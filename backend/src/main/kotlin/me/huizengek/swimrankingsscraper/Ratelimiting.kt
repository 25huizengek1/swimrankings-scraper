package me.huizengek.swimrankingsscraper

import io.github.crackthecodeabhi.kreds.connection.Endpoint
import io.github.crackthecodeabhi.kreds.connection.KredsClientConfig
import io.github.crackthecodeabhi.kreds.connection.newClient
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.util.pipeline.*
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout

private const val WINDOW_SIZE = 5000L
private const val MAX_REQUESTS_PER_WINDOW = 3

private const val SCRIPT =
    """
local currentKey = KEYS[1]
local previousKey = KEYS[2]
local tokens = tonumber(ARGV[1])
local now = ARGV[2]
local window = ARGV[3]
local requestsInCurrentWindow = redis.call("GET", currentKey)
if requestsInCurrentWindow == false then
  requestsInCurrentWindow = 0
end
local requestsInPreviousWindow = redis.call("GET", previousKey)
if requestsInPreviousWindow == false then
  requestsInPreviousWindow = 0
end
local percentageInCurrent = (now % window) / window
if requestsInPreviousWindow * (1 - percentageInCurrent) + requestsInCurrentWindow >= tokens then
  return 0
end
local newValue = redis.call("INCR", currentKey)
if newValue == 1 then
  redis.call("PEXPIRE", currentKey, window * 2 + 1000)
end
return tokens - newValue
"""

private val redisClient by lazy {
    config.redisHost?.let { host ->
        runBlocking {
            newClient(
                endpoint = Endpoint.from(host),
                config = KredsClientConfig.Builder().apply { soKeepAlive = true }.build()
            )
        }
    }
}

suspend fun PipelineContext<Unit, ApplicationCall>.ratelimit() = runCatching {
    withTimeout(500L) {
        val ip = call.request.headers["CF-Connecting-IP"] ?: call.request.origin.remoteHost
        val now = System.currentTimeMillis()
        val currentWindow = now / WINDOW_SIZE
        val currentKey = "$ip:$currentWindow"
        val previousKey = "$ip:${currentWindow - WINDOW_SIZE}"

        redisClient?.use { client ->
            val remaining = client.eval(
                script = SCRIPT,
                keys = arrayOf(currentKey, previousKey),
                args = arrayOf(MAX_REQUESTS_PER_WINDOW.toString(), now.toString(), WINDOW_SIZE.toString())
            )?.toString()?.toIntOrNull() ?: return@withTimeout true
            if (remaining == 0) return@withTimeout false
        }
        true
    }
}.let { it.isFailure || it.getOrNull() == true }

fun Route.ratelimit() = intercept(ApplicationCallPipeline.Setup) {
    if (ratelimit()) proceedWith(subject) else {
        call.respond(HttpStatusCode.TooManyRequests)
        finish()
    }
}

fun Route.ratelimit(block: Route.() -> Unit) {
    val route = createChild()
    route.ratelimit()
    route.block()
}
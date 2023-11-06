package me.huizengek.swimrankingsscraper

import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.util.pipeline.*
import kotlinx.datetime.LocalDate
import kotlinx.serialization.Serializable
import org.jsoup.nodes.Element
import java.io.File
import kotlin.time.Duration
import kotlin.time.Duration.Companion.hours
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Duration.Companion.seconds

val config by lazy {
    runCatching {
        json.decodeFromString<Configuration>(File("config.json").readText())
    }.getOrNull() ?: Configuration()
}

@Serializable
data class Configuration(
    val port: Int = 8080,
    val redisHost: String? = null
)

fun Element.getDeepestTextNode(): String? {
    val textNodes = textNodes()
    if (textNodes.isNotEmpty()) return textNodes.first().text()
    return children().firstNotNullOfOrNull { it.getDeepestTextNode() }
}

fun Element.getLink() = getElementsByTag("a").first()?.attributes()?.getIgnoreCase("href")

suspend inline fun <reified T : Any> ApplicationCall.receiveCatching() =
    runCatching { receiveNullable<T>() }.getOrNull()

fun String.asDutchLocalDate(): LocalDate? {
    val (day, dutchMonth, year) = split(" ").takeIf { it.size >= 3 } ?: return null

    val month = when (dutchMonth.lowercase()) {
        "jan" -> 1
        "feb" -> 2
        "mrt" -> 3
        "apr" -> 4
        "mei" -> 5
        "jun" -> 6
        "jul" -> 7
        "aug" -> 8
        "sep" -> 9
        "okt" -> 10
        "nov" -> 11
        "dec" -> 12
        else -> return null
    }

    return LocalDate(
        year = year.toIntOrNull() ?: return null,
        monthNumber = month,
        dayOfMonth = day.toIntOrNull() ?: return null
    )
}

fun String.asSwimDuration() = runCatching {
    var duration = 0.milliseconds
    val fields = replace('.', ':').split(':')
    for (i in fields.indices) {
        val index = fields.size - i - 1
        duration += when (i) {
            0 -> fields[index].padEnd(3, '0').toLongOrNull()?.milliseconds ?: continue
            1 -> fields[index].toLongOrNull()?.seconds ?: continue
            2 -> fields[index].toLongOrNull()?.minutes ?: continue
            3 -> fields[index].toLongOrNull()?.hours ?: continue
            else -> error("")
        }
    }
    duration
}.getOrNull()

fun Duration.format() = toComponents { hours, minutes, seconds, nanoseconds ->
    fun Number.pad(amount: Int = 2) = toString().padStart(amount, '0')
    buildString {
        val millis = nanoseconds / 1_000_000
        val hasHours = hours != 0L
        val hasMinutes = hasHours || minutes != 0

        if (hasHours) append("${hours.pad()}:")
        if (hasMinutes) append("${minutes.pad()}:")
        append("${seconds.pad()}.${millis.pad(3)}")
    }
}

class HttpEarlyReturnException : Exception()

suspend inline fun PipelineContext<*, ApplicationCall>.returnStatus(
    httpStatusCode: HttpStatusCode,
    block: () -> Unit = { }
): Nothing = call.returnStatus(httpStatusCode, block)

suspend inline fun ApplicationCall.returnStatus(
    httpStatusCode: HttpStatusCode,
    block: () -> Unit = { }
): Nothing {
    respond(httpStatusCode)
    block()
    throw HttpEarlyReturnException()
}

context(PipelineContext<*, ApplicationCall>)
suspend fun <T : Any> T?.asParameter() = this ?: returnStatus(HttpStatusCode.BadRequest)

val constantRouteSelector = object : RouteSelector() {
    override fun evaluate(context: RoutingResolveContext, segmentIndex: Int) = RouteSelectorEvaluation.Constant
}

fun Route.createChild() = createChild(constantRouteSelector)

context(HttpRequestBuilder)
operator fun String.plusAssign(other: String) = parameter(this, other)
package me.huizengek.swimrankingsscraper

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.*
import io.ktor.server.plugins.autohead.*
import io.ktor.server.plugins.callloging.*
import io.ktor.server.plugins.compression.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.defaultheaders.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.slf4j.event.Level

fun main() {
    embeddedServer(Netty, applicationEngineEnvironment {
        connector {
            host = "0.0.0.0"
            port = 8080
        }
        module {
            install(CallLogging) {
                level = Level.INFO
            }
            install(ContentNegotiation) {
                json(json)
            }
            install(DefaultHeaders) {
                header("X-Engine", "Ktor")
            }
            install(AutoHeadResponse)
            install(Compression) {
                gzip {
                    priority = 1.0
                }
                deflate {
                    priority = 10.0
                    minimumSize(1024)
                }
            }
            install(CORS) {
                allowHeaders { true }
                allowOrigins { true }
                anyHost()
                allowCredentials = true
                allowSameOrigin = true
                allowNonSimpleContentTypes = true
                maxAgeInSeconds = 3600
            }
            install(StatusPages) {
                exception<Throwable> { call, cause ->
                    runCatching {
                        when (cause) {
                            is HttpEarlyReturnException -> {}
                            is ContentTransformationException, is MissingRequestParameterException, is IllegalArgumentException
                            -> call.respond(HttpStatusCode.BadRequest).also { cause.printStackTrace() }

                            else -> call.respondText(text = "500: $cause", status = HttpStatusCode.InternalServerError)
                        }
                    }
                }
            }
            routing { router() }
        }
        watchPaths = listOf("classes")
    }).start(wait = true)
}
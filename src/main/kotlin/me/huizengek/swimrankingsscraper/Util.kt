package me.huizengek.swimrankingsscraper

import io.ktor.server.application.*
import io.ktor.server.request.*
import kotlinx.datetime.LocalDate
import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import org.jsoup.nodes.Element
import java.io.File
import kotlin.time.Duration
import kotlin.time.DurationUnit
import kotlin.time.toDuration

val config by lazy { json.decodeFromString<Configuration>(File("config.json").readText()) }

@Serializable
data class Configuration(
    val port: Int,
    val redisHost: String
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
    val splitted = split(" ")
    if (splitted.size < 3) return null
    val (day, dutchMonth, year) = splitted

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

    return LocalDate(year.toIntOrNull() ?: return null, month, day.toIntOrNull() ?: return null)
}

fun String.asSwimDuration() = runCatching {
    var millis = 0L
    val fields = replace('.', ':').split(':')
    for (i in fields.indices) {
        val index = fields.size - i - 1
        millis += when (i) {
            0 -> fields[index].padEnd(3, '0').toLongOrNull() ?: continue  // millis
            1 -> (fields[index].toLongOrNull() ?: continue) * 1000L                      // seconds
            2 -> (fields[index].toLongOrNull() ?: continue) * 60000L                     // minutes
            3 -> (fields[index].toLongOrNull() ?: continue) * 1440000L                   // hours
            else -> error("")
        }
    }
    millis
}.getOrNull()

fun Duration.format() = buildString {
    val minutes = inWholeMinutes
    val seconds = inWholeSeconds - minutes * 60
    val millis = inWholeMilliseconds - inWholeSeconds * 1000 - minutes * 60

    val hasMinutes = minutes != 0L
    val hasSeconds = seconds >= 0
    val hasMillis = millis >= 0

    if (hasMinutes) append(minutes.toString().padStart(2, '0'))
    if (hasMinutes && hasSeconds) append(":")
    if (hasSeconds) append(seconds.toString().padStart(2, '0'))
    if (hasSeconds && hasMillis) append(".")
    if (hasMillis) append(millis.toString().padStart(2, '0'))
}

object DurationSerializer : KSerializer<Duration> {
    override val descriptor = PrimitiveSerialDescriptor("KotlinMilliDuration", PrimitiveKind.LONG)
    override fun deserialize(decoder: Decoder) = decoder.decodeLong().toDuration(DurationUnit.MILLISECONDS)
    override fun serialize(encoder: Encoder, value: Duration) = encoder.encodeLong(value.inWholeMilliseconds)
}
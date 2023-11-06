package me.huizengek.swimrankingsscraper

import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.Json
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds

val json = Json {
    isLenient = true
    prettyPrint = true
    ignoreUnknownKeys = true
    encodeDefaults = true
}

typealias DurationAsMillis = @Serializable(with = DurationSerializer::class) Duration

object DurationSerializer : KSerializer<Duration> {
    override val descriptor = PrimitiveSerialDescriptor("KotlinMilliDuration", PrimitiveKind.LONG)
    override fun deserialize(decoder: Decoder) = decoder.decodeLong().milliseconds
    override fun serialize(encoder: Encoder, value: Duration) = encoder.encodeLong(value.inWholeMilliseconds)
}
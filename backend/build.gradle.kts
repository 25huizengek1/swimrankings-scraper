plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ktor)
    application
}

dependencies {
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)
    implementation(libs.ktor.server.serialization)
    implementation(libs.ktor.server.logging)
    implementation(libs.ktor.server.defaultHeaders)
    implementation(libs.ktor.server.autoHeadResponse)
    implementation(libs.ktor.server.compression)
    implementation(libs.ktor.server.cors)
    implementation(libs.ktor.server.status)

    implementation(libs.ktor.client.core)
    implementation(libs.ktor.client.cio)
    implementation(libs.ktor.client.serialization)
    implementation(libs.ktor.client.logging)

    implementation(libs.ktor.json)

    implementation(libs.poi)
    implementation(libs.poi.xlsx)

    implementation(libs.jsoup)
    implementation(libs.logback)
    implementation(libs.redis)

    implementation(libs.kotlinx.datetime)
}

application {
    mainClass.set("me.huizengek.swimrankingsscraper.ServerKt")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=true")
}

ktor.fatJar.archiveFileName.set("swimrankings-server-$version.jar")

kotlin {
    jvmToolchain(libs.versions.jvm.get().toInt())
    compilerOptions {
        freeCompilerArgs.addAll(
            "-Xcontext-receivers"
        )
    }
}
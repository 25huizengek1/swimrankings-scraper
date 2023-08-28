import org.apache.tools.ant.taskdefs.condition.Os

plugins {
    val kotlinVersion = "1.9.10"
    kotlin("jvm") version kotlinVersion
    kotlin("plugin.serialization") version kotlinVersion
    id("io.ktor.plugin") version "2.3.3"
    application
}

group = "me.huizengek"
version = "1.0"

repositories {
    mavenCentral()
}

dependencies {
    val ktorVersion = "2.3.3"
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
    implementation("io.ktor:ktor-server-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-server-call-logging:$ktorVersion")
    implementation("io.ktor:ktor-server-default-headers:$ktorVersion")
    implementation("io.ktor:ktor-server-auto-head-response:$ktorVersion")
    implementation("io.ktor:ktor-server-compression:$ktorVersion")
    implementation("io.ktor:ktor-server-cors:$ktorVersion")
    implementation("io.ktor:ktor-server-conditional-headers:$ktorVersion")
    implementation("io.ktor:ktor-server-partial-content:$ktorVersion")
    implementation("io.ktor:ktor-server-status-pages:$ktorVersion")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")

    implementation("io.ktor:ktor-client-core:$ktorVersion")
    implementation("io.ktor:ktor-client-cio:$ktorVersion")
    implementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-client-logging:$ktorVersion")

    val poiVersion = "5.2.3"
    implementation("org.apache.poi:poi:$poiVersion")
    implementation("org.apache.poi:poi-ooxml:$poiVersion")

    implementation("org.jsoup:jsoup:1.16.1")
    implementation("ch.qos.logback:logback-classic:1.4.11")
    implementation("io.github.crackthecodeabhi:kreds:0.9.0")

    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.4.0")
}

application {
    mainClass.set("me.huizengek.swimrankingsscraper.ServerKt")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=true")
}

val buildFrontend by tasks.registering(Exec::class) {
    dependsOn(tasks.processResources)

    val frontendDir = projectDir / "frontend"
    val resourcesDir = sourceSets.main.map { it.resources.sourceDirectories.first() }.get()

    workingDir(frontendDir)
    commandLine(if (Os.isFamily(Os.FAMILY_WINDOWS)) "yarn.cmd" else "yarn", "build")

    val assetsDir = resourcesDir / "static" / "assets"
    doLast {
        val publicDir = frontendDir / "dist" / "public"

        assetsDir.delete()
        assetsDir.mkdirs()
        (resourcesDir / "index.html").apply {
            delete()
            createNewFile()
        }

        copy {
            from(publicDir / "assets")
            into(assetsDir)
        }
        copy {
            from(publicDir)
            into(resourcesDir)
            include("index.html")
        }
    }

    inputs.dir(frontendDir / "src")
    outputs.dir(assetsDir)
    outputs.file(resourcesDir / "index.html")
}

operator fun File.div(other: String) = resolve(other)

ktor.fatJar.archiveFileName.set("swimrankings-server.jar")
//tasks.named("buildFatJar") {
//    dependsOn(buildFrontend)
//}

plugins {
    alias(libs.plugins.kotlin.jvm) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.ktor) apply false
}

allprojects {
    group = "me.huizengek.swimrankingsscraper"
    version = "1.0.1"

    repositories {
        mavenCentral()
    }
}

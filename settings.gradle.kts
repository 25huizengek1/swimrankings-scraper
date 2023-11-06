enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")

pluginManagement {
    resolutionStrategy {
        repositories {
            mavenCentral()
            gradlePluginPortal()
        }
    }
}

rootProject.name = "swimrankings-scraper"

include(":backend")
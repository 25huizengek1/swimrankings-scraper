import * as process from "process"

export const IS_PROD = process.env.NODE_ENV === "production"
export const BASE_URL = IS_PROD ? "https://swimrankingsapi.hooivorkenlaboratorium.ga/" : "http://localhost:8080/"

export function onRatelimit() {
    alert("Sorry, je bent over de rate limit heen (we willen niet wéér geband worden van swimrankings)")
}
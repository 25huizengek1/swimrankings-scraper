package me.huizengek.swimrankingsscraper

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.util.date.*
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import org.jsoup.Jsoup

private const val HOME_URL = "https://www.swimrankings.net/index.php"
private const val MARGIN = 1

val httpClient = HttpClient(CIO) {
    install(Logging) {
        level = LogLevel.INFO
    }
    install(ContentNegotiation) {
        json(json)
    }
}

fun Routing.router() = route("/") {
    get("countries") { call.respond(countries) }

    ratelimit {
        post("search") {
            val query = call.receiveCatching<SearchQuery>().asParameter()
            val html = runCatching {
                httpClient.get(HOME_URL) {
                    "internalRequest" += "athleteFind"
                    "athlete_clubId" += query.country.toString()
                    "athlete_gender" += query.gender.id.toString()
                    "athlete_lastname" += query.lastName
                    "athlete_firstname" += query.firstName
                }.bodyAsText()
            }.getOrNull() ?: returnStatus(HttpStatusCode.ServiceUnavailable)

            val results = Jsoup.parse(html).body().getElementsByTag("table").first()
                ?.getElementsByTag("tr")
                ?.mapNotNull { row ->
                    val url = runCatching {
                        HOME_URL + row.getElementsByClass("name").first()
                            ?.getElementsByTag("a")?.first()?.attributes()?.getIgnoreCase("href")
                    }.getOrNull() ?: return@mapNotNull null
                    val id = Url(url).parameters["athleteId"]?.toIntOrNull() ?: return@mapNotNull null
                    return@mapNotNull id to row
                        .getElementsByTag("td")
                        .mapNotNull secondMapNotNull@{
                            (it.classNames().firstOrNull() ?: return@secondMapNotNull null) to it.getDeepestTextNode()
                        }.toMap()
                }?.map { (id, map) ->
                    Athlete(
                        id = id,
                        name = map["name"],
                        birthdate = map["date"],
                        country = map["code"],
                        club = map["club"]
                    )
                } ?: returnStatus(HttpStatusCode.InternalServerError)
            call.respond(SearchResults(results))
        }
        get("records/{id}/{year?}") {
            val id = call.parameters["id"]?.toIntOrNull().asParameter()
            val records = call.getRecords(id)
            call.respond(Records(id, records))
        }

        get("records/{id}/csv/{year?}") {
            val id = call.parameters["id"]?.toIntOrNull().asParameter()
            val records = call.getRecords(id)

            call.respondText(
                "Soort record,Baanlengte,Tijd,Punten,Datum,Locatie,Wedstrijd\n" + records.joinToString("\n") {
                    "${it.event.description},${it.event.course},${it.result.time},${it.points ?: 0},${it.date},${it.city},${it.match.name}"
                },
                ContentType.Text.CSV
            )
        }

        get("records/{id}/excel/{year?}") {
            val id = call.parameters["id"]?.toIntOrNull().asParameter()
            val records = call.getRecords(id)

            val bytes = buildSpreadsheet("Resultaat") {
                val columns = listOf(
                    "Soort record",
                    "Baanlengte",
                    "Tijd",
                    "Tijd (110%)",
                    "Tijd (120%)",
                    "Tijd (130%)",
                    "Tijd (140%)",
                    "Punten",
                    "Datum",
                    "Locatie",
                    "Wedstrijd"
                )
                columns.forEachIndexed { i, col -> sheet[i][0] = col }
                records.forEachIndexed { recordIdx, record ->
                    columns.indices.forEach { colIdx ->
                        sheet[colIdx][recordIdx + 1] = when (colIdx) {
                            0 -> record.event.description
                            1 -> record.event.course
                            2 -> record.result.rawValue
                            3 -> (record.result.time * 1.1).format()
                            4 -> (record.result.time * 1.2).format()
                            5 -> (record.result.time * 1.3).format()
                            6 -> (record.result.time * 1.4).format()
                            7 -> (record.points ?: 0).toString()
                            8 -> record.date.toString()
                            9 -> record.city
                            10 -> record.match.name
                            else -> ""
                        }
                    }
                }
            }
            call.respondBytes(bytes, ContentType.Application.Xlsx)
        }
        get("records/excelbatch/{id...}") {
            val ids = call.parameters.getAll("id")?.mapNotNull { it.toIntOrNull() }.asParameter()
            val records = ids.map { async { getAthleteInfo(it) } }.awaitAll().filterNotNull().mapNotNull { info ->
                info to (getRecordHtml(info.id, -1)?.let { parseRecords(it) } ?: return@mapNotNull null)
            }.toMap()
            val columns = listOf(
                "Soort record",
                "Tijd",
                "Tijd (110%)",
                "Tijd (120%)",
                "Tijd (130%)",
                "Tijd (140%)"
            )
            val spreadsheet = buildSpreadsheet("Resultaat (batch)") {
                var i = 0
                records.forEach { (info, records) ->
                    val colOffset = columns.size * i + MARGIN * i
                    i++
                    sheet[colOffset][0] = info.name ?: "-"
                    sheet[colOffset + 1][0] = info.club ?: "-"
                    sheet[colOffset + 2][0] = info.country ?: "-"
                    sheet[colOffset + 3][0] = info.birthdate ?: "-"
                    columns.forEachIndexed { col, colName -> sheet[col + colOffset][1] = colName }
                    setColWidth(columns.size + colOffset, 8)
                    records.forEachIndexed { recordIdx, record ->
                        columns.indices.forEach { colIdx ->
                            val cellData = when (colIdx) {
                                0 -> record.event.description
                                1 -> record.result.rawValue
                                2 -> (record.result.time * 1.1).format()
                                3 -> (record.result.time * 1.2).format()
                                4 -> (record.result.time * 1.3).format()
                                5 -> (record.result.time * 1.4).format()
                                else -> ""
                            }
                            sheet[colIdx + colOffset][recordIdx + 2] = cellData
                        }
                    }
                }
            }
            call.response.header("Content-Disposition", "attachment; filename=\"export-${getTimeMillis()}.xlsx\"")
            call.respondBytes(spreadsheet, ContentType.Application.Xlsx)
        }
    }
}

suspend fun ApplicationCall.getRecords(id: Int): List<Record> {
    val year = parameters["year"]?.toIntOrNull() ?: -1
    val html = getRecordHtml(id, year) ?: returnStatus(HttpStatusCode.ServiceUnavailable)
    return parseRecords(html) ?: returnStatus(HttpStatusCode.InternalServerError)
}

suspend fun getRecordHtml(id: Int, year: Int) = runCatching {
    httpClient.get(HOME_URL) {
        "page" += "athleteDetail"
        "athleteId" += id.toString()
        "pbest" += year.toString()
        "language" += "nl"
    }.bodyAsText()
}.getOrNull()

fun parseRecords(html: String) = Jsoup.parse(html).getElementsByClass("athleteBest")
    .firstOrNull { it.tagName() == "table" }
    ?.getElementsByTag("tr")?.toList()
    ?.filter { it.classNames().any { className -> "athleteBest" in className } }
    ?.mapNotNull { row ->
        val eventCol = row.getElementsByClass("event").first() ?: return@mapNotNull null
        val eventLink = HOME_URL + (eventCol.getLink() ?: return@mapNotNull null)
        val eventId = Url(eventLink).parameters["styleId"]?.toIntOrNull() ?: return@mapNotNull null
        val eventDescription = eventCol.getDeepestTextNode() ?: return@mapNotNull null
        val eventCourse = row.getElementsByClass("course").first()?.getDeepestTextNode() ?: return@mapNotNull null

        val resultCol = row.getElementsByClass("time").toList().find { it.tagName() == "td" }
            ?: return@mapNotNull null
        val resultLink = HOME_URL + (resultCol.getLink() ?: return@mapNotNull null)
        val resultId = Url(resultLink).parameters["id"]?.toIntOrNull() ?: return@mapNotNull null
        val resultTime = resultCol.getDeepestTextNode() ?: return@mapNotNull null
        val resultDuration = resultTime.asSwimDuration() ?: return@mapNotNull null

        val points = row.getElementsByClass("code").first()?.getDeepestTextNode()?.toIntOrNull()
        val date = row.getElementsByClass("date").first()?.getDeepestTextNode()?.asDutchLocalDate()
            ?: return@mapNotNull null
        val city = row.getElementsByClass("city").first()?.getDeepestTextNode() ?: return@mapNotNull null

        val matchRow = row.getElementsByClass("name").first() ?: return@mapNotNull null
        val matchLink = HOME_URL + (matchRow.getLink() ?: return@mapNotNull null)
        val matchId = Url(matchLink).parameters["meetId"]?.toIntOrNull() ?: return@mapNotNull null
        val matchName = matchRow.getDeepestTextNode() ?: return@mapNotNull null

        Record(
            event = Event(id = eventId, description = eventDescription, link = eventLink, course = eventCourse),
            result = RecordResult(
                id = resultId,
                rawValue = resultTime,
                link = resultLink,
                time = resultDuration
            ),
            points = points,
            date = date,
            city = city,
            match = Match(id = matchId, name = matchName, link = matchLink)
        )
    }

suspend fun getAthleteInfo(id: Int): Athlete? {
    val html = runCatching {
        httpClient.get(HOME_URL) {
            "page" += "athleteDetail"
            "athleteId" += id.toString()
        }.bodyAsText()
    }.getOrNull() ?: return null
    val athleteInfo = Jsoup.parse(html).getElementById("athleteinfo") ?: return null
    val (name, birthdateStr) = athleteInfo.getElementById("name")?.textNodes()?.map { n -> n.text() }
        ?.takeIf { it.size >= 2 } ?: return null
    val (country, club) = athleteInfo.getElementById("nationclub")?.textNodes()?.map { n -> n.text() }
        ?.takeIf { it.size >= 2 } ?: return null
    return Athlete(
        id = id,
        name = name,
        birthdate = birthdateStr.drop(1),
        country = country,
        club = club
    )
}
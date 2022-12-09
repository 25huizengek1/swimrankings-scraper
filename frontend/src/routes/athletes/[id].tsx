import { A, useParams } from "solid-start"
import { createResource, For, Suspense } from "solid-js"
import { Spinner } from "~/components/Spinner"
import { Spacer } from "~/components/Spacer"
import { Button } from "~/components/Button"
import { BASE_URL, onRatelimit } from "~/constants"
import { FaSolidBackward, FaSolidLeftLong } from "solid-icons/fa"
import { useNavigate } from "@solidjs/router"

type Records = {
    athleteId: number,
    results: Record[]
}

type Record = {
    event: Event,
    result: Result,
    points: number | undefined | null,
    date: string,
    city: string,
    match: Match
}

type Event = {
    id: number,
    description: string,
    link: string,
    course: string
}

type Result = {
    id: number,
    rawValue: string,
    link: string,
    time: number
}

type Match = {
    id: number,
    name: string,
    link: string
}

export default function Athlete() {
    const params = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [records] = createResource(params.id, async id => {
        const res = await fetch(BASE_URL + "records/" + id)
        if (res.status == 429) onRatelimit()
        return await res.json() as Records
    })

    function downloadExport() {
        location.href = BASE_URL + "records/" + params.id + "/excel"
    }

    function percentageAlert(record: Record) {
        const percentage = parseInt((prompt("Hoeveel procent van deze tijd wil je weten?", "80") ?? "80")
            .replace("%", ""))
        const newTime = record.result.time * (percentage / 100)
        alert(`${percentage}% van ${record.result.rawValue} is ${newTime}ms, dus ${new Date(newTime).toISOString().substring(11, 23)}.`)
    }

    return (
        <main class="text-white container mx-auto text-center py-5 px-2">
            <div class="container flex flex-wrap items-center justify-between mx-auto">
                <div class="h-min pr-14 grow-0">
                    <Button content={<FaSolidLeftLong />} onClick={() => navigate("/")} isSubmit={false}/>
                </div>
                <A class="underline decoration-2 grow"
                   href={"https://www.swimrankings.net/index.php?page=athleteDetail&athleteId=" + params.id}><h1
                    class="text-2xl">{"Atleet " + params.id}</h1></A>
                <div class="h-min pl-14 grow-0">
                    <Button content={"Exporteren naar Excel"} onClick={downloadExport} isSubmit={false}/>
                </div>
            </div>
            <Spacer type="medium"/>
            <div>
                <Suspense fallback={<Spinner/>}>
                    <div class="overflow-x-auto relative">
                        <table class="w-full text-sm text-left text-gray-400">
                            <thead class="text-xs uppercase bg-gray-700 text-gray-400">
                            <tr>
                                <th scope="col" class="py-3 px-6">
                                    Soort record
                                </th>
                                <th scope="col" class="py-3 px-6">
                                    Baanlengte
                                </th>
                                <th scope="col" class="py-3 px-6">
                                    Tijd
                                </th>
                                <th scope="col" class="py-3 px-6">
                                    Punten
                                </th>
                                <th scope="col" class="py-3 px-6">
                                    Datum
                                </th>
                                <th scope="col" class="py-3 px-6">
                                    Locatie
                                </th>
                                <th scope="col" class="py-3 px-6">
                                    Wedstrijd
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            <For each={records()?.results}>{(record) =>
                                <tr class="border-b bg-gray-800 border-gray-700 hover:bg-gray-600">
                                    <th scope="row"
                                        class="py-4 px-6 font-medium whitespace-nowrap text-white">
                                        <A class="underline decoration-2"
                                           href={record.event.link}>{record.event.description}</A>
                                    </th>
                                    <td class="py-4 px-6">
                                        {record.event.course}
                                    </td>
                                    <td class="py-4 px-6 flex flex-row">
                                        <A class="underline decoration-2"
                                           href={record.result.link}>{record.result.rawValue}</A>
                                        <div class="inline-block pl-4">
                                            <A class="underline decoration-2" onClick={() => percentageAlert(record)} href={"#"}>Bereken percentage</A>
                                        </div>
                                    </td>
                                    <td class="py-4 px-6">
                                        {record.points}
                                    </td>
                                    <td class="py-4 px-6">
                                        {record.date}
                                    </td>
                                    <td class="py-4 px-6">
                                        {record.city}
                                    </td>
                                    <td class="py-4 px-6">
                                        <A class="underline decoration-2" href={record.match.link}>{record.match.name}</A>
                                    </td>
                                </tr>}
                            </For>
                            </tbody>
                        </table>
                    </div>
                </Suspense>
            </div>
        </main>
    )
}
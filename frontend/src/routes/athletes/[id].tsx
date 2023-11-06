import { useNavigate, useParams } from "@solidjs/router";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { getAthlete } from "~/requests";
import { BASE_URL } from "~/constants";
import { FaSolidLeftLong } from "solid-icons/fa";
import { Button } from "~/components/Button";
import { A } from "solid-start";
import { Spacer } from "~/components/Spacer";
import { Spinner } from "~/components/Spinner";

export default function Athlete() {
    const params = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isRatelimit, setIsRatelimit] = createSignal(false);
    const [records] = createResource(params.id, async id => {
        setIsRatelimit(false);
        const query = await getAthlete(id);
        if (query == null || query.isRatelimit || query.result == null) {
            setIsRatelimit(true);
            return;
        }
        return query.result;
    });

    const downloadExport = () => location.href = `${BASE_URL}records/${params.id}/excel`;

    return <main class="text-white container mx-auto text-center py-5 px-2">
        <div class="container flex flex-wrap items-center justify-between mx-auto">
            <div class="h-min pr-14 grow-0">
                <Button content={<FaSolidLeftLong/>} onClick={() => navigate("/")} isSubmit={false}/>
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
            <Show when={isRatelimit()}>
                <p class="text-lg text-red-600 font-semibold">Ratelimit bereikt, probeer opnieuw.</p>
            </Show>
            <Suspense fallback={<Spinner/>}>
                <div class="overflow-x-auto relative">
                    <table class="w-full text-sm text-left text-gray-400">
                        <thead class="text-xs uppercase bg-gray-700 text-gray-400">
                        <tr>
                            <th scope="col" class="py-3 px-6">Soort record</th>
                            <th scope="col" class="py-3 px-6">Baanlengte</th>
                            <th scope="col" class="py-3 px-6">Tijd</th>
                            <th scope="col" class="py-3 px-6">Punten</th>
                            <th scope="col" class="py-3 px-6">Datum</th>
                            <th scope="col" class="py-3 px-6">Locatie</th>
                            <th scope="col" class="py-3 px-6">Wedstrijd</th>
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
                                <td class="py-4 px-6">{record.event.course}</td>
                                <td class="py-4 px-6 flex flex-row">
                                    <A class="underline decoration-2"
                                       href={record.result.link}>{record.result.rawValue}</A>
                                </td>
                                <td class="py-4 px-6">{record.points}</td>
                                <td class="py-4 px-6">{record.date}</td>
                                <td class="py-4 px-6">{record.city}</td>
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
    </main>;
}
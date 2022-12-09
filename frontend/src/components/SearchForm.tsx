import { Component, createSignal, createResource, For, onMount, Show } from "solid-js"
import { Spacer } from "~/components/Spacer"
import { Input } from "~/components/Input"
import { Select } from "~/components/Select"
import { Button } from "~/components/Button"
import { Spinner } from "~/components/Spinner"
import { FaSolidLink } from "solid-icons/fa"
import { BASE_URL, onRatelimit } from "~/constants"

export type Result = {
    id: number
    name: string
    country: string
    club: string
    birthdate: string
}

interface SearchFormProps {
    onClick: (arg0: Result, clear: () => void) => void
}

export const SearchForm : Component<SearchFormProps> = (props) => {
    const [firstName, setFirstName] = createSignal("")
    const [lastName, setLastName] = createSignal("")
    const [country, setCountry] = createSignal("")
    const [gender, setGender] = createSignal("-1")
    const [countries, setCountries] = createSignal(new Map<string, string>())
    const [results, { refetch, mutate: setResults }] = createResource(async () => {
        if (lastName().length > 0) {
            const res = await fetch(new Request(BASE_URL + "search", {
                method: "POST",
                body: JSON.stringify({
                    firstName: firstName(),
                    lastName: lastName(),
                    gender: getGender(parseInt(gender())),
                    country: parseInt(country()) ?? -1
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            }))
            if (res.status == 429) onRatelimit()
            const json = (await res.json() as any).results
            return json as Result[]
        }
    })

    onMount(async () => {
        let delay = 1
        setCountry("273")
        while (true) {
            try {
                await wait(delay)
                const res = await fetch(BASE_URL + "countries")
                if (res.status == 429) onRatelimit()
                const countryMap: object = await res.json()
                setCountries(new Map(Object.entries(countryMap).sort((a, b) => a[1].localeCompare(b[1]))))
                break
            } catch {
                setCountries(new Map())
                delay *= 2
            }
        }
    })

    function clear() {
        setFirstName("")
        setLastName("")
        setGender("-1")
        setCountry("273")
        setResults([])
    }

    return <div>
        <h2 class="text-xl font-black">Zoeken</h2>
        <Spacer type="medium"/>
        <form onSubmit={(e) => {
            if (!(e.target as HTMLFormElement).checkValidity()) return
            e.preventDefault()
            refetch()
        }
        }>
            <div class="grid grid-flow-col auto-cols-auto space-x-2">
                <Input id={"first_name"} label={"Voornaam"} placeholder={"Gerrit"} value={firstName()}
                       setValue={setFirstName} required={false}/>
                <Input id={"last_name"} label={"Achternaam"} placeholder={"Strandstoel"} value={lastName()}
                       setValue={setLastName} required={true}/>
            </div>
            <Spacer type="small"/>
            <Select id={"country"} label={"Land"} options={countries()} value={country()} setValue={setCountry}/>
            <Spacer type="small"/>
            <Select id={"gender"} label={"Geslacht"}
                    options={new Map<string, string>([["-1", "Maakt niet uit"], ["1", "Man"], ["2", "Vrouw"]])}
                    value={gender()} setValue={setGender}/>
            <Spacer type="small"/>
            <Button content="Zoek..." onClick={refetch} isSubmit={true}/>
        </form>
        <Spacer type="medium"/>
        <div class="content-center">
            <Show when={results.state === "refreshing"} keyed={true}><Spinner/></Show>
        </div>
        <Show when={results.state === "ready" && (results()?.length ?? 0) > 0} keyed={true}>
            <h2 class="text-xl font-semibold">Resultaten</h2>
            <Spacer type={"small"}/>
            <div class="overflow-x-auto relative">
                <table class="w-full text-sm text-left text-gray-400">
                    <thead class="text-xs uppercase bg-gray-700 text-gray-400">
                    <tr>
                        <th scope="col" class="py-3 px-6">
                            Naam
                        </th>
                        <th scope="col" class="py-3 px-6">
                            Land
                        </th>
                        <th scope="col" class="py-3 px-6">
                            Club
                        </th>
                        <th scope="col" class="py-3 px-6">
                            Geboortejaar
                        </th>
                        <th scope="col" class="w-min"/>
                    </tr>
                    </thead>
                    <tbody>
                    <For each={results()!}>{(athlete) =>
                        <tr class="border-b bg-gray-800 border-gray-700 hover:bg-gray-600"
                            onClick={() => props.onClick(athlete, clear)}>
                            <th scope="row"
                                class="py-4 px-6 font-medium whitespace-nowrap text-white">
                                {athlete.name}
                            </th>
                            <td class="py-4 px-6">
                                {athlete.country}
                            </td>
                            <td class="py-4 px-6">
                                {athlete.club}
                            </td>
                            <td class="py-4 px-6">
                                {athlete.birthdate}
                            </td>
                            <td class="w-min">
                                <Button content={<FaSolidLink/>}
                                        onClick={() => location.href = "https://www.swimrankings.net/index.php?page=athleteDetail&athleteId=" + athlete.id}
                                        isSubmit={false}/>
                            </td>
                        </tr>}
                    </For>
                    </tbody>
                </table>
            </div>
        </Show>
    </div>
}

function wait(timeout: number) {
    return new Promise(res => setTimeout(res, timeout))
}

function getGender(gender: number) {
    switch (gender) {
        case -1:
            return "UNSPECIFIED"
        case 1:
            return "MAN"
        case 2:
            return "WOMAN"
        default:
            throw new Error("THIS STATE ISN'T EVEN POSSIBLE WHAT HAVE YOU DONE")
    }
}
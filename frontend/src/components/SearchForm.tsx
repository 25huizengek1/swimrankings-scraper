import { Component, createResource, createSignal, For, Show } from "solid-js";
import { Athlete, Gender, genders, getCountries, search } from "~/requests";
import { FaSolidLink } from "solid-icons/fa";
import { Button } from "~/components/Button";
import { Spacer } from "~/components/Spacer";
import { Spinner } from "~/components/Spinner";
import { Select } from "~/components/Select";
import { Input } from "~/components/Input";

interface SearchFormProps {
    onClick: (arg0: Athlete) => void;
}

export const SearchForm: Component<SearchFormProps> = props => {
    const [firstName, setFirstName] = createSignal("");
    const [lastName, setLastName] = createSignal("");
    const [country, setCountry] = createSignal(-1);
    const [gender, setGender] = createSignal<Gender>("UNSPECIFIED");
    const [isRatelimit, setIsRatelimit] = createSignal(false);
    const [isError, setIsError] = createSignal(false);
    const [countries] = createResource(async () => {
        const query = await getCountries();
        if (query == null) return new Map();
        return query.result;
    }, {initialValue: new Map()});
    const [results, {refetch}] = createResource(async () => {
        if (lastName().length <= 0) return;
        setIsError(false);
        setIsRatelimit(false);
        const query = await search(firstName(), lastName(), gender(), country());
        if (query == null) {
            setIsError(true);
            return;
        }
        if (query.isRatelimit) {
            setIsRatelimit(true);
            return;
        }
        return query.result;
    }, {initialValue: []});

    return <div>
        <h2 class="text-xl font-black">Zoeken</h2>
        <Spacer type="medium"/>
        <form onSubmit={(e) => {
            if (!(e.target as HTMLFormElement).checkValidity()) return;
            e.preventDefault();
            refetch();
        }}>
            <div class="grid grid-flow-col auto-cols-auto space-x-2">
                <Input id={"first_name"} label={"Voornaam"} placeholder={"Gerrit"} value={firstName()}
                       setValue={setFirstName} required={false}/>
                <Input id={"last_name"} label={"Achternaam"} placeholder={"Strandstoel"} value={lastName()}
                       setValue={setLastName} required={true}/>
            </div>
            <Spacer type="small"/>
            <Select<number> id={"country"} label={"Land"} options={countries()} value={country} setValue={setCountry}/>
            <Spacer type="small"/>
            <Select<string> id={"gender"} label={"Geslacht"}
                            options={new Map(Object.entries(genders).map(e => [e[0], e[1].displayName]))}
                            value={gender} setValue={setGender}/>
            <Spacer type="small"/>
            <Button content="Zoek" onClick={refetch} isSubmit={true}/>
            <Show when={isError()}>
                <Spacer type={"small"}/>
                <p class="text-l font-semibold text-red-600">Het laden van zwemmers is mislukt.</p>
            </Show>
        </form>
        <Spacer type="medium"/>
        <div class="content-center">
            <Show when={results.state === "refreshing"} keyed={true}>
                <Spinner/>
                <Show when={isRatelimit()}><Spacer type="small"/></Show>
            </Show>
            <Show when={isRatelimit()}><p class="text-l font-semibold text-red-600">
                De ratelimit is bereikt! Dit is zodat we niet geband worden van Swimrankings.
            </p></Show>
        </div>
        <Show when={results.state === "ready" && (results()?.length ?? 0) > 0} keyed={true}>
            <h2 class="text-xl font-semibold">Resultaten</h2>
            <Spacer type={"small"}/>
            <div class="overflow-x-auto relative">
                <table class="w-full text-sm text-left text-gray-400">
                    <thead class="text-xs uppercase bg-gray-700 text-gray-400">
                    <tr>
                        <th scope="col" class="py-3 px-6">Naam</th>
                        <th scope="col" class="py-3 px-6">Land</th>
                        <th scope="col" class="py-3 px-6">Club</th>
                        <th scope="col" class="py-3 px-6">Geboortejaar</th>
                        <th scope="col" class="w-min"/>
                    </tr>
                    </thead>
                    <tbody>
                    <For each={results()!}>{(athlete) =>
                        <tr class="border-b bg-gray-800 border-gray-700 hover:bg-gray-600"
                            onClick={() => props.onClick(athlete)}>
                            <th scope="row" class="py-4 px-6 font-medium whitespace-nowrap text-white">
                                {athlete.name ?? "-"}
                            </th>
                            <td class="py-4 px-6">{athlete.country ?? "-"}</td>
                            <td class="py-4 px-6">{athlete.club ?? "-"}</td>
                            <td class="py-4 px-6">{athlete.birthdate ?? "-"}</td>
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
    </div>;
};

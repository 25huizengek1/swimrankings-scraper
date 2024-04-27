import { Component, For } from "solid-js";
import { Spacer } from "~/components/Spacer";
import { Athlete } from "~/requests";
import { FaSolidTrash } from "solid-icons/fa";
import { Button } from "~/components/Button";

interface AthleteListProps {
    athletes: Athlete[],
    setAthletes: (arg0: Athlete[]) => void
}

export const AthleteList: Component<AthleteListProps> = props => {
    return <div>
        <h2 class="text-xl font-semibold">Geselecteerde atleten</h2>
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
                    <For each={props.athletes}>{athlete =>
                        <tr class="border-b bg-gray-800 border-gray-700 hover:bg-gray-600">
                            <th scope="row"
                                class="py-4 px-6 font-medium whitespace-nowrap text-white">{athlete.name ?? "-"}</th>
                            <td class="py-4 px-6">{athlete.country ?? "-"}</td>
                            <td class="py-4 px-6">{athlete.club ?? "-"}</td>
                            <td class="py-4 px-6">{athlete.birthdate ?? "-"}</td>
                            <td class="w-min">
                                <Button content={<FaSolidTrash/>}
                                    onClick={() => {
                                        const athletes = [...props.athletes];
                                        athletes.splice(athletes.indexOf(athlete), 1);
                                        props.setAthletes(athletes);
                                    }}
                                    isSubmit={false}/>
                            </td>
                        </tr>
                    }</For>
                </tbody>
            </table>
        </div>
    </div>;
};

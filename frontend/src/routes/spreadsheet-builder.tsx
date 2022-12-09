import { createSignal, Show } from "solid-js"
import { Result, SearchForm } from "~/components/SearchForm"
import { AthleteList } from "~/components/AthleteList"
import { Spacer } from "~/components/Spacer"
import { Button } from "~/components/Button"
import { BASE_URL } from "~/constants"

export default function SpreadsheetBuilder() {
    const [athletes, setAthletes] = createSignal<Result[]>([])

    function downloadExcel() {
        if (athletes().length < 1) return
        location.href = BASE_URL + "records/excelbatch/" + athletes().map(a => a.id).join("/")
    }

    return <main class="text-white container mx-auto text-center py-5 px-2">
        <h1 class="text-3xl font-extrabold font-sans">Spreadsheet maken</h1>
        <h1 class="text-md font-semibold text-gray-500">Zoek de gewenste atleten, en combineer deze in een
            Excel-document</h1>
        <Spacer type="medium"/>
        <Show when={athletes().length > 0} keyed={true}
              fallback={<div class="text-gray-400 font-semibold">Nog geen geselecteerde atleten...</div>}>
            <AthleteList athletes={athletes()} setAthletes={setAthletes}/>
        </Show>
        <Spacer type="small" />
        <Button content={"Download Excel-bestand"} onClick={downloadExcel} isSubmit={false}/>
        <Spacer type="large"/>
        <SearchForm onClick={(athlete, clear) => {
            setAthletes([...athletes(), athlete])
            clear()
        }}/>
    </main>
}
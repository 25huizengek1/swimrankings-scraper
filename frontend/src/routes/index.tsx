import { Spacer } from "~/components/Spacer"
import { useNavigate } from "@solidjs/router"
import { SearchForm } from "~/components/SearchForm"

export default function Home() {
    const navigate = useNavigate()

    return (
        <main class="text-white container mx-auto text-center py-5 px-2">
            <h1 class="text-3xl font-extrabold font-sans">Swimrankings calculator</h1>
            <h1 class="text-md font-semibold text-gray-500">Een onofficiële site om zwemstatistieken bij te houden</h1>
            <Spacer type="large"/>
            <SearchForm onClick={athlete => navigate("/athletes/" + athlete.id)} />
        </main>
    )
}

import { Spacer } from "~/components/Spacer";
import { FaBrandsDiscord, FaBrandsGithub, FaBrandsReddit } from "solid-icons/fa";

export default function About() {
    return <main class="text-white container max-w-screen-sm mx-auto text-center py-5 px-2">
        <h1 class="text-3xl font-extrabold">Over de maker</h1>
        <Spacer type={"large"}/>
        <h2 class="text-md max-w-screen-xs mx-auto">Hé hallo en gegroet, of voor mijn mede-gynmasiasten: Χαίρε! Mijn
            naam is Bart. Ik heb deze
            tool oorspronkelijk gemaakt op verzoek, maar nu het (blijkbaar) toch dusdanig handig is dat het enigszins
            populair is geworden, ben ik bezig de boel uit te breiden!</h2>
        <Spacer type={"small"}/>
        <p class="text-sm">Voor problemen en suggesties: mail naar <a class="underline decoration-2"
                                                                      href="mailto:25huizengek1@gmail.com">25huizengek1@gmail.com</a>
        </p>
        <Spacer type={"medium"}/>
        <p class="text-md font-light">Je kunt me ook bereiken op één van de volgende platformen</p>
        <ul>
            <li>
                <FaBrandsDiscord class="inline"/>
                <div class="pl-2 inline-block font-bold text-sm">@huizengek</div>
            </li>
            <li>
                <FaBrandsReddit class="inline"/>
                <div class="pl-2 inline-block font-bold text-sm">
                    <a class="underline decoration-2" href="https://reddit.com/u/Huizengek">Huizengek</a>
                </div>
            </li>
            <li>
                <FaBrandsGithub class="inline"/>
                <div class="pl-2 inline-block font-bold text-sm">
                    <a class="underline decoration-2" href="https://github.com/25huizengek1">25huizengek1</a>
                </div>
            </li>
        </ul>
        <Spacer type={"large"}/>
        <h2 class="text-2xl font-extrabold">Mijlpalen (misschien?)</h2>
        <Spacer type={"small"}/>
        <p class="text-sm font-semibold">3-12-2022 - 500 bezoekers tegelijk (bots UITERAARD uitgezonderd)</p>
        <Spacer type={"small"}/>
        <p class="text-sm font-semibold">8-12-2022 - Eerste server crash, bedankt DDoSsers! 🤦‍♂️</p>
        <Spacer type={"large"}/>
        <h2 class="text-2xl font-extrabold">Privacy</h2>
        <p class="text-sm font-extralight">(nu komt de saaie shit)</p>
        <Spacer type={"small"}/>
        <p class="text-sm font-semibold">Tot nu toe verzamel ik géén persoonlijke data, helemaal niks. Als dit ooit
            verandert, zal ik daarvan alle gebruikers op de hoogte stellen, met een (inmiddels verplichte) cookie-box.
            Cloudflare daarentegen gebruikt voor veiligheidsdoeleinden wel wat gegevens, zie hiervoor hun website (<a
                class="underline decoration-2" href="https://cloudflare.com/">cloudflare.com</a>)</p>
        <Spacer type={"large"}/>
        <h2 class="text-2xl font-extrabold">Ratelimits</h2>
        <Spacer type={"small"}/>
        <p class="text-sm font-semibold">Waarschijnlijk ben je het al weleens tegengekomen, het bericht over de
            rate-limits. Deze zijn ervoor bedoeld om niet geband te worden van de swimrankings website, want dit is al
            eerder voorgevallen. Je kunt per wifi-verbinding / IP-adres (dat gaat vaak per huis of gebouw) een aantal
            keer een verzoek naar mijn server toe sturen, daarna moet je 5 seconde wachten. Deze IP-adressen sla ik niet
            op en kan ik zelf ook niet zien. Heb je toch problemen met de ratelimit, bijvoorbeeld omdat je deze site met
            meerdere mensen vanaf bijvoorbeeld een club gebruikt, kun je hiervoor contact met mij opnemen, dan kunnen we
            kijken of er een passende oplossing is voor jouw situatie.</p>
        <Spacer type={"large"}/>
        <h2 class="text-2xl font-extrabold">Site onbereikbaar?</h2>
        <Spacer type={"small"}/>
        <p class="text-sm font-semibold">Mijn enige advies: neem contact met mij op! Ik heb niet de beste server in de
            wereld, dus daar kan het probleem liggen. Het kan ook zijn dat je bent 'verbannen' van de site. Dit kan
            bijvoorbeeld als je wifi-verbinding niet via Nederland, Duitsland of België loopt. De rest van de wereld heb
            ik namelijk verbannen, dit voornamelijk uit veiligheidsoverwegingen. Als dit jou overkomt, neem dan contact
            op, dan maak ik graag een uitzondering voor jou.</p>
    </main>;
}
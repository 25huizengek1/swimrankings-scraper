// @refresh reload
import { Suspense } from "solid-js";
import { Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title } from "solid-start";
import "./root.css";
import { NavBar } from "~/components/NavBar";

import "@fontsource/inter";

export default function Root() {
    return (
        <Html lang="nl">
            <Head>
                <Title>Swimrankings calculator</Title>
                <Meta charset="utf-8"/>
                <Meta name="viewport" content="width=device-width, initial-scale=1"/>
                <Meta name="description" content="Een onofficiële tool om zwemstatistieken bij te houden."/>
                <Meta name="darkreader-lock"/>
            </Head>
            <Body class="bg-slate-800 overflow-y-scroll">
                <NavBar/>
                <Suspense>
                    <ErrorBoundary
                        fallback={(e) => <div class="container mx-auto text-white font-black">
                            <p>Er heeft zich een error voorgedaan! De error was: {"\"" + e.message + "\""}</p>
                            Meld dit bij <a class="underline decoration-2" href="/about">de contactpagina</a>
                        </div>}>
                        <Routes>
                            <FileRoutes/>
                        </Routes>
                    </ErrorBoundary>
                </Suspense>
                <Scripts/>
            </Body>
        </Html>
    );
}

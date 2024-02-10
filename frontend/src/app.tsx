// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start";
import { ErrorBoundary, Suspense } from "solid-js";
import { NavBar } from "~/components/NavBar";

import "./app.css";
import "@fontsource/inter";

export default function App() {
    return (
        <Router
            root={props => <>
                <NavBar />
                <Suspense>
                    <ErrorBoundary
                        fallback={(e) => <div class="container mx-auto text-white font-black">
                            <p>Er heeft zich een error voorgedaan! De error was: {"\"" + e.message + "\""}</p>
                            Meld dit bij <a class="underline decoration-2" href="/about">de contactpagina</a>
                        </div>}
                    >
                        {props.children}
                    </ErrorBoundary>
                </Suspense>
            </>}
        >
            <FileRoutes />
        </Router>
    );
}

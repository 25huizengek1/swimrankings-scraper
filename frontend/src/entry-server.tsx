import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
    <StartServer document={({ assets, children, scripts }) => (
        <html lang="nl">
            <head>
                <title>Swimrankings calculator</title>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Een onofficiële tool om zwemstatistieken bij te houden." />
                <meta name="darkreader-lock" />
                <link rel="icon" href="/favicon.ico" />
                {assets}
            </head>
            <body class="bg-slate-800 overflow-y-scroll">
                <div id="app">{children}</div>
                {scripts}
            </body>
        </html>
    )} />
));

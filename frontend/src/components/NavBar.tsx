import { Component, createSignal, For, onMount } from "solid-js";
import { A, useLocation } from "@solidjs/router";

import logo from "../logo.svg";

export const NavBar: Component = () => {
    const route = useLocation();
    const [visible, setVisible] = createSignal(false);
    let button: HTMLButtonElement;

    onMount(() => {
        button.addEventListener("click", () => {
            setVisible(!visible());
        });
    });

    return <div class="pb-14">
        <nav class="fixed w-screen top-0 border-gray-200 px-2 sm:px-4 py-2.5 rounded bg-gray-900">
            <div class="container flex flex-wrap items-center justify-between mx-auto">
                <A href="/" class="flex items-center">
                    <img src={logo} class="h-6 mr-3 sm:h-9" alt="Logo"/>
                    <span
                        class="self-center text-xl font-semibold whitespace-nowrap text-white">Swimrankings calculator</span>
                </A>
                <button ref={el => button = el} data-collapse-toggle="navbar-default" type="button"
                        class="inline-flex items-center p-2 ml-3 text-sm rounded-lg md:hidden focus:outline-none focus:ring-2 text-gray-400 hover:bg-gray-700 focus:ring-gray-600"
                        aria-controls="navbar-default" aria-expanded="false">
                    <span class="sr-only">Open main menu</span>
                    <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                         xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                              clip-rule="evenodd"></path>
                    </svg>
                </button>
                <div class={(visible() ? "" : "hidden") + " w-full md:block md:w-auto"} id="navbar-default">
                    <ul class="flex flex-col mt-4 rounded-lg md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 bg-gray-900">
                        <For
                            each={[["/", "Home"], ["/spreadsheet-builder", "Spreadsheet maken"], ["/about", "Over de maker"]]}>
                            {link =>
                                <li class="pb-1">
                                    <A href={link[0]}
                                       class={(route.pathname == link[0] ? "text-white" :
                                           "text-gray-400") + " block py-2 pl-3 pr-4 bg-gray-800 rounded md:bg-transparent md:p-0 hover:bg-gray-900"}
                                       onClick={() => setVisible(!visible())}>
                                        {link[1]}
                                    </A>
                                </li>
                            }
                        </For>
                    </ul>
                </div>
            </div>
        </nav>
    </div>;
};

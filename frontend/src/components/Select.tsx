import { Component, For } from "solid-js"

interface SelectProps {
    id: string
    label: string
    options: Map<string, string>
    value: string,
    setValue: (arg0: string) => void
}

export const Select: Component<SelectProps> = (props) => {
    return <div class="text-left">
        <label for={props.id} class="block mb-2 text-sm font-medium text-white">{props.label}</label>
        <select value={props.value} onChange={(e) => props.setValue((e.target as HTMLSelectElement).value)}
                id={props.id}
                class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500">
            <For each={[...props.options.entries()]}>{(option) =>
                <option selected={option[0] == "273"} value={option[0]}>{option[1]}</option>
            }</For>
        </select>
    </div>
}
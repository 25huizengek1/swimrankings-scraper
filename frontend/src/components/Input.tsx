import { Component } from "solid-js";

interface InputProps {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    setValue: (arg0: string) => void;
    required: boolean;
    type?: string;
}

export const Input: Component<InputProps> = (props) => {
    return <div class="text-left">
        <label for={props.id} class="block mb-2 text-sm font-medium text-white">{props.label}</label>
        <input type={props.type ?? "text"} id={props.id}
               class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
               placeholder={props.placeholder} value={props.value}
               onInput={(e) => props.setValue((e.target as HTMLInputElement).value)} required={props.required}/>
    </div>;
};

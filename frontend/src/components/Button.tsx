import { Component, JSX } from "solid-js";

interface ButtonProps {
    content: JSX.Element;
    onClick: () => void;
    isSubmit: boolean;
}

export const Button: Component<ButtonProps> = (props) => {
    return <button
        type={props.isSubmit ? "submit" : "button"}
        class="bg-blue-700 focus:ring-4 focus:ring-blue-600 font-medium rounded-full text-sm px-4 py-2 m-2 transition duration-300 ease select-none hover:bg-blue-800 focus:outline-none focus:shadow-outline"
        onClick={props.onClick}
    >{props.content}</button>;
};

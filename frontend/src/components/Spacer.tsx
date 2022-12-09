import { Component, mergeProps } from "solid-js"

interface BlankSpaceProps {
    type: "small" | "medium" | "large"
}

export const Spacer : Component<BlankSpaceProps> = (props) => {
    const actualProps = mergeProps({ type: "medium" }, props)
    const className = () => {
        switch (actualProps.type) {
            case "small":
                return "h-2"
            case "medium":
                return "h-5"
            case "large":
                return "h-10"
        }
    }

    return <div class={className()} />
}
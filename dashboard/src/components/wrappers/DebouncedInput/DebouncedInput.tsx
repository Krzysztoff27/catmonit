import { useDebouncedCallback } from "@mantine/hooks";
import React from "react";

const DebouncedInput = ({ defaultValue, onChange, children }): React.JSX.Element => {
    const debounceOnChange = useDebouncedCallback(onChange, 500);

    return <>{React.Children.map(children, (child) => React.cloneElement(child, { defaultValue, onChange: debounceOnChange }))}</>;
};

export default DebouncedInput;

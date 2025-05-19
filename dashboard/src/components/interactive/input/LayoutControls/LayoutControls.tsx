import { Button, Combobox, Group, TextInput, useCombobox } from "@mantine/core";
import { IconChevronDown, IconTrash } from "@tabler/icons-react";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import classes from "./LayoutControls.module.css";
import { useElementSize } from "@mantine/hooks";

const LayoutControls = ({}): React.JSX.Element => {
    const [layouts, setLayouts] = useState(["New layout 1", "New layout 2", "New layout 3", "New layout 4", "New layout 5", "New layout 6", "New layout 7"]);
    const { layoutName } = useParams();
    const navigate = useNavigate();
    const combobox = useCombobox();

    const options = layouts.map((item) => (
        <Combobox.Option
            value={item}
            key={item}
        >
            {item}
        </Combobox.Option>
    ));

    const onRemove = () => {
        const currentIndex = layouts.findIndex((name) => name === layoutName);
        const newLayouts = [...layouts];
        newLayouts.splice(currentIndex, 1);
        setLayouts(newLayouts);
        const layoutToDisplay = currentIndex > 0 ? currentIndex - 1 : 0;
        navigate(`/editor/${encodeURI(newLayouts[layoutToDisplay])}`);
    };

    return (
        <Combobox
            width={200}
            store={combobox}
            position="bottom-start"
            onOptionSubmit={(val) => {
                navigate(`/editor/${encodeURI(val)}`);
                combobox.closeDropdown();
            }}
            classNames={{
                dropdown: classes.dropdownMenu,
                option: classes.option,
            }}
            offset={4}
        >
            <Group
                gap={0}
                className={classes.layoutGroup}
            >
                <Combobox.Target>
                    <Button
                        onClick={() => combobox.toggleDropdown()}
                        variant="default"
                        className={`${classes.dropdownButton} ${classes.button}`}
                    >
                        <IconChevronDown size={18} />
                    </Button>
                </Combobox.Target>

                <TextInput
                    value={layoutName}
                    onChange={() => {}}
                    radius="0"
                    className={classes.textInput}
                    classNames={{
                        input: classes.textInputInput,
                    }}
                    variant="filled"
                />

                <Button
                    disabled={layouts.length <= 1}
                    onClick={onRemove}
                    variant="default"
                    className={`${classes.deleteButton} ${classes.button}`}
                >
                    <IconTrash size={16} />
                </Button>
            </Group>

            <Combobox.Dropdown>
                <Combobox.Options>{options.length === 0 ? <Combobox.Empty>Nothing found</Combobox.Empty> : options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
};

export default LayoutControls;

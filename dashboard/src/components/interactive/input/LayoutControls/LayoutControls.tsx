import { Button, Combobox, Group, ScrollArea, TextInput, useCombobox } from "@mantine/core";
import { IconChevronDown, IconTrash } from "@tabler/icons-react";
import { useEffect, useMemo } from "react";
import classes from "./LayoutControls.module.css";
import { useLayouts } from "../../../../contexts/LayoutContext/LayoutContext";
import { LayoutInfoInDatabase } from "../../../../types/api.types";
import { isEmpty, isObject, trim, trimStart } from "lodash";
import { useField } from "@mantine/form";
import useNotifications from "../../../../hooks/useNotifications";
import { useDebouncedCallback } from "@mantine/hooks";
import { isFileLoadingAllowed } from "vite";

const LayoutControls = ({}): React.JSX.Element => {
    const { currentLayout, loading, layouts, renameCurrentLayout, removeLayout, createNewLayout, setCurrent } = useLayouts();
    const { sendErrorNotification } = useNotifications();

    const field = useField({
        initialValue: currentLayout?.info.name || "",
        validateOnChange: true,
        validate: (value) =>
            isEmpty(trim(value))
                ? "Layout name cannot be empty."
                : !/^[A-Za-z0-9 ]+$/.test(trim(value)!)
                ? "Name contains invalid characters."
                : isObject((layouts || []).find((l) => l.name === trim(value) && l.id !== currentLayout?.info.id))
                ? "Layout with that name already exists"
                : null,
    });

    const combobox = useCombobox();

    const options = useMemo(() => [{ name: "+ Create new layout", id: "+" } as LayoutInfoInDatabase, ...(layouts || [])], [layouts]);

    const comboboxOptions = useMemo(
        () =>
            options.map(({ name, id }: LayoutInfoInDatabase, i) => (
                <Combobox.Option
                    key={i}
                    value={id}
                >
                    {name}
                </Combobox.Option>
            )),
        [options]
    );

    const onRemove = async () => {
        if (!currentLayout) return;
        const currentIndex = layouts.findIndex(({ name }) => name === currentLayout?.info.name);
        const indexToDisplay = currentIndex > 0 ? currentIndex - 1 : 0;
        setCurrent(layouts[indexToDisplay].id);
        await removeLayout(currentLayout?.info.id);
    };

    const onInputBlur = async () => {
        field
            .validate()
            .then((message) => !message && renameCurrentLayout(field.getValue()!))
            .catch((err) => sendErrorNotification(err.status));
    };

    const onSubmit = async (val) => {
        if (val === "+") val = await createNewLayout();
        combobox.closeDropdown();
        setCurrent(val);
    };

    useEffect(() => {
        field.setValue(currentLayout?.info?.name || "Loading");
    }, [currentLayout?.info?.name]);

    useEffect(() => {
        field.setError(null);
    }, [currentLayout?.info.id]);

    return (
        <Combobox
            width={200}
            store={combobox}
            position="bottom-start"
            onOptionSubmit={onSubmit}
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
                <TextInput
                    {...field.getInputProps()}
                    radius="sm"
                    className={classes.textInput}
                    classNames={{
                        input: classes.textInputInput,
                    }}
                    variant="filled"
                    onBlur={onInputBlur}
                    disabled={loading}
                    leftSection={
                        <Combobox.Target>
                            <Button
                                onClick={() => combobox.toggleDropdown()}
                                variant="default"
                                className={`${classes.dropdownButton} ${classes.button}`}
                                disabled={loading}
                                c={field.error ? "red.6" : loading ? "dimmed" : ""}
                            >
                                <IconChevronDown size={18} />
                            </Button>
                        </Combobox.Target>
                    }
                    rightSection={
                        <Button
                            onClick={onRemove}
                            variant="default"
                            className={`${classes.deleteButton} ${classes.button}`}
                            disabled={layouts?.length <= 1 || loading}
                            c={field.error ? "red.6" : layouts?.length <= 1 || loading ? "dimmed" : ""}
                        >
                            <IconTrash size={18} />
                        </Button>
                    }
                />
            </Group>

            <Combobox.Dropdown mah={300}>
                <Combobox.Options>
                    <ScrollArea.Autosize
                        type="scroll"
                        mah={200}
                    >
                        {options.length === 0 ? <Combobox.Empty>Nothing found</Combobox.Empty> : comboboxOptions}
                    </ScrollArea.Autosize>
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
};

export default LayoutControls;

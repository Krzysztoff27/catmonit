import { Switch } from "@mantine/core";

const AutoOrderToggle = ({ resourceName = "resources", checked, toggle }): React.JSX.Element => {
    return (
        <Switch
            checked={checked}
            onChange={toggle}
            withThumbIndicator={false}
            label={`Order ${resourceName} automatically`}
        />
    );
};

export default AutoOrderToggle;

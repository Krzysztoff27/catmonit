import { notifications } from "@mantine/notifications";
import { uniqueId } from "lodash";
import errors from "../assets/errors.json";
import { IconX } from "@tabler/icons-react";

export default function useNotifications() {
    const sendErrorNotification = (code: number | undefined, props?: { [key: string]: any }) => {
        if (!code) return;
        const error = errors[code];

        notifications.show({
            id: uniqueId(`${code}`),
            autoClose: 5000,
            title: error.title,
            message: error.message,
            color: "red",
            icon: <IconX />,
            ...props,
        });
    };

    return {
        sendErrorNotification,
    };
}

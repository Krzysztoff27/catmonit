import { Button, Center, Divider, Fieldset, Group, PasswordInput, Space, Text, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import useAuth from "../../hooks/useAuth.ts";
import { useNavigate } from "react-router-dom";
import { TokenRequestForm } from "../../types/api.types.ts";
import { useFetch } from "@mantine/hooks";
import useApiRequests from "../../hooks/useApiRequests.ts";
import useNotifications from "../../hooks/useNotifications.tsx";
import { capitalize } from "lodash";

export default function LoginPage() {
    const navigate = useNavigate();
    const { error, loading, data: user } = useFetch("user");
    const { sendRequest } = useApiRequests();
    const { setAccessToken, setRefreshToken } = useAuth();
    const { sendErrorNotification } = useNotifications();
    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            username: "",
            password: "",
        },
        validate: {
            username: isNotEmpty(),
            password: isNotEmpty(),
        },
    });

    if (user) {
        navigate("/");
    }

    async function authenticate(values: TokenRequestForm) {
        const jsonResponse = await sendRequest(
            "POST",
            "/api/login",
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            },
            JSON.stringify({
                username: values.username,
                password: values.password,
            }),
            (res, _) => {
                sendErrorNotification(
                    res.status,
                    res.status === 401 ? { title: "Invalid credentials", message: "Either login or password is incorrect." } : {}
                );
            }
        );

        if (!jsonResponse?.token) return;

        setAccessToken(jsonResponse.token);
        navigate("/");
    }

    return (
        <Center h={"100vh"}>
            <Fieldset
                w="400"
                bd="none"
            >
                <form onSubmit={form.onSubmit(authenticate)}>
                    <Group
                        align="flex -end"
                        pt="xs"
                    >
                        <Text
                            size="xl"
                            fw={500}
                        >
                            Catmonit Dashboard
                        </Text>
                    </Group>
                    <Space h="sm" />
                    <Divider label="Log in with an authorized Catmonit account" />
                    <Space h="sm" />
                    <TextInput
                        label="Username"
                        description=" " // for a small gap
                        placeholder="Enter your username"
                        withAsterisk
                        key={form.key("username")}
                        {...form.getInputProps("username")}
                        variant="filled"
                    />
                    <Space h="sm" />
                    <PasswordInput
                        label="Password"
                        description=" " // for a small gap
                        placeholder="Enter your password"
                        withAsterisk
                        key={form.key("password")}
                        {...form.getInputProps("password")}
                        variant="filled"
                    />
                    <Group
                        justify="space-between"
                        mt="md"
                    >
                        <Button
                            onClick={() => navigate("/")}
                            style={{ fontWeight: 500 }}
                            color="dark.1"
                            variant="light"
                        >
                            Go back
                        </Button>
                        <Button type="submit">Log in</Button>
                    </Group>
                </form>
            </Fieldset>
        </Center>
    );
}

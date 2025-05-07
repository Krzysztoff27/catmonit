import { Button, Center, Divider, Fieldset, Group, PasswordInput, Space, Text, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import useAuth from "../../hooks/useAuth.ts";
import { useNavigate } from "react-router-dom";
import { TokenRequestForm } from "../../types/api.types.ts";
import { useFetch } from "@mantine/hooks";
import useApiRequests from "../../hooks/useApiRequests.ts";

export default function LoginPage() {
    const navigate = useNavigate();
    const { error, loading, data: user } = useFetch("user");
    const { sendRequest } = useApiRequests();
    const { setAccessToken, setRefreshToken } = useAuth();
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
            "/token",
            "POST",
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            },
            new URLSearchParams({
                username: values.username,
                password: values.password,
            })
        );

        if (!jsonResponse?.access_token) return;

        setAccessToken(jsonResponse.access_token);
        setRefreshToken(jsonResponse.refresh_token);
        navigate("/");
    }

    return (
        <Center h={"100vh"}>
            <Fieldset w="400">
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
                    />
                    <Space h="sm" />
                    <PasswordInput
                        label="Password"
                        description=" " // for a small gap
                        placeholder="Enter your password"
                        withAsterisk
                        key={form.key("password")}
                        {...form.getInputProps("password")}
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

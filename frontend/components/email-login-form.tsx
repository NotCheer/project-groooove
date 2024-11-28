"use client";

import { Button, Card, CardBody, CardHeader, Input } from "@nextui-org/react";
import { login, signup, LoginRequest, SignupRequest } from "@/util/api";
import {useState} from "react";

export const EmailLoginForm = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    const handleLogin = async () => {
        try {
            const credentials: LoginRequest = { username, password };
            console.log(credentials);
            const response = await login(credentials);
            setMessage(response.message || "Logged in successfully!");
        } catch (error: any) {
            setMessage(error.message || "An error occurred");
        }
    }

  return (
    <Card>
      <CardHeader>Login / Sign up</CardHeader>
      <CardBody className="gap-4">
        <Input label="Email" type="email" onValueChange={(v) => {setUsername(v)}}/>
        <Input label="Passord" type="password" onValueChange={(v) => {setPassword(v)}}/>
        <Button onPress={() => handleLogin()}>Log in</Button>
      </CardBody>
    </Card>
  );
};

"use client";

import React, { useState } from "react";
import { Input, Button, Textarea} from "@nextui-org/react";
import { login, signup, LoginRequest, SignupRequest } from "@/util/api";

const AuthForm: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [isLogin, setIsLogin] = useState<boolean>(true);

    const handleSubmit = async () => {
        try {
            if (isLogin) {
                const credentials: LoginRequest = { username, password };
                console.log(credentials);
                const response = await login(credentials);
                setMessage(response.message || "Logged in successfully!");
            } else {
                const userData: SignupRequest = { username, email, password };
                const response = await signup(userData);
                setMessage(`User created: ${response.message}`);
            }
        } catch (error: any) {
            setMessage(error.message || "An error occurred");
        }
    };

    return (
        <div>
            <h2>{isLogin ? "Login" : "Signup"}</h2>
            <Input
                color="primary"
                size="lg"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            {!isLogin && (
                <Input
                    color="primary"
                    size="lg"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            )}
            <Input
                color="primary"
                size="lg"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <Button
                color="primary"
                auto
                onClick={handleSubmit}
            >
                {isLogin ? "Login" : "Signup"}
            </Button>
            <Button
                onClick={() => setIsLogin(!isLogin)}
            >
                {isLogin ? "Switch to Signup" : "Switch to Login"}
            </Button>
            {message && (
                <Textarea color="error">
                    {message}
                </Textarea>
            )}
        </div>
    );
};

export default AuthForm;

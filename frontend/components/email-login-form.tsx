"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Link,
} from "@nextui-org/react";

export const EmailLoginForm = () => {
  return (
    <Card className="w-full max-w-xl m-auto">
      <CardHeader>Login</CardHeader>
      <CardBody className="gap-4">
        <Input label="Email" type="email" />
        <Input label="Passord" type="password" />
        <Button>Log in</Button>
        <p className="m-auto">
          Do not have an account yet? <Link href="/signup">Sign up here</Link>
        </p>
      </CardBody>
    </Card>
  );
};

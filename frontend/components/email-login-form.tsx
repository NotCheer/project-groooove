"use client";

import { Button, Card, CardBody, CardHeader, Input } from "@nextui-org/react";

export const EmailLoginForm = () => {
  return (
    <Card>
      <CardHeader>Login / Sign up</CardHeader>
      <CardBody className="gap-4">
        <Input label="Email" type="email" />
        <Input label="Passord" type="password" />
        <Button>Log in</Button>
      </CardBody>
    </Card>
  );
};

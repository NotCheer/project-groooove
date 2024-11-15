"use client";

import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";

export const LoginMethod = () => {
  return (
    <Card>
      <CardHeader>Login</CardHeader>
      <CardBody className="gap-4">
        <Button>Log in with Email</Button>
        <Button>Log in with Google</Button>
      </CardBody>
    </Card>
  );
};

"use client";

import { Button, Card, CardBody, CardHeader, Link } from "@nextui-org/react";

export const LoginMethod = () => {
  return (
    <Card className="w-full max-w-xl m-auto">
      <CardHeader>Login</CardHeader>
      <CardBody className="gap-4">
        <Button as={Link} href="/login/email">
          Log in with Email
        </Button>
        <Button>Log in with Google</Button>
      </CardBody>
    </Card>
  );
};

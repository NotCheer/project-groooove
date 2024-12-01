"use client";

import { Button, Input } from "@nextui-org/react";

export default function EmailLogin() {
  return (
    <>
      <Input isRequired label="Email" type="email" />
      <Input isRequired label="Passord" type="password" />
      <Button>Login</Button>
    </>
  );
}

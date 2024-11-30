"use client";

import { Button, Input } from "@nextui-org/react";

export default function Login() {
  return (
    <>
      <Input isRequired label="Username" type="text" />
      <Input isRequired label="Email" type="email" />
      <Input isRequired label="Passord" type="password" />
      <Input isRequired label="Confirm Password" type="password" />
      <Button>Sign up</Button>
    </>
  );
}

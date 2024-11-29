"use client";

import { Button, Link } from "@nextui-org/react";

export default function Signup() {
  return (
    <>
      <Button as={Link} href="/signup/email" size="lg">
        Sign up with Email
      </Button>
      <Button size="lg">Sign up with Google</Button>
    </>
  );
}

"use client";

import { Button, Link } from "@nextui-org/react";
import { GoogleOauth } from "@/components/GoogleOauth";

export default function Login() {

  return (
    <>
      <Button as={Link} href="/login/email" size="lg">
        Login with Email
      </Button>
      <GoogleOauth />
    </>
  );
}

"use client";

import { Button, Link } from "@nextui-org/react";
import { GoogleOauth } from "@/components/GoogleOauth";
import {Button} from "@nextui-org/react";

export default function Login() {

  return (
    <>
      <Button as={Link} href="/login/email" size="lg">
        Login with Email
      </Button>
      <Button size="lg">Login with Google</Button>
      <GoogleOauth />
    </>
  );
}

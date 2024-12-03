"use client";

import { Button, Link } from "@nextui-org/react";
import { BsEnvelopeFill } from "react-icons/bs";

import { GoogleOauth } from "@/components/google-oauth";

export default function Login() {
  return (
    <>
      <Button
        as={Link}
        endContent={<BsEnvelopeFill />}
        href="/login/email"
        size="lg"
      >
        Login with Email
      </Button>
      <GoogleOauth>Login with Google</GoogleOauth>
    </>
  );
}

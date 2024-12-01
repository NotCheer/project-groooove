"use client";

import { Button, Link } from "@nextui-org/react";
import { BsEnvelopeFill } from "react-icons/bs";

import { GoogleOauth } from "@/components/google-oauth";

export default function Signup() {
  return (
    <>
      <Button
        as={Link}
        endContent={<BsEnvelopeFill />}
        href="/signup/email"
        size="lg"
      >
        Sign up with Email
      </Button>
      <GoogleOauth>Sign up with Google</GoogleOauth>
    </>
  );
}

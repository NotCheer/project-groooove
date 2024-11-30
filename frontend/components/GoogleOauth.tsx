"use client";

import {verify} from "@/util/api";
import {Button, Link} from '@nextui-org/react'
import { useGoogleLogin } from '@react-oauth/google';




export const GoogleOauth = () => {
  const login = useGoogleLogin({
    onSuccess: codeResponse => {
      console.log(codeResponse)
      verify(codeResponse);
    },
    flow: 'auth-code',
  });
  return (
    <Button onClick={() => login()} size={"lg"}>Log in with Google 🚀</Button>
  )
}
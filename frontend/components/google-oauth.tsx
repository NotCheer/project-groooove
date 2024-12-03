"use client";

import { Button } from "@nextui-org/react";
import { useGoogleLogin } from "@react-oauth/google";
import { BsGoogle } from "react-icons/bs";
import { useRouter } from "next/navigation";

import { verify } from "@/util/api";

type Props = {
  children: React.ReactNode;
};

export const GoogleOauth = ({ children }: Props) => {
  const router = useRouter();

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log(codeResponse);
      verify(codeResponse);
      router.push("/");
    },
    flow: "auth-code",
  });

  return (
    <Button endContent={<BsGoogle />} size="lg" onClick={login}>
      {children}
    </Button>
  );
};

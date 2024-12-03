"use client";

import * as React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";

import { ToneContextProvider } from "@/context/tone-context";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <GoogleOAuthProvider clientId="681627740470-1mf8ipmqjh84pqmk2odrab168n81k502.apps.googleusercontent.com">
      <ToneContextProvider>
        <NextUIProvider navigate={router.push}>
          <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
        </NextUIProvider>
      </ToneContextProvider>
    </GoogleOAuthProvider>
  );
}

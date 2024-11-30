"use client";

import { Card, CardHeader, CardBody, Link } from "@nextui-org/react";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Card className="w-full max-w-xl m-auto">
      <CardHeader>
        <p className="font-bold text-xl pl-1">Login</p>
      </CardHeader>
      <CardBody className="gap-4">
        {children}
        <p className="m-auto py-2">
          Do not have an account yet? <Link href="/signup">Sign up here</Link>
        </p>
      </CardBody>
    </Card>
  );
}

"use client";

import { Card, CardHeader, CardBody, Link } from "@nextui-org/react";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Card className="w-full max-w-xl m-auto">
      <CardHeader>
        <p className="font-bold text-xl pl-1">Sign up</p>
      </CardHeader>
      <CardBody className="gap-4">
        {children}
        <p className="m-auto py-2">
          Already have an account? <Link href="/login">Login here</Link>
        </p>
      </CardBody>
    </Card>
  );
}

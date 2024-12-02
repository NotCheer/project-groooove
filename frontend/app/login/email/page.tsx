"use client";

import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { validate as validateEmail } from "email-validator";
import { useRouter } from "next/navigation";

import { emailLogin, LoginRequest } from "@/util/api";

type Inputs = LoginRequest;

export default function EmailLogin() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const [failMsg, setFailMsg] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await emailLogin(data);
      setFailed(false);
    } catch (err: any) {
      setFailed(true);
      setFailMsg(err.message);

      return;
    }
    router.push("/");
  };

  return (
    <>
      {failed && (
        <Card className="bg-danger-100" shadow="none">
          <CardBody>
            <p className="text-danger">Login failed: {failMsg}</p>
          </CardBody>
        </Card>
      )}
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          {...register("email", {
            required: "Please enter your email",
            validate: (email) => {
              return validateEmail(email) || "Invalid email format";
            },
          })}
          isRequired
          errorMessage={errors.email?.message}
          isInvalid={errors.email !== undefined}
          label="Email"
          type="email"
        />
        <Input
          {...register("password", { required: true })}
          isRequired
          label="Passord"
          type="password"
        />
        <Button type="submit">Login</Button>
      </form>
    </>
  );
}

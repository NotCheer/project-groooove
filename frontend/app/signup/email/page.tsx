"use client";

import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { validate as validateEmail } from "email-validator";
import { useRouter } from "next/navigation";

import { emailSignUp, SignUpRequest } from "@/util/api";

type Inputs = SignUpRequest;

export default function EmailSignUp() {
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
      await emailSignUp(data);
      setFailed(false);
      router.push("/"); // Redirect to home or a success page
    } catch (err: any) {
      setFailed(true);
      setFailMsg(err.message);
    }
  };

  return (
    <>
      {failed && (
        <Card className="bg-danger-100" shadow="none">
          <CardBody>
            <p className="text-danger">Sign-up failed: {failMsg}</p>
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
          {...register("password", {
            required: "Please enter your password",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters long",
            },
          })}
          isRequired
          errorMessage={errors.password?.message}
          isInvalid={errors.password !== undefined}
          label="Password"
          type="password"
        />
        <Input
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value, { password }) =>
              value === password || "Passwords do not match",
          })}
          isRequired
          errorMessage={errors.confirmPassword?.message}
          isInvalid={errors.confirmPassword !== undefined}
          label="Confirm Password"
          type="password"
        />
        <Button type="submit">Sign Up</Button>
      </form>
    </>
  );
}

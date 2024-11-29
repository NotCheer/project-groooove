

import { EmailLoginForm } from "@/components/email-login-form";
import { GoogleOauth } from "@/components/GoogleOauth";
import {Button} from "@nextui-org/react";



export default function Login() {

  return (
    <>
      <EmailLoginForm />
      <GoogleOauth />
    </>
  );
}

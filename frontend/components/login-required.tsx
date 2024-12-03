import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Link,
} from "@nextui-org/react";

type Props = {
  message: string;
};

export const LoginRequired = ({ message }: Props) => {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <p className="text-xl font-bold">Login required</p>
      </CardHeader>
      <Divider />
      <CardBody className="items-center gap-4">
        <p className="py-6">{message}</p>
        <div className="flex gap-4 w-full justify-evenly">
          <Button
            as={Link}
            className="basis-0 grow"
            href="/login"
            size="lg"
            variant="flat"
          >
            Login
          </Button>
          <Button
            as={Link}
            className="basis-0 grow"
            href="/signup"
            size="lg"
            variant="flat"
          >
            Sign up
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

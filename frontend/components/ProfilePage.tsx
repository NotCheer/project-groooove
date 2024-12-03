import { User, Card, CardBody, CardHeader, Avatar } from "@nextui-org/react";

export const ProfilePage = ({ name, email, avatarSrc }) => {
  return (
    <Card>
      <CardHeader>
        <User
          name={name}
          avatarProps={{
            src: avatarSrc,
            fallback: true
          }}
        />
      </CardHeader>
      <CardBody>
        <p>Email: {email}</p>
      </CardBody>
    </Card>
  );
};
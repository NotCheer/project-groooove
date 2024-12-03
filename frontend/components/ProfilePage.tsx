type Props = {
  name: string;
  email: string;
};

export const ProfilePage = ({ name, email }: Props) => {
  return (
    <>
      <p className="text-center font-bold text-2xl">Username: {name}</p>
      <p className="text-center font-bold text-2xl">Email: {email}</p>
    </>
  );
};


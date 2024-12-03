"use client";

import useSWR from "swr";
import { Button, CircularProgress, Link } from "@nextui-org/react";
import { useRouter } from "next/navigation";

import { ProfilePage } from "@/components/ProfilePage";
import { getDetailedUserById, logout } from "@/util/api";
import { useUserId } from "@/hooks/useUserId";

export default function UserLoop() {
  const userId = useUserId();
  const router = useRouter();

  const {
    data: userData,
    isLoading,
    error: userError,
  } = useSWR(userId ? ["getUser", userId] : null, () =>
    getDetailedUserById(userId!),
  );

  if (userError) {
    return <p>Failed to load: {userError?.message}</p>;
  }

  if (!userData || isLoading) {
    return <CircularProgress className="mx-auto" size="lg" />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <ProfilePage email={userData.email} name={userData.username} />
      <div className="w-full flex flex-col items-center gap-4 pt-4">
        <Button
          as={Link}
          color="primary"
          href={`/user/${userId}`}
          type="button"
          variant="flat"
        >
          My loops
        </Button>
        <Button
          color="danger"
          type="button"
          variant="flat"
          onPress={handleLogout}
        >
          Log out
        </Button>
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { CircularProgress } from "@nextui-org/react";
import { PagedLoopList } from "@/components/paged-loop-list";
import { ProfilePage } from "@/components/ProfilePage";
import { getLoopsByUserId, getDetailedUserById } from "@/util/api";
import { useUserId } from "@/hooks/useUserId";

export default function UserLoop() {
  const [page, setPage] = useState(1);
  const userId = useUserId();

  const { data, error, isLoading } = useSWR(
    userId ? [page, "getLoops", userId] : null,
    ([page, _, userId]) => getLoopsByUserId(page, userId)
  );

  const { data: userData, error: userError } = useSWR(
    userId ? ["getUser", userId] : null,
    () => getDetailedUserById(userId)
  );

  useEffect(() => {
    if (data !== undefined) {
      setPage(data.page);
    }
  }, [data]);

  if (error || userError) {
    return <p>Failed to load: {error?.message || userError?.message}</p>;
  }

  if (isLoading || !userData) {
    return <CircularProgress className="mx-auto" size="lg" />;
  }

  return (
    <>
      <ProfilePage
        name={userData.username}
        email={userData.email}
      />
      {data?.loops?.length > 0 ? (
        <PagedLoopList
          loops={data.loops}
          page={page}
          setPage={setPage}
          totalPages={data.totalPages}
        />
      ) : (
        <p>You haven't made any loops yet.</p>
      )}
    </>
  );
}

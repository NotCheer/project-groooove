"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { CircularProgress } from "@nextui-org/react";

import { PagedLoopList } from "@/components/paged-loop-list";
import { getLoopsByUserId, getUserById } from "@/util/api";

type Prop = {
  params: {
    userId: number;
  };
};

export default function UserLoop({ params: { userId } }: Prop) {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useSWR(
    [page, userId, "getLoops"],
    ([page, id, _]) => getLoopsByUserId(page, id),
  );

  const { data: userData, error: userError } = useSWR(
    [userId, "gerUserById"],
    ([id, _]) => getUserById(id),
  );

  useEffect(() => {
    if (data !== undefined) {
      setPage(data.page);
    }
  }, [data]);

  if (error || userError) {
    return <p>Failed to load: {error || userError}</p>;
  }

  if (isLoading || !userData) {
    return <CircularProgress className="mx-auto" size="lg" />;
  }

  return (
    data && (
      <>
        <p className="text-2xl font-bold text-center py-6">
          {userData.username}&apos;s Loops
        </p>
        <PagedLoopList
          loops={data.loops}
          page={page}
          setPage={setPage}
          totalPages={data.totalPages}
        />
      </>
    )
  );
}

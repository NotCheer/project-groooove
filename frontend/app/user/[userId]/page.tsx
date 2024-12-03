"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Accordion, AccordionItem, CircularProgress } from "@nextui-org/react";
import { PagedLoopList } from "@/components/paged-loop-list";
import { getLoopsByUserId, getUserById } from "@/util/api";

type Prop = {
  params: {
    userId: number;
  };
};

export default function userLoop({ params: { userId } }: Prop) {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useSWR([page, "getLoops"], ([page, _]) =>
    getLoopsByUserId(page, userId),
  );

  const { data: userData, error: userError } = useSWR(
    ["getUser", userId],
    () => getUserById(userId)
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
        <p>Welcome to {userData.username}'s collection</p>
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

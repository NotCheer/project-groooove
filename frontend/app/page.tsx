"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { CircularProgress } from "@nextui-org/react";

import { PagedLoopList } from "@/components/paged-loop-list";
import { getLoops } from "@/util/api";

export default function Home() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useSWR([page, "getLoops"], ([page, _]) =>
    getLoops(page),
  );

  useEffect(() => {
    if (data != undefined) {
      setPage(data.page);
    }
  }, [data]);

  if (error) {
    return <p>Failed to load: {error}</p>;
  }

  if (!data || isLoading) {
    return <CircularProgress className="mx-auto p-6" size="lg" />;
  }

  return (
    <>
      <PagedLoopList
        loops={data.loops}
        page={page}
        setPage={setPage}
        totalPages={data.totalPages}
      />
    </>
  );
}

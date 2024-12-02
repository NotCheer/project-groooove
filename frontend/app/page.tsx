"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { CircularProgress, Pagination } from "@nextui-org/react";

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
    <div className="flex flex-col gap-4 max-w-2xl w-full mx-auto">
      <div className="flex items-center gap-4 w-full max-w-2xl">
        <p className="font-bold text-xl">Page:</p>
        <Pagination page={page} total={data.totalPages} onChange={setPage} />
      </div>
      <PagedLoopList
        loops={data.loops}
        page={page}
        setPage={setPage}
        totalPages={data.totalPages}
      />
    </div>
  );
}

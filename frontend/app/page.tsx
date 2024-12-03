"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  CircularProgress,
  Pagination,
  Select,
  SelectItem,
} from "@nextui-org/react";

import { PagedLoopList } from "@/components/paged-loop-list";
import { getLoops } from "@/util/api";

export default function Home() {
  const [page, setPage] = useState(1);

  const SORT_OPTIONS = new Map([
    [
      "Newest",
      {
        sortBy: "createdAt",
        order: "desc",
      },
    ],
    [
      "Oldest",
      {
        sortBy: "createdAt",
        order: "asc",
      },
    ],
    [
      "Highest Rating",
      {
        sortBy: "rating",
        order: "desc",
      },
    ],
    [
      "Lowest Rating",
      {
        sortBy: "rating",
        order: "asc",
      },
    ],
  ]);
  const [sortOption, setSortOption] = useState("Newest");

  const { data, error, isLoading } = useSWR(
    [page, SORT_OPTIONS.get(sortOption)!, "getLoops"],
    ([page, { sortBy, order }, _]) => getLoops(page, sortBy, order),
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
        <p>Page</p>
        <Pagination page={page} total={data.totalPages} onChange={setPage} />
        <div className="flex-grow" />
        <Select
          aria-label="sort"
          className="max-w-40"
          color="primary"
          defaultSelectedKeys={["Newest"]}
          items={SORT_OPTIONS.keys().map((key) => {
            return {
              key: key,
            };
          })}
          selectedKeys={[sortOption]}
          selectionMode="single"
          onChange={(e) => {
            if (e.target.value !== "") {
              setSortOption(e.target.value);
            }
          }}
        >
          {(option) => <SelectItem key={option.key}>{option.key}</SelectItem>}
        </Select>
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

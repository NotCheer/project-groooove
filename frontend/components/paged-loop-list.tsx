import { Pagination } from "@nextui-org/react";

import { LoopList } from "./loop-list";

import { LoopInfoJson } from "@/types";

type Props = {
  loops: LoopInfoJson[];
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
};

export const PagedLoopList = ({ loops, page, setPage, totalPages }: Props) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <LoopList loops={loops} />
      <Pagination
        className="py-8"
        page={page}
        size="lg"
        total={totalPages}
        onChange={setPage}
      />
    </div>
  );
};

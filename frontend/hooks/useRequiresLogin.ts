import { useRouter } from "next/navigation";

import { useUserId } from "./useUserId";

export function useRequiresLogin() {
  const userId = useUserId();
  const router = useRouter();

  if (userId == null) {
    router.push("/login");
  }
}

import { useRouter } from "next/navigation";
import { useLayoutEffect } from "react";
import Cookies from "js-cookie";

export function useRequiresLogin() {
  const router = useRouter();

  useLayoutEffect(() => {
    const storedId = Cookies.get("userId");

    if (!storedId) {
      router.push("/login");
    }
  }, []);
}

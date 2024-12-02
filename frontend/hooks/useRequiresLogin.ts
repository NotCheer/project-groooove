import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export function useRequiresLogin() {
  const router = useRouter();
  const storedId = Cookies.get("userId");

  if (!storedId) {
    router.push("/login");
  }
}

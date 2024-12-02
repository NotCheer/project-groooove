import { useCookies } from "react-cookie";

export function useUserId() {
  const [cookies] = useCookies(["userId"], {
    doNotParse: true,
  });

  if (!cookies.userId) {
    return null;
  }

  return parseInt(cookies.userId);
}

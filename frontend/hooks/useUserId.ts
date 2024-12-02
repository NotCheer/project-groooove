import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export function useUserId() {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const storedId = Cookies.get("userId");

    if (!storedId) {
      setUserId(null);

      return;
    }
    setUserId(parseInt(storedId));
  });

  return userId;
}

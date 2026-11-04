"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
    const container =
      document.getElementById("main-scroll-container") ||
      document.querySelector("main");
    if (container) {
      container.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

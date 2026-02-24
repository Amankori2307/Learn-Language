"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ClientApp = dynamic(() => import("./App"), { ssr: false });

export default function NextSpaRoot() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <ClientApp />;
}

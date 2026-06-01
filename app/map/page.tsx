"use client";

import dynamic from "next/dynamic";

const KeralaMap = dynamic(() => import("@/components/KeralaMap"), { ssr: false });

export default function MapPage() {
  return <KeralaMap />;
}

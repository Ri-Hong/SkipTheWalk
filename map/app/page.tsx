"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import MapView and disable SSR
const Map = dynamic(() => import("@/components/Map"), {
  loading: () => <div />,
  ssr: false,
});

export default function Home() {
  return <Map />;
}

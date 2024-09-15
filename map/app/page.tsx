"use client";

import React from "react";
import { Suspense } from 'react'
import dynamic from "next/dynamic";
import { useSearchParams } from 'next/navigation'

// Dynamically import MapView and disable SSR
const Map = dynamic(() => import("@/components/Map"), {
  loading: () => <div />,
  ssr: false,
});

export default function Home() {
  const searchParams = useSearchParams()
 
  const room = searchParams.get('room') || '';

  return (
    <Suspense>
      <Map room={room}/>;
    </Suspense>
  )
}

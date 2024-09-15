"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from 'next/navigation';

// Dynamically import Map component and disable SSR for it
const Map = dynamic(() => import("@/components/Map"), {
  loading: () => <div>Loading map...</div>,
  ssr: false, // Disable server-side rendering for Map
});

// Separate component that handles useSearchParams
function MapWithRoom() {
  const searchParams = useSearchParams(); // Read URL parameters on client
  const room = searchParams.get('room') || '';

  return <Map room={room} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <MapWithRoom /> {/* Only wrap this component with Suspense */}
    </Suspense>
  );
}

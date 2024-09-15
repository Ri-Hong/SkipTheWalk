import { MapView, useMapData } from "@mappedin/react-sdk";
import "@mappedin/react-sdk/lib/esm/index.css";
import Labels from "./Labels";
import FloorSelector from "./FloorSelector";
import CameraEvents from "./CameraEvents";
import DrawNavigation from "./DrawNavigation";

interface MapProps {
  room: string;
}

export default function Map({ room }: MapProps) {
  const { isLoading, error, mapData } = useMapData({
    key: "mik_nF3LY3Fd7zixJ0k6l50380723",
    secret: "mis_zkYDjiB9G4pvD5KzBARAacAgfkY1L1AEC1OogTrqWNW83c00fc4",
    mapId: "66e5e313af770b000b90806f",
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return mapData ? (
    <MapView mapData={mapData} style={{ width: "100vw", height: "100vh"}}>
        <FloorSelector />
        <CameraEvents />
        <Labels />
        <DrawNavigation dest={room}/>
    </MapView>
  ) : null;
}

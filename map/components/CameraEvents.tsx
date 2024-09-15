import { useEvent, useMap } from "@mappedin/react-sdk";
import { useEffect, useState } from "react";

export default function CameraEvents() {
  const { mapView, mapData } = useMap();
  const [zoomLevel, setZoomLevel] = useState(
    Math.round(mapView.Camera.zoomLevel)
  );

  useEffect(() => {
    // Make all spaces interactive to
    // have them detected in the click event
    mapData.getByType("space").forEach((space) => {
      mapView.updateState(space, {
        interactive: true,
        hoverColor: "lightgrey",
      });
    });
  }, [mapView, mapData]);

  useEvent("camera-change", (event) => {
    // console.log(
    //   "camera-change",
    //   event.bearing,
    //   event.pitch,
    //   event.zoomLevel,
    //   event.center
    // );
    setZoomLevel(Math.round(event.zoomLevel));
  });

  useEvent("click", (event) => {
    const { labels, spaces } = event;
    if (labels.length === 0 && spaces.length >= 1) {
      mapView.Camera.focusOn(spaces);
    }
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "rgba(255, 255, 255, 0.8)",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
      }}
    >
      <button
        onClick={() => {
          mapView.Camera.animateTo(
            {
              center: mapView.Camera.center,
              zoomLevel: mapView.Camera.zoomLevel + 1,
            },
            { duration: 1000 }
          );
        }}
      >
        Zoom In
      </button>
      <button
        onClick={() => {
          mapView.Camera.animateTo(
            {
              center: mapView.Camera.center,
              zoomLevel: mapView.Camera.zoomLevel - 1,
            },
            { duration: 1000 }
          );
        }}
      >
        Zoom Out
      </button>
      <p>{zoomLevel}</p>
    </div>
  );
}

import { Navigation, useMap } from "@mappedin/react-sdk";

export default function DrawNavigation() {
  const { mapData, mapView } = useMap();

  const space1 = mapData
    .getByType("space")
    .find(space => space.name === "1911");

  const space2 = mapData
    .getByType("space")
    .find(space => space.name === "2000");

  if (space1 && space2) {
    const directions = mapView.getDirections(space1, space2);
    return directions ? <Navigation directions={directions} /> : null;
  }

}

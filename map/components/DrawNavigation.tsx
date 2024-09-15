import { Navigation, useMap } from "@mappedin/react-sdk";

interface DrawNavigationProps {
  dest: string;
}

export default function DrawNavigation({dest}: DrawNavigationProps) {
  const { mapData, mapView } = useMap();

  const space1 = mapData
    .getByType("point-of-interest")
    .find(poi => poi.name === "E7 Main Entrance");

  const space2 = mapData
    .getByType("space")
    .find(space => space.name === dest);

  if (space1 && space2) {
    const directions = mapView.getDirections(space1, space2);
    return directions ? <Navigation directions={directions} /> : null;
  }

}

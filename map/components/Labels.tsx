import { Label, useEvent, useMap } from "@mappedin/react-sdk";

export default function Labels() {
  console.log("Hello")

  const { mapData, mapView } = useMap();

  useEvent("click", (event) => {
    const { labels } = event;

    if (labels.length > 0) {
      labels.forEach((label) => {
        mapView.Labels.remove(label);
      });
    }
  });


  mapData?.getByType("space").forEach((s) => {
    console.log(s.name);
  });

  return (
    <>
      {mapData.getByType("space").map((space, idx) => {
        return (
          <Label
            key={idx}
            target={space.center}
            text={space.name}
            options={{
              interactive: true,
              appearance: {
                marker: {
                  foregroundColor: {
                    active: "tomato",
                  },
                },
                text: {
                  foregroundColor: "tomato",
                },
              },
            }}
          />
        );
      })}
      {mapData.getByType("point-of-interest").map((poi, idx) => {
        return (
          <Label
            key={idx}
            target={poi.coordinate}
            text={poi.name}
            options={{
              interactive: true,
              appearance: {
                marker: {
                  foregroundColor: {
                    active: "dodgerblue",
                  },
                },
                text: {
                  foregroundColor: "dodgerblue",
                },
              },
            }}
          />
        );
      })}
    </>
  );
}

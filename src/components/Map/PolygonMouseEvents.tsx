import React from "react";
import { useMapEvents } from "react-leaflet";
import { LeafletEvent } from "leaflet";

export enum MapEvent {
  HOVER,
  SELECT,
}

const PolygonMouseEvents: React.FC<{
  tooglePolygon: (event: MapEvent, parishLabel: string[]) => void;
  toogleZoom: (zoom: number) => void;
}> = ({ tooglePolygon, toogleZoom }) => {
  useMapEvents({
    layeradd(e: LeafletEvent) {
      if (
        !e?.layer?.options.permanent &&
        e?.layer?.options?.children &&
        e?.layer?.options?.children[0]
      ) {
        e?.layer?.on("click", () =>
          tooglePolygon(MapEvent.SELECT, [e?.layer?.options?.children[0]])
        );

        e?.layer?.on("mouseover", () =>
          tooglePolygon(MapEvent.HOVER, [e?.layer?.options?.children[0]])
        );

        e?.layer?.on("mouseout", () =>
          tooglePolygon(MapEvent.HOVER, [e?.layer?.options?.children[0]])
        );
      }
    },
    zoomend(e: LeafletEvent) {
      toogleZoom(e.target.getZoom());
    },
  });

  return null;
};

export default PolygonMouseEvents;

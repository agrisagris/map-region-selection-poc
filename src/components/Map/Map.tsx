import React, { useState } from "react";
import { MapContainer, Polygon, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngTuple } from "leaflet";

import treeViewWithMapData from "../../data/MapData.json";
import PolygonMouseEvents, { MapEvent } from "./PolygonMouseEvents";
import {
  Accordion,
  AccordionSummary,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";

import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type Parish = {
  label: string;
  swapCoordinates: boolean;
  coordinates: LatLngTuple[];
  selected: boolean;
  hover: boolean;
};

const unselectedColor = { color: "grey" };
const hoverColor = { color: "orange" };
const selectedColor = { color: "green" };

const Map: React.FC = () => {
  const [map, setMap] = useState<any>(null);
  const [mapZoom, setMapZoom] = useState<number>(8);
  const [parishes, setParishes] = useState<Parish[]>(
    treeViewWithMapData.parishes.map((jsonParish) => ({
      ...jsonParish,
      coordinates: jsonParish.coordinates as LatLngTuple[],
      selected: false,
      hover: false,
    }))
  );

  const tooglePolygon = (event: MapEvent, parishLabel: string[]): void => {
    setParishes((previousParishes) =>
      previousParishes.map((parish) =>
        parishLabel.find((parishElement) => parishElement === parish.label)
          ? {
              ...parish,
              ...(event === MapEvent.SELECT
                ? { selected: !parish.selected }
                : {}),
              ...(event === MapEvent.SELECT_ALL ? { selected: true } : {}),
              ...(event === MapEvent.HOVER ? { hover: !parish.hover } : {}),
            }
          : parish
      )
    );
  };

  const toogleZoom = (zoom: number): void => {
    setMapZoom(zoom);
  };

  const swapCoordinates = (polygon: LatLngTuple[]): LatLngTuple[] =>
    polygon.map((coord: LatLngTuple) => [coord[1], coord[0]]);

  const parishIsSelected = (parishLabel: string): boolean | undefined =>
    parishes.find(({ label }) => label === parishLabel)?.selected;

  return (
    <div className="row">
      <div className="col-lg-4 col-12">
        {treeViewWithMapData.treeView.map((county) => (
          <Accordion
            key={county.label}
            onChange={(_: React.SyntheticEvent, expanded: boolean): void => {
              if (county?.coordinates && expanded) {
                map?.flyTo(county.coordinates, 10);
              }
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{county.label}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {county?.children?.map((parish) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        key={parish.label}
                        checked={parishIsSelected(parish.label)}
                        color="success"
                        onChange={() =>
                          tooglePolygon(MapEvent.SELECT, [parish.label])
                        }
                      />
                    }
                    label={parish.label}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
      <div className="col-lg-8 col-12">
        <MapContainer
          style={{ width: "100%", height: "711px" }}
          center={[56.54522, 26.9762]}
          zoom={8}
          scrollWheelZoom
          whenCreated={setMap}
        >
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          />

          <Polygon pathOptions={undefined} positions={[[0, 0]]}>
            <PolygonMouseEvents
              tooglePolygon={tooglePolygon}
              toogleZoom={toogleZoom}
            />
          </Polygon>
          {parishes.map((parish) => (
            <div key={parish.label}>
              <Polygon
                pathOptions={
                  parish.selected
                    ? selectedColor
                    : parish.hover
                    ? hoverColor
                    : unselectedColor
                }
                positions={
                  parish.swapCoordinates
                    ? swapCoordinates(parish.coordinates)
                    : parish.coordinates
                }
              >
                {parish.label}
                {mapZoom > 8 && <Tooltip permanent>{parish.label}</Tooltip>}
              </Polygon>
            </div>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;

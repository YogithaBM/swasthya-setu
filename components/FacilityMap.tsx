"use client";

import L from "leaflet";
import { BedDouble, Stethoscope } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import {
  availableBeds,
  facilities,
  LEVEL_COLORS,
  totalBeds,
  type FacilityLevel,
} from "@/lib/data";
import { getTranslations, type Language } from "@/lib/translations";

const ICON_CACHE: Partial<Record<FacilityLevel, L.DivIcon>> = {};

/** Teardrop pin in the facility level's color with a white centre dot. */
function pinIcon(level: FacilityLevel): L.DivIcon {
  if (ICON_CACHE[level]) return ICON_CACHE[level] as L.DivIcon;
  const color = LEVEL_COLORS[level];
  const icon = L.divIcon({
    className: "", // avoid Leaflet's default white-box style
    html: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 3px rgba(15,23,42,.35)); display:block"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/><circle cx="12" cy="10" r="3" fill="#ffffff"/></svg>`,
    iconSize: [34, 34],
    iconAnchor: [17, 30],
    popupAnchor: [0, -30],
  });
  ICON_CACHE[level] = icon;
  return icon;
}

export default function FacilityMap({ lang }: { lang: Language }) {
  const t = getTranslations(lang);

  return (
    <MapContainer
      center={[20.94, 77.75]}
      zoom={9}
      scrollWheelZoom={false}
      className="z-0 h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {facilities.map((facility) => (
        <Marker
          key={facility.id}
          position={[facility.lat, facility.lng]}
          icon={pinIcon(facility.level)}
        >
          <Popup>
            <div className="space-y-1.5 text-left">
              <p className="text-sm font-extrabold leading-snug text-slate-800">
                {facility.name}
              </p>
              <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: LEVEL_COLORS[facility.level] }}
                />
                {t.levels[facility.level]}
              </p>
              <div className="my-1 h-px bg-slate-100" />
              <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
                {facility.doctorCount} {t.stats.doctors}
              </p>
              <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <BedDouble className="h-3.5 w-3.5 text-blue-700" />
                {availableBeds(facility)}/{totalBeds(facility)}{" "}
                {t.triage.bedsAvailable}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

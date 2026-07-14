'use client';
import { useEffect, useRef } from 'react';
import type { Layer, Map as LeafletMap } from 'leaflet';
import type { Field } from '@/types';

interface FieldMapProps {
  fields: Field[];
  selectedFieldId: string;
  activeLayer: string;
}

type LeafletModule = typeof import('leaflet');

const LAYER_COLORS: Record<string, { fill: string; stroke: string }> = {
  ndvi: { fill: 'rgba(15, 81, 50, 0.35)', stroke: '#0F5132' },
  moisture: { fill: 'rgba(45, 125, 210, 0.35)', stroke: '#2D7DD2' },
  stress: { fill: 'rgba(217, 119, 6, 0.35)', stroke: '#D97706' },
};

function renderFieldLayers(
  L: LeafletModule,
  map: LeafletMap,
  props: FieldMapProps,
  currentLayers: Layer[],
): Layer[] {
  currentLayers.forEach((layer) => map.removeLayer(layer));
  const nextLayers: Layer[] = [];
  const colors = LAYER_COLORS[props.activeLayer] ?? LAYER_COLORS.ndvi;

  props.fields.forEach((field) => {
    const isSelected = field.id === props.selectedFieldId;
    const boundary = field.boundary.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
    const polygon = L.polygon(boundary, {
      color: isSelected ? colors.stroke : '#484F58',
      fillColor: isSelected ? colors.fill : 'rgba(48,54,61,0.2)',
      weight: isSelected ? 3 : 1.5,
      fillOpacity: 1,
      dashArray: isSelected ? undefined : '6',
    }).addTo(map);

    const popup = L.popup({ className: 'kisanmitra-popup' }).setContent(
      `<div style="background:#161B22;color:#F0EDE8;padding:8px;border-radius:8px;font-size:12px;">
        <strong>${field.name}</strong><br/>
        ${field.areaHectares}ha &middot; ${field.irrigationMethod}<br/>
        Soil: ${field.soilCharacteristics.type}
      </div>`,
    );
    polygon.bindPopup(popup);

    if (isSelected && props.activeLayer === 'stress') {
      const marker = L.circleMarker(
        [field.centroid.lat + 0.003, field.centroid.lng + 0.003],
        { color: '#EF4444', fillColor: 'rgba(220,38,38,0.4)', radius: 12, weight: 2, fillOpacity: 1 },
      ).addTo(map).bindTooltip('Stress Zone', { permanent: false });
      nextLayers.push(marker);
    }

    nextLayers.push(polygon);
  });

  const selected = props.fields.find((field) => field.id === props.selectedFieldId);
  if (selected) {
    const coords = selected.boundary.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
    map.fitBounds(coords, { padding: [30, 30] });
  }

  return nextLayers;
}

export default function FieldMap({ fields, selectedFieldId, activeLayer }: FieldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const layersRef = useRef<Layer[]>([]);
  const latestPropsRef = useRef<FieldMapProps>({ fields, selectedFieldId, activeLayer });

  useEffect(() => {
    latestPropsRef.current = { fields, selectedFieldId, activeLayer };
  }, [fields, selectedFieldId, activeLayer]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return undefined;
    let cancelled = false;

    void import('leaflet').then((L) => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [20.010, 73.785],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      layersRef.current = renderFieldLayers(L, map, latestPropsRef.current, layersRef.current);
    });

    return () => {
      cancelled = true;
      layersRef.current = [];
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return undefined;
    let cancelled = false;

    void import('leaflet').then((L) => {
      if (cancelled) return;
      layersRef.current = renderFieldLayers(L, map, { fields, selectedFieldId, activeLayer }, layersRef.current);
    });

    return () => {
      cancelled = true;
    };
  }, [fields, selectedFieldId, activeLayer]);

  return <div ref={mapRef} style={{ height: '320px', width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 0 }} />;
}
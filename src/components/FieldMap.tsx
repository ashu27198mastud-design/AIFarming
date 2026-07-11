'use client';
import { useEffect, useRef } from 'react';
import type { Field } from '@/types';

interface FieldMapProps {
  fields: Field[];
  selectedFieldId: string;
  activeLayer: string;
}

const LAYER_COLORS: Record<string, { fill: string; stroke: string }> = {
  ndvi: { fill: 'rgba(15, 81, 50, 0.35)', stroke: '#0F5132' },
  moisture: { fill: 'rgba(45, 125, 210, 0.35)', stroke: '#2D7DD2' },
  stress: { fill: 'rgba(217, 119, 6, 0.35)', stroke: '#D97706' },
};

export default function FieldMap({ fields, selectedFieldId, activeLayer }: FieldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    const L = require('leaflet');

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
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  useEffect(() => {
    const L = require('leaflet');
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old layers
    layersRef.current.forEach(l => map.removeLayer(l));
    layersRef.current = [];

    const colors = LAYER_COLORS[activeLayer] ?? LAYER_COLORS.ndvi;

    fields.forEach(field => {
      const isSelected = field.id === selectedFieldId;
      const polygon = L.polygon(
        field.boundary.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng]),
        {
          color: isSelected ? colors.stroke : '#484F58',
          fillColor: isSelected ? colors.fill : 'rgba(48,54,61,0.2)',
          weight: isSelected ? 3 : 1.5,
          fillOpacity: 1,
          dashArray: isSelected ? undefined : '6',
        }
      ).addTo(map);

      const popup = L.popup({ className: 'kisanmitra-popup' }).setContent(
        `<div style="background:#161B22;color:#F0EDE8;padding:8px;border-radius:8px;font-size:12px;">
          <strong>${field.name}</strong><br/>
          ${field.areaHectares}ha &middot; ${field.irrigationMethod}<br/>
          Soil: ${field.soilCharacteristics.type}
        </div>`
      );
      polygon.bindPopup(popup);

      // Stress zone marker for selected field
      if (isSelected && activeLayer === 'stress') {
        const marker = L.circleMarker(
          [field.centroid.lat + 0.003, field.centroid.lng + 0.003],
          { color: '#EF4444', fillColor: 'rgba(220,38,38,0.4)', radius: 12, weight: 2, fillOpacity: 1 }
        ).addTo(map).bindTooltip('Stress Zone', { permanent: false });
        layersRef.current.push(marker);
      }

      layersRef.current.push(polygon);
    });

    // Fit to selected field
    const selected = fields.find(f => f.id === selectedFieldId);
    if (selected) {
      const coords = selected.boundary.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng]) as [number, number][];
      map.fitBounds(coords, { padding: [30, 30] });
    }
  }, [fields, selectedFieldId, activeLayer]);

  return <div ref={mapRef} style={{ height: '320px', width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 0 }} />;
}

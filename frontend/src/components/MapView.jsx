import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapView({
  center = { lat: 28.4744, lng: 77.5040 },
  radiusKm = 25,
  jobs = [],
  workers = [],
  selectedItem = null,
  onSelectItem = null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map once with Voyager Light tiles
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: 11,
        zoomControl: true
      });

      // Light OpenStreetMap Voyager Tile Layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // Pan map to center
    map.panTo([center.lat, center.lng]);

    // Draw Spatial Radius Circle in Emerald Green
    const radiusMeters = radiusKm * 1000;
    circleRef.current = L.circle([center.lat, center.lng], {
      color: '#16A34A',
      fillColor: '#16A34A',
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '4, 4',
      radius: radiusMeters
    }).addTo(layerGroup);

    // Custom Marker Creator
    const createCustomIcon = (bgColor, iconText, borderColor = '#ffffff') => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: ${bgColor};
            border: 2px solid ${borderColor};
            color: white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            cursor: pointer;
          ">
            ${iconText}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
    };

    // Center base marker
    L.marker([center.lat, center.lng], {
      icon: createCustomIcon('#064E3B', '📍', '#84CC16')
    })
      .bindPopup(`<b>Center Radius Base</b><br/>Lat: ${center.lat.toFixed(4)}, Lng: ${center.lng.toFixed(4)}`)
      .addTo(layerGroup);

    // Plot Jobs Markers
    jobs.forEach(job => {
      if (!job.location || !job.location.lat || !job.location.lng) return;

      const isSelected = selectedItem && selectedItem.id === job.id;
      const markerColor = isSelected ? '#DC2626' : '#16A34A';
      const iconSymbol = job.skill_required === 'Masonry' ? '🧱' :
                         job.skill_required === 'Carpentry' ? '🪵' :
                         job.skill_required === 'Agriculture' ? '🌾' :
                         job.skill_required === 'Plumbing' ? '🔧' : '🏗️';

      const marker = L.marker([job.location.lat, job.location.lng], {
        icon: createCustomIcon(markerColor, iconSymbol)
      }).addTo(layerGroup);

      const popupContent = `
        <div style="color: #12372A; font-family: Inter, sans-serif;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #064E3B;">${job.title}</h4>
          <p style="margin: 0 0 4px 0; font-size: 12px;"><b>Wage:</b> ₹${job.daily_wage}/day | <b>Skill:</b> ${job.skill_required}</p>
          <p style="margin: 0; font-size: 11px; color: #64748B;">${job.location.address || 'Local'}</p>
          ${job.distance_km !== undefined ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #16A34A; font-weight: bold;">Distance: ${job.distance_km} km</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectItem) onSelectItem(job);
      });
    });

    // Plot Worker Markers
    workers.forEach(worker => {
      if (!worker.location || !worker.location.lat || !worker.location.lng) return;

      const isSelected = selectedItem && selectedItem.id === worker.id;
      const markerColor = isSelected ? '#DC2626' : '#064E3B';
      const iconSymbol = '👷';

      const marker = L.marker([worker.location.lat, worker.location.lng], {
        icon: createCustomIcon(markerColor, iconSymbol)
      }).addTo(layerGroup);

      const popupContent = `
        <div style="color: #12372A; font-family: Inter, sans-serif;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #064E3B;">${worker.name}</h4>
          <p style="margin: 0 0 4px 0; font-size: 12px;"><b>Skill:</b> ${worker.primary_skill} (${worker.experience_years} yrs exp)</p>
          <p style="margin: 0 0 4px 0; font-size: 11px; color: #16A34A; font-weight: bold;">⭐ ${worker.avg_rating || 5.0} Rating | ${worker.trust_badge || 'Verified'}</p>
          ${worker.distance_km !== undefined ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #16A34A; font-weight: bold;">Distance: ${worker.distance_km} km</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectItem) onSelectItem(worker);
      });
    });

  }, [center, radiusKm, jobs, workers, selectedItem]);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-[#064E3B] flex items-center gap-2 shadow-sm">
        <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]"></span> Jobs
        <span className="h-2.5 w-2.5 rounded-full bg-[#064E3B] ml-2"></span> Workers
        <span className="text-[#475569] ml-2 font-medium">({radiusKm} km radius)</span>
      </div>
    </div>
  );
}

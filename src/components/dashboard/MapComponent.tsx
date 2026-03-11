"use client"

import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Bin } from '@/lib/types'
import { getBinStatusColor } from '@/utils/helpers'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: undefined,
  iconUrl: undefined,
  shadowUrl: undefined,
})

interface Props {
  bins: Bin[]
  onSelectBin?: (bin: Bin) => void
  userLocation?: { lat: number; lng: number } | null
  optimizedRoute?: any
}

export const MapComponent: React.FC<Props> = ({ bins, onSelectBin, userLocation, optimizedRoute }) => {
  const center = userLocation || (bins.length > 0 ? { lat: bins[0].latitude, lng: bins[0].longitude } : { lat: 28.7041, lng: 77.1025 })

  // Compute polyline points from optimizedRoute.waypoints if present
  const routePoints = optimizedRoute?.waypoints?.map((wp: any) => [wp.latitude, wp.longitude]) || []

  return (
    <div className="w-full h-96 lg:h-full">
      <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {bins.map((bin) => (
          <CircleMarker
            key={bin.id}
            center={[bin.latitude, bin.longitude]}
            radius={8}
            pathOptions={{ color: getBinStatusColor(bin.fillPercentage).replace('text-', '').replace('-', '') || '#3b82f6' }}
            eventHandlers={{
              click: () => onSelectBin && onSelectBin(bin),
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>Bin {bin.id}</strong>
                <div>Fill: {bin.fillPercentage}%</div>
                <div>{bin.location}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {routePoints.length > 0 && (
          <Polyline positions={routePoints} pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8 }} />
        )}
      </MapContainer>
    </div>
  )
}

export default MapComponent

'use client'

import {
  DashboardConstituency,
  useElectionResults,
} from '@/hooks/use-dashboard'
import { geoCentroid } from 'd3-geo'

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps'

// Thailand TopoJSON URL (Provinces) - Local File
const THAILAND_TOPO_JSON = '/maps/thailand.json'

// Colors for parties (fallback if data missing)
const PARTY_COLORS: Record<string, string> = {
  PTP: '#E30613',
  MFP: '#F47933',
  BJT: '#2D3494',
  DEM: '#00B2E3',
  UTN: '#0F1E8E',
}

export function ThailandMap() {
  const { data: results } = useElectionResults()

  // Normalize helper
  const normalize = (n: string) => n.toLowerCase().replace(/\s+/g, '')

  // Helper to get matching constituencies for a province
  const getProvinceData = (provinceName: string) => {
    if (!results || !results.constituencies) return []
    const normalizedTarget = normalize(provinceName)
    return results.constituencies.filter((c: DashboardConstituency) => {
      const normalizedSource = normalize(c.province)
      return (
        normalizedSource === normalizedTarget ||
        normalizedSource.includes(normalizedTarget) ||
        normalizedTarget.includes(normalizedSource)
      )
    })
  }

  // Helper to determine dominant party color
  const getProvinceColor = (provData: DashboardConstituency[]) => {
    if (provData.length === 0) return '#F1F5F9' // Slate-100

    // Count wins per party
    const partyWins: Record<string, { count: number; color: string }> = {}

    provData.forEach((c) => {
      // Check candidates existence
      if (c.candidates && c.candidates.length > 0) {
        const sorted = [...c.candidates].sort(
          (a, b) => b.voteCount - a.voteCount,
        )
        const winner = sorted[0]

        // Fix: API returns flat partyId, partyColor
        if (winner && winner.partyId) {
          const pId = winner.partyId
          // Use API color, fallback to map constant
          const pColor =
            winner.partyColor || PARTY_COLORS[winner.partyName] || '#333'

          if (!partyWins[pId]) {
            partyWins[pId] = { count: 0, color: pColor }
          }
          partyWins[pId].count++
        }
      }
    })

    // Find dominant party
    let dominantColor = '#CBD5E1' // Slate-300 (No Clear Winner)

    if (Object.keys(partyWins).length > 0) {
      let currentMax = -1
      Object.values(partyWins).forEach((pw) => {
        if (pw.count > currentMax) {
          currentMax = pw.count
          dominantColor = pw.color
        }
      })
    }

    return dominantColor
  }

  return (
    <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-0 overflow-hidden relative h-[50vh] min-h-[400px] md:h-[800px] flex flex-col'>
      <div className='absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm border border-slate-100'>
        <h3 className='font-bold text-slate-800 text-sm'>Live Election Map</h3>
        <p className='text-[10px] text-slate-500'>Leading party by province</p>
      </div>

      <ComposableMap
        projection='geoMercator'
        projectionConfig={{
          scale: 4500, // Zoom for Thailand (Increased from 3500)
          center: [100.5, 13.5], // Lat/Lng center of Thailand
        }}
        className='w-full h-full bg-slate-50'
      >
        <ZoomableGroup zoom={1}>
          <Geographies geography={THAILAND_TOPO_JSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const provinceName =
                  geo.properties.NAME_1 || geo.properties.name
                const provData = getProvinceData(provinceName)
                const color = getProvinceColor(provData)
                const centroid = geoCentroid(geo)
                // Calculate seat count (number of constituencies in this province)
                const seatCount = provData.length

                return (
                  <g key={geo.rsmKey}>
                    <Geography
                      geography={geo}
                      fill={color}
                      stroke='#64748b' // Slate-500 for clearer borders
                      strokeWidth={0.8}
                      style={{
                        default: { outline: 'none' },
                        hover: {
                          fill: '#1e293b', // Slate-800 on hover
                          stroke: '#000',
                          strokeWidth: 1.5,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={() => {
                        // Could add tooltip interaction state here if needed
                      }}
                    />
                    {/* Label */}
                    <Marker coordinates={centroid}>
                      <text
                        textAnchor='middle'
                        y={2}
                        style={{
                          fontFamily: 'system-ui',
                          fontSize: '6px',
                          fill: '#0f172a', // Slate-900 (Dark text)
                          fontWeight: '600',
                          pointerEvents: 'none',
                          textShadow:
                            '0px 0px 2px rgba(255,255,255,0.9), 0px 0px 4px rgba(255,255,255,0.9)', // Strong Halo for readability
                          letterSpacing: '0.2px',
                        }}
                      >
                        {provinceName}
                        {seatCount > 0 && ` (${seatCount})`}
                      </text>
                    </Marker>
                  </g>
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend Override */}
      <div className='absolute bottom-4 right-4 bg-white/90 p-3 rounded-lg border border-slate-100 text-xs shadow-sm'>
        <div className='font-bold mb-2'>Color Key</div>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center'>
            <span className='w-3 h-3 rounded-full mr-2 bg-slate-100 border'></span>{' '}
            Data Pending/Open
          </div>
          {Object.entries(PARTY_COLORS).map(([name, color]) => (
            <div
              key={name}
              className='flex items-center'
            >
              <span
                className='w-3 h-3 rounded-full mr-2'
                style={{ backgroundColor: color }}
              ></span>{' '}
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

interface RoueA2PProps {
  scores: {
    F: number
    R: number
    P: number
    M: number
  }
  metadata: {
    date: string           // "16/10/2023"
    analysedFor: string    // "Accompagnement Managérial"
    coacheeName?: string   // "Coralie BROUILLET"
    profileCode: string    // "F5R4P6M5"
    profileName: string    // "ADAPTATIF ET POLYVALENT"
    resultCode: string     // "F5 R4 P6 M5"
  }
  // Future enhancement: Soc/Psy analysis toggle (not yet implemented)
  showSocPsy?: boolean
  socScores?: { F: number; R: number; P: number; M: number }
  psyScores?: { F: number; R: number; P: number; M: number }
}

/**
 * RoueA2P - A2P Wheel visualization component
 * Displays an octagonal chart with 4 axes (F, R, P, M) and a focal point
 * Based on section 6 of the specifications
 */
export default function RoueA2P({ scores, metadata }: RoueA2PProps) {
  // SVG dimensions
  const SVG_WIDTH = 600
  const SVG_HEIGHT = 700
  
  // Chart dimensions
  const CHART_SIZE = 500
  const CHART_CENTER_X = SVG_WIDTH / 2
  const CHART_CENTER_Y = 400 // Offset down for header
  const GRID_STEP = CHART_SIZE / 26 // 13 graduations on each side of center
  
  // Compute focal point position
  // gridX: positive = towards M (right), negative = towards P (left)
  // gridY: positive = towards F (up), negative = towards R (down)
  const focalPoint = {
    gridX: scores.M - scores.P,
    gridY: scores.F - scores.R,
  }
  
  // Convert grid coordinates to SVG coordinates
  const focalX = CHART_CENTER_X + focalPoint.gridX * GRID_STEP
  const focalY = CHART_CENTER_Y - focalPoint.gridY * GRID_STEP // Invert Y for SVG
  
  // Octagon corner points
  // The octagon cuts the corners at 45° angles
  // Corner distance: 9.19 ≈ 13/√2 (for 45° corner cuts on a square grid)
  const cornerDist = 13 * GRID_STEP
  const cornerCut = 9.19 * GRID_STEP
  
  const octagonPoints = [
    // Top edge
    { x: CHART_CENTER_X - cornerCut, y: CHART_CENTER_Y - cornerDist },
    { x: CHART_CENTER_X + cornerCut, y: CHART_CENTER_Y - cornerDist },
    // Right edge
    { x: CHART_CENTER_X + cornerDist, y: CHART_CENTER_Y - cornerCut },
    { x: CHART_CENTER_X + cornerDist, y: CHART_CENTER_Y + cornerCut },
    // Bottom edge
    { x: CHART_CENTER_X + cornerCut, y: CHART_CENTER_Y + cornerDist },
    { x: CHART_CENTER_X - cornerCut, y: CHART_CENTER_Y + cornerDist },
    // Left edge
    { x: CHART_CENTER_X - cornerDist, y: CHART_CENTER_Y + cornerCut },
    { x: CHART_CENTER_X - cornerDist, y: CHART_CENTER_Y - cornerCut },
  ]
  
  const octagonPath = octagonPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ') + ' Z'
  
  // Generate grid dots
  const gridDots: JSX.Element[] = []
  for (let x = -13; x <= 13; x++) {
    for (let y = -13; y <= 13; y++) {
      const svgX = CHART_CENTER_X + x * GRID_STEP
      const svgY = CHART_CENTER_Y - y * GRID_STEP
      
      // Check if point is inside octagon (approximate)
      const isInside = 
        Math.abs(x) + Math.abs(y) <= 13 && // Inside diamond
        Math.abs(x) <= 13 && Math.abs(y) <= 13 // Inside square
      
      if (!isInside) continue
      
      // Larger dots at odd positions
      const isOdd = Math.abs(x) % 2 === 1 && Math.abs(y) % 2 === 1
      const radius = isOdd ? 2 : 1
      const opacity = isOdd ? 0.7 : 0.3
      
      gridDots.push(
        <circle
          key={`dot-${x}-${y}`}
          cx={svgX}
          cy={svgY}
          r={radius}
          fill="#000000"
          opacity={opacity}
        />
      )
    }
  }
  
  // Generate graduations for axes
  const graduations = [1, 3, 5, 7, 9, 11, 13]
  
  return (
    <svg
      width={SVG_WIDTH}
      height={SVG_HEIGHT}
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      className="max-w-full h-auto"
      style={{ fontFamily: 'Source Sans 3, sans-serif' }}
    >
      {/* Header Section */}
      <rect x="0" y="0" width={SVG_WIDTH} height="100" fill="#F5EBD8" stroke="#D4C5A9" strokeWidth="1" />
      
      {/* IT2P Logo */}
      <text x="20" y="40" fontSize="32" fontWeight="bold" fill="#2D2A26" fontFamily="Playfair Display, serif">
        IT₂P
      </text>
      
      {/* Metadata Table */}
      <g transform="translate(20, 55)">
        <text fontSize="10" fill="#2D2A26">
          <tspan x="0" dy="0">Date: {metadata.date}</tspan>
          <tspan x="120" dy="0">Analysé pour: {metadata.analysedFor}</tspan>
        </text>
        <text fontSize="10" fill="#2D2A26">
          <tspan x="0" dy="12">Résultat: {metadata.resultCode}</tspan>
          {metadata.coacheeName && (
            <tspan x="120" dy="0">Coaché(e): {metadata.coacheeName}</tspan>
          )}
        </text>
        <text fontSize="10" fill="#2D2A26">
          <tspan x="0" dy="12">Profil: {metadata.profileCode}</tspan>
          <tspan x="120" dy="0">Type: {metadata.profileName}</tspan>
        </text>
      </g>
      
      {/* Main Chart Background */}
      <rect
        x={CHART_CENTER_X - CHART_SIZE / 2}
        y={CHART_CENTER_Y - CHART_SIZE / 2}
        width={CHART_SIZE}
        height={CHART_SIZE}
        fill="#FFFFFF"
      />
      
      {/* Grid dots */}
      {gridDots}
      
      {/* Octagonal border */}
      <path
        d={octagonPath}
        fill="none"
        stroke="#000000"
        strokeWidth="1.5"
      />
      
      {/* Central axes */}
      <line
        x1={CHART_CENTER_X - 13 * GRID_STEP}
        y1={CHART_CENTER_Y}
        x2={CHART_CENTER_X + 13 * GRID_STEP}
        y2={CHART_CENTER_Y}
        stroke="#333333"
        strokeWidth="0.5"
      />
      <line
        x1={CHART_CENTER_X}
        y1={CHART_CENTER_Y - 13 * GRID_STEP}
        x2={CHART_CENTER_X}
        y2={CHART_CENTER_Y + 13 * GRID_STEP}
        stroke="#333333"
        strokeWidth="0.5"
      />
      
      {/* Axis labels */}
      {/* F - Top */}
      <text
        x={CHART_CENTER_X}
        y={CHART_CENTER_Y - 13 * GRID_STEP - 20}
        fontSize="24"
        fontWeight="bold"
        fill="#000000"
        textAnchor="middle"
      >
        F
      </text>
      
      {/* R - Bottom */}
      <text
        x={CHART_CENTER_X}
        y={CHART_CENTER_Y + 13 * GRID_STEP + 35}
        fontSize="24"
        fontWeight="bold"
        fill="#000000"
        textAnchor="middle"
      >
        R
      </text>
      
      {/* P - Left */}
      <text
        x={CHART_CENTER_X - 13 * GRID_STEP - 30}
        y={CHART_CENTER_Y + 8}
        fontSize="24"
        fontWeight="bold"
        fill="#000000"
        textAnchor="middle"
      >
        P
      </text>
      
      {/* M - Right */}
      <text
        x={CHART_CENTER_X + 13 * GRID_STEP + 30}
        y={CHART_CENTER_Y + 8}
        fontSize="24"
        fontWeight="bold"
        fill="#000000"
        textAnchor="middle"
      >
        M
      </text>
      
      {/* Graduations on F axis (top) */}
      {graduations.map((grad) => (
        <text
          key={`grad-f-${grad}`}
          x={CHART_CENTER_X + 8}
          y={CHART_CENTER_Y - grad * GRID_STEP + 4}
          fontSize="10"
          fill="#666666"
          textAnchor="start"
        >
          {grad}
        </text>
      ))}
      
      {/* Graduations on R axis (bottom) */}
      {graduations.map((grad) => (
        <text
          key={`grad-r-${grad}`}
          x={CHART_CENTER_X + 8}
          y={CHART_CENTER_Y + grad * GRID_STEP + 4}
          fontSize="10"
          fill="#666666"
          textAnchor="start"
        >
          {grad}
        </text>
      ))}
      
      {/* Graduations on P axis (left) */}
      {graduations.map((grad) => (
        <text
          key={`grad-p-${grad}`}
          x={CHART_CENTER_X - grad * GRID_STEP}
          y={CHART_CENTER_Y - 8}
          fontSize="10"
          fill="#666666"
          textAnchor="middle"
        >
          {grad}
        </text>
      ))}
      
      {/* Graduations on M axis (right) */}
      {graduations.map((grad) => (
        <text
          key={`grad-m-${grad}`}
          x={CHART_CENTER_X + grad * GRID_STEP}
          y={CHART_CENTER_Y - 8}
          fontSize="10"
          fill="#666666"
          textAnchor="middle"
        >
          {grad}
        </text>
      ))}
      
      {/* Focal point ⊗ */}
      <g>
        {/* Circle */}
        <circle
          cx={focalX}
          cy={focalY}
          r="8"
          fill="none"
          stroke="#CC3333"
          strokeWidth="2"
        />
        {/* Cross */}
        <line
          x1={focalX - 8}
          y1={focalY}
          x2={focalX + 8}
          y2={focalY}
          stroke="#CC3333"
          strokeWidth="2"
        />
        <line
          x1={focalX}
          y1={focalY - 8}
          x2={focalX}
          y2={focalY + 8}
          stroke="#CC3333"
          strokeWidth="2"
        />
      </g>
      
      {/* Focal point coordinates label */}
      <text
        x={focalX}
        y={focalY + 25}
        fontSize="10"
        fill="#CC3333"
        textAnchor="middle"
        fontWeight="bold"
      >
        ({focalPoint.gridX > 0 ? 'M' : 'P'}{Math.abs(focalPoint.gridX)}, {focalPoint.gridY > 0 ? 'F' : 'R'}{Math.abs(focalPoint.gridY)})
      </text>
    </svg>
  )
}

'use client'

type Props = {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
}

export default function Sparkline({
  data,
  width = 240,
  height = 56,
  stroke = '#00FF87',
  fill = 'rgba(0,255,135,0.12)',
}: Props) {
  if (data.length === 0) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: 'block' }}
      >
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke='rgba(0,255,135,0.2)'
          strokeWidth={1}
          strokeDasharray='3 3'
        />
      </svg>
    )
  }

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = Math.max(1, max - min)
  const stepX = data.length === 1 ? 0 : width / (data.length - 1)

  const points = data.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * (height - 4) - 2
    return [x, y] as const
  })

  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block' }}
    >
      <path d={areaPath} fill={fill} stroke='none' />
      <path d={linePath} fill='none' stroke={stroke} strokeWidth={1.5} strokeLinejoin='round' strokeLinecap='round' />
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r={2}
          fill={stroke}
        />
      )}
    </svg>
  )
}

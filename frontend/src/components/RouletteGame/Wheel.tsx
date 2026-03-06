'use client'

import { motion } from 'framer-motion'
import { Box } from '@mantine/core'

interface WheelProps {
    targetRotation: number
    isSpinning: boolean
    onSpinComplete: () => void
}

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36])

export default function Wheel({ targetRotation, isSpinning, onSpinComplete }: WheelProps) {
    const numbers = Array.from({ length: 37 }, (_, i) => i)

    const segments = numbers.map(num => {
        let color = '#fff'
        let textColor = '#000'
        if (num === 0) {
            color = '#2d8659'; textColor = '#fff'
        } else if (RED_NUMBERS.has(num)) {
            color = '#ee5a5a'; textColor = '#fff'
        } else {
            color = '#2c2c2c'; textColor = '#fff'
        }
        return { num, color, textColor }
    })

    return (
        <Box
            style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '2rem',
            }}
        >
            <motion.div
                animate={{ rotate: targetRotation }}
                transition={isSpinning ? { duration: 4, ease: 'easeOut' } : { duration: 0 }}
                onAnimationComplete={() => {
                    if (isSpinning) onSpinComplete()
                }}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <svg
                    width={400}
                    height={400}
                    viewBox="0 0 400 400"
                    style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
                >
                    <circle cx="200" cy="200" r="195" fill="none" stroke="#333" strokeWidth="2" />

                    {segments.map(segment => {
                        const angle = (segment.num / 37) * 360
                        const nextAngle = ((segment.num + 1) / 37) * 360
                        const startRad = (angle * Math.PI) / 180
                        const endRad = (nextAngle * Math.PI) / 180
                        const radius = 160

                        const x1 = 200 + radius * Math.cos(startRad)
                        const y1 = 200 + radius * Math.sin(startRad)
                        const x2 = 200 + radius * Math.cos(endRad)
                        const y2 = 200 + radius * Math.sin(endRad)
                        const largeArc = nextAngle - angle > 180 ? 1 : 0
                        const pathD = `M 200 200 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

                        const textAngle = (startRad + endRad) / 2
                        const textRadius = 130
                        const textX = 200 + textRadius * Math.cos(textAngle)
                        const textY = 200 + textRadius * Math.sin(textAngle)
                        const textRotation = (textAngle * 180) / Math.PI + 90

                        return (
                            <g key={segment.num}>
                                <path d={pathD} fill={segment.color} stroke="#fff" strokeWidth="1.5" />
                                <text
                                    x={textX}
                                    y={textY}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill={segment.textColor}
                                    fontSize="12"
                                    fontWeight="bold"
                                    transform={`rotate(${textRotation} ${textX} ${textY})`}
                                >
                                    {segment.num}
                                </text>
                            </g>
                        )
                    })}

                    <circle cx="200" cy="200" r="25" fill="#fff" stroke="#333" strokeWidth="2" />
                    <text x="200" y="205" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#333">
                        ●
                    </text>
                </svg>
            </motion.div>

            {/* Fixed pointer at top */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '12px solid transparent',
                    borderRight: '12px solid transparent',
                    borderTop: '22px solid #ee5a5a',
                    zIndex: 10,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                }}
            />
        </Box>
    )
}

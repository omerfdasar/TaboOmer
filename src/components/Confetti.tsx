import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function Confetti() {
  useEffect(() => {
    const colors = ['#ff6b9d', '#4ecdc4', '#ffd700', '#ff9f43', '#26de81']

    // Just one celebratory burst on mount
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors,
      disableForReducedMotion: true,
    })

    // No continuous animation - just the initial burst
  }, [])

  return null
}

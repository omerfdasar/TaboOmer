import { useState, useEffect, useCallback } from 'react'

interface TimerProps {
  initialSeconds: number
  team: 'red' | 'blue'
  onTimeUp: () => void
  onReset: () => void
}

export default function Timer({ initialSeconds, team, onTimeUp, onReset }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    if (!isRunning || seconds <= 0) return

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          // Vibrate when time is up (pattern: vibrate 200ms, pause 100ms, vibrate 200ms)
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200])
          }
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, seconds, onTimeUp])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = useCallback(() => {
    setSeconds(initialSeconds)
    setIsRunning(true)
    onReset()
  }, [initialSeconds, onReset])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`
  }

  const isLowTime = seconds <= 10

  return (
    <div className="flex items-center gap-2">
      {/* Team indicator */}
      <div
        className={`w-3 h-3 rounded-full ${
          team === 'red' ? 'bg-red-500' : 'bg-blue-500'
        }`}
      />

      {/* Timer display */}
      <button
        onClick={toggleTimer}
        className={`px-4 py-2 rounded-xl font-mono font-bold text-xl transition-all ${
          isLowTime
            ? 'bg-red-500/20 text-red-400 animate-pulse'
            : 'bg-slate-800/60 text-slate-200'
        }`}
      >
        {formatTime(seconds)}
        {!isRunning && <span className="ml-2 text-xs text-slate-500">||</span>}
      </button>

      {/* Reset button */}
      <button
        onClick={resetTimer}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
        title="Yeniden Basla"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  )
}

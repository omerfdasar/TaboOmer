import { useState, useEffect } from 'react'

interface StartScreenProps {
  onStart: (team: 'red' | 'blue', duration: number) => void
  onReset: () => void
}

interface TeamProgress {
  red: { seen: number; total: number }
  blue: { seen: number; total: number }
}

const TIMER_OPTIONS = [
  { label: '1 dk', value: 60 },
  { label: '1.5 dk', value: 90 },
  { label: '2 dk', value: 120 },
]

function getTeamProgress(): TeamProgress | null {
  const stored = localStorage.getItem('taboo-teams')
  if (stored) {
    const teams = JSON.parse(stored)
    return {
      red: { seen: teams.red.seenCount, total: teams.red.cards.length },
      blue: { seen: teams.blue.seenCount, total: teams.blue.cards.length }
    }
  }
  return null
}

export default function StartScreen({ onStart, onReset }: StartScreenProps) {
  const [selectedTeam, setSelectedTeam] = useState<'red' | 'blue' | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number>(90)
  const [progress, setProgress] = useState<TeamProgress | null>(null)

  useEffect(() => {
    setProgress(getTeamProgress())
  }, [])

  const handleStart = () => {
    if (selectedTeam) {
      onStart(selectedTeam, selectedDuration)
    }
  }

  const handleReset = () => {
    if (confirm('Tum takim ilerlemeleri sifirlanacak. Emin misin?')) {
      onReset()
      setProgress(getTeamProgress())
    }
  }

  const getCardsRemaining = (team: 'red' | 'blue') => {
    if (!progress) return null
    const remaining = progress[team].total - progress[team].seen
    return remaining > 0 ? remaining : progress[team].total
  }

  return (
    <div className="h-full flex flex-col px-6 py-12 safe-area-inset">
      <div className="w-full max-w-md mx-auto flex flex-col h-full">

        {/* Logo/Title - Top */}
        <div className="text-center pt-4">
          <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-2xl shadow-red-500/30">
            <h1 className="text-5xl font-black text-white tracking-widest">
              TABOOMER
            </h1>
          </div>
        </div>

        {/* Middle Section - Team & Timer */}
        <div className="flex-1 flex flex-col justify-center py-8">

          {/* Team Selection */}
          <div>
            <p className="text-white/40 text-xs font-medium mb-4 text-center uppercase tracking-widest">Takim Sec</p>
            <div className="flex gap-4">
              {/* Red Team */}
              <button
                onClick={() => setSelectedTeam('red')}
                className={`flex-1 relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  selectedTeam === 'red'
                    ? 'scale-105 shadow-2xl shadow-red-500/40'
                    : ''
                }`}
              >
                <div className={`p-5 rounded-2xl ${
                  selectedTeam === 'red'
                    ? 'bg-gradient-to-br from-red-500 to-red-600'
                    : 'bg-white/5 border-2 border-red-500/30'
                }`}>
                  <div className={`text-2xl font-black mb-1 ${
                    selectedTeam === 'red' ? 'text-white' : 'text-red-400'
                  }`}>
                    KIRMIZI
                  </div>
                  {progress && (
                    <div className={`text-sm ${
                      selectedTeam === 'red' ? 'text-red-100' : 'text-red-400/70'
                    }`}>
                      {getCardsRemaining('red')} kart
                    </div>
                  )}
                </div>
              </button>

              {/* Blue Team */}
              <button
                onClick={() => setSelectedTeam('blue')}
                className={`flex-1 relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  selectedTeam === 'blue'
                    ? 'scale-105 shadow-2xl shadow-blue-500/40'
                    : ''
                }`}
              >
                <div className={`p-5 rounded-2xl ${
                  selectedTeam === 'blue'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                    : 'bg-white/5 border-2 border-blue-500/30'
                }`}>
                  <div className={`text-2xl font-black mb-1 ${
                    selectedTeam === 'blue' ? 'text-white' : 'text-blue-400'
                  }`}>
                    MAVI
                  </div>
                  {progress && (
                    <div className={`text-sm ${
                      selectedTeam === 'blue' ? 'text-blue-100' : 'text-blue-400/70'
                    }`}>
                      {getCardsRemaining('blue')} kart
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Spacer */}
          <div className="h-16" />

          {/* Timer Selection */}
          <div>
            <p className="text-white/40 text-xs font-medium mb-4 text-center uppercase tracking-widest">Tur Suresi</p>
            <div className="bg-white/5 p-1.5 rounded-2xl">
              <div className="flex">
                {TIMER_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDuration(option.value)}
                    className={`flex-1 py-4 font-bold text-lg transition-all duration-200 ${
                      index === 0 ? 'rounded-l-xl' : ''
                    } ${
                      index === TIMER_OPTIONS.length - 1 ? 'rounded-r-xl' : ''
                    } ${
                      selectedDuration === option.value
                        ? 'bg-white text-gray-900 shadow-lg'
                        : 'text-white/60 hover:text-white/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Buttons */}
        <div className="pb-4 pt-8">
          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!selectedTeam}
            className={`w-full py-5 rounded-2xl font-black text-2xl tracking-wider transition-all duration-300 ${
              selectedTeam
                ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 active:scale-95'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            BASLA
          </button>

          {/* Reset Button */}
          {progress && (
            <button
              onClick={handleReset}
              className="w-full mt-4 py-3 text-white/30 hover:text-white/60 transition-all text-sm flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Oyunu Sifirla
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

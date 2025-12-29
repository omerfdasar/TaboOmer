import { useState, useEffect } from 'react'

interface StartScreenProps {
  onStart: (team: 'red' | 'blue', duration: number) => void
  onReset: () => void
}

interface TeamProgress {
  red: { seen: number; total: number }
  blue: { seen: number; total: number }
}

interface TeamScores {
  red: number
  blue: number
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

function getTeamScores(): TeamScores {
  const stored = localStorage.getItem('taboo-scores')
  if (stored) {
    return JSON.parse(stored)
  }
  return { red: 0, blue: 0 }
}

export default function StartScreen({ onStart, onReset }: StartScreenProps) {
  const [selectedTeam, setSelectedTeam] = useState<'red' | 'blue' | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number>(90)
  const [progress, setProgress] = useState<TeamProgress | null>(null)
  const [scores, setScores] = useState<TeamScores>({ red: 0, blue: 0 })

  useEffect(() => {
    setProgress(getTeamProgress())
    setScores(getTeamScores())
  }, [])

  const handleStart = () => {
    if (selectedTeam) {
      onStart(selectedTeam, selectedDuration)
    }
  }

  const handleReset = () => {
    if (confirm('Tum takim ilerlemeleri ve skorlar sifirlanacak. Emin misin?')) {
      onReset()
      setProgress(getTeamProgress())
      setScores({ red: 0, blue: 0 })
    }
  }

  const getCardsRemaining = (team: 'red' | 'blue') => {
    if (!progress) return null
    const remaining = progress[team].total - progress[team].seen
    return remaining > 0 ? remaining : progress[team].total
  }

  return (
    <div className="h-full flex flex-col px-6 py-8 safe-area-inset">
      <div className="w-full max-w-md mx-auto flex flex-col h-full">

        {/* Logo/Title - Top */}
        <div className="text-center pt-6">
          <div className="inline-block">
            <h1 className="text-5xl font-black text-white tracking-[0.2em] mb-2">
              TABU
            </h1>
            <div className="h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
          </div>
        </div>

        {/* Middle Section - Team & Timer */}
        <div className="flex-1 flex flex-col justify-center py-6">

          {/* Team Selection */}
          <div>
            <p className="text-slate-400 text-xs font-medium mb-4 text-center uppercase tracking-[0.2em]">Takim Sec</p>
            <div className="flex gap-3">
              {/* Red Team */}
              <button
                onClick={() => setSelectedTeam('red')}
                className={`flex-1 relative overflow-hidden rounded-2xl transition-all duration-200 ${
                  selectedTeam === 'red' ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-slate-900' : ''
                }`}
              >
                <div className={`p-5 rounded-2xl border transition-all ${
                  selectedTeam === 'red'
                    ? 'bg-red-500/20 border-red-500/50'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-red-500/30'
                }`}>
                  <div className={`text-xl font-bold mb-2 ${
                    selectedTeam === 'red' ? 'text-red-400' : 'text-slate-300'
                  }`}>
                    KIRMIZI
                  </div>
                  <div className={`text-3xl font-black mb-1 ${scores.red >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {scores.red > 0 ? '+' : ''}{scores.red}
                  </div>
                  {progress && (
                    <div className="text-xs text-slate-500">
                      {getCardsRemaining('red')} kart kaldi
                    </div>
                  )}
                </div>
              </button>

              {/* Blue Team */}
              <button
                onClick={() => setSelectedTeam('blue')}
                className={`flex-1 relative overflow-hidden rounded-2xl transition-all duration-200 ${
                  selectedTeam === 'blue' ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' : ''
                }`}
              >
                <div className={`p-5 rounded-2xl border transition-all ${
                  selectedTeam === 'blue'
                    ? 'bg-blue-500/20 border-blue-500/50'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-blue-500/30'
                }`}>
                  <div className={`text-xl font-bold mb-2 ${
                    selectedTeam === 'blue' ? 'text-blue-400' : 'text-slate-300'
                  }`}>
                    MAVI
                  </div>
                  <div className={`text-3xl font-black mb-1 ${scores.blue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {scores.blue > 0 ? '+' : ''}{scores.blue}
                  </div>
                  {progress && (
                    <div className="text-xs text-slate-500">
                      {getCardsRemaining('blue')} kart kaldi
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Spacer */}
          <div className="h-12" />

          {/* Timer Selection */}
          <div>
            <p className="text-slate-400 text-xs font-medium mb-4 text-center uppercase tracking-[0.2em]">Tur Suresi</p>
            <div className="bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
              <div className="flex">
                {TIMER_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDuration(option.value)}
                    className={`flex-1 py-3.5 font-semibold text-base transition-all duration-200 ${
                      index === 0 ? 'rounded-l-lg' : ''
                    } ${
                      index === TIMER_OPTIONS.length - 1 ? 'rounded-r-lg' : ''
                    } ${
                      selectedDuration === option.value
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200'
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
        <div className="pb-4 pt-6">
          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!selectedTeam}
            className={`w-full py-5 rounded-2xl font-bold text-xl tracking-wider transition-all duration-200 ${
              selectedTeam
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-[0.98]'
                : 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            BASLA
          </button>

          {/* Reset Button - separated with more space */}
          {progress && (
            <button
              onClick={handleReset}
              className="w-full mt-12 py-3 text-slate-500 hover:text-red-400 transition-all text-sm flex items-center justify-center gap-2 border-t border-slate-800 pt-6"
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

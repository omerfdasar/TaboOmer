import { useState, useEffect } from 'react'
import { getStacksProgress, type StackNumber } from '../pages/Game'

interface StartScreenProps {
  onStart: (team: 'red' | 'blue', duration: number, stack: StackNumber) => void
  onReset: () => void
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

function getTeamScores(): TeamScores {
  const stored = localStorage.getItem('taboo-scores')
  if (stored) {
    return JSON.parse(stored)
  }
  return { red: 0, blue: 0 }
}

interface StackProgress {
  stack: StackNumber
  redRemaining: number
  blueRemaining: number
  total: number
}

export default function StartScreen({ onStart, onReset }: StartScreenProps) {
  const [selectedTeam, setSelectedTeam] = useState<'red' | 'blue' | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number>(90)
  const [selectedStack, setSelectedStack] = useState<StackNumber>(1)
  const [stacksProgress, setStacksProgress] = useState<StackProgress[]>([])
  const [scores, setScores] = useState<TeamScores>({ red: 0, blue: 0 })
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    setScores(getTeamScores())
    setStacksProgress(getStacksProgress())
  }, [])

  const handleStart = () => {
    if (selectedTeam) {
      onStart(selectedTeam, selectedDuration, selectedStack)
    }
  }

  const handleResetClick = () => {
    setShowResetConfirm(true)
  }

  const handleResetConfirm = () => {
    onReset()
    setStacksProgress(getStacksProgress())
    setScores({ red: 0, blue: 0 })
    setShowResetConfirm(false)
  }

  const handleResetCancel = () => {
    setShowResetConfirm(false)
  }

  const getCardsRemaining = (team: 'red' | 'blue') => {
    const stackInfo = stacksProgress.find(s => s.stack === selectedStack)
    if (!stackInfo) return null
    const remaining = team === 'red' ? stackInfo.redRemaining : stackInfo.blueRemaining
    return remaining
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
                  {stacksProgress.length > 0 && (
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
                  {stacksProgress.length > 0 && (
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

          {/* Spacer */}
          <div className="h-8" />

          {/* Stack Selection */}
          <div>
            <p className="text-slate-400 text-xs font-medium mb-4 text-center uppercase tracking-[0.2em]">Kart Destesi</p>
            <div className="flex gap-2 justify-center">
              {([1, 2, 3, 4, 5] as StackNumber[]).map((stack) => {
                const stackInfo = stacksProgress.find(s => s.stack === stack)
                const totalRemaining = stackInfo
                  ? stackInfo.redRemaining + stackInfo.blueRemaining
                  : 0
                const isComplete = stackInfo && totalRemaining === 0

                return (
                  <button
                    key={stack}
                    onClick={() => setSelectedStack(stack)}
                    className={`w-12 h-12 rounded-xl font-bold text-lg transition-all duration-200 flex flex-col items-center justify-center ${
                      selectedStack === stack
                        ? 'bg-emerald-500 text-white ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-emerald-500/30'
                        : isComplete
                          ? 'bg-slate-700/30 text-slate-600 border border-slate-700/50'
                          : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-emerald-500/30'
                    }`}
                  >
                    <span>{stack}</span>
                    {isComplete && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )
              })}
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
          {stacksProgress.length > 0 && (
            <button
              onClick={handleResetClick}
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

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">Oyunu Sifirla</h3>
            <p className="text-slate-400 text-sm mb-6">
              Tum takim ilerlemeleri ve skorlar sifirlanacak. Emin misin?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleResetCancel}
                className="flex-1 py-3 rounded-xl font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                Vazgec
              </button>
              <button
                onClick={handleResetConfirm}
                className="flex-1 py-3 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Sifirla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

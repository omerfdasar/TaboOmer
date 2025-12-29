import { memo } from 'react'

const MAX_PASSES = 4

interface ScoreButtonsProps {
  onCorrect: () => void
  onPass: () => void
  onTaboo: () => void
  disabled?: boolean
  passCount?: number
}

const ScoreButtons = memo(function ScoreButtons({
  onCorrect,
  onPass,
  onTaboo,
  disabled = false,
  passCount = 0
}: ScoreButtonsProps) {
  const baseStyles = "flex-1 flex flex-col items-center justify-center py-4 rounded-2xl font-bold transition-all active:scale-95"
  const disabledStyles = "bg-slate-700/50 text-slate-500 cursor-not-allowed active:scale-100"

  const passDisabled = disabled || passCount >= MAX_PASSES
  const remainingPasses = MAX_PASSES - passCount

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-center gap-3 w-full">
        {/* Taboo Button (-1) */}
        <button
          onClick={onTaboo}
          disabled={disabled}
          className={`${baseStyles} ${
            disabled
              ? disabledStyles
              : 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40'
          }`}
        >
          <span className="text-2xl mb-0.5">-1</span>
          <span className="text-xs uppercase tracking-wide opacity-80">Tabu</span>
        </button>

        {/* Pass Button (0) */}
        <button
          onClick={onPass}
          disabled={passDisabled}
          className={`${baseStyles} ${
            passDisabled
              ? disabledStyles
              : 'bg-gradient-to-b from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/25 hover:shadow-slate-500/40'
          }`}
        >
          <span className="text-2xl mb-0.5">0</span>
          <span className="text-xs uppercase tracking-wide opacity-80">Pas</span>
        </button>

        {/* Correct Button (+1) */}
        <button
          onClick={onCorrect}
          disabled={disabled}
          className={`${baseStyles} ${
            disabled
              ? disabledStyles
              : 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
          }`}
        >
          <span className="text-2xl mb-0.5">+1</span>
          <span className="text-xs uppercase tracking-wide opacity-80">Dogru</span>
        </button>
      </div>

      {/* Pass counter */}
      <div className="text-xs text-slate-500">
        {remainingPasses > 0 ? (
          <span>Kalan pas hakki: <span className="text-slate-400 font-medium">{remainingPasses}</span></span>
        ) : (
          <span className="text-amber-500">Pas hakki bitti</span>
        )}
      </div>
    </div>
  )
})

export default ScoreButtons

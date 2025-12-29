import { memo } from 'react'

interface CardProps {
  word: string
  forbidden: string[]
}

// Memoized to prevent unnecessary re-renders during swipe animations
const Card = memo(function Card({ word, forbidden }: CardProps) {
  return (
    <div className="card-content w-full h-full">
      <div className="w-full h-full rounded-3xl shadow-2xl overflow-hidden flex flex-col card-base">

        {/* Top header band - Green */}
        <div className="card-header py-5 shrink-0">
          <h2 className="text-white text-center font-black text-2xl tracking-[0.3em] drop-shadow-sm">
            TABU
          </h2>
        </div>

        {/* Main content area */}
        <div className="flex-1 px-5 py-5 flex flex-col min-h-0">
          {/* Main Word */}
          <div className="bg-white/80 rounded-2xl p-5 shadow-sm shrink-0 border border-emerald-100">
            <h1 className="text-3xl font-black text-center text-slate-800 uppercase tracking-wide">
              {word}
            </h1>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4 shrink-0">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
            <span className="text-rose-400 text-xs font-bold tracking-[0.2em]">YASAK KELIMELER</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
          </div>

          {/* Forbidden Words - fills remaining space */}
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            {forbidden.map((item, index) => (
              <div
                key={index}
                className="flex-1 flex items-center gap-3 bg-rose-50/80 rounded-xl px-4 border border-rose-200/60 min-h-0"
              >
                <span className="text-rose-400 font-medium text-lg shrink-0">&#10005;</span>
                <span className="text-slate-700 font-semibold text-xl truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom decorative band */}
        <div className="card-header py-2.5 shrink-0">
          <div className="flex justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white/40" />
            <span className="w-2 h-2 rounded-full bg-white/60" />
            <span className="w-2 h-2 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </div>
  )
})

export default Card

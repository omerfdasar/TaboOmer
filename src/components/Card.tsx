import { memo } from 'react'

interface CardProps {
  word: string
  forbidden: string[]
}

// Memoized to prevent unnecessary re-renders during swipe animations
const Card = memo(function Card({ word, forbidden }: CardProps) {
  return (
    <div className="card-content w-full h-full">
      <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-200 flex flex-col">

        {/* Top decorative band */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 py-4">
          <h2 className="text-white text-center font-black text-2xl tracking-widest drop-shadow-lg">
            TABOO
          </h2>
        </div>

        {/* Main content area */}
        <div className="flex-1 px-5 py-5 flex flex-col min-h-0">
          {/* Main Word */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-amber-300 shrink-0">
            <h1 className="text-3xl font-black text-center text-gray-800 uppercase tracking-wide">
              {word}
            </h1>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4 shrink-0">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent" />
            <span className="text-red-500 text-sm font-bold tracking-wider">YASAK</span>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent" />
          </div>

          {/* Forbidden Words - fills remaining space */}
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            {forbidden.map((item, index) => (
              <div
                key={index}
                className="flex-1 flex items-center gap-3 bg-red-50 rounded-xl pl-5 pr-4 border-2 border-red-200 min-h-0"
              >
                <span className="text-red-500 font-bold text-2xl shrink-0">✕</span>
                <span className="text-gray-700 font-bold text-2xl truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom decorative band */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 py-3 shrink-0">
          <div className="flex justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-300" />
            <span className="w-3 h-3 rounded-full bg-yellow-300" />
            <span className="w-3 h-3 rounded-full bg-yellow-300" />
          </div>
        </div>
      </div>
    </div>
  )
})

export default Card

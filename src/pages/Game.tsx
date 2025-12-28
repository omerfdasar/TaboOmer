import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CardSwiper from '../components/CardSwiper'
import Progress from '../components/Progress'
import Confetti from '../components/Confetti'
import initialWordsData from '../data/words.json'

interface CardData {
  id: number
  word: string
  forbidden: string[]
}

const STORAGE_KEY = 'taboo-cards'

function getStoredCards(): CardData[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return initialWordsData.cards
}

export default function Game() {
  const [currentIndex, setCurrentIndex] = useState(1)
  const [cards, setCards] = useState<CardData[]>([])

  useEffect(() => {
    setCards(getStoredCards())
  }, [])

  if (cards.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white/60">Yukleniyor...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <Confetti />

      {/* Settings button - top right */}
      <div className="absolute top-4 right-4 z-10 safe-area-top">
        <Link
          to="/admin"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </div>

      {/* Main Content - Cards */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <CardSwiper cards={cards} onSlideChange={setCurrentIndex} />

        {/* Progress */}
        <div className="mt-8">
          <Progress current={currentIndex} total={cards.length} />
        </div>

        {/* Swipe Hint */}
        <p className="mt-4 text-white/40 text-sm">
          ← Kaydir →
        </p>
      </main>

      {/* Footer Safe Area */}
      <div className="h-6 safe-area-bottom" />
    </div>
  )
}

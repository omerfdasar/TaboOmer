import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import CardSwiper from '../components/CardSwiper'
import Progress from '../components/Progress'
// import Confetti from '../components/Confetti'
import StartScreen from '../components/StartScreen'
import Timer from '../components/Timer'
import initialWordsData from '../data/words.json'

interface CardData {
  id: number
  word: string
  forbidden: string[]
}

interface GameState {
  team: 'red' | 'blue'
  duration: number
}

interface TeamState {
  cards: CardData[]
  seenCount: number
}

interface TeamsStorage {
  red: TeamState
  blue: TeamState
}

const STORAGE_KEY = 'taboo-cards'
const TEAMS_STORAGE_KEY = 'taboo-teams'
const CARDS_PER_SESSION = 50

function getStoredCards(): CardData[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return initialWordsData.cards
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getTeamsStorage(): TeamsStorage | null {
  const stored = localStorage.getItem(TEAMS_STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return null
}

function initializeTeams(): TeamsStorage {
  const allCards = getStoredCards()
  // Shuffle and split cards between teams - each team gets unique cards
  const shuffled = shuffleArray(allCards)
  const midpoint = Math.floor(shuffled.length / 2)

  const teams: TeamsStorage = {
    red: { cards: shuffled.slice(0, midpoint), seenCount: 0 },
    blue: { cards: shuffled.slice(midpoint), seenCount: 0 }
  }

  localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams))
  return teams
}

function saveTeamProgress(team: 'red' | 'blue', seenCount: number) {
  const teams = getTeamsStorage()
  if (teams) {
    teams[team].seenCount = seenCount
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams))
  }
}

export default function Game() {
  const [currentIndex, setCurrentIndex] = useState(1)
  const [cards, setCards] = useState<CardData[]>([])
  const [totalRemaining, setTotalRemaining] = useState(0)
  const [baseSeenCount, setBaseSeenCount] = useState(0)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [timerKey, setTimerKey] = useState(0)
  const [gameKey, setGameKey] = useState(0)
  const [isTimeUp, setIsTimeUp] = useState(false)

  const handleStart = (team: 'red' | 'blue', duration: number) => {
    let teams = getTeamsStorage()
    if (!teams) {
      teams = initializeTeams()
    }

    const teamState = teams[team]
    const remainingCards = teamState.cards.slice(teamState.seenCount)

    // If team has finished all cards, reshuffle their deck
    if (remainingCards.length === 0) {
      teamState.cards = shuffleArray(teamState.cards)
      teamState.seenCount = 0
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams))
      setCards(teamState.cards.slice(0, CARDS_PER_SESSION))
      setTotalRemaining(teamState.cards.length)
      setBaseSeenCount(0)
    } else {
      setCards(remainingCards.slice(0, CARDS_PER_SESSION))
      setTotalRemaining(remainingCards.length)
      setBaseSeenCount(teamState.seenCount)
    }

    setCurrentIndex(1)
    setGameKey(prev => prev + 1)
    setIsTimeUp(false)
    setGameState({ team, duration })
  }

  const handleSlideChange = useCallback((index: number) => {
    setCurrentIndex(index)

    // Save progress for current team
    if (gameState) {
      // Use baseSeenCount from when game started, add current index - 1
      // (index is 1-based, so index 1 = seen 0 new cards, index 2 = seen 1 new card)
      saveTeamProgress(gameState.team, baseSeenCount + index - 1)
    }
  }, [gameState, baseSeenCount])

  const handleTimeUp = useCallback(() => {
    setIsTimeUp(true)
  }, [])

  const handleTimerReset = useCallback(() => {
    setTimerKey(prev => prev + 1)
    setIsTimeUp(false)
  }, [])

  const handleBackToStart = () => {
    setGameState(null)
  }

  const handleResetTeams = () => {
    localStorage.removeItem(TEAMS_STORAGE_KEY)
    initializeTeams()
  }

  // Show start screen if game hasn't started
  if (!gameState) {
    return <StartScreen onStart={handleStart} onReset={handleResetTeams} />
  }

  return (
    <div className="h-full flex flex-col">
      {/* Confetti disabled temporarily for debugging */}
      {/* <Confetti /> */}

      {/* Top bar with Timer and Settings */}
      <div className="pt-4 safe-area-top px-4 flex items-center justify-between shrink-0">
        {/* Back button */}
        <button
          onClick={handleBackToStart}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Timer */}
        <Timer
          key={timerKey}
          initialSeconds={gameState.duration}
          team={gameState.team}
          onTimeUp={handleTimeUp}
          onReset={handleTimerReset}
        />

        {/* Settings button */}
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
        {currentIndex >= cards.length ? (
          /* Round Complete Screen */
          <div className="text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-black text-white mb-3">Tur Bitti!</h2>
            <p className="text-white/60 mb-8">
              {cards.length} kart tamamlandi
            </p>
            <button
              onClick={handleBackToStart}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
                gameState?.team === 'red'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white shadow-lg`}
            >
              Devam Et
            </button>
          </div>
        ) : (
          <>
            <CardSwiper key={gameKey} cards={cards} onSlideChange={handleSlideChange} disabled={isTimeUp} />

            {/* Progress */}
            <div className="mt-8">
              <Progress current={currentIndex} total={totalRemaining} />
            </div>

            {/* Swipe Hint */}
            <p className="mt-4 text-white/40 text-sm">
              ← Kaydir →
            </p>
          </>
        )}
      </main>

      {/* Footer Safe Area */}
      <div className="h-6 safe-area-bottom" />
    </div>
  )
}

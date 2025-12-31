import { useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import CardSwiper from '../components/CardSwiper'
import type { CardSwiperHandle } from '../components/CardSwiper'
import ScoreButtons from '../components/ScoreButtons'
import Progress from '../components/Progress'
import StartScreen from '../components/StartScreen'
import Timer from '../components/Timer'
import initialWordsData from '../data/words.json'

interface CardData {
  id: number
  word: string
  forbidden: string[]
}

export type StackNumber = 1 | 2 | 3 | 4 | 5
const NUM_STACKS = 5

interface GameState {
  team: 'red' | 'blue'
  duration: number
  stack: StackNumber
}

interface TeamState {
  cards: CardData[]
  seenCount: number
}

interface TeamsStorage {
  red: TeamState
  blue: TeamState
}

interface AllStacksStorage {
  [key: string]: TeamsStorage // "stack-1", "stack-2", etc.
}

const STORAGE_KEY = 'taboo-cards'
const STACKS_STORAGE_KEY = 'taboo-stacks'
const SCORES_STORAGE_KEY = 'taboo-scores'
const CARDS_PER_SESSION = 50

interface TeamScores {
  red: number
  blue: number
}

function getStoredScores(): TeamScores {
  const stored = localStorage.getItem(SCORES_STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return { red: 0, blue: 0 }
}

function saveTeamScore(team: 'red' | 'blue', scoreToAdd: number) {
  const scores = getStoredScores()
  scores[team] += scoreToAdd
  localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(scores))
}

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

// Get all stacks storage
function getAllStacksStorage(): AllStacksStorage {
  const stored = localStorage.getItem(STACKS_STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return {}
}

// Get teams for a specific stack
function getTeamsForStack(stack: StackNumber): TeamsStorage | null {
  const allStacks = getAllStacksStorage()
  return allStacks[`stack-${stack}`] || null
}

// Initialize teams for a specific stack
function initializeStack(stack: StackNumber): TeamsStorage {
  const allCards = getStoredCards()
  const cardsPerStack = Math.floor(allCards.length / NUM_STACKS)

  // Get cards for this stack (stack 1 = first chunk, stack 2 = second chunk, etc.)
  const startIndex = (stack - 1) * cardsPerStack
  const endIndex = stack === NUM_STACKS ? allCards.length : startIndex + cardsPerStack
  const stackCards = allCards.slice(startIndex, endIndex)

  // Shuffle and split between teams
  const shuffled = shuffleArray(stackCards)
  const midpoint = Math.floor(shuffled.length / 2)

  const teams: TeamsStorage = {
    red: { cards: shuffled.slice(0, midpoint), seenCount: 0 },
    blue: { cards: shuffled.slice(midpoint), seenCount: 0 }
  }

  // Save to storage
  const allStacks = getAllStacksStorage()
  allStacks[`stack-${stack}`] = teams
  localStorage.setItem(STACKS_STORAGE_KEY, JSON.stringify(allStacks))

  return teams
}

// Save team progress for a specific stack
function saveTeamProgress(stack: StackNumber, team: 'red' | 'blue', seenCount: number) {
  const allStacks = getAllStacksStorage()
  const stackKey = `stack-${stack}`
  if (allStacks[stackKey]) {
    allStacks[stackKey][team].seenCount = seenCount
    localStorage.setItem(STACKS_STORAGE_KEY, JSON.stringify(allStacks))
  }
}

// Get progress info for all stacks (for UI display)
export function getStacksProgress(): { stack: StackNumber; redRemaining: number; blueRemaining: number; total: number }[] {
  const allCards = getStoredCards()
  const cardsPerStack = Math.floor(allCards.length / NUM_STACKS)
  const allStacks = getAllStacksStorage()

  const progress: { stack: StackNumber; redRemaining: number; blueRemaining: number; total: number }[] = []

  for (let i = 1; i <= NUM_STACKS; i++) {
    const stack = i as StackNumber
    const stackKey = `stack-${stack}`
    const stackData = allStacks[stackKey]

    const totalCards = stack === NUM_STACKS
      ? allCards.length - (cardsPerStack * (NUM_STACKS - 1))
      : cardsPerStack
    const perTeam = Math.floor(totalCards / 2)

    if (stackData) {
      progress.push({
        stack,
        redRemaining: stackData.red.cards.length - stackData.red.seenCount,
        blueRemaining: stackData.blue.cards.length - stackData.blue.seenCount,
        total: totalCards
      })
    } else {
      progress.push({
        stack,
        redRemaining: perTeam,
        blueRemaining: perTeam,
        total: totalCards
      })
    }
  }

  return progress
}

interface ScoreState {
  correct: number
  pass: number
  taboo: number
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
  const [score, setScore] = useState<ScoreState>({ correct: 0, pass: 0, taboo: 0 })

  const swiperRef = useRef<CardSwiperHandle>(null)
  const cardAnsweredRef = useRef(true) // Track if current card was answered via button

  const handleStart = (team: 'red' | 'blue', duration: number, stack: StackNumber) => {
    let teams = getTeamsForStack(stack)
    if (!teams) {
      teams = initializeStack(stack)
    }

    const teamState = teams[team]
    const remainingCards = teamState.cards.slice(teamState.seenCount)

    // If team has finished all cards, reshuffle their deck
    if (remainingCards.length === 0) {
      teamState.cards = shuffleArray(teamState.cards)
      teamState.seenCount = 0
      // Save reshuffled cards
      const allStacks = getAllStacksStorage()
      allStacks[`stack-${stack}`] = teams
      localStorage.setItem(STACKS_STORAGE_KEY, JSON.stringify(allStacks))

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
    setScore({ correct: 0, pass: 0, taboo: 0 })
    cardAnsweredRef.current = false // First card needs to be answered too
    setGameState({ team, duration, stack })
  }

  // Score button handlers - mark card as answered before advancing
  const handleCorrect = useCallback(() => {
    cardAnsweredRef.current = true
    setScore(prev => ({ ...prev, correct: prev.correct + 1 }))
    swiperRef.current?.slideNext()
  }, [])

  const handlePass = useCallback(() => {
    cardAnsweredRef.current = true
    setScore(prev => ({ ...prev, pass: prev.pass + 1 }))
    swiperRef.current?.slideNext()
  }, [])

  const handleTaboo = useCallback(() => {
    cardAnsweredRef.current = true
    setScore(prev => ({ ...prev, taboo: prev.taboo + 1 }))
    swiperRef.current?.slideNext()
  }, [])

  // Calculate total score
  const totalScore = score.correct - score.taboo

  const handleSlideChange = useCallback((index: number) => {
    // If previous card wasn't answered via button, count as pass (swipe = pass)
    if (!cardAnsweredRef.current) {
      setScore(prev => ({ ...prev, pass: prev.pass + 1 }))
    }

    // Reset for the new card
    cardAnsweredRef.current = false
    setCurrentIndex(index)

    // Save progress for current team and stack
    if (gameState) {
      // Use baseSeenCount from when game started, add current index - 1
      // (index is 1-based, so index 1 = seen 0 new cards, index 2 = seen 1 new card)
      saveTeamProgress(gameState.stack, gameState.team, baseSeenCount + index - 1)
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
    // Save the round score for the team
    if (gameState && totalScore !== 0) {
      saveTeamScore(gameState.team, totalScore)
    }
    setGameState(null)
  }

  const handleResetTeams = () => {
    localStorage.removeItem(STACKS_STORAGE_KEY)
    localStorage.removeItem(SCORES_STORAGE_KEY)
  }

  // Show start screen if game hasn't started
  if (!gameState) {
    return <StartScreen onStart={handleStart} onReset={handleResetTeams} />
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="pt-4 safe-area-top px-4 flex items-center justify-between shrink-0">
        {/* Back button */}
        <button
          onClick={handleBackToStart}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Timer and Score */}
        <div className="flex flex-col items-center">
          <Timer
            key={timerKey}
            initialSeconds={gameState.duration}
            team={gameState.team}
            onTimeUp={handleTimeUp}
            onReset={handleTimerReset}
          />
          <div className={`text-sm font-bold mt-1 ${totalScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            Skor: {totalScore > 0 ? '+' : ''}{totalScore}
          </div>
        </div>

        {/* Settings button */}
        <Link
          to="/admin"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
        {currentIndex >= cards.length || isTimeUp ? (
          /* Round Complete Screen */
          <div className="text-center w-full max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-6">
              {isTimeUp ? 'Sure Doldu!' : 'Tur Bitti!'}
            </h2>

            {/* Score Summary */}
            <div className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/50">
              <div className={`text-5xl font-black mb-2 ${totalScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalScore > 0 ? '+' : ''}{totalScore}
              </div>
              <div className="text-slate-500 text-sm mb-6">Toplam Puan</div>

              <div className="flex justify-center gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-emerald-400">{score.correct}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Dogru</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-slate-400">{score.pass}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Pas</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-amber-400">{score.taboo}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Tabu</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleBackToStart}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] ${
                gameState?.team === 'red'
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                  : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30'
              } text-white`}
            >
              Devam Et
            </button>
          </div>
        ) : (
          <>
            <CardSwiper
              ref={swiperRef}
              key={gameKey}
              cards={cards}
              onSlideChange={handleSlideChange}
              disabled={isTimeUp}
              blockSwipe={score.pass >= 4}
            />

            {/* Score Buttons */}
            <div className="mt-5 w-full px-2">
              <ScoreButtons
                onCorrect={handleCorrect}
                onPass={handlePass}
                onTaboo={handleTaboo}
                disabled={isTimeUp}
                passCount={score.pass}
              />
            </div>

            {/* Progress */}
            <div className="mt-4">
              <Progress current={currentIndex} total={totalRemaining} />
            </div>
          </>
        )}
      </main>

      {/* Footer Safe Area */}
      <div className="h-4 safe-area-bottom" />
    </div>
  )
}

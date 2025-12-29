import { useMemo, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCards } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import Card from './Card'

const MAX_CARDS_PER_GAME = 50

interface CardData {
  id: number
  word: string
  forbidden: string[]
}

interface CardSwiperProps {
  cards: CardData[]
  onSlideChange: (index: number) => void
  disabled?: boolean
}

// Detect low-end devices for reduced animations
const isLowEndDevice = typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 4

export default function CardSwiper({ cards, onSlideChange, disabled = false }: CardSwiperProps) {
  // Memoize card slicing to prevent recalculation on every render
  const gameCards = useMemo(() => cards.slice(0, MAX_CARDS_PER_GAME), [cards])

  // Memoize slide change handler to prevent unnecessary Swiper re-renders
  const handleSlideChange = useCallback((swiper: SwiperType) => {
    onSlideChange(swiper.activeIndex + 1)
  }, [onSlideChange])

  // Optimized swiper config - reduced effects for low-end devices
  const cardsEffectConfig = useMemo(() => ({
    perSlideOffset: isLowEndDevice ? 6 : 8,
    perSlideRotate: isLowEndDevice ? 0 : 2,
    rotate: !isLowEndDevice,
    slideShadows: false,
  }), [])

  return (
    <div
      className="card-swiper-wrapper"
      style={{
        width: 'min(85vw, 340px)',
        height: 'min(75vh, 580px)'
      }}
    >
      <Swiper
        effect="cards"
        grabCursor={!disabled}
        modules={[EffectCards]}
        onSlideChange={handleSlideChange}
        allowSlideNext={!disabled}
        allowSlidePrev={!disabled}
        allowTouchMove={!disabled}
        style={{ width: '100%', height: '100%' }}
        cardsEffect={cardsEffectConfig}
        speed={isLowEndDevice ? 200 : 300}
      >
        {gameCards.map((card) => (
          <SwiperSlide key={card.id}>
            <Card word={card.word} forbidden={card.forbidden} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

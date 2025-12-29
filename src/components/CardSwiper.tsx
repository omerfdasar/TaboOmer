import { useMemo, useCallback, useRef, useImperativeHandle, forwardRef, useEffect } from 'react'
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
  blockSwipe?: boolean // Block manual swipe but allow button-triggered slideNext
}

export interface CardSwiperHandle {
  slideNext: () => void
}

// Detect touch device for optimized swipe settings
const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

const CardSwiper = forwardRef<CardSwiperHandle, CardSwiperProps>(function CardSwiper(
  { cards, onSlideChange, disabled = false, blockSwipe = false },
  ref
) {
  const swiperRef = useRef<SwiperType | null>(null)

  // Expose slideNext method to parent (only blocked when fully disabled, not when just swipe blocked)
  useImperativeHandle(ref, () => ({
    slideNext: () => {
      if (swiperRef.current && !disabled) {
        swiperRef.current.slideNext()
      }
    }
  }), [disabled])

  // Manual swipe is blocked if disabled OR blockSwipe is true
  const manualSwipeBlocked = disabled || blockSwipe

  // Update swiper instance when blockSwipe/disabled changes
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.allowTouchMove = !manualSwipeBlocked
    }
  }, [manualSwipeBlocked])

  // Memoize card slicing to prevent recalculation on every render
  const gameCards = useMemo(() => cards.slice(0, MAX_CARDS_PER_GAME), [cards])

  // Memoize slide change handler to prevent unnecessary Swiper re-renders
  const handleSlideChange = useCallback((swiper: SwiperType) => {
    onSlideChange(swiper.activeIndex + 1)
  }, [onSlideChange])

  // Card effect config - keep rotation for natural feel
  const cardsEffectConfig = useMemo(() => ({
    perSlideOffset: 8,
    perSlideRotate: 2,
    rotate: true,
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
        grabCursor={!manualSwipeBlocked}
        modules={[EffectCards]}
        onSwiper={(swiper) => { swiperRef.current = swiper }}
        onSlideChange={handleSlideChange}
        allowSlideNext={!disabled}
        allowSlidePrev={!disabled}
        allowTouchMove={!manualSwipeBlocked}
        style={{ width: '100%', height: '100%' }}
        cardsEffect={cardsEffectConfig}
        // Transition speed
        speed={250}
        // Touch settings for natural feel
        touchRatio={1.2}
        threshold={isTouchDevice ? 5 : 10}
        touchStartPreventDefault={false}
        // Follow finger movement
        followFinger={true}
        // Resistance when reaching edges
        resistance={true}
        resistanceRatio={0.85}
        // Short swipes work too
        shortSwipes={true}
        longSwipesRatio={0.3}
      >
        {gameCards.map((card) => (
          <SwiperSlide key={card.id}>
            <Card word={card.word} forbidden={card.forbidden} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
})

export default CardSwiper

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

export default function CardSwiper({ cards, onSlideChange, disabled = false }: CardSwiperProps) {
  // Limit cards for performance
  const gameCards = cards.slice(0, MAX_CARDS_PER_GAME)

  const handleSlideChange = (swiper: SwiperType) => {
    onSlideChange(swiper.activeIndex + 1)
  }

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
        cardsEffect={{
          perSlideOffset: 8,
          perSlideRotate: 2,
          rotate: true,
          slideShadows: false,
        }}
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

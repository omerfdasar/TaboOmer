# TABOOMER - Improvement Points

## Current State Summary
- Turkish Taboo game with card swiping mechanics
- Two teams (Red/Blue) with persistent progress tracking
- No actual scoring system - only tracks cards seen
- Basic performance optimizations in place

---

## Priority 1: Scoring System

### Add Correct/Wrong Buttons Below Card

**Current behavior:** Swipe only advances to next card, no score tracking

**Proposed implementation:**
```
┌─────────────────────┐
│                     │
│       CARD          │
│                     │
└─────────────────────┘
       ↓  Swipe
┌──────────┬──────────┐
│    ✓     │    ✗     │
│  DOGRU   │  PAS     │
│ (+1 puan)│ (0 puan) │
└──────────┴──────────┘
```

**Features to add:**
- [ ] Two buttons below the card: Tick (correct) and X (pass/wrong)
- [ ] Track score per team per round
- [ ] Display running score during gameplay (e.g., "Skor: 5")
- [ ] Show final score when timer ends
- [ ] Store scores in localStorage for session history

**State additions needed in Game.tsx:**
```tsx
const [score, setScore] = useState(0)
const [correctCount, setCorrectCount] = useState(0)
const [passCount, setPassCount] = useState(0)
```

**Button component idea:**
```tsx
// ScoreButtons.tsx
<div className="flex gap-4 mt-4">
  <button onClick={handleCorrect} className="bg-green-500 ...">
    ✓ Dogru
  </button>
  <button onClick={handlePass} className="bg-red-500 ...">
    ✗ Pas
  </button>
</div>
```

---

## Priority 2: Mobile Performance Fixes

### Known Issues
- Lag during card swiping on mobile devices
- Possible jank when rendering card stack

### Proposed Fixes

#### 2.1 Add React Memoization
```tsx
// Card.tsx - Wrap with React.memo
export const Card = React.memo(({ data }: CardProps) => {
  // ...
})

// CardSwiper.tsx - Memoize card rendering
const memoizedCards = useMemo(() =>
  cards.slice(0, MAX_CARDS_PER_GAME), [cards]
)
```

#### 2.2 Reduce Card Stack Depth
```tsx
// Current: Shows all 50 cards in DOM
// Proposed: Virtual rendering - only render visible + 2 adjacent
cardsEffect={{
  perSlideOffset: 8,
  perSlideRotate: 2,
  rotate: true,
  slideShadows: false,
}}
// Add: virtual: { enabled: true }
```

#### 2.3 CSS Performance Enhancements
```css
/* Add to Card component */
.card-content {
  contain: layout style paint;  /* CSS containment */
  content-visibility: auto;      /* Skip off-screen rendering */
}

/* Reduce repaints during swipe */
.swiper-slide {
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0);
}
```

#### 2.4 Debounce Slide Change Handler
```tsx
const debouncedSlideChange = useMemo(
  () => debounce((index: number) => onSlideChange(index), 16),
  [onSlideChange]
)
```

#### 2.5 Reduce Swiper Effects on Low-End Devices
```tsx
// Detect low-end device
const isLowEndDevice = navigator.hardwareConcurrency <= 4

// Simplified config for low-end
const swiperConfig = isLowEndDevice ? {
  speed: 200,
  cardsEffect: { rotate: false, slideShadows: false }
} : { /* full config */ }
```

---

## Priority 3: Score Display & Results

### 3.1 In-Game Score Display
```
┌─────────────────────────────────────┐
│ KIRMIZI TAKIM        ⏱ 01:23       │
│ Skor: 7              Kart: 5/50    │
├─────────────────────────────────────┤
│                                     │
│            [CARD]                   │
│                                     │
├─────────────────────────────────────┤
│      [✓ DOGRU]    [✗ PAS]          │
└─────────────────────────────────────┘
```

### 3.2 End-of-Round Results Screen
```
┌─────────────────────────────────────┐
│         SÜRE DOLDU!                 │
│                                     │
│    Bu Tur Sonuçları:                │
│    ✓ Dogru: 7                       │
│    ✗ Pas: 3                         │
│    Toplam Kart: 10                  │
│                                     │
│    [DEVAM ET]                       │
└─────────────────────────────────────┘
```

### 3.3 Team Score History (Optional)
- Store round history in localStorage
- Show cumulative scores per team
- Winner announcement after all rounds

---

## Priority 4: UX Improvements

### 4.1 Swipe Gesture Feedback
- [ ] Add visual feedback when swiping (card tilt animation)
- [ ] Haptic feedback on button press (not just timer end)
- [ ] Sound effects (optional, with mute toggle)

### 4.2 Button Accessibility
- [ ] Large touch targets (min 48x48px)
- [ ] Color-blind friendly icons (not just color)
- [ ] Disabled state styling when time is up

### 4.3 Scoring Confirmation
- [ ] Brief animation/highlight when button pressed
- [ ] Score increment animation (+1 floating up)

---

## Priority 5: Code Architecture

### 5.1 State Management Refactor
Consider extracting game state to a custom hook or context:
```tsx
// useGameState.ts
export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  return { state, dispatch }
}
```

### 5.2 Component Structure
```
src/
├── components/
│   ├── game/
│   │   ├── CardSwiper.tsx
│   │   ├── Card.tsx
│   │   ├── ScoreButtons.tsx    // NEW
│   │   ├── ScoreDisplay.tsx    // NEW
│   │   └── ResultsModal.tsx    // NEW
│   ├── ui/
│   │   ├── Timer.tsx
│   │   ├── Progress.tsx
│   │   └── Button.tsx          // NEW: Reusable
```

---

## Implementation Order

1. **Phase 1: Scoring Basics**
   - Add ScoreButtons component (tick/cross)
   - Track correct/pass counts in state
   - Display score in top bar

2. **Phase 2: Performance**
   - Add React.memo to Card component
   - Implement CSS containment
   - Test on actual mobile devices

3. **Phase 3: Results**
   - Create ResultsModal for end of round
   - Store scores in localStorage
   - Show round summary

4. **Phase 4: Polish**
   - Animations for score changes
   - Sound effects (optional)
   - Team score comparison view

---

## Technical Notes

### Current Performance Optimizations
- `will-change: transform` on cards
- `transform: translateZ(0)` for GPU acceleration
- `backface-visibility: hidden`
- Max 50 cards per session limit
- Swiper disabled when time up

### Files to Modify
- `src/pages/Game.tsx` - Add score state, buttons
- `src/components/CardSwiper.tsx` - Performance optimizations
- `src/components/Card.tsx` - React.memo wrapper
- `src/index.css` - CSS containment rules
- NEW: `src/components/ScoreButtons.tsx`
- NEW: `src/components/ScoreDisplay.tsx`
- NEW: `src/components/ResultsModal.tsx`

---

## Questions to Consider

1. Should swipe direction matter? (Right = correct, Left = pass)
2. Should there be a "skip" vs "wrong" distinction?
3. Do we want sound effects?
4. Should scores persist between sessions or reset each game?
5. Multi-round game flow - best of 3 rounds?




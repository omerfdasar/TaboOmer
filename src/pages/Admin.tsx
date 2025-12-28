import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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

function saveCards(cards: CardData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
}

export default function Admin() {
  const [cards, setCards] = useState<CardData[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    word: '',
    forbidden: ['', '', '', '', ''],
  })

  useEffect(() => {
    setCards(getStoredCards())
  }, [])

  const resetForm = () => {
    setFormData({ word: '', forbidden: ['', '', '', '', ''] })
    setEditingId(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.word.trim() || formData.forbidden.some((f) => !f.trim())) {
      alert('Lütfen tüm alanları doldurun!')
      return
    }

    let newCards: CardData[]

    if (editingId !== null) {
      newCards = cards.map((card) =>
        card.id === editingId
          ? { ...card, word: formData.word, forbidden: formData.forbidden }
          : card
      )
    } else {
      const newId = Math.max(0, ...cards.map((c) => c.id)) + 1
      newCards = [
        ...cards,
        { id: newId, word: formData.word, forbidden: formData.forbidden },
      ]
    }

    setCards(newCards)
    saveCards(newCards)
    resetForm()
  }

  const handleEdit = (card: CardData) => {
    setEditingId(card.id)
    setFormData({ word: card.word, forbidden: [...card.forbidden] })
  }

  const handleDelete = (id: number) => {
    if (confirm('Bu kartı silmek istediğinize emin misiniz?')) {
      const newCards = cards.filter((c) => c.id !== id)
      setCards(newCards)
      saveCards(newCards)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify({ cards }, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'words.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.cards && Array.isArray(data.cards)) {
          setCards(data.cards)
          saveCards(data.cards)
          alert('Veriler başarıyla içe aktarıldı!')
        }
      } catch {
        alert('Geçersiz dosya formatı!')
      }
    }
    reader.readAsText(file)
  }

  const handleReset = () => {
    if (confirm('Tüm değişiklikleri sıfırlayıp orijinal verilere dönmek istiyor musunuz?')) {
      localStorage.removeItem(STORAGE_KEY)
      setCards(initialWordsData.cards)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            ← Oyuna Dön
          </Link>
          <h1 className="text-2xl font-bold text-white">Yönetim Paneli</h1>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            >
              Dışa Aktar
            </button>
            <label className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors cursor-pointer">
              İçe Aktar
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Sıfırla
            </button>
          </div>
        </motion.header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? 'Kartı Düzenle' : 'Yeni Kart Ekle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-1">
                  Ana Kelime
                </label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={(e) =>
                    setFormData({ ...formData, word: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-yellow-400/50"
                  placeholder="Kelimeyi girin..."
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1">
                  Yasak Kelimeler
                </label>
                <div className="space-y-2">
                  {formData.forbidden.map((word, index) => (
                    <input
                      key={index}
                      type="text"
                      value={word}
                      onChange={(e) => {
                        const newForbidden = [...formData.forbidden]
                        newForbidden[index] = e.target.value
                        setFormData({ ...formData, forbidden: newForbidden })
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-red-400/50"
                      placeholder={`Yasak kelime ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg bg-yellow-500/20 text-yellow-400 font-bold hover:bg-yellow-500/30 transition-colors"
                >
                  {editingId ? 'Güncelle' : 'Ekle'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-3 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>
          </motion.div>

          {/* Cards List */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 max-h-[calc(100vh-200px)] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Kartlar ({cards.length})
            </h2>
            <div className="space-y-3">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-yellow-400 truncate">
                        {card.word}
                      </h3>
                      <p className="text-white/60 text-sm mt-1 truncate">
                        {card.forbidden.join(', ')}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleEdit(card)}
                        className="px-3 py-1.5 rounded bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="px-3 py-1.5 rounded bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

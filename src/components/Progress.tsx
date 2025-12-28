interface ProgressProps {
  current: number
  total: number
}

export default function Progress({ current, total }: ProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 text-white/60">
      <span className="text-lg font-bold text-white">{current}</span>
      <span className="text-sm">/</span>
      <span className="text-lg">{total}</span>
    </div>
  )
}

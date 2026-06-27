'use client'
import { useCountUp } from '@/hooks/useCountUp'
import React from 'react'

type Props = {
  label: string
  value: number
  suffix?: string
  prefix?: string
  note: string
  source: string
  delay?: number
}

export function HeroStatCard({ label, value, suffix = '', prefix = '', note, source, delay = 0 }: Props) {
  const { count, ref } = useCountUp(value, 1200)

  return (
    <div
      className="light-card motion-card p-6"
      data-fade
      data-delay={delay || undefined}
    >
      <p className="text-sm font-bold text-[#475569] mb-2 uppercase tracking-widest">{label}</p>
      <p
        className="count-number text-4xl font-black text-[#0e6b7c] leading-none mb-2"
        ref={ref as React.RefObject<HTMLParagraphElement>}
      >
        {prefix}{count.toLocaleString('ja-JP')}{suffix}
      </p>
      <p className="text-base text-[#0f172a] leading-snug mb-2">{note}</p>
      <p className="text-xs text-[#475569]">出典：{source}</p>
    </div>
  )
}

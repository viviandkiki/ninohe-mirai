'use client'
import { useEffect } from 'react'

export function useFadeIn() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const selector = '[data-fade], [data-fade-left], [data-fade-right], [data-pop]'

    if (prefersReduced) {
      document.querySelectorAll(selector).forEach(el => {
        el.classList.add('is-visible')
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    document.querySelectorAll(selector).forEach(el => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])
}

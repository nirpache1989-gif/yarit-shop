/**
 * @file AmbientSoundPill — bottom-corner ambient sound toggle
 * @summary Small pill button fixed at the bottom-left corner
 *          (bottom-right in RTL via `[dir="rtl"] .g-sound-toggle`
 *          in globals.css). Toggles a looping ambient audio track
 *          on / off. Visual-only for Phase 2 — the actual
 *          `/audio/ambient.mp3` asset is not in the repo yet.
 *
 *          Graceful degradation: the `<audio>` element is lazy-
 *          created in a `useEffect` so SSR stays untouched. If
 *          the audio file 404s or autoplay policy rejects the
 *          `play()` promise, we silently stay in the idle state
 *          — no console noise, no error modals. Phase 4 ships
 *          the real audio file + crossfade behavior.
 *
 *          A11y:
 *            - aria-pressed reflects toggle state
 *            - text label updates between "ambient sound" /
 *              "ambience on" (localized)
 *            - icon glyph shift (🔈 → 🔊) is decorative;
 *              aria-hidden so screen readers read the text only
 *
 *          Reduced motion: the pill has no motion of its own —
 *          the `is-on` state flips colors via a CSS transition
 *          that the global reduced-motion override also strips
 *          (`transition: none !important` on body).
 */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'

const AMBIENT_SRC = '/audio/ambient.mp3'
const AMBIENT_VOLUME = 0.4

export function AmbientSoundPill() {
  const t = useTranslations('layout')
  const [on, setOn] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Lazy-create on mount. If the file is missing the Audio
    // object is still valid; .play() will reject later and we
    // just stay in the idle state.
    if (!audioRef.current) {
      const a = new Audio(AMBIENT_SRC)
      a.loop = true
      a.volume = AMBIENT_VOLUME
      audioRef.current = a
    }
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  const toggle = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    if (on) {
      a.pause()
      setOn(false)
    } else {
      a.play()
        .then(() => setOn(true))
        .catch(() => {
          // Autoplay rejected OR asset 404 — stay idle silently.
          setOn(false)
        })
    }
  }, [on])

  const label = on ? t('soundPillLabelPlaying') : t('soundPillLabelIdle')

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className={cn('g-sound-toggle', on && 'is-on')}
    >
      <span aria-hidden="true">{on ? '🔊' : '🔈'}</span>
      <span>{label}</span>
    </button>
  )
}

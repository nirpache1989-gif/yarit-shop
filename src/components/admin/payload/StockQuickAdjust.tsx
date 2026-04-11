/**
 * @file StockQuickAdjust — custom field component wrapping the `stock` number input
 * @summary 2026-04-11 Track B.2. Replaces Payload's default NumberField
 *          on the `stock` field with a version that renders the same
 *          input plus two small `+1` / `−1` buttons. Yarit's most
 *          common stock-adjust workflow — "I just received 6 more of
 *          this product" or "I just sold one in person" — now takes a
 *          single click instead of clicking into the input, editing
 *          the value, and tabbing out.
 *
 *          Wired via `admin.components.Field` on the `stock` field in
 *          `src/collections/Products.ts`. Only rendered when
 *          `data.type === 'stocked'` (the admin.condition on the field
 *          keeps it hidden for sourced items).
 *
 *          Uses Payload's built-in `useField` hook to read/write the
 *          form value. The `+1` / `−1` buttons call `setValue(n +/- 1)`
 *          with `disableModifyingForm` set to `false` so the normal
 *          form-dirty state kicks in and the Save button lights up.
 *
 *          Styled via `.yarit-stock-adjust*` rules in admin-brand.css.
 *
 *          Guardrails:
 *            - `−` button is disabled when the value is at 0 (prevents
 *              negative stock which the schema disallows).
 *            - No wraparound. Large jumps still require typing into
 *              the input.
 *            - Respects the field's disabled/readOnly state (inherited
 *              via `useField()`).
 */
'use client'

import React from 'react'
import { NumberField, useField } from '@payloadcms/ui'
import type { NumberFieldClientComponent } from 'payload'

export const StockQuickAdjust: NumberFieldClientComponent = (props) => {
  // `useField<number>` gives us the current value + a setter wired
  // into the form state. Hook into the same `path` prop Payload
  // passes the default field component so we track the exact cell
  // even if Payload ever wraps the field in an array or row.
  const { value, setValue, disabled } = useField<number>({
    path: props.path,
  })

  const current = typeof value === 'number' ? value : 0

  const handleBump = (delta: number) => () => {
    if (disabled) return
    const next = Math.max(0, current + delta)
    if (next === current) return
    setValue(next)
  }

  return (
    <div className="yarit-stock-adjust">
      {/* Render the stock input by delegating to the stock-standard
          NumberField from @payloadcms/ui — this keeps label, error
          state, description text, and the number input behavior
          identical to every other number field in the admin. */}
      <NumberField {...props} />
      <div className="yarit-stock-adjust__buttons" aria-hidden={disabled}>
        <button
          type="button"
          className="yarit-stock-adjust__btn yarit-stock-adjust__btn--minus"
          onClick={handleBump(-1)}
          disabled={disabled || current <= 0}
          aria-label="הקטנת מלאי ב-1"
          title="הקטנת מלאי ב-1"
        >
          −1
        </button>
        <button
          type="button"
          className="yarit-stock-adjust__btn yarit-stock-adjust__btn--plus"
          onClick={handleBump(1)}
          disabled={disabled}
          aria-label="הגדלת מלאי ב-1"
          title="הגדלת מלאי ב-1"
        >
          +1
        </button>
      </div>
    </div>
  )
}

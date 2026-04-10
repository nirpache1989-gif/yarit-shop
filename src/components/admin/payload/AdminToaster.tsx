/**
 * @file AdminToaster — warm branded toast system for the admin panel
 * @summary Registered as a Payload admin provider in
 *          `payload.config.ts → admin.components.providers`.
 *          Mounts react-hot-toast's <Toaster> at the bottom-center
 *          of the admin viewport, branded with Warm Night palette
 *          tokens, RTL-aware, and 4s default duration.
 *
 *          Success toasts use a linear gradient from primary-dark
 *          to primary, which reads as a "celebration" gradient
 *          without needing the palette to change. Error toasts
 *          fall back to neutral red for clarity.
 *
 *          See: Round 4 plan Track C2.
 */
'use client'

import { Toaster } from 'react-hot-toast'

export function AdminToaster() {
  return (
    <Toaster
      position="bottom-center"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        bottom: 24,
        fontFamily: 'var(--font-heebo), system-ui, sans-serif',
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--color-primary-dark)',
          color: '#f3e5c0',
          fontSize: '14px',
          padding: '14px 20px',
          borderRadius: '12px',
          border: '1px solid var(--color-border-brand)',
          direction: 'rtl',
          textAlign: 'right',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          maxWidth: 440,
        },
        success: {
          iconTheme: {
            primary: 'var(--color-accent)',
            secondary: '#ffffff',
          },
          style: {
            background:
              'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
            color: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#f87171',
            secondary: '#ffffff',
          },
        },
      }}
    />
  )
}

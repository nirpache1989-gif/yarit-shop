/**
 * @file OG social share card — auto-discovered by Next.js
 * @summary Generates a 1200x630 Open Graph image for link previews on
 *          social media. Uses `next/og` ImageResponse with the Copaia
 *          brand palette: parchment background, centered logo, tagline.
 *
 *          Next.js auto-discovers this file and applies the generated
 *          image as the `og:image` meta tag on all pages that don't
 *          override it with their own `opengraph-image` file.
 */
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Copaia — Rooted in wellness'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  // Read the logo as base64 for embedding in the ImageResponse
  const logoBuffer = await readFile(
    join(process.cwd(), 'public/brand/copaia.png'),
  )
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#F6EFDC',
          fontFamily: 'serif',
        }}
      >
        {/* Subtle border frame */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1120px',
            height: '550px',
            border: '2px solid #E4D7B0',
            borderRadius: '24px',
            backgroundColor: '#FDF8E8',
          }}
        >
          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoBase64}
            alt=""
            width={180}
            height={180}
            style={{ objectFit: 'contain' }}
          />

          {/* Brand name */}
          <div
            style={{
              display: 'flex',
              fontSize: 48,
              fontWeight: 700,
              color: '#183329',
              marginTop: 16,
              letterSpacing: '0.02em',
            }}
          >
            Copaia
          </div>

          {/* Tagline */}
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: '#6F6450',
              marginTop: 8,
            }}
          >
            Rooted in wellness
          </div>

          {/* Hebrew tagline */}
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: '#8B5A2B',
              marginTop: 6,
            }}
          >
            שורשים של בריאות
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}

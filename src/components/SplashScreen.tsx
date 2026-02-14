import { useState } from 'react'

interface SplashScreenProps {
  onEnter: () => void
}

/** Use logo.png in public folder, or fall back to inline SVG (Walkman-style W) */
const LOGO_PNG = '/logo.png'

export function SplashScreen({ onEnter }: SplashScreenProps) {
  const [logoSrcFailed, setLogoSrcFailed] = useState(false)
  const usePng = LOGO_PNG && !logoSrcFailed

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f0f12] px-6 py-8 overflow-auto animate-fade-in">
      <div className="flex flex-col items-center max-w-md w-full text-center">
        {/* Logo - Walkman PNG or inline W */}
        <div className="mb-6 flex items-center justify-center splash-animate-logo h-24 w-24 sm:h-28 sm:w-28">
          {usePng ? (
            <img
              src={LOGO_PNG}
              alt=""
              className="h-full w-full object-contain drop-shadow-[0_0_20px_rgba(99,102,241,0.15)]"
              onError={() => setLogoSrcFailed(true)}
            />
          ) : (
            <svg
              viewBox="0 0 32 32"
              className="h-full w-full drop-shadow-[0_0_20px_rgba(99,102,241,0.15)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 22 Q8 14 12 10 Q16 6 16 6 Q16 6 20 10 Q24 14 26 22"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="26" cy="22" r="2.5" fill="white" />
            </svg>
          )}
        </div>

        {/* App name */}
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight mb-2 splash-animate-title">
          EasyNote
        </h1>
        <p className="text-zinc-400 text-lg sm:text-xl mb-8 splash-animate-tagline">
          So you don’t miss anything
        </p>

        {/* Short feature line */}
        <p className="text-zinc-500 text-sm mb-10 max-w-xs splash-animate-features">
          Record meetings & calls, take notes, capture snapshots, summarize, and export to PDF — all in one place.
        </p>

        {/* CTA */}
        <button
          type="button"
          onClick={onEnter}
          className="w-full max-w-xs px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-500 hover:scale-[1.02] active:bg-indigo-500 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#0f0f12] transition min-h-[52px] splash-animate-button"
        >
          Get started
        </button>
      </div>
    </div>
  )
}

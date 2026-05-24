import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type SketchShellProps = {
  designId: string
  designName: string
  tagline: string
  accentClass: string
  children: ReactNode
}

export function SketchShell({
  designId,
  designName,
  tagline,
  accentClass,
  children,
}: SketchShellProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className={`border-b px-4 py-3 sm:px-6 ${accentClass}`}>
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider opacity-80">
              Design sketch · {designId}
            </p>
            <h1 className="text-lg font-semibold sm:text-xl">{designName}</h1>
            <p className="text-sm opacity-90">{tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/design-sketches"
              className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium backdrop-blur hover:bg-white/30"
            >
              All sketches
            </Link>
            <span className="hidden rounded-lg bg-white/10 px-3 py-1.5 text-xs sm:inline">
              Resize browser to preview mobile / tablet / desktop
            </span>
          </div>
        </div>
      </div>
      <div className="w-full p-4 sm:p-6">{children}</div>
    </div>
  )
}

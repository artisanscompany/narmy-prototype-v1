import { Lock } from 'lucide-react'
import type { ClearanceLevel } from '#/types/elearning'
import { getClearanceLabel } from '#/lib/clearance'

interface ContentLockProps {
  requiredLevel: ClearanceLevel
  children: React.ReactNode
  className?: string
  compact?: boolean
}

export function ContentLock({ requiredLevel, children, className = '', compact = false }: ContentLockProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="select-none pointer-events-none blur-[6px] opacity-40">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-xl">
        <div className={`flex flex-col items-center gap-2 ${compact ? 'scale-90' : ''}`}>
          <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-500" />
          </div>
          <p className="text-sm font-bold text-army-dark">Restricted Content</p>
          <p className="text-xs text-gray-500 text-center max-w-55">
            Requires <span className="font-semibold">{getClearanceLabel(requiredLevel)}</span> clearance
          </p>
          {!compact && (
            <p className="text-[11px] text-gray-500 text-center mt-0.5">
              Contact your HOD or Training Officer for access
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

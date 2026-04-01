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
      <div className="select-none pointer-events-none blur-[6px] opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl">
        <div className={`flex flex-col items-center gap-2 ${compact ? 'scale-90' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-army-dark">Restricted</p>
          <p className="text-xs text-gray-400 text-center max-w-[200px]">
            Requires {getClearanceLabel(requiredLevel)}
          </p>
          {!compact && (
            <p className="text-[11px] text-gray-300 text-center mt-1">
              Contact your HOD or Training Officer for access
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

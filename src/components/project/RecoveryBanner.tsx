import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'

export const RecoveryBanner: React.FC = () => {
  const { recoverySession, restoreRecoverySession, discardRecoverySession } = useProjectStore()

  if (!recoverySession || !recoverySession.hasRecovery) return null

  const formattedTime = recoverySession.timestamp
    ? new Date(recoverySession.timestamp).toLocaleTimeString() + ' on ' + new Date(recoverySession.timestamp).toLocaleDateString()
    : 'a previous session'

  return (
    <div className="w-full bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs select-none z-40 animate-in slide-in-from-top-1">
      <div className="flex items-center gap-2 text-amber-200">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong className="text-white font-semibold">Unsaved Session Recovered:</strong> D2 Visualizer detected an unexpected session termination from {formattedTime}.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={restoreRecoverySession}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restore Session
        </button>
        <button
          onClick={discardRecoverySession}
          className="px-2 py-1 rounded hover:bg-amber-500/20 text-amber-300 hover:text-white text-xs transition-colors"
        >
          Discard
        </button>
      </div>
    </div>
  )
}

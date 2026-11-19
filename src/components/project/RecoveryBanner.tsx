import React from 'react'
import { AlertCircle, RotateCcw, X } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'

export const RecoveryBanner: React.FC = () => {
  const { recoverySession, restoreRecoverySession, discardRecoverySession } = useProjectStore()

  if (!recoverySession || !recoverySession.hasRecovery) return null

  const formattedTime = recoverySession.timestamp
    ? new Date(recoverySession.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'a previous session'

  return (
    <div className="fixed top-11 right-4 max-w-sm bg-d2-surfaceElevated/95 backdrop-blur-md border border-amber-500/40 rounded-lg p-3 shadow-2xl flex items-start gap-3 text-xs select-none z-50 animate-in slide-in-from-top-2 duration-200">
      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        <p className="font-semibold text-white text-2xs">
          Unsaved Session Recovered
        </p>
        <p className="text-3xs text-d2-textSubtle leading-relaxed">
          Detected unexpected exit from {formattedTime}. Would you like to restore your work?
        </p>
        <div className="flex items-center gap-2 pt-1.5">
          <button
            onClick={restoreRecoverySession}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-3xs transition-colors shadow-xs"
          >
            <RotateCcw className="w-3 h-3" />
            Restore Session
          </button>
          <button
            onClick={discardRecoverySession}
            className="px-2 py-1 rounded hover:bg-white/10 text-d2-textSubtle hover:text-white text-3xs transition-colors"
          >
            Discard
          </button>
        </div>
      </div>
      <button
        onClick={discardRecoverySession}
        className="text-d2-textSubtle hover:text-white p-0.5 transition-colors"
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

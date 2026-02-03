import { useState } from 'react'
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVoteSummary, useMyVote, useVote, useRemoveVote } from '@/hooks/useVotes'
import { useAuth } from '@/context/AuthContext'

export function VoteButtons({ reportId, status, compact = false, initialSummary }) {
  const { isAuthenticated } = useAuth()
  const [pendingType, setPendingType] = useState(null)

  const normalizedStatus = (status || '').toString().toUpperCase()
  const isResolved = normalizedStatus === 'FINISHED' || normalizedStatus === 'RESOLVED'
  const isOpen = normalizedStatus === 'PENDING' || normalizedStatus === 'SENT'

  const prompt = isResolved
    ? 'Was this actually resolved?'
    : isOpen
      ? 'Is this a real problem?'
      : 'How do you feel about this report?'

  const upLabel = isResolved ? 'Yes, the problem is fixed' : 'Yes, this is a real issue'
  const downLabel = isResolved ? 'No, the problem still exists' : 'No, this is not a real issue'

  const initialData = initialSummary
    ? {
        upvotes: initialSummary.upvotes ?? 0,
        downvotes: initialSummary.downvotes ?? 0,
        total:
          initialSummary.total ??
          (initialSummary.upvotes ?? 0) + (initialSummary.downvotes ?? 0),
      }
    : undefined

  const { data: summary } = useVoteSummary(reportId, initialData)
  const { data: myVote } = useMyVote(reportId, isAuthenticated)
  const voteMutation = useVote()
  const removeVoteMutation = useRemoveVote()

  const isMutating = voteMutation.isPending || removeVoteMutation.isPending
  const upvotes = summary?.upvotes ?? 0
  const downvotes = summary?.downvotes ?? 0

  const handleVote = (type) => {
    if (!isAuthenticated || isMutating) return

    setPendingType(type)
    if (myVote?.type === type) {
      removeVoteMutation.mutate(reportId, {
        onSettled: () => setPendingType(null),
      })
      return
    }

    voteMutation.mutate(
      { reportId, type },
      { onSettled: () => setPendingType(null) }
    )
  }

  const upButton = (
    <Button
      variant={myVote?.type === 'UP' ? 'default' : 'outline'}
      size="sm"
      onClick={() => handleVote('UP')}
      disabled={!isAuthenticated || isMutating}
      title={isAuthenticated ? upLabel : undefined}
      aria-label={upLabel}
      className={`flex items-center gap-1 ${compact ? 'h-8 px-2' : ''}`}
    >
      {pendingType === 'UP' && isMutating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <ThumbsUp className="h-4 w-4" />
      )}
      <span>{upvotes}</span>
    </Button>
  )

  const downButton = (
    <Button
      variant={myVote?.type === 'DOWN' ? 'destructive' : 'outline'}
      size="sm"
      onClick={() => handleVote('DOWN')}
      disabled={!isAuthenticated || isMutating}
      title={isAuthenticated ? downLabel : undefined}
      aria-label={downLabel}
      className={`flex items-center gap-1 ${compact ? 'h-8 px-2' : ''}`}
    >
      {pendingType === 'DOWN' && isMutating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <ThumbsDown className="h-4 w-4" />
      )}
      <span>{downvotes}</span>
    </Button>
  )

  return (
    <div className={`space-y-2 ${compact ? 'text-xs' : ''}`}>
      {!compact && (
        <p className="text-sm text-muted-foreground">{prompt}</p>
      )}
      <div className={`flex items-center gap-2 ${compact ? 'scale-95 origin-left' : ''}`}>
        {isAuthenticated ? upButton : <span className="inline-flex" title="Log in to vote">{upButton}</span>}
        {isAuthenticated ? downButton : <span className="inline-flex" title="Log in to vote">{downButton}</span>}
      </div>
    </div>
  )
}

export default VoteButtons

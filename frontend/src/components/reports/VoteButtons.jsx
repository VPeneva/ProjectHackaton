import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useVoteSummary, useMyVote, useVote, useRemoveVote } from '@/hooks/useVotes'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/I18nContext'

export function VoteButtons({ reportId, status, compact = false, initialSummary }) {
  const { isAuthenticated } = useAuth()
  const { t } = useI18n()
  const [pendingType, setPendingType] = useState(null)
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')

  const normalizedStatus = (status || '').toString().toUpperCase()
  const isResolved = normalizedStatus === 'FINISHED' || normalizedStatus === 'RESOLVED'
  const isOpen = normalizedStatus === 'PENDING' || normalizedStatus === 'SENT'

  const prompt = isResolved
    ? t('vote.promptResolved')
    : isOpen
      ? t('vote.promptOpen')
      : t('vote.promptOpen')

  const upLabel = isResolved ? t('vote.upResolved') : t('vote.upOpen')
  const downLabel = isResolved ? t('vote.downResolved') : t('vote.downOpen')

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
  const weightedUpvotes = summary?.weightedUpvotes ?? upvotes
  const weightedDownvotes = summary?.weightedDownvotes ?? downvotes
  const votingClosed = summary?.votingClosed

  const reasonOptions = isResolved
    ? [
        { value: 'Fixed properly', label: t('vote.upResolved') },
        { value: 'Still an issue', label: t('vote.downResolved') },
        { value: 'Other', label: t('vote.reasonOther') },
      ]
    : [
        { value: 'Safety risk', label: 'Safety risk' },
        { value: 'Infrastructure damage', label: 'Infrastructure damage' },
        { value: 'Accessibility issue', label: 'Accessibility issue' },
        { value: 'Recurring problem', label: 'Recurring problem' },
        { value: 'Other', label: t('vote.reasonOther') },
      ]

  useEffect(() => {
    if (!myVote?.reason) {
      setReason('')
      setCustomReason('')
      return
    }
    const match = reasonOptions.find((option) => option.value === myVote.reason)
    if (match) {
      setReason(match.value)
      setCustomReason('')
    } else {
      setReason('Other')
      setCustomReason(myVote.reason)
    }
  }, [myVote?.reason])

  const handleVote = (type) => {
    if (!isAuthenticated || isMutating || votingClosed) return

    const reasonValue =
      reason === 'Other'
        ? customReason.trim()
        : reason && reason !== 'Other'
          ? reason
          : ''

    setPendingType(type)
    if (myVote?.type === type) {
      removeVoteMutation.mutate(reportId, {
        onSettled: () => setPendingType(null),
      })
      return
    }

    voteMutation.mutate(
      { reportId, type, reason: reasonValue || undefined },
      { onSettled: () => setPendingType(null) }
    )
  }

  const upButton = (
    <Button
      variant={myVote?.type === 'UP' ? 'default' : 'outline'}
      size="sm"
      onClick={() => handleVote('UP')}
      disabled={!isAuthenticated || isMutating || votingClosed}
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
      disabled={!isAuthenticated || isMutating || votingClosed}
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
      {!compact && votingClosed && (
        <p className="text-xs text-amber-600">{t('vote.votingClosed')}</p>
      )}
      {!compact && (
        <div className="text-xs text-muted-foreground">
          {t('vote.weightedScore')}: {weightedUpvotes} / {weightedDownvotes}
        </div>
      )}
      {!compact && isAuthenticated && !votingClosed && (
        <div className="space-y-2">
          <p className="text-xs font-medium">{t('vote.reasonTitle')}</p>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder={t('vote.reasonPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {reasonOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {reason === 'Other' && (
            <Textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={2}
              placeholder={t('vote.reasonDetails')}
            />
          )}
        </div>
      )}
      {!compact && summary?.reasons?.length ? (
        <div className="space-y-1">
          <p className="text-xs font-medium">{t('vote.reasonsHeading')}</p>
          <div className="flex flex-wrap gap-2">
            {summary.reasons.map((item) => (
              <span
                key={item.reason}
                className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {item.reason} · {item.count}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default VoteButtons

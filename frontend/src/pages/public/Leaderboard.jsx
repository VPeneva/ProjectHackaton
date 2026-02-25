import { useLeaderboard } from '@/hooks/useUsers'
import { useI18n } from '@/context/I18nContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy } from 'lucide-react'

export default function Leaderboard() {
  const { t } = useI18n()
  const { data: leaderboard = [], isLoading, isError, error } = useLeaderboard(10)

  const errorMessage =
    error?.response?.data?.error ||
    error?.message ||
    'Failed to load leaderboard.'

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 text-center border-b-3 border-foreground pb-6">
        <h1 className="font-display text-5xl md:text-7xl uppercase mb-2">{t('leaderboard.title')}</h1>
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{t('leaderboard.subtitle')}</p>
      </div>

      <Card>
        <CardHeader className="border-b-3 border-foreground">
          <CardTitle className="flex items-center gap-2 font-display text-xl uppercase">
            <Trophy className="h-5 w-5 text-foreground" />
            {t('leaderboard.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-muted-foreground">{errorMessage}</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-muted-foreground">{t('dashboard.noContributors')}</p>
          ) : (
            leaderboard.map((entry, index) => (
              <div
                key={entry.user.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 border-3 border-foreground"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 border-3 border-foreground bg-muted text-foreground flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold uppercase">{entry.user.name}</p>
                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      {t('leaderboard.points')}: {entry.points}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.badges?.length ? (
                    entry.badges.map((badge) => (
                      <Badge key={badge.key} variant="outline">
                        {badge.label}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">{t('leaderboard.badges')}</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

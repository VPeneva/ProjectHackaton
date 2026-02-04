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
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('leaderboard.title')}</h1>
        <p className="text-muted-foreground">{t('leaderboard.subtitle')}</p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {t('leaderboard.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-muted-foreground">{errorMessage}</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-muted-foreground">No contributors yet.</p>
          ) : (
            leaderboard.map((entry, index) => (
              <div
                key={entry.user.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 rounded-lg border border-border/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{entry.user.name}</p>
                    <p className="text-xs text-muted-foreground">
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

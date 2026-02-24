import { Link, useParams } from 'react-router-dom'
import { useUserProfile } from '@/hooks/useUsers'
import { useI18n } from '@/context/I18nContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Clock, CheckCircle, Send, User, Trophy } from 'lucide-react'

const statusConfig = {
  Pending: { label: 'Pending', variant: 'pending' },
  Sent: { label: 'In Progress', variant: 'sent' },
  Finished: { label: 'Resolved', variant: 'finished' },
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="font-display text-3xl">{value}</p>
        </div>
        <div className="w-10 h-10 border-3 border-foreground bg-muted flex items-center justify-center">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

function ReportCard({ report }) {
  const status = statusConfig[report.status] || statusConfig.Pending
  const imageUrl = report.images?.[0]?.url || report.imageUrl

  return (
    <Card className="overflow-hidden">
      {imageUrl && (
        <Link to={`/reports/${report.id}`} className="block">
          <div className="aspect-video overflow-hidden bg-muted">
            <img src={imageUrl} alt={report.title} className="w-full h-full object-cover" />
          </div>
        </Link>
      )}
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold uppercase line-clamp-1">{report.title}</h3>
          <Badge variant={status.variant}>
            {status.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
        <Button size="sm" variant="outline" asChild className="hover:bg-foreground hover:text-background transition-none">
          <Link to={`/reports/${report.id}`}><span className="uppercase">View Report</span></Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function UserProfile() {
  const { id } = useParams()
  const { data, isLoading, isError, error } = useUserProfile(id)
  const { t } = useI18n()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {error?.response?.data?.error || 'Unable to load user profile.'}
            </p>
            <Button asChild className="mt-4">
              <Link to="/reports"><span className="uppercase">Back to Reports</span></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { user, stats, reports, gamification } = data

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 border-3 border-foreground bg-muted flex items-center justify-center">
          <User className="h-6 w-6 text-foreground" />
        </div>
        <div>
          <h1 className="font-display text-5xl uppercase">{user.name}</h1>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Reports" value={stats.total} icon={FileText} />
        <StatCard title="Pending" value={stats.pending} icon={Clock} />
        <StatCard title="In Progress" value={stats.sent} icon={Send} />
        <StatCard title="Resolved" value={stats.finished} icon={CheckCircle} />
      </div>

      {gamification && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{t('gamification.points')}</p>
                <p className="font-display text-3xl">{gamification.points}</p>
              </div>
              <div className="w-10 h-10 border-3 border-foreground bg-muted flex items-center justify-center">
                <Trophy className="h-5 w-5 text-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">{t('gamification.badges')}</p>
              <div className="flex flex-wrap gap-2">
                {gamification.badges?.length ? (
                  gamification.badges.map((badge) => (
                    <Badge key={badge.key} variant="outline">
                      {badge.label}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">{t('gamification.badges')}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mb-4 border-b-3 border-foreground pb-4">
        <h2 className="font-display text-xl uppercase">Recent Reports</h2>
      </div>
      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No reports published yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  )
}

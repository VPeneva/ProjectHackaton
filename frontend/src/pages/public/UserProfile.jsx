import { Link, useParams } from 'react-router-dom'
import { useUserProfile } from '@/hooks/useUsers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Clock, CheckCircle, Send, User } from 'lucide-react'

const statusConfig = {
  Pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  Sent: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  Finished: { label: 'Resolved', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

function ReportCard({ report }) {
  const status = statusConfig[report.status] || statusConfig.Pending
  const imageUrl = report.images?.[0]?.url || report.imageUrl

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      {imageUrl && (
        <Link to={`/reports/${report.id}`} className="block">
          <div className="aspect-video overflow-hidden bg-muted">
            <img src={imageUrl} alt={report.title} className="w-full h-full object-cover" />
          </div>
        </Link>
      )}
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold line-clamp-1">{report.title}</h3>
          <Badge variant="outline" className={status.color}>
            {status.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
        <Button size="sm" variant="outline" asChild>
          <Link to={`/reports/${report.id}`}>View Report</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function UserProfile() {
  const { id } = useParams()
  const { data, isLoading, isError, error } = useUserProfile(id)

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
        <Card className="border-0 shadow-lg max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {error?.response?.data?.error || 'Unable to load user profile.'}
            </p>
            <Button asChild className="mt-4">
              <Link to="/reports">Back to Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { user, stats, reports } = data

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">
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

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Recent Reports</h2>
      </div>
      {reports.length === 0 ? (
        <Card className="border-0 shadow-lg">
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

import { Link } from 'react-router-dom'
import { useReportStats } from '@/hooks/useReports'
import { useAdmin, useVoteAnalytics } from '@/hooks/useAdmin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    FileText,
    Clock,
    Send,
    CheckCircle,
    Users,
    Building2,
    Tag,
    MessageSquare,
    ArrowRight,
    AlertCircle,
    ThumbsUp,
    ThumbsDown,
} from 'lucide-react'

function StatCard({ title, value, icon: Icon, href, isLoading }) {
    const content = (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                            <p className="font-display text-4xl uppercase">{value}</p>
                        )}
                    </div>
                    <div className="w-12 h-12 border-3 border-foreground bg-muted flex items-center justify-center">
                        <Icon className="h-6 w-6 text-foreground" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    if (href) {
        return <Link to={href}>{content}</Link>
    }
    return content
}

function QuickActionCard({ title, description, icon: Icon, href, count }) {
    return (
        <Link to={href}>
            <Card className="h-full hover:bg-foreground hover:text-background transition-none">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border-3 border-foreground bg-muted flex items-center justify-center">
                            <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold uppercase">{title}</h3>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {count !== undefined && (
                            <Badge variant="secondary">{count}</Badge>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

const statusLabels = {
    PENDING: 'Pending',
    SENT: 'In Progress',
    FINISHED: 'Resolved',
}

const formatStatusLabel = (status) => {
    const normalized = (status || '').toString().toUpperCase()
    return statusLabels[normalized] || status || 'Unknown'
}

export default function AdminDashboard() {
    const { data: stats, isLoading: statsLoading } = useReportStats()
    const { data: pendingReports, isLoading: reportsLoading } = useAdmin()
    const { data: voteAnalytics, isLoading: analyticsLoading } = useVoteAnalytics()

    const pendingCount = pendingReports?.filter(r => r.status === 'PENDING').length || 0
    const sentCount = pendingReports?.filter(r => r.status === 'SENT').length || 0

    const statCards = [
        {
            title: 'Total Reports',
            value: stats?.total || 0,
            icon: FileText,
            href: '/admin/reports',
        },
        {
            title: 'Pending Review',
            value: stats?.byStatus?.PENDING || 0,
            icon: Clock,
            href: '/admin/reports',
        },
        {
            title: 'In Progress',
            value: stats?.byStatus?.SENT || 0,
            icon: Send,
            href: '/admin/reports',
        },
        {
            title: 'Resolved',
            value: stats?.byStatus?.FINISHED || 0,
            icon: CheckCircle,
            href: '/admin/resolved',
        },
    ]

    const quickActions = [
        {
            title: 'Manage Reports',
            description: 'Review and process pending reports',
            icon: FileText,
            href: '/admin/reports',
            count: pendingCount + sentCount,
        },
        {
            title: 'Resolved Reports',
            description: 'View completed and resolved reports',
            icon: CheckCircle,
            href: '/admin/resolved',
        },
        {
            title: 'Institutions',
            description: 'Manage government institutions',
            icon: Building2,
            href: '/admin/institutions',
        },
        {
            title: 'Categories',
            description: 'Manage report categories',
            icon: Tag,
            href: '/admin/categories',
        },
        {
            title: 'Contact Messages',
            description: 'View messages from users',
            icon: MessageSquare,
            href: '/admin/messages',
        },
        {
            title: 'Analytics',
            description: 'Trends and resolution insights',
            icon: ThumbsUp,
            href: '/admin/analytics',
        },
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8 border-b-3 border-foreground pb-4">
                <h1 className="font-display text-5xl md:text-7xl uppercase">ADMIN DASHBOARD</h1>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-2">
                    Manage reports, institutions, and system settings.
                </p>
            </div>

            {/* Alert for pending reports */}
            {pendingCount > 0 && (
                <Card className="border-3 border-primary mb-8">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            <span className="font-mono text-sm uppercase tracking-wider">
                                You have {pendingCount} report{pendingCount !== 1 ? 's' : ''} awaiting review
                            </span>
                        </div>
                        <Button size="sm" asChild>
                            <Link to="/admin/reports" className="uppercase">REVIEW NOW</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, index) => (
                    <StatCard key={index} {...stat} isLoading={statsLoading} />
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="font-display text-2xl uppercase mb-4">QUICK ACTIONS</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                        <QuickActionCard key={index} {...action} />
                    ))}
                </div>
            </div>

            {/* Community Feedback */}
            <div className="mb-8">
                <h2 className="font-display text-2xl uppercase mb-4">COMMUNITY FEEDBACK</h2>
                <div className="grid lg:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="border-b-3 border-foreground">
                            <CardTitle className="font-display text-xl uppercase">Validated Issues</CardTitle>
                            <CardDescription className="font-mono text-xs uppercase tracking-wider">Most upvoted open reports</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {analyticsLoading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <Skeleton key={i} className="h-4 w-full" />
                                    ))}
                                </div>
                            ) : voteAnalytics?.topUpvotedOpen?.length ? (
                                <div className="space-y-2">
                                    {voteAnalytics.topUpvotedOpen.map((report) => (
                                        <Link
                                            key={report.id}
                                            to={`/reports/${report.id}`}
                                            className="flex items-center justify-between gap-3 border-3 border-foreground p-2 hover:bg-foreground hover:text-background transition-none"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium line-clamp-1">
                                                    {report.title}
                                                </p>
                                                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                                                    {formatStatusLabel(report.status)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 font-mono text-xs">
                                                <span className="flex items-center gap-1 text-emerald-600">
                                                    <ThumbsUp className="h-3 w-3" />
                                                    {report.upvotes ?? 0}
                                                </span>
                                                <span className="flex items-center gap-1 text-rose-600">
                                                    <ThumbsDown className="h-3 w-3" />
                                                    {report.downvotes ?? 0}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">No votes yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b-3 border-foreground">
                            <CardTitle className="font-display text-xl uppercase">Unresolved Signals</CardTitle>
                            <CardDescription className="font-mono text-xs uppercase tracking-wider">Most downvoted resolved reports</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {analyticsLoading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <Skeleton key={i} className="h-4 w-full" />
                                    ))}
                                </div>
                            ) : voteAnalytics?.topDownvotedFinished?.length ? (
                                <div className="space-y-2">
                                    {voteAnalytics.topDownvotedFinished.map((report) => (
                                        <Link
                                            key={report.id}
                                            to={`/reports/${report.id}`}
                                            className="flex items-center justify-between gap-3 border-3 border-foreground p-2 hover:bg-foreground hover:text-background transition-none"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium line-clamp-1">
                                                    {report.title}
                                                </p>
                                                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                                                    {formatStatusLabel(report.status)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 font-mono text-xs">
                                                <span className="flex items-center gap-1 text-emerald-600">
                                                    <ThumbsUp className="h-3 w-3" />
                                                    {report.upvotes ?? 0}
                                                </span>
                                                <span className="flex items-center gap-1 text-rose-600">
                                                    <ThumbsDown className="h-3 w-3" />
                                                    {report.downvotes ?? 0}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">No feedback yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b-3 border-foreground">
                            <CardTitle className="font-display text-xl uppercase">Vote Ratio</CardTitle>
                            <CardDescription className="font-mono text-xs uppercase tracking-wider">Upvote share by status</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {analyticsLoading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <Skeleton key={i} className="h-4 w-full" />
                                    ))}
                                </div>
                            ) : voteAnalytics?.ratiosByStatus?.length ? (
                                <div className="space-y-3">
                                    {voteAnalytics.ratiosByStatus.map((row) => (
                                        <div
                                            key={row.status}
                                            className="flex items-center justify-between font-mono text-sm"
                                        >
                                            <span className="uppercase">{formatStatusLabel(row.status)}</span>
                                            <span className="font-medium">
                                                {row.total
                                                    ? `${Math.round(row.ratio * 100)}% up`
                                                    : 'No votes'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">No votes yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Pending Reports */}
            <Card>
                <CardHeader className="border-b-3 border-foreground">
                    <CardTitle className="font-display text-xl uppercase">Recent Pending Reports</CardTitle>
                    <CardDescription className="font-mono text-xs uppercase tracking-wider">Latest reports awaiting your review</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    {reportsLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10" />
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-3/4 mb-2" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : pendingReports?.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 border-3 border-foreground flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-6 w-6 text-foreground" />
                            </div>
                            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">All caught up! No pending reports.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingReports?.slice(0, 5).map((report) => (
                                <Link
                                    key={report.id}
                                    to={`/reports/${report.id}`}
                                    className="flex items-center gap-4 border-3 border-foreground p-2 hover:bg-foreground hover:text-background transition-none"
                                >
                                    <div className="w-10 h-10 border-3 border-foreground bg-muted flex items-center justify-center shrink-0">
                                        <FileText className="h-5 w-5 text-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium uppercase line-clamp-1">{report.title}</h4>
                                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={report.status === 'PENDING' ? 'pending' : 'sent'}
                                    >
                                        {report.status === 'PENDING' ? 'PENDING' : 'SENT'}
                                    </Badge>
                                </Link>
                            ))}
                            {pendingReports?.length > 5 && (
                                <Button variant="outline" asChild className="w-full uppercase">
                                    <Link to="/admin/reports">
                                        VIEW ALL ({pendingReports.length} REPORTS)
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

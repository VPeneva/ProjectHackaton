import { Link } from 'react-router-dom'
import { useReportStats } from '@/hooks/useReports'
import { useAdmin } from '@/hooks/useAdmin'
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
} from 'lucide-react'

function StatCard({ title, value, icon: Icon, color, href, isLoading }) {
    const content = (
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                            <p className="text-3xl font-bold">{value}</p>
                        )}
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
                        <Icon className="h-6 w-6" />
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
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 h-full">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{title}</h3>
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

export default function AdminDashboard() {
    const { data: stats, isLoading: statsLoading } = useReportStats()
    const { data: pendingReports, isLoading: reportsLoading } = useAdmin()

    const pendingCount = pendingReports?.filter(r => r.status === 'PENDING').length || 0
    const sentCount = pendingReports?.filter(r => r.status === 'SENT').length || 0

    const statCards = [
        {
            title: 'Total Reports',
            value: stats?.total || 0,
            icon: FileText,
            color: 'bg-blue-500/10 text-blue-500',
            href: '/admin/reports',
        },
        {
            title: 'Pending Review',
            value: stats?.byStatus?.PENDING || 0,
            icon: Clock,
            color: 'bg-amber-500/10 text-amber-500',
            href: '/admin/reports',
        },
        {
            title: 'In Progress',
            value: stats?.byStatus?.SENT || 0,
            icon: Send,
            color: 'bg-blue-500/10 text-blue-500',
            href: '/admin/reports',
        },
        {
            title: 'Resolved',
            value: stats?.byStatus?.FINISHED || 0,
            icon: CheckCircle,
            color: 'bg-green-500/10 text-green-500',
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
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage reports, institutions, and system settings.
                </p>
            </div>

            {/* Alert for pending reports */}
            {pendingCount > 0 && (
                <Card className="border-0 shadow-lg bg-amber-500/10 mb-8">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <span className="font-medium">
                                You have {pendingCount} report{pendingCount !== 1 ? 's' : ''} awaiting review
                            </span>
                        </div>
                        <Button size="sm" asChild>
                            <Link to="/admin/reports">Review Now</Link>
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
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                        <QuickActionCard key={index} {...action} />
                    ))}
                </div>
            </div>

            {/* Recent Pending Reports */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>Recent Pending Reports</CardTitle>
                    <CardDescription>Latest reports awaiting your review</CardDescription>
                </CardHeader>
                <CardContent>
                    {reportsLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded" />
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-3/4 mb-2" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : pendingReports?.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <p className="text-muted-foreground">All caught up! No pending reports.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingReports?.slice(0, 5).map((report) => (
                                <Link
                                    key={report.id}
                                    to={`/reports/${report.id}`}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium line-clamp-1">{report.title}</h4>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={
                                            report.status === 'PENDING'
                                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                        }
                                    >
                                        {report.status === 'PENDING' ? 'Pending' : 'Sent'}
                                    </Badge>
                                </Link>
                            ))}
                            {pendingReports?.length > 5 && (
                                <Button variant="outline" asChild className="w-full">
                                    <Link to="/admin/reports">
                                        View All ({pendingReports.length} reports)
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

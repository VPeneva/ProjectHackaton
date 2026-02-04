import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useReportStats } from '@/hooks/useReports'
import { useLeaderboard } from '@/hooks/useUsers'
import { useI18n } from '@/context/I18nContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Plus,
    FileText,
    Clock,
    Send,
    CheckCircle,
    ArrowRight,
    MapPin,
    TrendingUp,
    Trophy,
} from 'lucide-react'

export default function Dashboard() {
    const { user } = useAuth()
    const { t } = useI18n()
    const { data: stats, isLoading } = useReportStats()
    const { data: leaderboard = [] } = useLeaderboard(3)

    const quickActions = [
        {
            title: 'Create New Report',
            description: 'Submit a new infrastructure issue',
            icon: Plus,
            href: '/create-report',
            color: 'bg-primary text-primary-foreground',
        },
        {
            title: 'View My Reports',
            description: 'See all your submitted reports',
            icon: FileText,
            href: '/my-reports',
            color: 'bg-muted hover:bg-muted/80',
        },
        {
            title: 'Explore Map',
            description: 'View all reports on the map',
            icon: MapPin,
            href: '/map',
            color: 'bg-muted hover:bg-muted/80',
        },
    ]

    const statCards = [
        {
            title: 'Total Reports',
            value: stats?.total || 0,
            icon: FileText,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'Pending',
            value: stats?.byStatus?.PENDING || 0,
            icon: Clock,
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
        },
        {
            title: 'In Progress',
            value: stats?.byStatus?.SENT || 0,
            icon: Send,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'Resolved',
            value: stats?.byStatus?.FINISHED || 0,
            icon: CheckCircle,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Welcome back, {user?.name?.split(' ')[0] || 'there'}!
                </h1>
                <p className="text-muted-foreground text-lg">
                    Here's what's happening with your reports and the community.
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                {quickActions.map((action, index) => (
                    <Link key={index} to={action.href}>
                        <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${index === 0 ? 'bg-primary text-primary-foreground' : ''}`}>
                            <CardContent className="p-6 flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${index === 0 ? 'bg-primary-foreground/20' : 'bg-primary/10'}`}>
                                    <action.icon className={`h-6 w-6 ${index === 0 ? 'text-primary-foreground' : 'text-primary'}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{action.title}</h3>
                                    <p className={`text-sm ${index === 0 ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                        {action.description}
                                    </p>
                                </div>
                                <ArrowRight className={`h-5 w-5 ${index === 0 ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Stats Overview */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Community Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <Card key={index} className="border-0 shadow-md">
                            <CardContent className="p-6">
                                {isLoading ? (
                                    <>
                                        <Skeleton className="h-4 w-20 mb-2" />
                                        <Skeleton className="h-8 w-16" />
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                            </div>
                                            <span className="text-sm text-muted-foreground">{stat.title}</span>
                                        </div>
                                        <div className="text-3xl font-bold">{stat.value}</div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest report submissions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
                        <p className="text-muted-foreground mb-4">
                            Start by creating your first report to improve your community.
                        </p>
                        <Button asChild>
                            <Link to="/create-report">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Report
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Community Leaders */}
            <div className="mt-8">
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-primary" />
                            {t('leaderboard.title')}
                        </CardTitle>
                        <CardDescription>{t('leaderboard.subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {leaderboard.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No contributors yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {leaderboard.map((entry, index) => (
                                    <div
                                        key={entry.user.id}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                                                {index + 1}
                                            </span>
                                            <span className="font-medium">{entry.user.name}</span>
                                        </div>
                                        <span className="text-muted-foreground">
                                            {entry.points} {t('gamification.points')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

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
            title: 'CREATE NEW REPORT',
            description: 'Submit a new infrastructure issue',
            icon: Plus,
            href: '/create-report',
        },
        {
            title: 'VIEW MY REPORTS',
            description: 'See all your submitted reports',
            icon: FileText,
            href: '/my-reports',
        },
        {
            title: 'EXPLORE MAP',
            description: 'View all reports on the map',
            icon: MapPin,
            href: '/map',
        },
    ]

    const statCards = [
        {
            title: 'TOTAL REPORTS',
            value: stats?.total || 0,
            icon: FileText,
        },
        {
            title: 'PENDING',
            value: stats?.byStatus?.PENDING || 0,
            icon: Clock,
        },
        {
            title: 'IN PROGRESS',
            value: stats?.byStatus?.SENT || 0,
            icon: Send,
        },
        {
            title: 'RESOLVED',
            value: stats?.byStatus?.FINISHED || 0,
            icon: CheckCircle,
        },
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Welcome Header */}
            <div className="mb-8 border-b-3 border-foreground pb-6">
                <h1 className="font-display text-5xl md:text-7xl uppercase mb-2">
                    WELCOME BACK, {user?.name?.split(' ')[0]?.toUpperCase() || 'THERE'}!
                </h1>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Here's what's happening with your reports and the community.
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                {quickActions.map((action, index) => (
                    <Link key={index} to={action.href}>
                        <Card className={`transition-none ${index === 0 ? 'bg-primary text-primary-foreground' : 'hover:bg-foreground hover:text-background'}`}>
                            <CardContent className="p-6 flex items-center space-x-4">
                                <div className={`w-12 h-12 border-3 border-foreground flex items-center justify-center ${index === 0 ? 'bg-primary-foreground/20 border-primary-foreground' : 'bg-muted'}`}>
                                    <action.icon className={`h-6 w-6 ${index === 0 ? 'text-primary-foreground' : 'text-foreground'}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-display text-xl uppercase">{action.title}</h3>
                                    <p className={`font-mono text-xs uppercase tracking-wider ${index === 0 ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
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
                <h2 className="font-display text-3xl uppercase mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    COMMUNITY STATISTICS
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <Card key={index}>
                            <CardContent className="p-6">
                                {isLoading ? (
                                    <>
                                        <Skeleton className="h-4 w-20 mb-2" />
                                        <Skeleton className="h-8 w-16" />
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 border-3 border-foreground bg-muted flex items-center justify-center">
                                                <stat.icon className="h-4 w-4 text-foreground" />
                                            </div>
                                            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{stat.title}</span>
                                        </div>
                                        <div className="font-display text-4xl">{stat.value}</div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <Card>
                <CardHeader className="border-b-3 border-foreground">
                    <CardTitle className="font-display text-2xl uppercase">RECENT ACTIVITY</CardTitle>
                    <CardDescription className="font-mono text-xs uppercase tracking-wider">Your latest report submissions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <div className="w-16 h-16 border-3 border-foreground bg-muted flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-display text-2xl uppercase mb-2">NO RECENT ACTIVITY</h3>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                            Start by creating your first report to improve your community.
                        </p>
                        <Button asChild>
                            <Link to="/create-report">
                                <Plus className="mr-2 h-4 w-4" />
                                CREATE REPORT
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Community Leaders */}
            <div className="mt-8">
                <Card>
                    <CardHeader className="border-b-3 border-foreground">
                        <CardTitle className="font-display text-2xl uppercase flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-primary" />
                            {t('leaderboard.title')}
                        </CardTitle>
                        <CardDescription className="font-mono text-xs uppercase tracking-wider">{t('leaderboard.subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {leaderboard.length === 0 ? (
                            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">No contributors yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {leaderboard.map((entry, index) => (
                                    <div
                                        key={entry.user.id}
                                        className="flex items-center justify-between border-b-3 border-foreground pb-3 last:border-b-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 border-3 border-foreground bg-muted text-foreground flex items-center justify-center font-display text-lg">
                                                {index + 1}
                                            </span>
                                            <span className="font-display text-lg uppercase">{entry.user.name}</span>
                                        </div>
                                        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
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

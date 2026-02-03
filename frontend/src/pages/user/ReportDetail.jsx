import { useParams, Link, useNavigate } from 'react-router-dom'
import { useReport, useDeleteReport } from '@/hooks/useReports'
import { useAuth } from '@/context/AuthContext'
import { VoteButtons } from '@/components/reports/VoteButtons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
    ArrowLeft,
    MapPin,
    Clock,
    User,
    Building2,
    Tag,
    Trash2,
    CheckCircle,
    Send,
    AlertCircle,
} from 'lucide-react'

const statusConfig = {
    PENDING: {
        label: 'Pending',
        color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        icon: Clock,
        description: 'Awaiting review by administrators',
    },
    SENT: {
        label: 'In Progress',
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        icon: Send,
        description: 'Forwarded to the responsible institution',
    },
    FINISHED: {
        label: 'Resolved',
        color: 'bg-green-500/10 text-green-600 border-green-500/20',
        icon: CheckCircle,
        description: 'Issue has been addressed',
    },
}

function StatusTimeline({ status }) {
    const statuses = ['PENDING', 'SENT', 'FINISHED']
    const currentIndex = statuses.indexOf(status)

    return (
        <div className="flex items-center justify-between">
            {statuses.map((s, index) => {
                const config = statusConfig[s]
                const isActive = index <= currentIndex
                const isCurrent = index === currentIndex

                return (
                    <div key={s} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive
                                        ? isCurrent
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-green-500 text-white'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                <config.icon className="h-5 w-5" />
                            </div>
                            <span className={`text-xs mt-2 ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
                                {config.label}
                            </span>
                        </div>
                        {index < statuses.length - 1 && (
                            <div
                                className={`flex-1 h-1 mx-2 rounded ${index < currentIndex ? 'bg-green-500' : 'bg-muted'
                                    }`}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default function ReportDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isAdmin } = useAuth()
    const { data: report, isLoading, isError } = useReport(id)
    const deleteReport = useDeleteReport()

    const handleDelete = async () => {
        try {
            await deleteReport.mutateAsync(id)
            navigate('/my-reports')
        } catch (error) {
            // Error handled by mutation
        }
    }

    const canDelete = report && (user?.id === report.userId || isAdmin)

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Skeleton className="h-8 w-32 mb-6" />
                <Skeleton className="h-64 w-full mb-6 rounded-lg" />
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        )
    }

    if (isError || !report) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-lg mx-auto border-0 shadow-lg">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
                        <p className="text-muted-foreground mb-4">
                            This report doesn't exist or has been removed.
                        </p>
                        <Button asChild>
                            <Link to="/reports">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const status = statusConfig[report.status] || statusConfig.PENDING
    const initialSummary = report?.upvotes !== undefined && report?.downvotes !== undefined
        ? {
            upvotes: report.upvotes ?? 0,
            downvotes: report.downvotes ?? 0,
            total: (report.upvotes ?? 0) + (report.downvotes ?? 0),
        }
        : undefined

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Back Button */}
            <Button variant="ghost" asChild className="mb-6">
                <Link to="/reports">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Reports
                </Link>
            </Button>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Image */}
                    {report.imageUrl && (
                        <Card className="border-0 shadow-lg overflow-hidden">
                            <img
                                src={report.imageUrl}
                                alt={report.title}
                                className="w-full aspect-video object-cover"
                            />
                        </Card>
                    )}

                    {/* Title and Description */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <CardTitle className="text-2xl">{report.title}</CardTitle>
                                <Badge variant="outline" className={status.color}>
                                    <status.icon className="h-3 w-3 mr-1" />
                                    {status.label}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {report.description}
                            </p>
                            <div className="mt-6 pt-4 border-t border-border/60">
                                <VoteButtons
                                    reportId={report.id}
                                    status={report.status}
                                    initialSummary={initialSummary}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Timeline */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">Report Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StatusTimeline status={report.status} />
                            <p className="text-sm text-muted-foreground text-center mt-4">
                                {status.description}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Details */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Submitted</div>
                                    <div className="text-sm font-medium">
                                        {new Date(report.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                </div>
                            </div>

                            {report.category && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Category</div>
                                        <div className="text-sm font-medium">{report.category.name}</div>
                                    </div>
                                </div>
                            )}

                            {report.institution && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Institution</div>
                                        <div className="text-sm font-medium">{report.institution.name}</div>
                                    </div>
                                </div>
                            )}

                            {report.location && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Location</div>
                                        <div className="text-sm font-medium">{report.location}</div>
                                    </div>
                                </div>
                            )}

                            {report.user && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Reported by</div>
                                        <div className="text-sm font-medium">{report.user.name}</div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    {canDelete && (
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg">Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Report
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Report</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete this report? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

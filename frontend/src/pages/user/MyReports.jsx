import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReports, useDeleteReport } from '@/hooks/useReports'
import { useAuth } from '@/context/AuthContext'
import { VoteButtons } from '@/components/reports/VoteButtons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
    Plus,
    MapPin,
    Clock,
    Eye,
    Trash2,
    FileText,
    Pencil,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

const statusConfig = {
    Pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    Sent: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    Finished: { label: 'Resolved', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
}

function ReportRow({ report, onDelete }) {
    const status = statusConfig[report.status] || statusConfig.Pending
    const imageUrl = report.images?.[0]?.url || report.imageUrl
    const [deleting, setDeleting] = useState(false)
    const initialSummary = report?.upvotes !== undefined && report?.downvotes !== undefined
        ? {
            upvotes: report.upvotes ?? 0,
            downvotes: report.downvotes ?? 0,
            total: (report.upvotes ?? 0) + (report.downvotes ?? 0),
        }
        : undefined

    const handleDelete = async () => {
        setDeleting(true)
        await onDelete(report.id)
        setDeleting(false)
    }

    return (
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Image thumbnail */}
                    {imageUrl && (
                        <div className="w-full md:w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                            <img
                                src={imageUrl}
                                alt={report.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold line-clamp-1">{report.title}</h3>
                            <Badge variant="outline" className={status.color}>
                                {status.label}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {report.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {report.address && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="line-clamp-1">{report.address}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="mt-3">
                            <VoteButtons
                                reportId={report.id}
                                status={report.status}
                                compact
                                initialSummary={initialSummary}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {report.status === 'Pending' && (
                            <Button variant="outline" size="sm" asChild>
                                <Link to={`/reports/${report.id}/edit`}>
                                    <Pencil className="h-4 w-4 mr-1" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                            <Link to={`/reports/${report.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Report</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete "{report.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {deleting ? 'Deleting...' : 'Delete'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ReportSkeleton() {
    return (
        <Card className="border-0 shadow-md">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
                    <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-9" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function MyReports() {
    const { user } = useAuth()
    const [page, setPage] = useState(1)

    const { data, isLoading, isError, error } = useReports({
        page,
        limit: 10,
        mine: 'true',
    })

    const deleteReport = useDeleteReport()

    const reports = data?.data || []
    const pagination = data?.pagination || { page: 1, totalPages: 1 }
    const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to load your reports. Please try again.'

    const handleDelete = async (id) => {
        try {
            await deleteReport.mutateAsync(id)
        } catch (error) {
            // Error handled by mutation
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Reports</h1>
                    <p className="text-muted-foreground">
                        Manage and track all your submitted reports.
                    </p>
                </div>
                <Button asChild>
                    <Link to="/create-report">
                        <Plus className="mr-2 h-4 w-4" />
                        New Report
                    </Link>
                </Button>
            </div>

            {/* Reports List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <ReportSkeleton key={i} />
                    ))}
                </div>
            ) : isError ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">{errorMessage}</p>
                    </CardContent>
                </Card>
            ) : reports.length === 0 ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
                        <p className="text-muted-foreground mb-4">
                            You haven't submitted any reports yet. Start by creating your first report.
                        </p>
                        <Button asChild>
                            <Link to="/create-report">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Your First Report
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="space-y-4 mb-8">
                        {reports.map((report) => (
                            <ReportRow key={report.id} report={report} onDelete={handleDelete} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setPage(page - 1)}
                                disabled={page <= 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage(page + 1)}
                                disabled={page >= pagination.totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

import { Link } from 'react-router-dom'
import { useI18n } from '@/context/I18nContext'
import { useResolvedReports } from '@/hooks/useAdmin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Eye,
    CheckCircle,
    Clock,
    Building2,
    MapPin,
    FileText,
    ArrowLeft,
    ThumbsUp,
    ThumbsDown,
} from 'lucide-react'

function ReportRow({ report }) {
    const { t } = useI18n()
    const upvotes = report.upvotes ?? 0
    const downvotes = report.downvotes ?? 0
    const needsReview = downvotes >= 3 && downvotes > upvotes
    const imageUrl = report.images?.[0]?.url || report.imageUrl

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Image */}
                    {imageUrl && (
                        <div className="w-full lg:w-20 h-20 border-3 border-foreground overflow-hidden bg-muted shrink-0">
                            <img
                                src={imageUrl}
                                alt={report.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold uppercase line-clamp-1">{report.title}</h3>
                            <Badge variant="finished">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t('admin.resolvedBadge')}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {report.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            {report.institution && (
                                <span className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {report.institution.name}
                                </span>
                            )}
                            {report.address && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {report.address}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {t('admin.resolvedDate', { date: new Date(report.updatedAt).toLocaleDateString() })}
                            </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 text-emerald-600">
                                <ThumbsUp className="h-3 w-3" />
                                {upvotes}
                            </span>
                            <span className="flex items-center gap-1 text-rose-600">
                                <ThumbsDown className="h-3 w-3" />
                                {downvotes}
                            </span>
                            {needsReview && (
                                <Badge variant="pending">
                                    {t('admin.needsReview')}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0">
                        <Button variant="outline" size="sm" asChild>
                            <Link to={`/reports/${report.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                {t('admin.viewDetails')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ReportSkeleton() {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-20 h-20 shrink-0" />
                    <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-9 w-28" />
                </div>
            </CardContent>
        </Card>
    )
}

export default function ResolvedReports() {
    const { t } = useI18n()
    const { data: reports, isLoading, isError, error } = useResolvedReports()
    const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        t('admin.resolvedReportsDesc')

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 border-b-3 border-foreground pb-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/admin">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="font-display text-5xl uppercase">{t('admin.resolvedReportsTitle')}</h1>
                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-2">
                        {t('admin.resolvedReportsSubtitle')}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <Card className="mb-8">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 border-3 border-foreground bg-muted flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <p className="font-display text-3xl">{reports?.length || 0}</p>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{t('admin.totalResolvedReports')}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Reports List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <ReportSkeleton key={i} />
                    ))}
                </div>
            ) : isError ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">{errorMessage}</p>
                    </CardContent>
                </Card>
            ) : reports?.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 border-3 border-foreground flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-foreground" />
                        </div>
                        <h3 className="font-display text-2xl uppercase mb-2">{t('admin.noResolvedYet')}</h3>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            {t('admin.resolvedWillAppear')}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {reports.map((report) => (
                        <ReportRow key={report.id} report={report} />
                    ))}
                </div>
            )}
        </div>
    )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useReports } from '@/hooks/useReports'
import { useCategories } from '@/hooks/useCategories'
import { VoteButtons } from '@/components/reports/VoteButtons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Search,
    MapPin,
    Clock,
    ChevronLeft,
    ChevronRight,
    Locate,
} from 'lucide-react'

const statusConfig = {
    Pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    Sent: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    Finished: { label: 'Resolved', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
}

function ReportCard({ report }) {
    const status = statusConfig[report.status] || statusConfig.Pending
    const imageUrl = report.images?.[0]?.url || report.imageUrl
    const initialSummary = report?.upvotes !== undefined && report?.downvotes !== undefined
        ? {
            upvotes: report.upvotes ?? 0,
            downvotes: report.downvotes ?? 0,
            total: (report.upvotes ?? 0) + (report.downvotes ?? 0),
        }
        : undefined

    return (
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
            {imageUrl && (
                <Link to={`/reports/${report.id}`} className="block">
                    <div className="aspect-video overflow-hidden bg-muted">
                        <img
                            src={imageUrl}
                            alt={report.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </Link>
            )}
            <CardContent className="p-4">
                <div className="space-y-3">
                    <Link to={`/reports/${report.id}`} className="block">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                {report.title}
                            </h3>
                            <Badge variant="outline" className={status.color}>
                                {status.label}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {report.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{report.address || 'Location set'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </Link>
                    <div className="pt-2 border-t border-border/60">
                        <VoteButtons
                            reportId={report.id}
                            status={report.status}
                            compact
                            initialSummary={initialSummary}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ReportSkeleton() {
    return (
        <Card className="border-0 shadow-md overflow-hidden">
            <Skeleton className="aspect-video" />
            <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-3" />
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </CardContent>
        </Card>
    )
}

export default function Reports() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')
    const [categoryId, setCategoryId] = useState('all')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [sort, setSort] = useState('newest')
    const [nearLat, setNearLat] = useState('')
    const [nearLng, setNearLng] = useState('')
    const [radiusKm, setRadiusKm] = useState('5')
    const [hasLocationOnly, setHasLocationOnly] = useState(false)

    const { data: categories } = useCategories()
    const { data, isLoading, isError, error } = useReports({
        page,
        limit: 9,
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        categoryId: categoryId !== 'all' ? categoryId : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sort,
        nearLat: nearLat || undefined,
        nearLng: nearLng || undefined,
        radiusKm: nearLat && nearLng ? radiusKm : undefined,
        hasLocation: hasLocationOnly ? 'true' : undefined,
    })

    const reports = data?.data || []
    const pagination = data?.pagination || { page: 1, totalPages: 1 }
    const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to load reports. Please try again.'

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            return
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setNearLat(position.coords.latitude.toFixed(6))
                setNearLng(position.coords.longitude.toFixed(6))
            },
            () => {
                // ignore errors silently
            }
        )
    }

    useEffect(() => {
        setPage(1)
    }, [search, status, categoryId, dateFrom, dateTo, sort, nearLat, nearLng, radiusKm, hasLocationOnly])

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Reports</h1>
                <p className="text-muted-foreground text-lg">
                    Explore infrastructure issues reported by the community.
                </p>
            </div>

            {/* Filters */}
            <div className="space-y-4 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search reports..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Sent">In Progress</SelectItem>
                            <SelectItem value="Finished">Resolved</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                            <SelectItem value="most-voted">Most Voted</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" asChild>
                        <Link to="/map">
                            <MapPin className="mr-2 h-4 w-4" />
                            Map View
                        </Link>
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        placeholder="From date"
                    />
                    <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        placeholder="To date"
                    />
                    <Button
                        variant={hasLocationOnly ? 'default' : 'outline'}
                        onClick={() => setHasLocationOnly((prev) => !prev)}
                    >
                        {hasLocationOnly ? 'Only With Location' : 'All Locations'}
                    </Button>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                    <Input
                        type="number"
                        step="any"
                        placeholder="Near latitude"
                        value={nearLat}
                        onChange={(e) => setNearLat(e.target.value)}
                    />
                    <Input
                        type="number"
                        step="any"
                        placeholder="Near longitude"
                        value={nearLng}
                        onChange={(e) => setNearLng(e.target.value)}
                    />
                    <Input
                        type="number"
                        min="1"
                        placeholder="Radius km"
                        value={radiusKm}
                        onChange={(e) => setRadiusKm(e.target.value)}
                    />
                    <Button variant="outline" onClick={handleUseLocation}>
                        <Locate className="mr-2 h-4 w-4" />
                        Use My Location
                    </Button>
                </div>
            </div>

            {/* Reports Grid */}
            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
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
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
                        <p className="text-muted-foreground">
                            {search || status !== 'all' || categoryId !== 'all'
                                ? 'Try adjusting your filters or search terms.'
                                : 'Be the first to submit a report!'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {reports.map((report) => (
                            <ReportCard key={report.id} report={report} />
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

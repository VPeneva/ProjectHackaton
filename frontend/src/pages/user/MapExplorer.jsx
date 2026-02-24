import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useMapReports } from '@/hooks/useReports'
import { useI18n } from '@/context/I18nContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, List } from 'lucide-react'

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const statusConfig = {
    Pending: { key: 'statuses.pending', variant: 'pending', stamp: 'PENDING' },
    Sent: { key: 'statuses.sent', variant: 'sent', stamp: 'IN PROGRESS' },
    Finished: { key: 'statuses.finished', variant: 'finished', stamp: 'RESOLVED' },
}

function ReportListItem({ report }) {
    const { t } = useI18n()
    const status = statusConfig[report.status] || statusConfig.Pending

    return (
        <Link to={`/reports/${report.id}`} className="block">
            <div className="p-4 hover:bg-foreground hover:text-background transition-none border-b-3 border-foreground last:border-b-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display text-lg uppercase line-clamp-1">{report.title}</h3>
                    <Badge variant={status.variant} className="shrink-0">
                        {status.stamp}
                    </Badge>
                </div>
                {report.address && (
                    <div className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{report.address}</span>
                    </div>
                )}
            </div>
        </Link>
    )
}

// Default center (Bulgaria)
const DEFAULT_CENTER = [42.7339, 25.4858]
const DEFAULT_ZOOM = 7

export default function MapExplorer() {
    const { data: reports, isLoading, isError, error } = useMapReports()
    const { t } = useI18n()
    const [showList, setShowList] = useState(false)
    const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to load map data.'

    // Filter reports that have coordinates
    const mapReports = useMemo(
        () => reports?.filter((r) => r.lat && r.lng) || [],
        [reports]
    )
    const allReports = reports || []

    // Calculate map center based on reports
    const mapCenter = useMemo(() => {
        if (mapReports.length > 0) {
            const avgLat = mapReports.reduce((sum, r) => sum + r.lat, 0) / mapReports.length
            const avgLng = mapReports.reduce((sum, r) => sum + r.lng, 0) / mapReports.length
            return [avgLat, avgLng]
        }
        return DEFAULT_CENTER
    }, [mapReports])

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="container mx-auto px-4 py-4 flex items-center justify-between border-b-3 border-foreground">
                <div>
                    <h1 className="font-display text-3xl uppercase">{t('reports.mapView')}</h1>
                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        {t('reports.subtitle')}
                    </p>
                </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowList(!showList)}
                        className="md:hidden"
                    >
                        <List className="h-4 w-4 mr-2" />
                        {showList ? 'SHOW MAP' : 'SHOW LIST'}
                    </Button>
                </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Map Area */}
                <div className={`flex-1 relative ${showList ? 'hidden md:block' : ''}`}>
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <div className="text-center">
                                <Skeleton className="w-16 h-16 mx-auto mb-4" />
                                <Skeleton className="w-32 h-4 mx-auto" />
                            </div>
                        </div>
                    ) : isError ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <div className="text-center">
                                <p className="text-muted-foreground">{errorMessage}</p>
                            </div>
                        </div>
                    ) : (
                        <MapContainer
                            center={mapCenter}
                            zoom={mapReports.length > 0 ? 10 : DEFAULT_ZOOM}
                            className="absolute inset-0 z-0"
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {mapReports.map((report) => (
                                <Marker
                                    key={report.id}
                                    position={[report.lat, report.lng]}
                                >
                                    <Popup>
                                        <div className="min-w-[200px]">
                                            <h3 className="font-display text-lg uppercase mb-1">{report.title}</h3>
                                            <Badge
                                                variant={statusConfig[report.status]?.variant || 'pending'}
                                                className="mb-2"
                                            >
                                                {statusConfig[report.status]?.stamp || report.status}
                                            </Badge>
                                            {report.address && (
                                                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                                                    {report.address}
                                                </p>
                                            )}
                                            <Link
                                                to={`/reports/${report.id}`}
                                                className="font-mono text-xs uppercase tracking-wider text-primary hover:underline"
                                            >
                                                VIEW DETAILS &rarr;
                                            </Link>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                </div>

                {/* Sidebar List */}
                <div
                    className={`w-full md:w-80 border-l-3 border-foreground bg-card overflow-hidden flex flex-col ${showList ? '' : 'hidden md:flex'
                        }`}
                >
                    <div className="p-4 border-b-3 border-foreground">
                        <h2 className="font-display text-xl uppercase">ACTIVE REPORTS</h2>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            {allReports.length} total reports
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i}>
                                        <Skeleton className="h-4 w-3/4 mb-2" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : allReports.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">No active reports</p>
                            </div>
                        ) : (
                            allReports.map((report) => (
                                <ReportListItem key={report.id} report={report} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

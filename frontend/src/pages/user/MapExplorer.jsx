import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useMapReports } from '@/hooks/useReports'
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
    Pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    Sent: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    Finished: { label: 'Resolved', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
}

function ReportListItem({ report }) {
    const status = statusConfig[report.status] || statusConfig.PENDING

    return (
        <Link to={`/reports/${report.id}`} className="block">
            <div className="p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium line-clamp-1">{report.title}</h3>
                    <Badge variant="outline" className={`shrink-0 text-xs ${status.color}`}>
                        {status.label}
                    </Badge>
                </div>
                {report.address && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
    const { data: reports, isLoading, isError } = useMapReports()
    const [showList, setShowList] = useState(false)

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
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Map Explorer</h1>
                    <p className="text-sm text-muted-foreground">
                        View all active reports on the map
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowList(!showList)}
                    className="md:hidden"
                >
                    <List className="h-4 w-4 mr-2" />
                    {showList ? 'Show Map' : 'Show List'}
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Map Area */}
                <div className={`flex-1 relative ${showList ? 'hidden md:block' : ''}`}>
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <div className="text-center">
                                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                                <Skeleton className="w-32 h-4 mx-auto" />
                            </div>
                        </div>
                    ) : isError ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <div className="text-center">
                                <p className="text-muted-foreground">Failed to load map data</p>
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
                                            <h3 className="font-semibold mb-1">{report.title}</h3>
                                            <Badge
                                                variant="outline"
                                                className={`mb-2 text-xs ${statusConfig[report.status]?.color || ''}`}
                                            >
                                                {statusConfig[report.status]?.label || report.status}
                                            </Badge>
                                            {report.address && (
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    {report.address}
                                                </p>
                                            )}
                                            <Link
                                                to={`/reports/${report.id}`}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                View Details →
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
                    className={`w-full md:w-80 border-l bg-card overflow-hidden flex flex-col ${showList ? '' : 'hidden md:flex'
                        }`}
                >
                    <div className="p-4 border-b">
                        <h2 className="font-semibold">Active Reports</h2>
                        <p className="text-xs text-muted-foreground">
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
                                <p className="text-muted-foreground text-sm">No active reports</p>
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

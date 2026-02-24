import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAdminAnalytics } from '@/hooks/useAdmin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, TrendingUp, Activity } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { MapContainer, TileLayer, CircleMarker, Tooltip as MapTooltip } from 'react-leaflet'

const statusColors = {
  Pending: '#ff0000',
  Sent: '#ffdd00',
  Finished: '#000000',
}

export default function Analytics() {
  const [days, setDays] = useState('30')
  const { data, isLoading, isError, error } = useAdminAnalytics(days)

  const trendData = data?.trends || []
  const resolution = data?.resolution || { averageDays: 0, medianDays: 0, sampleSize: 0 }
  const statusTotals = data?.statusTotals || {}
  const heatmap = useMemo(() =>
    (data?.heatmap || []).filter(p => p.lat != null && p.lng != null && !Number.isNaN(p.lat) && !Number.isNaN(p.lng)),
    [data?.heatmap]
  )

  const mapCenter = useMemo(() => {
    if (!heatmap.length) return [42.7339, 25.4858]
    const avgLat = heatmap.reduce((sum, r) => sum + r.lat, 0) / heatmap.length
    const avgLng = heatmap.reduce((sum, r) => sum + r.lng, 0) / heatmap.length
    if (Number.isNaN(avgLat) || Number.isNaN(avgLng)) return [42.7339, 25.4858]
    return [avgLat, avgLng]
  }, [heatmap])

  const errorMessage =
    error?.response?.data?.error || error?.message || 'Failed to load analytics.'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8 border-b-3 border-foreground pb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-5xl uppercase">REPORT ANALYTICS</h1>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-2">
            Trends, resolution time, and geographic distribution.
          </p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 DAYS</SelectItem>
            <SelectItem value="30">30 DAYS</SelectItem>
            <SelectItem value="90">90 DAYS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{errorMessage}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="border-b-3 border-foreground">
                <CardTitle className="flex items-center gap-2 font-display text-lg uppercase">
                  <TrendingUp className="h-4 w-4" />
                  AVERAGE RESOLUTION
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="font-display text-4xl">{resolution.averageDays.toFixed(1)} DAYS</p>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-1">
                  Median: {resolution.medianDays.toFixed(1)} days / {resolution.sampleSize} resolved reports
                </p>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader className="border-b-3 border-foreground">
                <CardTitle className="flex items-center gap-2 font-display text-lg uppercase">
                  <Activity className="h-4 w-4" />
                  REPORTS OVER TIME
                </CardTitle>
              </CardHeader>
              <CardContent className="h-60 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#000000" strokeWidth={2} />
                    <Line type="monotone" dataKey="pending" stroke={statusColors.Pending} strokeWidth={2} />
                    <Line type="monotone" dataKey="sent" stroke={statusColors.Sent} strokeWidth={2} />
                    <Line type="monotone" dataKey="finished" stroke={statusColors.Finished} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="border-b-3 border-foreground">
                <CardTitle className="font-display text-lg uppercase">STATUS BREAKDOWN</CardTitle>
              </CardHeader>
              <CardContent className="h-64 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Pending', value: statusTotals.Pending || 0 },
                    { name: 'In Progress', value: statusTotals.Sent || 0 },
                    { name: 'Resolved', value: statusTotals.Finished || 0 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ff0000" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b-3 border-foreground">
                <CardTitle className="font-display text-lg uppercase">REPORT HEATMAP</CardTitle>
              </CardHeader>
              <CardContent className="h-64 pt-4">
                <div className="border-3 border-foreground h-full w-full">
                  <MapContainer center={mapCenter} zoom={7} className="h-full w-full">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {heatmap.map((point, index) => (
                      <CircleMarker
                        key={`${point.lat}-${point.lng}-${index}`}
                        center={[point.lat, point.lng]}
                        radius={6}
                        pathOptions={{
                          color: statusColors[point.status] || '#64748b',
                          fillColor: statusColors[point.status] || '#64748b',
                          fillOpacity: 0.6,
                        }}
                      >
                        <MapTooltip>{point.status}</MapTooltip>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

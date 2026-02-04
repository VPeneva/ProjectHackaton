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
  Pending: '#f59e0b',
  Sent: '#3b82f6',
  Finished: '#22c55e',
}

export default function Analytics() {
  const [days, setDays] = useState('30')
  const { data, isLoading, isError, error } = useAdminAnalytics(days)

  const trendData = data?.trends || []
  const resolution = data?.resolution || { averageDays: 0, medianDays: 0, sampleSize: 0 }
  const statusTotals = data?.statusTotals || {}
  const heatmap = data?.heatmap || []

  const mapCenter = useMemo(() => {
    if (!heatmap.length) return [42.7339, 25.4858]
    const avgLat = heatmap.reduce((sum, r) => sum + r.lat, 0) / heatmap.length
    const avgLng = heatmap.reduce((sum, r) => sum + r.lng, 0) / heatmap.length
    return [avgLat, avgLng]
  }, [heatmap])

  const errorMessage =
    error?.response?.data?.error || error?.message || 'Failed to load analytics.'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1">Report Analytics</h1>
          <p className="text-muted-foreground">
            Trends, resolution time, and geographic distribution.
          </p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
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
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{errorMessage}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Average Resolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{resolution.averageDays.toFixed(1)} days</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Median: {resolution.medianDays.toFixed(1)} days · {resolution.sampleSize} resolved reports
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4" />
                  Reports Over Time
                </CardTitle>
              </CardHeader>
              <CardContent className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} />
                    <Line type="monotone" dataKey="pending" stroke={statusColors.Pending} strokeWidth={2} />
                    <Line type="monotone" dataKey="sent" stroke={statusColors.Sent} strokeWidth={2} />
                    <Line type="monotone" dataKey="finished" stroke={statusColors.Finished} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
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
                    <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Report Heatmap</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
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
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

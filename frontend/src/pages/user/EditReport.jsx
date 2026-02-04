import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useReport, useUpdateReport } from '@/hooks/useReports'
import { useCategories } from '@/hooks/useCategories'
import { useInstitutions } from '@/hooks/useInstitutions'
import { useAuth } from '@/context/AuthContext'
import { uploadService } from '@/services/upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  MapPin,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const DEFAULT_CENTER = [42.7339, 25.4858]
const DEFAULT_ZOOM = 7
const MAX_IMAGES = 5

function LocationMarker({ position, onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng)
    },
  })

  if (!position) return null
  return <Marker position={position} />
}

export default function EditReport() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const { data: report, isLoading, isError, error: reportError } = useReport(id)
  const updateReport = useUpdateReport()

  const { data: institutions } = useInstitutions()
  const [selectedInstitution, setSelectedInstitution] = useState('')
  const { data: categories } = useCategories(selectedInstitution || undefined)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    address: '',
    latitude: '',
    longitude: '',
  })
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!report) return

    setFormData({
      title: report.title || '',
      description: report.description || '',
      categoryId: report.categoryId ? report.categoryId.toString() : '',
      address: report.address || '',
      latitude: report.lat !== null && report.lat !== undefined ? report.lat.toString() : '',
      longitude: report.lng !== null && report.lng !== undefined ? report.lng.toString() : '',
    })
    setSelectedInstitution(report.institutionId ? report.institutionId.toString() : '')
    const initialImages =
      report.images?.length ? report.images.map((image) => image.url) : report.imageUrl ? [report.imageUrl] : []
    setExistingImages(initialImages)
    setNewImages([])
  }, [report])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setNewImages((prev) => {
      const next = [...prev]
      for (const file of files) {
        if (existingImages.length + next.length >= MAX_IMAGES) {
          setError(`You can upload up to ${MAX_IMAGES} images`)
          break
        }
        if (!file.type.startsWith('image/')) {
          setError('Please select image files only')
          continue
        }
        if (file.size > 5 * 1024 * 1024) {
          setError('Each image must be less than 5MB')
          continue
        }
        next.push({ file, preview: URL.createObjectURL(file) })
      }
      return next
    })

    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveExisting = (index) => {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleRemoveNew = (index) => {
    setNewImages((prev) => {
      const next = [...prev]
      const removed = next.splice(index, 1)[0]
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview)
      }
      return next
    })
  }

  const handleInstitutionChange = (value) => {
    setSelectedInstitution(value)
    setFormData((prev) => ({ ...prev, categoryId: '' }))
  }

  const handleMapSelect = (latlng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: latlng.lat.toFixed(6),
      longitude: latlng.lng.toFixed(6),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Please enter a title')
      return
    }
    if (!formData.description.trim()) {
      setError('Please enter a description')
      return
    }
    if (!selectedInstitution) {
      setError('Please select an institution')
      return
    }
    if (!formData.categoryId) {
      setError('Please select a category')
      return
    }
    if ((formData.latitude && !formData.longitude) || (!formData.latitude && formData.longitude)) {
      setError('Please provide both latitude and longitude')
      return
    }

    try {
      let uploadedUrls = []

      if (newImages.length) {
        setUploading(true)
        const uploads = await Promise.all(
          newImages.map((image) => uploadService.uploadImage(image.file))
        )
        uploadedUrls = uploads.map((upload) => upload.url).filter(Boolean)
        setUploading(false)
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: parseInt(formData.categoryId, 10),
        institutionId: parseInt(selectedInstitution, 10),
        address: formData.address || null,
      }

      if (formData.latitude && formData.longitude) {
        payload.lat = parseFloat(formData.latitude)
        payload.lng = parseFloat(formData.longitude)
      }

      const finalImageUrls = [...existingImages, ...uploadedUrls]
      payload.imageUrls = finalImageUrls

      await updateReport.mutateAsync({ id, data: payload })
      navigate('/my-reports')
    } catch (err) {
      setUploading(false)
      const message = err.response?.data?.error || 'Failed to update report. Please try again.'
      setError(message)
    }
  }

  const isSubmitting = updateReport.isPending || uploading
  const latValue = formData.latitude ? parseFloat(formData.latitude) : null
  const lngValue = formData.longitude ? parseFloat(formData.longitude) : null
  const hasCoords = !Number.isNaN(latValue) && !Number.isNaN(lngValue)
  const mapPosition = hasCoords ? [latValue, lngValue] : null

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || !report) {
    const errorMessage =
      reportError?.response?.data?.error ||
      reportError?.message ||
      'Failed to load report details.'
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">{errorMessage}</p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/my-reports">Back to My Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (report.status !== 'Pending') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-12 text-center space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Only pending reports can be edited. This report is currently {report.status}.
              </AlertDescription>
            </Alert>
            <Button asChild variant="outline">
              <Link to="/my-reports">Back to My Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user?.id && report.userId && user.id !== report.userId && user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-12 text-center space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>You do not have permission to edit this report.</AlertDescription>
            </Alert>
            <Button asChild variant="outline">
              <Link to="/my-reports">Back to My Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link to="/my-reports">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-1">Edit Report</h1>
          <p className="text-muted-foreground">Update the details of your pending report.</p>
        </div>
      </div>

      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Report Details
          </CardTitle>
          <CardDescription>
            Adjust any fields below and save to update your report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={handleChange}
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide more details about the issue..."
                rows={4}
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Institution *</Label>
                <Select
                  value={selectedInstitution}
                  onValueChange={handleInstitutionChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions?.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id.toString()}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, categoryId: value }))
                  }
                  disabled={isSubmitting || !selectedInstitution}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="address"
                name="address"
                placeholder="Address or description of location"
                value={formData.address}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude (optional)</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 42.6977"
                  value={formData.latitude}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude (optional)</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 23.3219"
                  value={formData.longitude}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Pick location on map
              </Label>
              <div className="h-64 rounded-lg overflow-hidden border border-border">
                <MapContainer
                  center={mapPosition || DEFAULT_CENTER}
                  zoom={mapPosition ? 14 : DEFAULT_ZOOM}
                  className="h-full w-full"
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={mapPosition} onSelect={handleMapSelect} />
                </MapContainer>
              </div>
              <p className="text-xs text-muted-foreground">
                Click the map to set coordinates. You can also type them manually above.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                Photos (optional)
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="grid sm:grid-cols-3 gap-4">
                {existingImages.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="relative rounded-lg overflow-hidden bg-muted aspect-video"
                  >
                    <img
                      src={url}
                      alt={`Existing ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemoveExisting(index)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {newImages.map((image, index) => (
                  <div
                    key={image.preview}
                    className="relative rounded-lg overflow-hidden bg-muted aspect-video"
                  >
                    <img
                      src={image.preview}
                      alt={`New ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemoveNew(index)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {existingImages.length + newImages.length < MAX_IMAGES && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center"
                  >
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Add photo
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {existingImages.length + newImages.length}/{MAX_IMAGES} used
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Max {MAX_IMAGES} images, each up to 5MB.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploading ? 'Uploading image...' : 'Saving changes...'}
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

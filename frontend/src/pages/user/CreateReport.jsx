import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateReport } from '@/hooks/useReports'
import { useCategories } from '@/hooks/useCategories'
import { useInstitutions } from '@/hooks/useInstitutions'
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
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { toast } from 'sonner'

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

export default function CreateReport() {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const createReport = useCreateReport()

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        address: '',
        lat: '',
        lng: '',
    })
    const [images, setImages] = useState([])
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    const { data: institutions } = useInstitutions()
    const [selectedInstitution, setSelectedInstitution] = useState('')
    const { data: categories } = useCategories(selectedInstitution || undefined)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        setImages((prev) => {
            const next = [...prev]
            for (const file of files) {
                if (next.length >= MAX_IMAGES) {
                    toast.error(`You can upload up to ${MAX_IMAGES} images`)
                    break
                }
                if (!file.type.startsWith('image/')) {
                    toast.error('Please select image files only')
                    continue
                }
                if (file.size > 5 * 1024 * 1024) {
                    toast.error('Each image must be less than 5MB')
                    continue
                }
                next.push({ file, preview: URL.createObjectURL(file) })
            }
            return next
        })

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleRemoveImage = (index) => {
        setImages((prev) => {
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
            lat: latlng.lat.toFixed(6),
            lng: latlng.lng.toFixed(6),
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
        if ((formData.lat && !formData.lng) || (!formData.lat && formData.lng)) {
            setError('Please provide both latitude and longitude')
            return
        }

        try {
            let imageUrls = []

            if (images.length) {
                setUploading(true)
                const uploads = await Promise.all(
                    images.map((image) => uploadService.uploadImage(image.file))
                )
                imageUrls = uploads.map((upload) => upload.url).filter(Boolean)
                setUploading(false)
            }

            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                categoryId: parseInt(formData.categoryId, 10),
                institutionId: parseInt(selectedInstitution, 10),
                address: formData.address || null,
            }

            if (imageUrls.length) {
                payload.imageUrls = imageUrls
            }

            if (formData.lat && formData.lng) {
                payload.lat = parseFloat(formData.lat)
                payload.lng = parseFloat(formData.lng)
            }

            await createReport.mutateAsync(payload)

            navigate('/my-reports')
        } catch (err) {
            setUploading(false)
            const message = err.response?.data?.error || 'Failed to create report. Please try again.'
            setError(message)
        }
    }

    const isSubmitting = createReport.isPending || uploading
    const latValue = formData.lat ? parseFloat(formData.lat) : null
    const lngValue = formData.lng ? parseFloat(formData.lng) : null
    const hasCoords = !Number.isNaN(latValue) && !Number.isNaN(lngValue)
    const mapPosition = hasCoords ? [latValue, lngValue] : null

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Create New Report</h1>
                <p className="text-muted-foreground">
                    Report an infrastructure issue in your community.
                </p>
            </div>

            <Card className="border-0 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Report Details
                    </CardTitle>
                    <CardDescription>
                        Provide as much detail as possible to help resolve the issue quickly.
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

                        {/* Title */}
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

                        {/* Description */}
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

                        {/* Institution & Category */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Institution</Label>
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

                        {/* Location */}
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

                        {/* Coordinates */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="lat">Latitude (optional)</Label>
                                <Input
                                    id="lat"
                                    name="lat"
                                    type="number"
                                    step="any"
                                    placeholder="e.g., 42.6977"
                                    value={formData.lat}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lng">Longitude (optional)</Label>
                                <Input
                                    id="lng"
                                    name="lng"
                                    type="number"
                                    step="any"
                                    placeholder="e.g., 23.3219"
                                    value={formData.lng}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Location Picker */}
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

                        {/* Image Upload */}
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
                                {images.map((image, index) => (
                                    <div
                                        key={image.preview}
                                        className="relative rounded-lg overflow-hidden bg-muted aspect-video"
                                    >
                                        <img
                                            src={image.preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={() => handleRemoveImage(index)}
                                            disabled={isSubmitting}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {images.length < MAX_IMAGES && (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center"
                                    >
                                        <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">
                                            Add photo
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {images.length}/{MAX_IMAGES} used
                                        </p>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Max {MAX_IMAGES} images, each up to 5MB.
                            </p>
                        </div>

                        {/* Submit */}
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {uploading ? 'Uploading image...' : 'Creating report...'}
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Submit Report
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

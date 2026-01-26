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
import { toast } from 'sonner'

export default function CreateReport() {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const createReport = useCreateReport()

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        location: '',
        latitude: '',
        longitude: '',
    })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
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
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file')
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be less than 5MB')
                return
            }
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleRemoveImage = () => {
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleInstitutionChange = (value) => {
        setSelectedInstitution(value)
        setFormData((prev) => ({ ...prev, categoryId: '' }))
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
        if (!formData.categoryId) {
            setError('Please select a category')
            return
        }

        try {
            let imageUrl = null

            // Upload image if selected
            if (imageFile) {
                setUploading(true)
                const uploadResponse = await uploadService.uploadImage(imageFile)
                imageUrl = uploadResponse.data.url
                setUploading(false)
            }

            // Create report
            await createReport.mutateAsync({
                title: formData.title,
                description: formData.description,
                categoryId: parseInt(formData.categoryId),
                location: formData.location || null,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                imageUrl,
            })

            navigate('/my-reports')
        } catch (err) {
            setUploading(false)
            const message = err.response?.data?.error || 'Failed to create report. Please try again.'
            setError(message)
        }
    }

    const isSubmitting = createReport.isPending || uploading

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
                            <Label htmlFor="location" className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                Location
                            </Label>
                            <Input
                                id="location"
                                name="location"
                                placeholder="Address or description of location"
                                value={formData.location}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Coordinates */}
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

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                                <ImageIcon className="h-4 w-4" />
                                Photo (optional)
                            </Label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            {imagePreview ? (
                                <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2"
                                        onClick={handleRemoveImage}
                                        disabled={isSubmitting}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                >
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Click to upload an image
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Max file size: 5MB
                                    </p>
                                </div>
                            )}
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

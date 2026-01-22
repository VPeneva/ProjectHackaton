import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StepIndicator } from "@/components/reports/StepIndicator";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";
import {
  Loader2,
  Upload,
  X,
  MapPin,
  Building2,
  FileText,
  Camera,
  ArrowLeft,
  ArrowRight,
  Check,
  Navigation,
} from "lucide-react";

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const STEPS = [
  { id: "location", label: "Location" },
  { id: "details", label: "Details" },
  { id: "photo", label: "Photo" },
];

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
}

export default function CreateReport() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Form data
  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [markerPosition, setMarkerPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [gettingLocation, setGettingLocation] = useState(false);

  const mapRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    api.get("/institutions").then((res) => setInstitutions(res.data));
  }, []);

  useEffect(() => {
    if (institutionId) {
      api
        .get(`/categories?institutionId=${institutionId}`)
        .then((res) => setCategories(res.data));
    } else {
      setCategories([]);
      setCategoryId("");
    }
  }, [institutionId]);

  useEffect(() => {
    if (mapRef.current && markerPosition) {
      mapRef.current.setView(markerPosition, 17, { animate: true });
    }
  }, [markerPosition]);

  const reverseGeocode = async (latVal, lngVal) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latVal}&lon=${lngVal}&addressdetails=1`
      );
      const data = await res.json();
      if (data?.address) {
        setAddress(formatAddress(data.address));
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  };

  const formatAddress = (a) => {
    const parts = [];
    if (a.road) parts.push(a.road);
    if (a.house_number) parts.push(`#${a.house_number}`);
    if (a.city || a.town || a.village) parts.push(a.city || a.town || a.village);
    return parts.join(", ");
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => searchAddressSuggestions(value), 300);
  };

  const searchAddressSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setSuggestions(
        data.map((item) => ({
          lat: item.lat,
          lon: item.lon,
          display: formatAddress(item.address),
        }))
      );
    } catch (err) {
      console.error("Autocomplete error", err);
    }
  };

  const selectSuggestion = (s) => {
    setAddress(s.display);
    setSuggestions([]);
    const latN = Number(s.lat);
    const lngN = Number(s.lon);
    setLat(latN.toFixed(6));
    setLng(lngN.toFixed(6));
    setMarkerPosition([latN, lngN]);
  };

  const handleMapPositionChange = (latVal, lngVal) => {
    setLat(latVal.toFixed(6));
    setLng(lngVal.toFixed(6));
    setMarkerPosition([latVal, lngVal]);
    reverseGeocode(latVal, lngVal);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude.toFixed(6));
        setLng(longitude.toFixed(6));
        setMarkerPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude);
        setGettingLocation(false);
        toast.success("Location detected!");
      },
      (err) => {
        console.log("Geolocation denied:", err);
        toast.error("Could not get your location");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Max size is 5MB.");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));

    try {
      setUploading(true);
      const form = new FormData();
      form.append("image", file);
      const res = await api.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedImageUrl(res.data.url);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!institutionId || !categoryId || !title || !lat || !lng) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/reports", {
        title,
        description: description || null,
        categoryId: Number(categoryId),
        institutionId: Number(institutionId),
        lat: Number(lat),
        lng: Number(lng),
        address: address || null,
        imageUrl: uploadedImageUrl || null,
      });

      toast.success("Report created successfully!");
      navigate("/reports");
    } catch {
      toast.error("Failed to create report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedFromStep = (step) => {
    switch (step) {
      case 0: // Location
        return lat && lng;
      case 1: // Details
        return institutionId && categoryId && title.trim();
      case 2: // Photo (always can proceed, photo is optional)
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1 && canProceedFromStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getInstitutionName = () => {
    const inst = institutions.find((i) => String(i.id) === institutionId);
    return inst?.name || "";
  };

  const getCategoryName = () => {
    const cat = categories.find((c) => String(c.id) === categoryId);
    return cat?.name || "";
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 px-4">
      <div className="container max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Report an Issue
          </h1>
          <p className="text-muted-foreground">
            Help improve your community in just 3 simple steps
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {/* Step 1: Location */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Where is the issue?</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click on the map or search for an address
                  </p>
                </div>

                {/* Address Search */}
                <div className="relative">
                  <Label>Search Address</Label>
                  <div className="flex gap-2 mt-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Start typing an address..."
                        value={address}
                        onChange={handleAddressChange}
                      />
                      {suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-auto">
                          {suggestions.map((s, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                              onClick={() => selectSuggestion(s)}
                            >
                              {s.display}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={useCurrentLocation}
                      disabled={gettingLocation}
                    >
                      {gettingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Navigation className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Map */}
                <div className="rounded-lg overflow-hidden border h-[350px]">
                  <MapContainer
                    center={markerPosition || [42.6977, 23.3219]}
                    zoom={13}
                    ref={mapRef}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {markerPosition && (
                      <Marker
                        draggable
                        icon={markerIcon}
                        position={markerPosition}
                        eventHandlers={{
                          dragend: (e) => {
                            const pos = e.target.getLatLng();
                            handleMapPositionChange(pos.lat, pos.lng);
                          },
                        }}
                      />
                    )}
                    <MapClickHandler onMapClick={handleMapPositionChange} />
                  </MapContainer>
                </div>

                {markerPosition && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500" />
                    Location selected: {lat}, {lng}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">What did you find?</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tell us about the issue
                  </p>
                </div>

                {/* Institution */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Institution *
                  </Label>
                  <Select
                    value={institutionId}
                    onValueChange={(v) => {
                      setInstitutionId(v);
                      setCategoryId("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select responsible institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((i) => (
                        <SelectItem key={i.id} value={String(i.id)}>
                          {i.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                {institutionId && (
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <Label>Brief Description *</Label>
                  <Input
                    placeholder="e.g., Pothole on Main Street"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {title.length}/100 characters
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Additional Details (optional)</Label>
                  <Textarea
                    rows={3}
                    placeholder="Provide more details if needed..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Photo + Review */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Add a Photo</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    A photo helps authorities understand the issue faster
                  </p>
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  {previewUrl ? (
                    <div className="relative rounded-lg overflow-hidden border">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setPreviewUrl(null);
                          setUploadedImageUrl(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">
                        Click to upload a photo
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 5MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>

                {/* Review Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium">Review Your Report</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="text-right max-w-[200px] truncate">
                        {address || `${lat}, ${lng}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Institution:</span>
                      <span>{getInstitutionName()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{getCategoryName()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title:</span>
                      <span className="text-right max-w-[200px] truncate">
                        {title}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Photo:</span>
                      <span>
                        {previewUrl ? (
                          <Badge variant="success">Attached</Badge>
                        ) : (
                          <Badge variant="secondary">None</Badge>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceedFromStep(currentStep)}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting || uploading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

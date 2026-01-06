import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";
import {
  Loader2,
  Upload,
  X,
  MapPin,
  Building2,
  FileText,
  Send,
} from "lucide-react";

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

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
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude.toFixed(6));
        setLng(longitude.toFixed(6));
        setMarkerPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude);
      },
      (err) => console.log("Geolocation denied:", err),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

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
    if (a.neighbourhood) parts.push(a.neighbourhood);
    if (a.suburb) parts.push(a.suburb);
    if (a.city || a.town || a.village) parts.push(a.city || a.town || a.village);
    if (a.postcode) parts.push(a.postcode);
    if (a.country) parts.push(a.country);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setTitle("");
      setDescription("");
      setLat("");
      setLng("");
      setInstitutionId("");
      setCategoryId("");
      setMarkerPosition(null);
      setAddress("");
      setSuggestions([]);
      setPreviewUrl(null);
      setUploadedImageUrl(null);
    } catch (err) {
      toast.error("Failed to create report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Create Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Left Side - Form */}
                <div className="space-y-6">
                  {/* Institution */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Institution *
                    </Label>
                    <Select value={institutionId} onValueChange={(v) => { setInstitutionId(v); setCategoryId(""); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select institution" />
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

                  {/* Address */}
                  <div className="space-y-2 relative">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    <Input
                      placeholder="Start typing address..."
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

                  {/* Title */}
                  <div className="space-y-2">
                    <Label>Report Title *</Label>
                    <Input
                      required
                      placeholder="Brief description of the issue"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={4}
                      placeholder="Provide more details about the issue..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <Label>Photo (optional)</Label>
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
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          Max 5MB
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

                  {/* Coordinates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Latitude</Label>
                      <Input
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        placeholder="42.6977"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Longitude</Label>
                      <Input
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        placeholder="23.3219"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </div>

                {/* Right Side - Map */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Choose location on map
                  </Label>
                  <div className="rounded-lg overflow-hidden border h-[500px]">
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
                  <p className="text-sm text-muted-foreground">
                    Click on the map or drag the marker to set the exact location
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

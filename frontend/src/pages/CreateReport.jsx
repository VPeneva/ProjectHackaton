import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { toast } from "react-hot-toast";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import {
  Box,
  Button,
  Card as MuiCard,
  CssBaseline,
  Divider,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Stack,
  Paper,
} from "@mui/material";

import { styled } from "@mui/material/styles";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

// ---------------------
// Leaflet Marker Icon
// ---------------------
const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ---------------------
// Styled Card
// ---------------------
const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  marginTop: theme.spacing(4),
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("md")]: {
    width: "1100px",
  },
}));

// ---------------------
// Page Background
// ---------------------
const PageContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(3),
  backgroundImage:
    theme.palette.mode === "dark"
      ? "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))"
      : "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), white)",
  backgroundRepeat: "no-repeat",
}));

// ---------------------
// Map click handler
// ---------------------
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
}

// ========================================================================
// MAIN COMPONENT
// ========================================================================
export default function CreateReport() {
  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [markerPosition, setMarkerPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const mapRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ======================================================================
  // LOAD DATA
  // ======================================================================
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

  // ======================================================================
  // GEOLOCATION
  // ======================================================================
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const latStr = latitude.toFixed(6);
        const lngStr = longitude.toFixed(6);

        setLat(latStr);
        setLng(lngStr);
        setMarkerPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude); // адрес от координати
      },
      (err) => {
        console.log("Geolocation denied or failed:", err);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  // ======================================================================
  // MOVE MAP WHEN MARKER CHANGES
  // ======================================================================
  useEffect(() => {
    if (mapRef.current && markerPosition) {
      mapRef.current.setView(markerPosition, 17, { animate: true });
    }
  }, [markerPosition]);

  // ======================================================================
  // REVERSE GEOCODING (координати → адрес)
  // ======================================================================
  const reverseGeocode = async (latVal, lngVal) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latVal}&lon=${lngVal}&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.address) {
        const formatted = formatAddress(data.address);
        setAddress(formatted);
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  };

  // ======================================================================
  // SUBMIT
  // ======================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!institutionId || !categoryId || !title || !lat || !lng) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      title,
      description: description || null,
      categoryId: Number(categoryId),
      institutionId: Number(institutionId),
      lat: Number(lat),
      lng: Number(lng),
      address: address || null,
      imageUrl: uploadedImageUrl || null,
    };

    await api.post("/reports", payload);

    toast.success("Report created successfully!");

    // reset
    setTitle("");
    setDescription("");
    setLat("");
    setLng("");
    setInstitutionId("");
    setCategoryId("");
    setMarkerPosition(null);
    setAddress("");
    setSuggestions([]);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedImageUrl(null);
  };

  // ======================================================================
  // ADDRESS AUTOCOMPLETE
  // ======================================================================
  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      searchAddressSuggestions(value);
    }, 300);
  };

  const searchAddressSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();

      const formatted = data.map((item) => ({
        lat: item.lat,
        lon: item.lon,
        display: formatAddress(item.address),
      }));

      setSuggestions(formatted);
    } catch (err) {
      console.error("Autocomplete error", err);
    }
  };

  const formatAddress = (a) => {
    const parts = [];
    if (a.road) parts.push(a.road);
    if (a.house_number) parts.push(`№ ${a.house_number}`);
    if (a.neighbourhood) parts.push(a.neighbourhood);
    if (a.suburb) parts.push(a.suburb);
    if (a.city) parts.push(a.city);
    if (a.town) parts.push(a.town);
    if (a.village) parts.push(a.village);
    if (a.postcode) parts.push(a.postcode);
    if (a.country) parts.push(a.country);
    return parts.join(", ");
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

  // ======================================================================
  // MAP CLICK / DRAG
  // ======================================================================
  const handleMapPositionChange = (latVal, lngVal) => {
    setLat(latVal.toFixed(6));
    setLng(lngVal.toFixed(6));
    setMarkerPosition([latVal, lngVal]);
    reverseGeocode(latVal, lngVal);
  };

  // ======================================================================
  // UI
  // ======================================================================
  return (
    <>
      <CssBaseline enableColorScheme />
      <PageContainer direction="column">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontSize: "clamp(2rem, 10vw, 2.4rem)" }}
          >
            Create Report
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}
          >
            {/* LEFT SIDE */}
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Select Institution</FormLabel>
                <Select
                  value={institutionId}
                  onChange={(e) => {
                    setInstitutionId(e.target.value);
                    setCategoryId("");
                  }}
                >
                  <MenuItem value="">
                    <em>Choose institution</em>
                  </MenuItem>
                  {institutions.map((i) => (
                    <MenuItem key={i.id} value={i.id}>
                      {i.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {institutionId && (
                <FormControl>
                  <FormLabel>Select Category</FormLabel>
                  <Select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Choose category</em>
                    </MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Address (optional)</FormLabel>
                <TextField
                  placeholder="Start typing address..."
                  value={address}
                  onChange={handleAddressChange}
                />
              </FormControl>

              {suggestions.length > 0 && (
                <Paper
                  elevation={4}
                  sx={{
                    maxHeight: 200,
                    overflowY: "auto",
                    mt: -1,
                  }}
                >
                  {suggestions.map((s, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.5,
                        borderBottom: "1px solid #ddd",
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                      onClick={() => selectSuggestion(s)}
                    >
                      {s.display}
                    </Box>
                  ))}
                </Paper>
              )}

              <FormControl>
                <FormLabel>Report Title</FormLabel>
                <TextField
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <TextField
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Photo (optional, images only, max 5MB)</FormLabel>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // validate type
                    if (!file.type.startsWith("image/")) {
                      toast.error("Only image files are allowed.");
                      return;
                    }

                    // validate size (<5MB)
                    const max = 5 * 1024 * 1024;
                    if (file.size > max) {
                      toast.error("Image too large. Max size is 5MB.");
                      return;
                    }

                    setSelectedFile(file);
                    setPreviewUrl(URL.createObjectURL(file));

                    // auto-upload
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
                      console.error(err);
                      toast.error(
                        err?.response?.data?.error || "Upload failed"
                      );
                    } finally {
                      setUploading(false);
                    }
                  }}
                  onClick={(e) => {
                    e.currentTarget.value = "";
                  }}
                  style={{ display: "none" }}
                  id="photo-input"
                />

                {previewUrl ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: 300,
                      border: "2px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      backgroundColor: "action.hover",
                      position: "relative",
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {uploading && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography sx={{ color: "white" }}>
                          Uploading...
                        </Typography>
                      </Box>
                    )}
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setUploadedImageUrl(null);
                      }}
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                      }}
                    >
                      Remove Photo
                    </Button>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      border: "2px dashed",
                      borderColor: "divider",
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 3,
                      backgroundColor: "action.hover",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                        backgroundColor: "action.selected",
                      },
                    }}
                    component="label"
                    htmlFor="photo-input"
                  >
                    <CloudUploadIcon
                      sx={{
                        fontSize: 48,
                        color: "text.secondary",
                        mb: 1,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", mt: 1 }}
                    >
                      or drag and drop
                    </Typography>
                  </Box>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Latitude</FormLabel>
                <TextField
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Longitude</FormLabel>
                <TextField
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                />
              </FormControl>

              <Button type="submit" variant="contained" size="large">
                Submit Report
              </Button>
            </Stack>

            {/* MAP */}
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Choose location on the map
              </Typography>

              <Box
                sx={{
                  height: 380,
                  width: "100%",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <MapContainer
                  center={markerPosition || [42.6977, 23.3219]}
                  zoom={13}
                  ref={mapRef}
                  whenCreated={(map) => (mapRef.current = map)}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
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

                  <MapClickHandler
                    onMapClick={(lat, lng) => handleMapPositionChange(lat, lng)}
                  />
                </MapContainer>
              </Box>
            </Box>
          </Box>
        </Card>
      </PageContainer>
    </>
  );
}

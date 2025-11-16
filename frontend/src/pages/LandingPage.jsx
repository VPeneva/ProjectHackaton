import { useEffect, useState, useRef } from "react";
import api from "../services/api";

import {
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  Typography,
  Stack,
  Divider,
} from "@mui/material";

import { styled } from "@mui/material/styles";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";

// Custom marker icon
const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Page background
const PageContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(4),
  backgroundImage:
    theme.palette.mode === "dark"
      ? "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.4), hsl(220, 30%, 5%))"
      : "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), white)",
  backgroundRepeat: "no-repeat",
}));

// Info card
const InfoCard = styled(Card)(({ theme }) => ({
  maxWidth: "900px",
  margin: "0 auto",
  padding: theme.spacing(4),
  borderRadius: "14px",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles?.("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.4) 0px 5px 15px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

export default function LandingPage() {
  const [activeReports, setActiveReports] = useState([]);

  useEffect(() => {
    api.get("/reports/active").then((res) => setActiveReports(res.data));
  }, []);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get("/reports/map").then((res) => setReports(res.data));
  }, []);

  const mapCenter = [42.6977, 23.3219]; // София по default

  return (
    <>
      <CssBaseline enableColorScheme />
      <PageContainer spacing={4}>
        {/* ---------- INFO SECTION ---------- */}
        <InfoCard>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
            Welcome to SmartCity
          </Typography>

          <Typography sx={{ opacity: 0.8 }}>
            A platform where citizens can report issues in the city — street
            problems, lights, infrastructure, and more. Our system routes each
            report to the correct institution for fast and efficient resolution.
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Active issues in the city:
          </Typography>

          <Typography sx={{ opacity: 0.7, mb: 2 }}>
            The map below displays all problems that are currently being
            processed or already sent to institutions.
          </Typography>
        </InfoCard>

        {/* ---------- MAP SECTION ---------- */}
        <Card
          sx={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: 2,
            borderRadius: "14px",
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Live Map: City Issues
          </Typography>

          <Box
            sx={{
              height: 500,
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <MapContainer
              center={[42.6977, 23.3219]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {reports.map((r) => (
                <Marker key={r.id} icon={markerIcon} position={[r.lat, r.lng]}>
                  <Popup>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {r.title}
                    </Typography>

                    <Typography sx={{ fontSize: "0.85rem", opacity: 0.7 }}>
                      Category: {r.category?.name || "N/A"}
                    </Typography>

                    <Typography sx={{ fontSize: "0.85rem", opacity: 0.7 }}>
                      Institution: {r.institution?.name || "Not assigned"}
                    </Typography>

                    <Typography
                      sx={{ fontSize: "0.8rem", mt: 1, color: "primary.main" }}
                    >
                      Status: {r.status}
                    </Typography>

                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => window.open(`/report/${r.id}`, "_blank")}
                    >
                      View details
                    </Button>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Box>
        </Card>
      </PageContainer>
    </>
  );
}

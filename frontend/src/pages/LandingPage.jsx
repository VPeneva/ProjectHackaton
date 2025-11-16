import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Box,
  Card,
  CssBaseline,
  Typography,
  Stack,
  Divider,
  Grid,
} from "@mui/material";

import { styled } from "@mui/material/styles";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";

// WORKING MARKER ICON (fix for Vite + Leaflet)
const markerIcon = new Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Background layout
const PageContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(4),
}));

const InfoCard = styled(Card)(({ theme }) => ({
  maxWidth: "1100px",
  margin: "0 auto",
  padding: theme.spacing(4),
  borderRadius: "14px",
}));

export default function LandingPage() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    resolved: 0,
  });

  // Load reports (for map)
  useEffect(() => {
    api.get("/reports/map").then((res) => {
      console.log("Map reports:", res.data);
      setReports(res.data);
    });
  }, []);

  // Load stats from backend
  useEffect(() => {
    api.get("/reports/stats").then((res) => {
      console.log("Stats:", res.data);
      setStats(res.data);
    });
  }, []);

  return (
    <>
      <CssBaseline enableColorScheme />
      <PageContainer spacing={4}>
        {/* HEADER */}
        <InfoCard>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
            Welcome to SmartCity
          </Typography>

          <Typography sx={{ opacity: 0.8 }}>
            View the current issues reported by citizens in your city.
            Each problem is assigned to the correct institution automatically.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" sx={{ mb: 2 }}>
            Current System Statistics
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 2, borderLeft: "4px solid #9c27b0" }}>
                <Typography variant="h6">Total Reports</Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ p: 2, borderLeft: "4px solid #f44336" }}>
                <Typography variant="h6">Pending</Typography>
                <Typography variant="h4">{stats.pending}</Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ p: 2, borderLeft: "4px solid #ff9800" }}>
                <Typography variant="h6">Sent</Typography>
                <Typography variant="h4">{stats.sent}</Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ p: 2, borderLeft: "4px solid #4caf50" }}>
                <Typography variant="h6">Resolved</Typography>
                <Typography variant="h4">{stats.resolved}</Typography>
              </Card>
            </Grid>
          </Grid>
        </InfoCard>

        {/* MAP */}
        <Card
          sx={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: 2,
            borderRadius: "14px",
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Live Map: Active Issues
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
                <Marker
                  key={r.id}
                  position={[r.lat, r.lng]}
                  icon={markerIcon} // IMPORTANT FIX
                >
                  <Popup>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {r.title}
                    </Typography>
                    <Typography sx={{ opacity: 0.7, fontSize: "0.85rem" }}>
                      Status: {r.status}
                    </Typography>

                    <a
                      href={`/report/${r.id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#1976d2", fontWeight: 600 }}
                    >
                      View details →
                    </a>
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

import { useEffect, useState, useRef } from "react";
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

// ---- PAGE STYLES ----
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

  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const markersRef = useRef([]);

  // -------------------------
  // Load reports from backend
  // -------------------------
  useEffect(() => {
    api.get("/reports/map").then((res) => {
      console.log("Reports from DB:", res.data);
      setReports(res.data);
    });

    api.get("/reports/stats").then((res) => {
      console.log("Stats:", res.data);
      setStats(res.data);
    });
  }, []);

  // -------------------------
  // Load Google Maps script
  // -------------------------
  useEffect(() => {
    const existing = document.getElementById("google-maps");

    if (!existing) {
      const script = document.createElement("script");
      script.id = "google-maps";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_GOOGLE_MAPS_API
      }`;
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, [reports]);

  // -------------------------
  // Initialize Map + Markers
  // -------------------------
  function initMap() {
    if (!mapRef.current) return;

    googleMap.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 42.6977, lng: 23.3219 }, // Sofia
      zoom: 12,
      mapId: "smartcity-map",
    });

    // Add markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    reports.forEach((report) => {
      const marker = new window.google.maps.Marker({
        position: { lat: report.lat, lng: report.lng },
        map: googleMap.current,
        title: report.title,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family: sans-serif;">
            <strong>${report.title}</strong><br/>
            Status: ${report.status}<br/>
            <a href="/report/${report.id}" target="_blank" style="color:#1976d2">View details</a>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(googleMap.current, marker);
      });

      markersRef.current.push(marker);
    });
  }

  return (
    <>
      <CssBaseline enableColorScheme />

      <PageContainer spacing={4}>
        {/* ------------------- HEADER ------------------- */}
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

        {/* ------------------- MAP ------------------- */}
        <Card
          sx={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: 2,
            borderRadius: "14px",
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Live Google Map: Active Issues
          </Typography>

          <Box
            ref={mapRef}
            sx={{
              height: 500,
              width: "100%",
              borderRadius: 2,
              border: "1px solid #ccc",
            }}
          />
        </Card>
      </PageContainer>
    </>
  );
}

import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Box,
  Card,
  CardContent,
  CssBaseline,
  Typography,
  Stack,
  Divider,
  Grid,
} from "@mui/material";

import { styled } from "@mui/material/styles";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";

// Leaflet marker icon
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
  maxWidth: "1100px",
  margin: "0 auto",
  padding: theme.spacing(4),
  borderRadius: "14px",
}));

export default function LandingPage() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    sent: 0,
    resolved: 0,
  });

  // Load all reports for map
  useEffect(() => {
    api.get("/reports/map").then((res) => {
      setReports(res.data);

      // Generate stats
      const pending = res.data.filter((r) => r.status === "Pending").length;
      const sent = res.data.filter((r) => r.status === "Sent").length;
      const resolved = res.data.filter((r) => r.status === "Resolved").length;

      setStats({ pending, sent, resolved });
    });
  }, []);

  return (
    <>
      <CssBaseline enableColorScheme />
      <PageContainer spacing={4}>
        
        {/* ========== HEADER SECTION ========== */}
        <InfoCard>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
            Welcome to SmartCity
          </Typography>

          <Typography sx={{ opacity: 0.8 }}>
            SmartCity allows citizens to report urban problems such as broken 
            infrastructure, street issues, lighting failures, and more. 
            Each report is automatically assigned to the correct institution.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" sx={{ mb: 2 }}>
            Current Issue Overview
          </Typography>

          {/* ===== STATISTICS ===== */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  p: 2,
                  backgroundColor: "rgba(255, 205, 86, 0.1)",
                  borderLeft: "4px solid #FFCD56",
                }}
              >
                <Typography variant="h6">Pending</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.pending}
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  p: 2,
                  backgroundColor: "rgba(54, 162, 235, 0.1)",
                  borderLeft: "4px solid #36A2EB",
                }}
              >
                <Typography variant="h6">Sent</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.sent}
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  p: 2,
                  backgroundColor: "rgba(75, 192, 192, 0.1)",
                  borderLeft: "4px solid #4BC0C0",
                }}
              >
                <Typography variant="h6">Resolved</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.resolved}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </InfoCard>

        {/* ========== MAP SECTION ========== */}
        <Card
          sx={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: 2,
            borderRadius: "14px",
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Live Map: Active City Issues
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
                  icon={markerIcon}
                  position={[r.lat, r.lng]}
                >
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
                      sx={{
                        fontSize: "0.85rem",
                        mt: 1,
                        fontWeight: 600,
                        color:
                          r.status === "Resolved"
                            ? "green"
                            : r.status === "Sent"
                            ? "orange"
                            : "red",
                      }}
                    >
                      Status: {r.status}
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                      <a
                        href={`/report/${r.id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#1976d2", fontWeight: 600 }}
                      >
                        View details →
                      </a>
                    </Box>
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

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
} from "@mui/material";

import { styled } from "@mui/material/styles";

import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";

// =============================
// STYLES
// =============================
const PageContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(4),
  backgroundImage:
    theme.palette.mode === "dark"
      ? "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.4), hsl(220, 30%, 5%))"
      : "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), white)",
}));

const InfoCard = styled(Card)(({ theme }) => ({
  maxWidth: "900px",
  margin: "0 auto",
  padding: theme.spacing(4),
  borderRadius: "14px",
}));

// =============================
// GOOGLE MAP OPTIONS
// =============================
const mapContainerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "14px",
};

const defaultCenter = { lat: 42.6977, lng: 23.3219 }; // Sofia

export default function LandingPage() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    resolved: 0,
  });

  const [selectedReport, setSelectedReport] = useState(null);

  // Load Google Maps script
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API,
  });

  // Load reports
  useEffect(() => {
    api.get("/reports")
      .then((res) => {
        setReports(res.data);

        const pending = res.data.filter((r) => r.status === "Pending").length;
        const sent = res.data.filter((r) => r.status === "Sent").length;
        const resolved = res.data.filter((r) => r.status === "Resolved").length;

        setStats({
          total: res.data.length,
          pending,
          sent,
          resolved,
        });
      })
      .catch((err) => console.log(err));
  }, []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <>
      <CssBaseline enableColorScheme />
      <PageContainer spacing={4}>
        {/* ============================= INFO CARD ============================= */}
        <InfoCard>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
            Welcome to SmartCity
          </Typography>

          <Typography sx={{ opacity: 0.8 }}>
            View all issues citizens have reported across the city.  
            Explore the live map below.
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 1 }}>
            City Issue Statistics:
          </Typography>

          <Typography sx={{ opacity: 0.8 }}>
            Total reports: <strong>{stats.total}</strong>
            <br />
            Pending: <strong style={{ color: "orange" }}>{stats.pending}</strong>
            <br />
            Sent: <strong style={{ color: "#007bff" }}>{stats.sent}</strong>
            <br />
            Resolved: <strong style={{ color: "green" }}>{stats.resolved}</strong>
          </Typography>
        </InfoCard>

        {/* ============================= MAP ============================= */}
        <Card sx={{ maxWidth: "1100px", margin: "0 auto", padding: 2 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Live Map: City Issues
          </Typography>

          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={defaultCenter}
          >
            {reports.map((r) => (
              <Marker
                key={r.id}
                position={{ lat: r.lat, lng: r.lng }}
                onClick={() => setSelectedReport(r)}
              />
            ))}

            {selectedReport && (
              <InfoWindow
                position={{ lat: selectedReport.lat, lng: selectedReport.lng }}
                onCloseClick={() => setSelectedReport(null)}
              >
                <Box sx={{ maxWidth: 200 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {selectedReport.title}
                  </Typography>

                  <Typography sx={{ fontSize: "0.8rem", opacity: 0.7 }}>
                    Status: {selectedReport.status}
                  </Typography>

                  <Typography sx={{ fontSize: "0.8rem", opacity: 0.7 }}>
                    Category: {selectedReport.category?.name || "N/A"}
                  </Typography>

                  <Typography sx={{ fontSize: "0.8rem", opacity: 0.7 }}>
                    Institution: {selectedReport.institution?.name || "N/A"}
                  </Typography>

                  <button
                    style={{ marginTop: "8px" }}
                    onClick={() =>
                      window.open(`/report/${selectedReport.id}`, "_blank")
                    }
                  >
                    View details
                  </button>
                </Box>
              </InfoWindow>
            )}
          </GoogleMap>
        </Card>
      </PageContainer>
    </>
  );
}

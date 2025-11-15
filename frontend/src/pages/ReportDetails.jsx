import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CssBaseline,
  Divider,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Layout container
const PageLayout = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  padding: theme.spacing(4),
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,

  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "1fr",
  },
}));

export default function ReportDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.get(`/reports/${id}`).then((res) => setReport(res.data));
  }, [id]);

  if (!report) {
    return (
      <Typography sx={{ p: 4 }} variant="h5">
        Loading...
      </Typography>
    );
  }

  return (
    <>
      <CssBaseline />

      <PageLayout>
        {/* LEFT SIDE — REPORT INFO */}
        <Card variant="outlined">
          <CardContent>
            <Button
              component={Link}
              to="/"
              variant="outlined"
              sx={{ mb: 2 }}
            >
              ← Back to Reports
            </Button>

            <Typography variant="h4">{report.title}</Typography>

            {report.description && (
              <Typography sx={{ mt: 2 }}>{report.description}</Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography sx={{ mt: 1 }}>
              <strong>Category:</strong>{" "}
              {report.category ? report.category.name : "N/A"}
            </Typography>

            <Typography sx={{ mt: 1 }}>
              <strong>Institution:</strong>{" "}
              {report.institution ? report.institution.name : "N/A"}
            </Typography>

            <Typography sx={{ mt: 1 }}>
              <strong>Coordinates:</strong> {report.lat}, {report.lng}
            </Typography>

            <Typography sx={{ mt: 2, opacity: 0.6 }}>
              Created by: {report.user?.name || "Unknown"}
            </Typography>
          </CardContent>
        </Card>

        {/* RIGHT SIDE — MAP */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Location
            </Typography>

            <Box
              sx={{
                width: "100%",
                height: "400px",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${report.lat},${report.lng}&hl=es;z=14&output=embed`}
              ></iframe>
            </Box>
          </CardContent>
        </Card>
      </PageLayout>
    </>
  );
}

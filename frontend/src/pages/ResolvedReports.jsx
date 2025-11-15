import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  CssBaseline,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const PageContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(4),
  alignItems: "center",
  backgroundColor: theme.palette.background.default,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: "900px",
  padding: theme.spacing(3),
  borderRadius: "14px",
}));

const ReportCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: "10px",
}));

export default function ResolvedReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/reports/resolved")
      .then((res) => setReports(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <CssBaseline />

      <PageContainer>
        <StyledCard variant="outlined">
          <Typography
            variant="h4"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Resolved Reports
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Loading */}
          {loading && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Empty */}
          {!loading && reports.length === 0 && (
            <Typography>No resolved reports found.</Typography>
          )}

          {/* Reports */}
          <Stack spacing={2}>
            {reports.map((r) => (
              <ReportCard key={r.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">{r.title}</Typography>

                  {r.description && (
                    <Typography sx={{ mt: 1 }}>{r.description}</Typography>
                  )}

                  <Typography sx={{ mt: 1 }}>
                    <strong>Category:</strong>{" "}
                    {r.category?.name || "Unknown"}
                  </Typography>

                  <Typography>
                    <strong>Institution:</strong>{" "}
                    {r.institution?.name || "Unknown"}
                  </Typography>

                  <Typography sx={{ mt: 1 }}>
                    <strong>User:</strong>{" "}
                    {r.user?.name} ({r.user?.email})
                  </Typography>

                  <Typography
                    sx={{ mt: 1, color: "green", fontWeight: "bold" }}
                  >
                    ✔ Finished
                  </Typography>
                </CardContent>
              </ReportCard>
            ))}
          </Stack>
        </StyledCard>
      </PageContainer>
    </>
  );
}

import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  CssBaseline,
  Divider,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import { styled } from "@mui/material/styles";

const PageContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(4),

  backgroundColor: theme.palette.background.default,
  backgroundImage:
    theme.palette.mode === "dark"
      ? "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.4), hsl(220, 30%, 5%))"
      : "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  backgroundRepeat: "no-repeat",
}));

const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: "900px",
  margin: "0 auto",
  padding: theme.spacing(3),
  borderRadius: "14px",
  ...theme.applyStyles?.("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.4) 0px 5px 15px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const ReportCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: "10px",
}));

export default function Admin() {
  const [reports, setReports] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/institutions").then((res) => setInstitutions(res.data));
  }, []);

  const loadReports = () => {
    setLoading(true);

    const url = selectedInstitution
      ? `/admin/reports?institutionId=${selectedInstitution}`
      : `/admin/reports`;

    api
      .get(url)
      .then((res) => setReports(res.data))
      .catch((err) => console.error("Error loading admin reports:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, [selectedInstitution]);

  const sendToInstitution = async (id) => {
    if (!selectedInstitution) {
      alert("Select an institution first.");
      return;
    }

    await api.patch(`/admin/reports/${id}/send`, {
      institutionId: Number(selectedInstitution),
    });

    loadReports();
  };

  const markResolved = async (id) => {
    await api.patch(`/admin/reports/${id}/resolve`);
    loadReports();
  };

  return (
    <>
      <CssBaseline />

      <PageContainer spacing={3}>
        <StyledCard variant="outlined">
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Admin Panel
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Institution Filter */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel>Select Institution</FormLabel>
            <Select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
            >
              <MenuItem value="">All institutions</MenuItem>
              {institutions.map((inst) => (
                <MenuItem key={inst.id} value={inst.id}>
                  {inst.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Loading state */}
          {loading && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* No reports */}
          {!loading && reports.length === 0 && (
            <Typography>No reports for this institution.</Typography>
          )}

          {/* Report list */}
          <Stack spacing={2}>
            {reports.map((r) => (
              <ReportCard variant="outlined" key={r.id}>
                <CardContent>
                  <Typography variant="h6">{r.title}</Typography>

                  {r.description && (
                    <Typography sx={{ mt: 1 }}>{r.description}</Typography>
                  )}

                  <Typography sx={{ mt: 1 }}>
                    <strong>Category:</strong>{" "}
                    {r.category?.name || "No category"}
                  </Typography>

                  <Typography>
                    <strong>Institution:</strong>{" "}
                    {r.institution?.name || "No institution"}
                  </Typography>

                  <Typography sx={{ mt: 1 }}>
                    <strong>User:</strong> {r.user?.name} ({r.user?.email})
                  </Typography>

                  <Typography sx={{ mt: 1 }}>
                    <strong>Status:</strong> {r.status || "Pending"}
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => sendToInstitution(r.id)}
                    >
                      Send
                    </Button>

                      <Button
                      variant="contained"
                      color="success"
                      onClick={() => markResolved(r.id)}
                    >
                      Resolve
                    </Button>
                  </Stack>
                </CardContent>
              </ReportCard>
            ))}
          </Stack>
        </StyledCard>
      </PageContainer>
    </>
  );
}

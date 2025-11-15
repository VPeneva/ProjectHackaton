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

export default function Admin() {
  const [reports, setReports] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [loading, setLoading] = useState(true);

  // Load institutions
  useEffect(() => {
    api.get("/institutions").then((res) => setInstitutions(res.data));
  }, []);

  // Load reports based on filter
  const loadReports = () => {
    setLoading(true);

    const url = selectedInstitution
      ? `/admin/reports?institutionId=${selectedInstitution}`
      : `/admin/reports`;

    api
      .get(url)
      .then((res) => setReports(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, [selectedInstitution]);

  // Local per-report institution override
  const handleLocalInstitutionChange = (id, value) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, _selectedInstitution: value } : r
      )
    );
  };

  // SEND report
  const sendToInstitution = async (id) => {
    const report = reports.find((r) => r.id === id);
    const instId =
      report._selectedInstitution || report.institution?.id || null;

    if (!instId) {
      alert("Please select an institution first.");
      return;
    }

    await api.patch(`/admin/reports/${id}/send`, {
      institutionId: Number(instId),
    });

    loadReports();
  };

  // RESOLVE report
  const markResolved = async (id) => {
    await api.patch(`/admin/reports/${id}/resolve`);
    loadReports();
  };

  // Dynamic label for main filter
  const selectedInstitutionLabel =
    selectedInstitution
      ? institutions.find((i) => i.id === Number(selectedInstitution))?.name ||
        "All Institutions"
      : "All Institutions";

  return (
    <>
      <CssBaseline />

      <PageContainer spacing={3}>
        <StyledCard variant="outlined">
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Admin Panel
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* FILTER */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel>Select Institution</FormLabel>
            <Select
              value={selectedInstitution}
              displayEmpty
              onChange={(e) => setSelectedInstitution(e.target.value)}
              renderValue={() => selectedInstitutionLabel}
            >
              <MenuItem value="">All Institutions</MenuItem>
              {institutions.map((inst) => (
                <MenuItem key={inst.id} value={inst.id}>
                  {inst.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Loading */}
          {loading && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* No reports */}
          {!loading && reports.length === 0 && (
            <Typography>No reports for this institution.</Typography>
          )}

          {/* Reports */}
          <Stack spacing={2}>
            {reports.map((r) => {
              const localInst = r._selectedInstitution ?? r.institution?.id ?? "";
              const isSent = r.status === "SENT";
              const isFinished = r.status === "FINISHED";

              return (
                <ReportCard variant="outlined" key={r.id}>
                  <CardContent>
                    <Typography variant="h6">{r.title}</Typography>

                    {r.description && (
                      <Typography sx={{ mt: 1 }}>{r.description}</Typography>
                    )}

                    <Typography sx={{ mt: 1 }}>
                      <strong>Category:</strong> {r.category?.name || "No category"}
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      <strong>User:</strong> {r.user?.name} ({r.user?.email})
                    </Typography>

                    {/* STATUS BADGE */}
                    <Typography
                      sx={{
                        mt: 1,
                        fontWeight: "bold",
                        color:
                          r.status === "SENT"
                            ? "orange"
                            : r.status === "FINISHED"
                            ? "green"
                            : "grey",
                      }}
                    >
                      Status: {r.status}
                    </Typography>

                    {/* ⛔ IF SENT → NO SELECT, NO SEND */}
                    {isSent && !isFinished && (
                      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => markResolved(r.id)}
                        >
                          Resolve
                        </Button>
                      </Stack>
                    )}

                    {/* 🟩 IF PENDING → SHOW SELECT + SEND + RESOLVE */}
                    {!isSent && !isFinished && (
                      <>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                          <FormLabel>Send To Institution</FormLabel>
                          <Select
                            value={localInst}
                            onChange={(e) =>
                              handleLocalInstitutionChange(r.id, e.target.value)
                            }
                          >
                            {institutions.map((inst) => (
                              <MenuItem key={inst.id} value={inst.id}>
                                {inst.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

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
                      </>
                    )}
                  </CardContent>
                </ReportCard>
              );
            })}
          </Stack>
        </StyledCard>
      </PageContainer>
    </>
  );
}

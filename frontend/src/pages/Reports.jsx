import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CssBaseline,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const PageContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(3),
  backgroundColor: theme.vars.palette.background.default,
  color: theme.vars.palette.text.primary,
}));

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get("/reports").then((res) => setReports(res.data));
  }, []);

  return (
    <>
      <CssBaseline enableColorScheme />

      <PageContainer>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Reports
        </Typography>

        <Stack spacing={2}>
          {reports.map((r) => (
            <Card key={r.id} variant="outlined">
              <CardContent>
                <Typography variant="h6">{r.title}</Typography>

                {r.description && (
                  <Typography sx={{ mt: 1 }}>{r.description}</Typography>
                )}

                <Typography sx={{ mt: 1 }}>
                  <strong>Category:</strong> {r.category || "N/A"}
                </Typography>

                {r.institution && (
                  <Typography>
                    <strong>Institution:</strong> {r.institution.name}
                  </Typography>
                )}

                <Typography sx={{ mt: 1, fontSize: "0.9rem", opacity: 0.7 }}>
                  Created by: {r.user?.name || "Unknown"}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </PageContainer>
    </>
  );
}

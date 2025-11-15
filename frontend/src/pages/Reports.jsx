import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Card,
  CardContent,
  Typography,
  CssBaseline,
  Stack,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const PageContainer = styled(Stack)(({ theme }) => ({
  minHeight: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  backgroundImage:
    theme.palette.mode === "dark"
      ? "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.4), hsl(220, 30%, 5%))"
      : "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  backgroundRepeat: "no-repeat",
  width: "100%",
  display: "flex",
  alignItems: "center",
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  maxWidth: "850px",
  width: "100%",
  margin: "0 auto",
}));

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get("/reports").then((res) => setReports(res.data));
  }, []);

  return (
    <>
      <CssBaseline />

      <PageContainer>
        <ContentWrapper>
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              fontWeight: 600,
              letterSpacing: "-0.5px",
            }}
          >
            Reports
          </Typography>

          <Stack spacing={3}>
            {reports.map((r) => (
              <Card
                key={r.id}
                variant="outlined"
                sx={{
                  backgroundColor:
                    theme => theme.palette.background.paper,
                  borderRadius: 3,
                  padding: 1,
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {r.title}
                  </Typography>

                  {r.description && (
                    <Typography sx={{ mt: 1 }}>{r.description}</Typography>
                  )}

                  <Typography sx={{ mt: 1 }}>
                    <strong>Category:</strong>{" "}
                    {r.category ? r.category.name : "N/A"}
                  </Typography>

                  {r.institution && (
                    <Typography>
                      <strong>Institution:</strong> {r.institution.name}
                    </Typography>
                  )}

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: "0.85rem",
                      opacity: 0.7,
                    }}
                  >
                    Created by: {r.user?.name || "Unknown"}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </ContentWrapper>
      </PageContainer>
    </>
  );
}

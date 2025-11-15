import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Card,
  CardContent,
  Typography,
  CssBaseline,
  Stack,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";

const PageContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
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
                  <strong>Category:</strong>{" "}
                  {r.category ? r.category.name : "N/A"}
                </Typography>

                {r.institution && (
                  <Typography>
                    <strong>Institution:</strong> {r.institution.name}
                  </Typography>
                )}

                <Typography sx={{ mt: 1, fontSize: "0.9rem", opacity: 0.7 }}>
                  Created by: {r.user?.name || "Unknown"}
                </Typography>

                {/* VIEW MORE BUTTON */}
                <Button
                  variant="contained"
                  size="small"
                  sx={{ mt: 2, float: "right" }}
                  component={Link}
                  to={`/report/${r.id}`}
                >
                  View more
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </PageContainer>
    </>
  );
}

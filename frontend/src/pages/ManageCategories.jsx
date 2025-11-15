import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { styled } from "@mui/material/styles";

// --- Page container ---
const PageContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  backgroundImage:
    theme.palette.mode === "dark"
      ? "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.4), hsl(220, 30%, 5%))"
      : "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  backgroundRepeat: "no-repeat",
}));

// --- Centered card ---
const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: "700px",
  margin: "0 auto",
  padding: theme.spacing(3),
  borderRadius: "14px",
  ...theme.applyStyles?.("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.4) 0px 5px 15px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

export default function ManageCategories() {
  const [institutions, setInstitutions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [institutionId, setInstitutionId] = useState("");
  const [name, setName] = useState("");

  // Load institutions
  useEffect(() => {
    api.get("/institutions").then((res) => setInstitutions(res.data));
  }, []);

  // Load categories when institution changes
  useEffect(() => {
    if (institutionId) {
      api
        .get(`/categories?institutionId=${institutionId}`)
        .then((res) => setCategories(res.data));
    } else {
      setCategories([]);
    }
  }, [institutionId]);

  const addCategory = async () => {
    if (!name.trim() || !institutionId) return;

    await api.post("/categories", {
      name,
      institutionId,
    });

    setName("");

    api
      .get(`/categories?institutionId=${institutionId}`)
      .then((res) => setCategories(res.data));
  };

  return (
    <>
      <CssBaseline />

      <PageContainer>
        <StyledCard variant="outlined">
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Manage Categories
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Institution select */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Institution</InputLabel>
            <Select
              value={institutionId}
              label="Select Institution"
              onChange={(e) => setInstitutionId(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {institutions.map((i) => (
                <MenuItem key={i.id} value={i.id}>
                  {i.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Categories list */}
          {institutionId && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Categories for this institution
              </Typography>

              <List sx={{ mb: 3 }}>
                {categories.length === 0 && (
                  <Typography sx={{ opacity: 0.7 }}>
                    No categories available.
                  </Typography>
                )}

                {categories.map((c) => (
                  <ListItem key={c.id}>
                    <ListItemText primary={c.name} />
                  </ListItem>
                ))}
              </List>

              {/* Add new category */}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="New category name"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <Button variant="contained" onClick={addCategory}>
                  Add
                </Button>
              </Stack>
            </>
          )}
        </StyledCard>
      </PageContainer>
    </>
  );
}

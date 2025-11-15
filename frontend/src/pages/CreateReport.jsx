import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { styled } from "@mui/material/styles";

// Background + alignment identical to SignIn / SignUp
const PageContainer = styled(Stack)(({ theme }) => ({
  minHeight: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  padding: theme.spacing(4),
  display: "flex",
  justifyContent: "center",
  backgroundColor: theme.palette.background.default,
  backgroundImage:
    theme.palette.mode === "dark"
      ? "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.4), hsl(220, 30%, 5%))"
      : "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  backgroundRepeat: "no-repeat",
}));

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: "550px",
  width: "100%",
  margin: "auto",
  padding: theme.spacing(4),
  borderRadius: "16px",
  ...theme.applyStyles?.("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.4) 0px 5px 15px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

export default function CreateReport() {
  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // Load institutions
  useEffect(() => {
    api.get("/institutions").then((res) => setInstitutions(res.data));
  }, []);

  // Load categories based on institution
  useEffect(() => {
    if (institutionId) {
      api
        .get(`/categories?institutionId=${institutionId}`)
        .then((res) => setCategories(res.data));
    } else {
      setCategories([]);
    }
  }, [institutionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!institutionId) return alert("Please select an institution.");
    if (!categoryId) return alert("Please select a category.");
    if (!title || !lat || !lng)
      return alert("Title and coordinates are required.");

    await api.post("/reports", {
      title,
      description: description || null,
      categoryId: Number(categoryId),
      institutionId: Number(institutionId),
      lat: Number(lat),
      lng: Number(lng),
    });

    alert("Report created successfully!");

    setTitle("");
    setDescription("");
    setLat("");
    setLng("");
    setInstitutionId("");
    setCategoryId("");
    setCategories([]);
  };

  return (
    <>
      <CssBaseline />

      <PageContainer>
        <StyledCard variant="outlined">
          <CardContent>
            <Typography
              variant="h4"
              sx={{ mb: 3, fontWeight: 600, letterSpacing: "-0.5px" }}
            >
              Create Report
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              {/* Institution */}
              <FormControl fullWidth>
                <FormLabel>Institution</FormLabel>
                <Select
                  value={institutionId}
                  onChange={(e) => {
                    setInstitutionId(e.target.value);
                    setCategoryId("");
                  }}
                >
                  <MenuItem value="">-- Select Institution --</MenuItem>
                  {institutions.map((i) => (
                    <MenuItem key={i.id} value={i.id}>
                      {i.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Category */}
              {institutionId && (
                <FormControl fullWidth>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <MenuItem value="">-- Select Category --</MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Title */}
              <FormControl fullWidth>
                <FormLabel>Report Title</FormLabel>
                <TextField
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FormControl>

              {/* Description */}
              <FormControl fullWidth>
                <FormLabel>Description (optional)</FormLabel>
                <TextField
                  multiline
                  minRows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FormControl>

              {/* Coordinates */}
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth>
                  <FormLabel>Latitude</FormLabel>
                  <TextField
                    required
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <FormLabel>Longitude</FormLabel>
                  <TextField
                    required
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                  />
                </FormControl>
              </Stack>

              <Button type="submit" variant="contained" fullWidth>
                Submit Report
              </Button>
            </Box>
          </CardContent>
        </StyledCard>
      </PageContainer>
    </>
  );
}

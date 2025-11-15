import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Box,
  Button,
  Card,
  CssBaseline,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  IconButton,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";

// Page container
const PageContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: "700px",
  margin: "0 auto",
  padding: theme.spacing(3),
  borderRadius: "14px",
}));

export default function ManageCategories() {
  const [institutions, setInstitutions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [institutionId, setInstitutionId] = useState("");
  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState(null);

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

  const deleteCategory = async () => {
    await api.delete(`/categories/${deleteId}`);
    setDeleteId(null);

    api
      .get(`/categories?institutionId=${institutionId}`)
      .then((res) => setCategories(res.data));
  };

  return (
    <>
      <CssBaseline />

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
      >
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this category? This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" onClick={deleteCategory}>Delete</Button>
        </DialogActions>
      </Dialog>

      <PageContainer>
        <StyledCard variant="outlined">
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Manage Categories
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* 1️⃣ SELECT INSTITUTION */}
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

          {/* 2️⃣ CATEGORY LIST (DELETE) */}
          {institutionId && (
            <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Existing Categories
              </Typography>

              <List>
                {categories.length === 0 ? (
                  <Typography sx={{ opacity: 0.7 }}>
                    No categories available.
                  </Typography>
                ) : (
                  categories.map((c) => (
                    <ListItem
                      key={c.id}
                      secondaryAction={
                        <IconButton
                          color="error"
                          onClick={() => setDeleteId(c.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={c.name} />
                    </ListItem>
                  ))
                )}
              </List>
            </Card>
          )}

          {/* 3️⃣ ADD CATEGORY */}
          {institutionId && (
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Add New Category
              </Typography>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Category name"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <Button variant="contained" onClick={addCategory}>
                  Add
                </Button>
              </Stack>
            </Card>
          )}
        </StyledCard>
      </PageContainer>
    </>
  );
}

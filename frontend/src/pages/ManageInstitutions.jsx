import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Button,
  Card,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";

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

export default function ManageInstitutions() {
  const [institutions, setInstitutions] = useState([]);
  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    api.get("/institutions").then((res) => setInstitutions(res.data));
  };

  const addInstitution = async () => {
    if (!name.trim()) return;
    await api.post("/institutions", { name });
    setName("");
    load();
  };

  const deleteInstitution = async () => {
    await api.delete(`/institutions/${deleteId}`);
    setDeleteId(null);
    load();
  };

  return (
    <>
      <CssBaseline />

      {/* DELETE CONFIRMATION */}
      <Dialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
      >
        <DialogTitle>Delete Institution</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this institution?  
            This action cannot be undone and may impact existing reports.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" onClick={deleteInstitution}>Delete</Button>
        </DialogActions>
      </Dialog>

      <PageContainer>
        <StyledCard variant="outlined">
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Manage Institutions
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* 1️⃣ ADD SECTION */}
          <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Add New Institution
            </Typography>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Institution name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Button variant="contained" onClick={addInstitution}>
                Add
              </Button>
            </Stack>
          </Card>

          {/* 2️⃣ DELETE / LIST SECTION */}
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Existing Institutions
            </Typography>

            <List>
              {institutions.map((inst) => (
                <ListItem
                  key={inst.id}
                  secondaryAction={
                    <IconButton
                      color="error"
                      onClick={() => setDeleteId(inst.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={inst.name} />
                </ListItem>
              ))}
            </List>
          </Card>
        </StyledCard>
      </PageContainer>
    </>
  );
}

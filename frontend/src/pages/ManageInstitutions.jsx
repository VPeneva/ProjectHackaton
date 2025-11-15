import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
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
  backgroundImage:
    theme.palette.mode === "dark"
      ? "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.4), hsl(220, 30%, 5%))"
      : "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  backgroundRepeat: "no-repeat",
}));

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

export default function ManageInstitutions() {
  const [institutions, setInstitutions] = useState([]);
  const [name, setName] = useState("");

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

  const deleteInstitution = async (id) => {
    await api.delete(`/institutions/${id}`);
    load();
  };

  return (
    <>
      <CssBaseline />

      <PageContainer>
        <StyledCard variant="outlined">
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Manage Institutions
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Add Institution */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
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

          {/* Institution List */}
          <List>
            {institutions.map((inst) => (
              <ListItem
                key={inst.id}
                secondaryAction={
                  <IconButton color="error" onClick={() => deleteInstitution(inst.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={inst.name} />
              </ListItem>
            ))}
          </List>
        </StyledCard>
      </PageContainer>
    </>
  );
}

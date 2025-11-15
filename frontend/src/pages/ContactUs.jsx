import { useState } from "react";
import api from "../services/api";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Stack,
} from "@mui/material";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");

    try {
      await api.post("/contact", form);
      setSuccess("Your message has been sent!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      alert("Something went wrong.");
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4 }}>
      <Card sx={{ maxWidth: 500, width: "100%" }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Contact Us
          </Typography>

          {success && (
            <Typography color="success.main" sx={{ mb: 2 }}>
              {success}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel>Name</FormLabel>
              <TextField
                name="name"
                required
                value={form.name}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel>Email</FormLabel>
              <TextField
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel>Your Message</FormLabel>
              <TextField
                name="message"
                required
                multiline
                rows={4}
                value={form.message}
                onChange={handleChange}
              />
            </FormControl>

            <Button type="submit" variant="contained" fullWidth>
              Send Message
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}

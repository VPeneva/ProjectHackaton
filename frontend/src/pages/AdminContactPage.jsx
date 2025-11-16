import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
} from "@mui/material";

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);

    useEffect(() => {
        api.get("/contact").then((res) => setMessages(res.data));
    }, []);

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Contact Messages
      </Typography>

      <Stack spacing={2}>
        {messages.map((m) => (
          <Card key={m.id} variant="outlined">
            <CardContent>
              <Typography variant="h6">{m.name}</Typography>
              <Typography sx={{ opacity: 0.8 }}>{m.email}</Typography>

              <Divider sx={{ my: 1 }} />

              <Typography>{m.message}</Typography>

              <Typography sx={{ mt: 1, opacity: 0.6 }}>
                Received: {new Date(m.createdAt).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </div>
  );
}

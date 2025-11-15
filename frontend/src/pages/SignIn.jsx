import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: '100vh',
  minHeight: '100%',
  padding: theme.spacing(2),
}));

export default function SignIn() {
  const { login } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login(form.email, form.password);
      navigate("/"); // success
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <SignInContainer justifyContent="center">
        <Card variant="outlined">
          <Typography component="h1" variant="h4">
            Sign in
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {error && (
              <Typography color="error" sx={{ textAlign: "center" }}>
                {error}
              </Typography>
            )}

            <FormControl>
              <FormLabel>Email</FormLabel>
              <TextField
                name="email"
                type="email"
                required
                fullWidth
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Password</FormLabel>
              <TextField
                name="password"
                type="password"
                required
                fullWidth
                onChange={handleChange}
              />
            </FormControl>

            <Button type="submit" fullWidth variant="contained">
              Sign in
            </Button>
          </Box>

          <Divider />

          <Typography sx={{ textAlign: 'center' }}>
            Don’t have an account?{" "}
            <Link href="/signup" variant="body2">
              Sign up
            </Link>
          </Typography>
        </Card>
      </SignInContainer>
    </>
  );
}

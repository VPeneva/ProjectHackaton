import * as React from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import OutlinedInput from "@mui/material/OutlinedInput";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import api from "../services/api";
import toast from "react-hot-toast";

function ForgotPassword({ open, handleClose }) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });

      setSuccess("If the email exists, a reset link has been sent.");
      setEmail("");

      setTimeout(() => {
        handleClose();
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          component: "form",
          onSubmit: async (event) => {
            event.preventDefault();
            const email = event.target.email.value;

            try {
              await api.post("/auth/forgot-password", { email });
              toast.success(
                "If this email exists, a reset link has been sent."
              );
            } catch (err) {
              toast.error("Something went wrong. Please try again.");
            }

            handleClose();
          },
          sx: { backgroundImage: "none" },
        },
      }}
    >
      <DialogTitle>Reset password</DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
      >
        <DialogContentText>
          Enter your email address and we'll send you a password reset link.
        </DialogContentText>

        {error && <Typography color="error">{error}</Typography>}
        {success && <Typography color="primary">{success}</Typography>}

        <OutlinedInput
          autoFocus
          required
          id="email"
          name="email"
          placeholder="Email address"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" type="submit" disabled={loading}>
          {loading ? <CircularProgress size={22} /> : "Continue"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgotPassword;

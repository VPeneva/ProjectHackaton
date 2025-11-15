import * as React from "react";
import { useContext } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import CheckIcon from "@mui/icons-material/Check";

import { AuthContext } from "../context/AuthContext";
import { ColorModeContext } from "../theme/ThemeProvider";

// --- Styled Components ---
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
}));

const AppBarInner = styled(Box)(({ theme }) => ({
  maxWidth: "1200px",
  width: "100%",
  margin: "0 auto",
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  gap: 20,
}));

export default function NavBar() {
  const auth = useContext(AuthContext);
  const colorMode = useContext(ColorModeContext);

  // ако по някаква причина няма AuthProvider – не крашваме
  if (!auth) return null;
  if (!colorMode) return null;

  const { user, logout } = auth;
  const { mode, setMode } = colorMode;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const modeLabel = {
    light: "Light mode",
    dark: "Dark mode",
    system: "System default",
  }[mode];

  return (
    <StyledAppBar position="static">
      <Toolbar disableGutters>
        <AppBarInner>
          {/* Left Side */}
          <Button color="inherit" component={Link} to="/">
            Reports
          </Button>

          {user && (
            <Button color="inherit" component={Link} to="/create">
              Create Report
            </Button>
          )}

          {user?.role === "ADMIN" && (
            <>
              <Button color="inherit" component={Link} to="/admin">
                Admin Panel
              </Button>
              <Button color="inherit" component={Link} to="/admin/institutions">
                Institutions
              </Button>
              <Button color="inherit" component={Link} to="/admin/categories">
                Categories
              </Button>
              <Button color="inherit" component={Link} to="/admin/resolved">
                Resolved Reports
              </Button>
              <Button color="inherit" component={Link} to="/admin/contact-messages">
                Contact Messages
              </Button>
            </>
          )}

          {/* Right Side */}
          <Box
            sx={{
              marginLeft: "auto",
              display: "flex",
              gap: 2,
              alignItems: "center",
            }}
          >
            {/* Текущ режим (малък текст) */}
            <Box sx={{ fontSize: "0.8rem", opacity: 0.7 }}>
              {modeLabel}
            </Box>

            {/* THEME SWITCHER */}
            <IconButton onClick={handleOpen} color="inherit" size="small">
              <Brightness4Icon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => {
                  setMode("light");
                  handleClose();
                }}
              >
                {mode === "light" && (
                  <CheckIcon fontSize="small" style={{ marginRight: 8 }} />
                )}
                Light
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setMode("dark");
                  handleClose();
                }}
              >
                {mode === "dark" && (
                  <CheckIcon fontSize="small" style={{ marginRight: 8 }} />
                )}
                Dark
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setMode("system");
                  handleClose();
                }}
              >
                {mode === "system" && (
                  <CheckIcon fontSize="small" style={{ marginRight: 8 }} />
                )}
                System
              </MenuItem>
            </Menu>

            {/* AUTH SECTION */}
            {user ? (
              <>
                <Box sx={{ opacity: 0.8 }}>Hello, {user.name}</Box>
                <Button variant="outlined" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/signin">
                  Sign In
                </Button>
                <Button variant="contained" component={Link} to="/signup">
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </AppBarInner>
      </Toolbar>
    </StyledAppBar>
  );
}

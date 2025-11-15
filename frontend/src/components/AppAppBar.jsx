import * as React from "react";
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

import { AuthContext } from "../context/AuthContext";
import { ColorModeContext } from "../theme/ThemeProvider";

// --- Styled Components ---
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.vars.palette.background.paper,
  borderBottom: `1px solid ${theme.vars.palette.divider}`,
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

export default function AppAppBar() {
  const { user, logout } = React.useContext(AuthContext);
  const { mode, setMode } = React.useContext(ColorModeContext);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

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
            </>
          )}

          {/* Right Side */}
          <Box sx={{ marginLeft: "auto", display: "flex", gap: 2, alignItems: "center" }}>
            {/* THEME SWITCHER */}
            <IconButton onClick={handleOpen} color="inherit">
              <Brightness4Icon />
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem onClick={() => { setMode("light"); handleClose(); }}>
                Light Mode
              </MenuItem>
              <MenuItem onClick={() => { setMode("dark"); handleClose(); }}>
                Dark Mode
              </MenuItem>
              <MenuItem onClick={() => { setMode("system"); handleClose(); }}>
                System Default
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

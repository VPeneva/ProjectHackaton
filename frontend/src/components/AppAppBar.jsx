import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Wrapper → full width
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.vars.palette.background.paper,
  borderBottom: `1px solid ${theme.vars.palette.divider}`,
  boxShadow: "none",
}));

// Inner container → SAME width as Reports (1200px default)
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

  return (
    <StyledAppBar position="static">
      <Toolbar disableGutters>
        <AppBarInner>
          {/* Left side */}
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

          {/* Right side */}
          <Box sx={{ marginLeft: "auto", display: "flex", gap: 2 }}>
            {user ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", opacity: 0.8 }}>
                  Hello, {user.name}
                </Box>
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

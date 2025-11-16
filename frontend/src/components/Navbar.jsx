import * as React from "react";
import { useContext } from "react";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import CheckIcon from "@mui/icons-material/Check";

import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { ColorModeContext } from "../theme/ThemeProvider";

// =========================
// Styles
// =========================

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
}));

const AppBarInner = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  gap: 20,
  whiteSpace: "nowrap",
}));

// =========================
// Component
// =========================

export default function NavBar() {
  const auth = useContext(AuthContext);
  const colorMode = useContext(ColorModeContext);

  if (!auth || !colorMode) return null;

  const { user, logout } = auth;
  const { mode, setMode } = colorMode;

  // Theme menu
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleOpenTheme = (e) => setAnchorEl(e.currentTarget);
  const handleCloseTheme = () => setAnchorEl(null);

  // Drawer (mobile hamburger)
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  // ------------------------------
  // MENU BUTTONS
  // ------------------------------
  const menuItems = [
    { label: "Home", to: "/" }, // Landing page

    ...(user
      ? [{ label: "Reports", to: "/reports" }] // <--- FIXED
      : []),

    ...(user ? [{ label: "Create Report", to: "/create" }] : []),

    ...(user?.role === "ADMIN"
      ? [
          { label: "Admin Panel", to: "/admin" },
          { label: "Institutions", to: "/admin/institutions" },
          { label: "Categories", to: "/admin/categories" },
          { label: "Resolved Reports", to: "/admin/resolved" },
          { label: "Contact Messages", to: "/admin/contact-messages" },
        ]
      : []),
  ];

  return (
    <StyledAppBar position="static">
      <Toolbar disableGutters>
        <AppBarInner>
          {/* MOBILE BURGER */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton color="inherit" onClick={toggleDrawer}>
              <MenuIcon />
            </IconButton>
          </Box>

          {/* DESKTOP MENU */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 2,
              flexGrow: 1, // <-- разширява се и ползва празното място
              whiteSpace: "nowrap",
              overflow: "hidden", // <-- скрива скрола
              "& button": {
                flexShrink: 0, // <-- не позволява текстът да пада на два реда
              },
            }}
          >
            {menuItems.map((item) => (
              <Button
                key={item.to}
                color="inherit"
                component={Link}
                to={item.to}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* RIGHT SIDE */}
          <Box
            sx={{
              marginLeft: "auto",
              display: "flex",
              gap: 2,
              alignItems: "center",
              minWidth: 150,
            }}
          >
            {/* THEME SWITCHER */}
            <IconButton onClick={handleOpenTheme} color="inherit" size="small">
              <Brightness4Icon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseTheme}
            >
              <MenuItem
                onClick={() => {
                  setMode("light");
                  handleCloseTheme();
                }}
              >
                {mode === "light" && (
                  <CheckIcon fontSize="small" sx={{ mr: 1 }} />
                )}
                Light
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setMode("dark");
                  handleCloseTheme();
                }}
              >
                {mode === "dark" && (
                  <CheckIcon fontSize="small" sx={{ mr: 1 }} />
                )}
                Dark
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setMode("system");
                  handleCloseTheme();
                }}
              >
                {mode === "system" && (
                  <CheckIcon fontSize="small" sx={{ mr: 1 }} />
                )}
                System
              </MenuItem>
            </Menu>

            {/* AUTH BUTTONS */}
            {user ? (
              <>
                <Box
                  sx={{ opacity: 0.8, display: { xs: "none", md: "block" } }}
                >
                  Hello, {user.name}!
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

      {/* ========== MOBILE DRAWER ========== */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer}>
          <List>
            {menuItems.map((item) => (
              <ListItem disablePadding key={item.to}>
                <ListItemButton component={Link} to={item.to}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}

            <Divider />

            {/* MOBILE AUTH */}
            {user ? (
              <ListItem disablePadding>
                <ListItemButton onClick={logout}>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/signin">
                    <ListItemText primary="Sign In" />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/signup">
                    <ListItemText primary="Sign Up" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </StyledAppBar>
  );
}

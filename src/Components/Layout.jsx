import React, { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../pages/auth/authSlice";

const Layout = ({ children, onAdminToggle, currentAdminPage = "management" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const authState = useSelector((state) => state.auth);
  const { firstName = "User", lastName = "", email = "", role = "user" } = authState || {};
  const isAdmin = role === "admin";

  const handleUserMenuClick = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.reload();
  };

  const handleAdminToggle = () => {
    const newPage = currentAdminPage === "management" ? "tasks" : "management";
    if (newPage === "management") {
      navigate("/");
    } else {
      navigate("/admin/tasks");
    }
    handleUserMenuClose();
  };

  const getInitials = () => {
    return `${(firstName?.[0] || "")}${(lastName?.[0] || "")}`.toUpperCase()
      .slice(0, 2);
  };

  const fullName = `${firstName} ${lastName}`.trim() || "User";

  const navigationItems = [
    { label: "Dashboard", icon: <PersonIcon sx={{ mr: 1 }} /> },
  ];

  const drawerContent = (
    <Box sx={{ width: 280, p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        Task Manager
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {navigationItems.map((item) => (
        <ListItem button key={item.label} sx={{ borderRadius: 1, mb: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItem>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "linear-gradient(135deg, #1a73e8 0%, #1565c0 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #fff 0%, #e3f2fd 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              TaskHub
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isAdmin && (
              <Tooltip title={`Switch to ${currentAdminPage === "management" ? "Tasks" : "Management"}`}>
                <Button
                  color="inherit"
                  startIcon={<AdminIcon />}
                  onClick={handleAdminToggle}
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    border: "1.5px solid rgba(255,255,255,0.4)",
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.5,
                    "&:hover": {
                      background: "rgba(255,255,255,0.1)",
                      border: "1.5px solid rgba(255,255,255,0.7)",
                    },
                  }}
                >
                  {currentAdminPage === "management" ? "Admin Tasks" : "User Mgmt"}
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleUserMenuClick}
                size="small"
                sx={{
                  padding: 0.5,
                  border: "2px solid rgba(255,255,255,0.3)",
                  "&:hover": {
                    border: "2px solid rgba(255,255,255,0.6)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  {getInitials()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: {
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            mt: 1,
            minWidth: 280,
          },
        }}
      >
        <MenuItem sx={{ flexDirection: "column", alignItems: "flex-start", p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            {fullName}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {email}
          </Typography>
          {isAdmin && (
            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, mt: 0.5 }}>
              👤 Admin
            </Typography>
          )}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1.5, color: "error.main" }} />
          <Typography sx={{ color: "error.main" }}>Logout</Typography>
        </MenuItem>
      </Menu>

      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        {drawerContent}
      </Drawer>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <Toolbar /> {/* This accounts for the fixed AppBar height */}
        <Container
          maxWidth="xl"
          sx={{
            py: 4,
            px: { xs: 1, sm: 2, md: 3 },
            flex: 1,
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;

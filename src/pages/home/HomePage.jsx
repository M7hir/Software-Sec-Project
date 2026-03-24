import {
  AppBar,
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreateTask } from "./CreateTask";
import TaskTable from "./TaskTable";
import TaskTableContent from "./TaskTableContent";
import { EditTask } from "./EditTask";
import { logout } from "../auth/authSlice";
import { useAuth } from "../../routes/hooks/useAuth";
import { editTaskAcrossUsers, removeTaskAcrossUsers, removeUserTasks } from "./taskSlice";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const HomePage = () => {
  const dispatch = useDispatch();
  const { firstName, lastName, fullName, isAdmin } = useAuth();
  const currentUser = useSelector((state) => state.auth);
  const taskState = useSelector((state) => state.tasks);

  const [open, setOpen] = React.useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = React.useState(false);
  const [adminPage, setAdminPage] = React.useState("management");
  const [adminManagementTab, setAdminManagementTab] = React.useState(0);
  const [adminTaskTab, setAdminTaskTab] = React.useState(0);
  const [users, setUsers] = React.useState([]);
  const [addUserDialogOpen, setAddUserDialogOpen] = React.useState(false);
  const [addUserError, setAddUserError] = React.useState("");
  const [editUserDialogOpen, setEditUserDialogOpen] = React.useState(false);
  const [editUserError, setEditUserError] = React.useState("");
  const [newUser, setNewUser] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [editingUser, setEditingUser] = React.useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState(null);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [allUsersTaskPage, setAllUsersTaskPage] = React.useState(0);
  const [allUsersTaskRowsPerPage, setAllUsersTaskRowsPerPage] = React.useState(5);
  const [usersPage, setUsersPage] = React.useState(0);
  const [usersRowsPerPage, setUsersRowsPerPage] = React.useState(5);
  const [allUsersTaskSortOrder, setAllUsersTaskSortOrder] = React.useState("asc");
  const [allUsersTaskSortBy, setAllUsersTaskSortBy] = React.useState("ownerName");
  const [usersSortOrder, setUsersSortOrder] = React.useState("asc");
  const [adminEditTaskOpen, setAdminEditTaskOpen] = React.useState(false);
  const [adminTaskToEdit, setAdminTaskToEdit] = React.useState(null);

  const loadUsers = React.useCallback(() => {
    const localUsers = JSON.parse(localStorage.getItem("userData")) || [];
    setUsers(localUsers);
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleLogout = () => {
    localStorage.removeItem("AuthToken");
    dispatch(logout());
    window.location.reload();
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const getInitials = () => {
    const firstInitial = firstName?.[0] ?? "";
    const lastInitial = lastName?.[0] ?? "";
    const initials = `${firstInitial}${lastInitial}`.toUpperCase();
    return initials || "U";
  };

  const taskOwnerMap = React.useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.id] = `${user.firstName} ${user.lastName}`.trim() || "Unknown User";
      return acc;
    }, {});
  }, [users]);

  const allUsersTasks = React.useMemo(() => {
    return Object.entries(taskState || {}).flatMap(([userId, value]) => {
      if (userId === "admin-user-id") {
        return [];
      }

      const tasks = value?.tasks || [];
      return tasks.map((task) => ({
        ...task,
        ownerId: userId,
        ownerName: taskOwnerMap[userId] || "Unknown User",
      }));
    });
  }, [taskState, taskOwnerMap]);

  const sortedAllUsersTasks = React.useMemo(() => {
    const sorted = [...allUsersTasks].sort((a, b) => {
      const direction = allUsersTaskSortOrder === "asc" ? 1 : -1;

      if (allUsersTaskSortBy === "startDateTime" || allUsersTaskSortBy === "endDateTime") {
        const aTime = a[allUsersTaskSortBy] ? dayjs(a[allUsersTaskSortBy]).valueOf() : 0;
        const bTime = b[allUsersTaskSortBy] ? dayjs(b[allUsersTaskSortBy]).valueOf() : 0;
        return (aTime - bTime) * direction;
      }

      const aValue = (a[allUsersTaskSortBy] || "").toString().toLowerCase();
      const bValue = (b[allUsersTaskSortBy] || "").toString().toLowerCase();
      return aValue.localeCompare(bValue) * direction;
    });

    return sorted;
  }, [allUsersTasks, allUsersTaskSortBy, allUsersTaskSortOrder]);

  const sortedUsers = React.useMemo(() => {
    const direction = usersSortOrder === "asc" ? 1 : -1;
    return [...users].sort((a, b) => {
      const aName = `${a.firstName || ""} ${a.lastName || ""}`.trim().toLowerCase();
      const bName = `${b.firstName || ""} ${b.lastName || ""}`.trim().toLowerCase();
      return aName.localeCompare(bName) * direction;
    });
  }, [users, usersSortOrder]);

  const adminTasks = React.useMemo(() => {
    const uniqueTaskMap = new Map();

    Object.entries(taskState || {}).forEach(([userId, value]) => {
      const tasks = value?.tasks || [];

      tasks.forEach((task) => {
        if (task.createdByUserId !== currentUser.id) {
          return;
        }

        if (!uniqueTaskMap.has(task.id)) {
          uniqueTaskMap.set(task.id, {
            ...task,
            visibleFor: new Set(),
          });
        }

        uniqueTaskMap.get(task.id).visibleFor.add(taskOwnerMap[userId] || "Unknown User");
      });
    });

    return Array.from(uniqueTaskMap.values()).map((task) => ({
      ...task,
      visibleForDisplay: Array.from(task.visibleFor).join(", "),
    }));
  }, [taskState, currentUser.id, taskOwnerMap]);

  const paginatedAllUsersTasks = React.useMemo(() => {
    const start = allUsersTaskPage * allUsersTaskRowsPerPage;
    return sortedAllUsersTasks.slice(start, start + allUsersTaskRowsPerPage);
  }, [sortedAllUsersTasks, allUsersTaskPage, allUsersTaskRowsPerPage]);

  const paginatedUsers = React.useMemo(() => {
    const start = usersPage * usersRowsPerPage;
    return sortedUsers.slice(start, start + usersRowsPerPage);
  }, [sortedUsers, usersPage, usersRowsPerPage]);

  const adminTodoTasks = React.useMemo(
    () => adminTasks.filter((task) => task.status === "To-Do"),
    [adminTasks],
  );

  const adminInProgressTasks = React.useMemo(
    () => adminTasks.filter((task) => task.status === "In-Progress"),
    [adminTasks],
  );

  const adminCompletedTasks = React.useMemo(
    () => adminTasks.filter((task) => task.status === "Completed"),
    [adminTasks],
  );

  React.useEffect(() => {
    const maxTaskPage = Math.max(
      0,
      Math.ceil(allUsersTasks.length / allUsersTaskRowsPerPage) - 1,
    );
    if (allUsersTaskPage > maxTaskPage) {
      setAllUsersTaskPage(maxTaskPage);
    }
  }, [allUsersTasks.length, allUsersTaskRowsPerPage, allUsersTaskPage]);

  React.useEffect(() => {
    const maxUsersPage = Math.max(0, Math.ceil(users.length / usersRowsPerPage) - 1);
    if (usersPage > maxUsersPage) {
      setUsersPage(maxUsersPage);
    }
  }, [users.length, usersRowsPerPage, usersPage]);

  const resetNewUserForm = () => {
    setNewUser({ firstName: "", lastName: "", email: "", password: "" });
    setAddUserError("");
  };

  const handleAddUser = () => {
    if (
      !newUser.firstName.trim() ||
      !newUser.lastName.trim() ||
      !newUser.email.trim() ||
      !newUser.password.trim()
    ) {
      setAddUserError("All fields are required");
      return;
    }

    const hasDuplicate = users.some(
      (user) => user.email?.toLowerCase() === newUser.email.trim().toLowerCase(),
    );

    if (hasDuplicate) {
      setAddUserError("A user with this email already exists");
      return;
    }

    const userToAdd = {
      id: uuidv4(),
      firstName: newUser.firstName.trim(),
      lastName: newUser.lastName.trim(),
      email: newUser.email.trim(),
      password: newUser.password,
      role: "user",
    };

    const updatedUsers = [...users, userToAdd];
    localStorage.setItem("userData", JSON.stringify(updatedUsers));

    const ids = JSON.parse(localStorage.getItem("IDs")) || [];
    localStorage.setItem("IDs", JSON.stringify([...ids, userToAdd.id]));

    setUsers(updatedUsers);
    setAddUserDialogOpen(false);
    resetNewUserForm();
  };

  const handleDeleteUser = (userId) => {
    if (userId === currentUser.id) {
      return;
    }

    const updatedUsers = users.filter((user) => user.id !== userId);
    localStorage.setItem("userData", JSON.stringify(updatedUsers));

    const ids = (JSON.parse(localStorage.getItem("IDs")) || []).filter(
      (id) => id !== userId,
    );
    localStorage.setItem("IDs", JSON.stringify(ids));

    dispatch(removeUserTasks({ userId }));
    setUsers(updatedUsers);
  };

  const handleUserMenuOpen = (event, user) => {
    setUserMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
    setSelectedUser(null);
  };

  const handleEditUserOpen = () => {
    if (!selectedUser) {
      return;
    }

    setEditingUser({
      id: selectedUser.id,
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      email: selectedUser.email,
      role: selectedUser.role || "user",
    });
    setEditUserError("");
    setEditUserDialogOpen(true);
    handleUserMenuClose();
  };

  const handleDeleteUserFromMenu = () => {
    if (selectedUser) {
      handleDeleteUser(selectedUser.id);
    }
    handleUserMenuClose();
  };

  const handleEditUserSave = () => {
    if (!editingUser) {
      return;
    }

    if (
      !editingUser.firstName.trim() ||
      !editingUser.lastName.trim() ||
      !editingUser.email.trim()
    ) {
      setEditUserError("First name, last name and email are required");
      return;
    }

    const duplicateEmail = users.some(
      (user) =>
        user.id !== editingUser.id &&
        user.email?.toLowerCase() === editingUser.email.trim().toLowerCase(),
    );

    if (duplicateEmail) {
      setEditUserError("A user with this email already exists");
      return;
    }

    const updatedUsers = users.map((user) =>
      user.id === editingUser.id
        ? {
            ...user,
            firstName: editingUser.firstName.trim(),
            lastName: editingUser.lastName.trim(),
            email: editingUser.email.trim(),
            role: editingUser.role,
          }
        : user,
    );

    localStorage.setItem("userData", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setEditUserDialogOpen(false);
    setEditingUser(null);
    setEditUserError("");
  };

  const handleAllUsersTaskSort = (column) => {
    const isAsc = allUsersTaskSortBy === column && allUsersTaskSortOrder === "asc";
    setAllUsersTaskSortOrder(isAsc ? "desc" : "asc");
    setAllUsersTaskSortBy(column);
    setAllUsersTaskPage(0);
  };

  const handleUsersSort = () => {
    setUsersSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setUsersPage(0);
  };

  const handleAdminTaskDelete = (taskId) => {
    dispatch(removeTaskAcrossUsers({ taskId }));
  };

  const handleAdminTaskStatusChange = (taskId, newStatus) => {
    const task = adminTasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    dispatch(editTaskAcrossUsers({ taskId, task: { ...task, status: newStatus } }));
  };

  const handleAdminTaskEditOpen = (task) => {
    setAdminTaskToEdit(task);
    setAdminEditTaskOpen(true);
  };

  const handleAdminTaskEditSave = (taskData) => {
    dispatch(editTaskAcrossUsers({ taskId: taskData.id, task: taskData }));
  };

  const goToAdminTasksPage = () => {
    setAdminPage("tasks");
    setIsProfileDrawerOpen(false);
  };

  const goToAdminManagementPage = () => {
    setAdminPage("management");
    setIsProfileDrawerOpen(false);
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <AppBar position="fixed">
        <Toolbar
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
          }}
        >
          <Box>
            <Button onClick={handleClickOpen} variant="contained" color="secondary">
              Create task
            </Button>
          </Box>

          <Typography variant="h6" component="div" textAlign="center">
            Heremes
          </Typography>

          <Box sx={{ justifySelf: "end" }}>
            <IconButton onClick={() => setIsProfileDrawerOpen(true)} sx={{ p: 0 }}>
              <Avatar>{getInitials()}</Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Toolbar />

      <Drawer
        anchor="right"
        open={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
      >
        <Box
          sx={{
            width: 300,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            p: 3,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 72, height: 72, fontSize: 26 }}>{getInitials()}</Avatar>
            <Typography variant="h6" textAlign="center">
              {fullName || "User"}
            </Typography>
          </Box>

          <Box sx={{ mt: "auto" }}>
            {isAdmin && (
              <Button
                onClick={adminPage === "management" ? goToAdminTasksPage : goToAdminManagementPage}
                variant="outlined"
                fullWidth
                sx={{ mb: 1.5 }}
              >
                {adminPage === "management" ? "Admin Tasks" : "User Management"}
              </Button>
            )}
            <Button onClick={handleLogout} variant="contained" color="error" fullWidth>
              Log out
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
        {!isAdmin && <TaskTable />}

        {isAdmin && adminPage === "management" && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Admin Portal
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs value={adminManagementTab} onChange={(_, value) => setAdminManagementTab(value)}>
                <Tab label="All Users Tasks" />
                <Tab label="User Management" />
              </Tabs>
            </Box>

            {adminManagementTab === 0 && (
              <Paper>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TableSortLabel
                            active={allUsersTaskSortBy === "ownerName"}
                            direction={allUsersTaskSortBy === "ownerName" ? allUsersTaskSortOrder : "asc"}
                            onClick={() => handleAllUsersTaskSort("ownerName")}
                          >
                            User
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={allUsersTaskSortBy === "taskName"}
                            direction={allUsersTaskSortBy === "taskName" ? allUsersTaskSortOrder : "asc"}
                            onClick={() => handleAllUsersTaskSort("taskName")}
                          >
                            Task Name
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={allUsersTaskSortBy === "startDateTime"}
                            direction={allUsersTaskSortBy === "startDateTime" ? allUsersTaskSortOrder : "asc"}
                            onClick={() => handleAllUsersTaskSort("startDateTime")}
                          >
                            Start Date
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={allUsersTaskSortBy === "endDateTime"}
                            direction={allUsersTaskSortBy === "endDateTime" ? allUsersTaskSortOrder : "asc"}
                            onClick={() => handleAllUsersTaskSort("endDateTime")}
                          >
                            End Date
                          </TableSortLabel>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allUsersTasks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6}>
                            No tasks available for any user.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedAllUsersTasks.map((task) => (
                          <TableRow key={`${task.ownerId}-${task.id}`}>
                            <TableCell>{task.ownerName || taskOwnerMap[task.ownerId] || "Unknown User"}</TableCell>
                            <TableCell>{task.taskName}</TableCell>
                            <TableCell>{task.status}</TableCell>
                            <TableCell>{task.priority}</TableCell>
                            <TableCell>
                              {task.startDateTime
                                ? dayjs(task.startDateTime).format("MMM-DD-YYYY")
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {task.endDateTime
                                ? dayjs(task.endDateTime).format("MMM-DD-YYYY")
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={allUsersTasks.length}
                  rowsPerPage={allUsersTaskRowsPerPage}
                  page={allUsersTaskPage}
                  onPageChange={(_, newPage) => setAllUsersTaskPage(newPage)}
                  onRowsPerPageChange={(event) => {
                    setAllUsersTaskRowsPerPage(parseInt(event.target.value, 10));
                    setAllUsersTaskPage(0);
                  }}
                />
              </Paper>
            )}

            {adminManagementTab === 1 && (
              <Box>
                <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="contained" onClick={() => setAddUserDialogOpen(true)}>
                    Add User
                  </Button>
                </Box>

                <Paper>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <TableSortLabel
                              active
                              direction={usersSortOrder}
                              onClick={handleUsersSort}
                            >
                              Full Name
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role || "user"}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                onClick={(event) => handleUserMenuOpen(event, user)}
                                disabled={user.id === currentUser.id || user.role === "admin"}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={users.length}
                    rowsPerPage={usersRowsPerPage}
                    page={usersPage}
                    onPageChange={(_, newPage) => setUsersPage(newPage)}
                    onRowsPerPageChange={(event) => {
                      setUsersRowsPerPage(parseInt(event.target.value, 10));
                      setUsersPage(0);
                    }}
                  />
                </Paper>
              </Box>
            )}
          </Box>
        )}

        {isAdmin && adminPage === "tasks" && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Admin Tasks
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={adminTaskTab}
                onChange={(_, newValue) => setAdminTaskTab(newValue)}
                aria-label="admin task status tabs"
              >
                <Tab label={`To-Do (${adminTodoTasks.length})`} />
                <Tab label={`In-Progress (${adminInProgressTasks.length})`} />
                <Tab label={`Completed (${adminCompletedTasks.length})`} />
              </Tabs>
            </Box>

            <TabPanel value={adminTaskTab} index={0}>
              {adminTodoTasks.length === 0 ? (
                <Typography variant="body1" color="textSecondary">
                  No To-Do admin tasks yet.
                </Typography>
              ) : (
                <TaskTableContent
                  tasks={adminTodoTasks}
                  onDelete={handleAdminTaskDelete}
                  onStatusChange={handleAdminTaskStatusChange}
                  onEdit={handleAdminTaskEditOpen}
                  canDeleteTask={() => true}
                  canEditTask={() => true}
                  currentUserId={currentUser.id}
                  currentUserName={`${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim()}
                  showAssignedTo
                />
              )}
            </TabPanel>

            <TabPanel value={adminTaskTab} index={1}>
              {adminInProgressTasks.length === 0 ? (
                <Typography variant="body1" color="textSecondary">
                  No admin tasks in progress.
                </Typography>
              ) : (
                <TaskTableContent
                  tasks={adminInProgressTasks}
                  onDelete={handleAdminTaskDelete}
                  onStatusChange={handleAdminTaskStatusChange}
                  onEdit={handleAdminTaskEditOpen}
                  canDeleteTask={() => true}
                  canEditTask={() => true}
                  currentUserId={currentUser.id}
                  currentUserName={`${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim()}
                  showAssignedTo
                />
              )}
            </TabPanel>

            <TabPanel value={adminTaskTab} index={2}>
              {adminCompletedTasks.length === 0 ? (
                <Typography variant="body1" color="textSecondary">
                  No completed admin tasks yet.
                </Typography>
              ) : (
                <TaskTableContent
                  tasks={adminCompletedTasks}
                  onDelete={handleAdminTaskDelete}
                  onStatusChange={handleAdminTaskStatusChange}
                  onEdit={handleAdminTaskEditOpen}
                  canDeleteTask={() => true}
                  canEditTask={() => true}
                  currentUserId={currentUser.id}
                  currentUserName={`${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim()}
                  showAssignedTo
                />
              )}
            </TabPanel>
          </Box>
        )}
      </Box>

      <CreateTask open={open} setOpen={setOpen} />

      <EditTask
        open={adminEditTaskOpen}
        setOpen={setAdminEditTaskOpen}
        task={adminTaskToEdit}
        onSubmitTask={handleAdminTaskEditSave}
      />

      <Dialog
        open={addUserDialogOpen}
        onClose={() => {
          setAddUserDialogOpen(false);
          resetNewUserForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {addUserError && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="error">{addUserError}</Alert>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                value={newUser.firstName}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, firstName: e.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                value={newUser.lastName}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, lastName: e.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, password: e.target.value }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddUserDialogOpen(false);
              resetNewUserForm();
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddUser}>
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
      >
        <MenuItem onClick={handleEditUserOpen}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteUserFromMenu}>Delete</MenuItem>
      </Menu>

      <Dialog
        open={editUserDialogOpen}
        onClose={() => {
          setEditUserDialogOpen(false);
          setEditingUser(null);
          setEditUserError("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {editUserError && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="error">{editUserError}</Alert>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                value={editingUser?.firstName || ""}
                onChange={(e) =>
                  setEditingUser((prev) => ({ ...prev, firstName: e.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                value={editingUser?.lastName || ""}
                onChange={(e) =>
                  setEditingUser((prev) => ({ ...prev, lastName: e.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editingUser?.email || ""}
                onChange={(e) =>
                  setEditingUser((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditUserDialogOpen(false);
              setEditingUser(null);
              setEditUserError("");
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleEditUserSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export { HomePage };

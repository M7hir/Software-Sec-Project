import {
  Box,
  Button,
  Typography,
} from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreateTask } from "./CreateTask";
import TaskTable from "./TaskTable";
import { EditTask } from "./EditTask";
import { logout } from "../auth/authSlice";
import { useAuth } from "../../routes/hooks/useAuth";
import { editTaskAcrossUsers, removeTaskAcrossUsers, removeUserTasks } from "./taskSlice";
import { userService } from "../../api/userService";
import dayjs from "dayjs";
import { AdminManagementSection, AdminTasksSection } from "./HomePageSections";
import HomePageDialogs from "./HomePageDialogs";
import Layout from "../../Components/Layout";

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
  const [usersError, setUsersError] = React.useState("");
  const [addUserDialogOpen, setAddUserDialogOpen] = React.useState(false);
  const [addUserError, setAddUserError] = React.useState("");
  const [editUserDialogOpen, setEditUserDialogOpen] = React.useState(false);
  const [editUserError, setEditUserError] = React.useState("");
  const [newUser, setNewUser] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
  });
  const [editingUser, setEditingUser] = React.useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState(null);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [deleteUserConfirmOpen, setDeleteUserConfirmOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState(null);
  const [allUsersTaskPage, setAllUsersTaskPage] = React.useState(0);
  const [allUsersTaskRowsPerPage, setAllUsersTaskRowsPerPage] = React.useState(5);
  const [usersPage, setUsersPage] = React.useState(0);
  const [usersRowsPerPage, setUsersRowsPerPage] = React.useState(5);
  const [allUsersTaskSortOrder, setAllUsersTaskSortOrder] = React.useState("asc");
  const [allUsersTaskSortBy, setAllUsersTaskSortBy] = React.useState("ownerName");
  const [usersSortOrder, setUsersSortOrder] = React.useState("asc");
  const [adminEditTaskOpen, setAdminEditTaskOpen] = React.useState(false);
  const [adminTaskToEdit, setAdminTaskToEdit] = React.useState(null);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = React.useState(false);
  const [descriptionTaskSelected, setDescriptionTaskSelected] = React.useState(null);
  const [adminTaskDeleteConfirmOpen, setAdminTaskDeleteConfirmOpen] = React.useState(false);
  const [adminTaskToDelete, setAdminTaskToDelete] = React.useState(null);
  const [allUsersTaskMenuAnchor, setAllUsersTaskMenuAnchor] = React.useState(null);
  const [selectedAllUsersTask, setSelectedAllUsersTask] = React.useState(null);

  const loadUsers = React.useCallback(async () => {
    try {
      setUsersError("");
      const response = await userService.getUsers(100, 0);
      setUsers(response?.users || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to load users:", error);
      }
      setUsersError(error?.message || "Failed to load users");
      setUsers([]);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleLogout = () => {
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
      visibleFor: Array.from(task.visibleFor),
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

  const getErrorMessage = (error, fallbackMessage) => {
    if (typeof error === "string") return error;
    if (error?.message && typeof error.message === "string") return error.message;
    return fallbackMessage;
  };

  const resetNewUserForm = () => {
    setNewUser({ firstName: "", lastName: "", email: "", password: "", role: "user" });
    setAddUserError("");
  };

  const handleAddUser = async () => {
    if (
      !newUser.firstName.trim() ||
      !newUser.lastName.trim() ||
      !newUser.email.trim() ||
      !newUser.password.trim()
    ) {
      setAddUserError("All fields are required");
      return;
    }

    try {
      setAddUserError("");
      await userService.createUser({
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        role: newUser.role,
      });

      setAddUserDialogOpen(false);
      resetNewUserForm();
      await loadUsers();
    } catch (error) {
      setAddUserError(getErrorMessage(error, "Failed to create user"));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      dispatch(removeUserTasks({ userId }));
      await loadUsers();
    } catch (error) {
      setUsersError(getErrorMessage(error, "Failed to delete user"));
    }
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
      setUserToDelete(selectedUser);
      setDeleteUserConfirmOpen(true);
      handleUserMenuClose();
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await handleDeleteUser(userToDelete.id);
      setDeleteUserConfirmOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEditUserSave = async () => {
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

    try {
      setEditUserError("");
      await userService.updateUser(editingUser.id, {
        firstName: editingUser.firstName.trim(),
        lastName: editingUser.lastName.trim(),
        email: editingUser.email.trim(),
        role: editingUser.role,
      });

      setEditUserDialogOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      setEditUserError(getErrorMessage(error, "Failed to update user"));
    }
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

  const handleAllUsersTaskEditOpen = (task) => {
    setAdminTaskToEdit(task);
    setAdminEditTaskOpen(true);
  };

  const handleAllUsersTaskDeleteConfirm = (task) => {
    setAdminTaskToDelete(task);
    setAdminTaskDeleteConfirmOpen(true);
  };

  const handleConfirmAllUsersTaskDelete = () => {
    if (adminTaskToDelete) {
      dispatch(removeTaskAcrossUsers({ taskId: adminTaskToDelete.id }));
      setAdminTaskDeleteConfirmOpen(false);
      setAdminTaskToDelete(null);
    }
  };

  const handleAllUsersTaskMenuOpen = (event, task) => {
    setAllUsersTaskMenuAnchor(event.currentTarget);
    setSelectedAllUsersTask(task);
  };

  const handleAllUsersTaskMenuClose = () => {
    setAllUsersTaskMenuAnchor(null);
    setSelectedAllUsersTask(null);
  };

  const handleAllUsersTaskMenuEdit = () => {
    if (selectedAllUsersTask) {
      handleAllUsersTaskEditOpen(selectedAllUsersTask);
      handleAllUsersTaskMenuClose();
    }
  };

  const handleAllUsersTaskMenuDelete = () => {
    if (selectedAllUsersTask) {
      handleAllUsersTaskDeleteConfirm(selectedAllUsersTask);
      handleAllUsersTaskMenuClose();
    }
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
    <Layout onAdminToggle={setAdminPage} currentAdminPage={adminPage}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: "primary.dark" }}>
            Welcome, {fullName}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
            Manage your tasks efficiently
          </Typography>
        </Box>
        <Button 
          onClick={handleClickOpen} 
          variant="contained" 
          color="primary"
          size="large"
          sx={{
            py: 1.2,
            px: 3,
            fontSize: "1rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #1a73e8 0%, #1565c0 100%)",
            boxShadow: "0 4px 12px rgba(26, 115, 232, 0.4)",
            "&:hover": {
              boxShadow: "0 6px 20px rgba(26, 115, 232, 0.6)",
              transform: "translateY(-2px)",
            },
          }}
        >
          + Create Task
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {!isAdmin && (
          <Box>
            <TaskTable />
          </Box>
        )}

        {isAdmin && adminPage === "management" && (
          <Box>
            <AdminManagementSection
              adminManagementTab={adminManagementTab}
              setAdminManagementTab={setAdminManagementTab}
              allUsersTaskSortBy={allUsersTaskSortBy}
              allUsersTaskSortOrder={allUsersTaskSortOrder}
              handleAllUsersTaskSort={handleAllUsersTaskSort}
              allUsersTasks={allUsersTasks}
              paginatedAllUsersTasks={paginatedAllUsersTasks}
              taskOwnerMap={taskOwnerMap}
              setDescriptionTaskSelected={setDescriptionTaskSelected}
              setDescriptionDialogOpen={setDescriptionDialogOpen}
              handleAllUsersTaskMenuOpen={handleAllUsersTaskMenuOpen}
              allUsersTaskRowsPerPage={allUsersTaskRowsPerPage}
              allUsersTaskPage={allUsersTaskPage}
              setAllUsersTaskPage={setAllUsersTaskPage}
              setAllUsersTaskRowsPerPage={setAllUsersTaskRowsPerPage}
              usersError={usersError}
              setAddUserDialogOpen={setAddUserDialogOpen}
              usersSortOrder={usersSortOrder}
              handleUsersSort={handleUsersSort}
              paginatedUsers={paginatedUsers}
              currentUser={currentUser}
              handleUserMenuOpen={handleUserMenuOpen}
              usersLength={users.length}
              usersRowsPerPage={usersRowsPerPage}
              usersPage={usersPage}
              setUsersPage={setUsersPage}
              setUsersRowsPerPage={setUsersRowsPerPage}
            />
          </Box>
        )}

        {isAdmin && adminPage === "tasks" && (
          <Box>
            <AdminTasksSection
              adminTaskTab={adminTaskTab}
              setAdminTaskTab={setAdminTaskTab}
              adminTodoTasks={adminTodoTasks}
              adminInProgressTasks={adminInProgressTasks}
              adminCompletedTasks={adminCompletedTasks}
              handleAdminTaskDelete={handleAdminTaskDelete}
              handleAdminTaskStatusChange={handleAdminTaskStatusChange}
              handleAdminTaskEditOpen={handleAdminTaskEditOpen}
              currentUser={currentUser}
            />
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

      <HomePageDialogs
        addUserDialogOpen={addUserDialogOpen}
        setAddUserDialogOpen={setAddUserDialogOpen}
        resetNewUserForm={resetNewUserForm}
        addUserError={addUserError}
        newUser={newUser}
        setNewUser={setNewUser}
        handleAddUser={handleAddUser}
        userMenuAnchor={userMenuAnchor}
        handleUserMenuClose={handleUserMenuClose}
        handleEditUserOpen={handleEditUserOpen}
        handleDeleteUserFromMenu={handleDeleteUserFromMenu}
        allUsersTaskMenuAnchor={allUsersTaskMenuAnchor}
        handleAllUsersTaskMenuClose={handleAllUsersTaskMenuClose}
        handleAllUsersTaskMenuEdit={handleAllUsersTaskMenuEdit}
        handleAllUsersTaskMenuDelete={handleAllUsersTaskMenuDelete}
        editUserDialogOpen={editUserDialogOpen}
        setEditUserDialogOpen={setEditUserDialogOpen}
        setEditingUser={setEditingUser}
        setEditUserError={setEditUserError}
        editUserError={editUserError}
        editingUser={editingUser}
        handleEditUserSave={handleEditUserSave}
        deleteUserConfirmOpen={deleteUserConfirmOpen}
        setDeleteUserConfirmOpen={setDeleteUserConfirmOpen}
        setUserToDelete={setUserToDelete}
        userToDelete={userToDelete}
        handleConfirmDeleteUser={handleConfirmDeleteUser}
        descriptionDialogOpen={descriptionDialogOpen}
        setDescriptionDialogOpen={setDescriptionDialogOpen}
        setDescriptionTaskSelected={setDescriptionTaskSelected}
        descriptionTaskSelected={descriptionTaskSelected}
        adminTaskDeleteConfirmOpen={adminTaskDeleteConfirmOpen}
        setAdminTaskDeleteConfirmOpen={setAdminTaskDeleteConfirmOpen}
        setAdminTaskToDelete={setAdminTaskToDelete}
        adminTaskToDelete={adminTaskToDelete}
        handleConfirmAllUsersTaskDelete={handleConfirmAllUsersTaskDelete}
      />
    </Layout>
  );
};

export { HomePage };
export default HomePage;

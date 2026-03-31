import React from "react";
import { Box, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../routes/hooks/useAuth";
import { removeUserTasks } from "./taskSlice";
import { userService } from "../../api/userService";
import { AdminManagementSection } from "./HomePageSections";
import HomePageDialogs from "./HomePageDialogs";
import Layout from "../../Components/Layout";

const AdminManagementPage = () => {
  const dispatch = useDispatch();
  const { fullName } = useAuth();
  const currentUser = useSelector((state) => state.auth);
  const taskState = useSelector((state) => state.tasks);

  const [adminManagementTab, setAdminManagementTab] = React.useState(0);
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
  const [descriptionDialogOpen, setDescriptionDialogOpen] = React.useState(false);
  const [descriptionTaskSelected, setDescriptionTaskSelected] = React.useState(null);
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
        const aTime = a[allUsersTaskSortBy] ? new Date(a[allUsersTaskSortBy]).valueOf() : 0;
        const bTime = b[allUsersTaskSortBy] ? new Date(b[allUsersTaskSortBy]).valueOf() : 0;
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

  const paginatedAllUsersTasks = React.useMemo(() => {
    const start = allUsersTaskPage * allUsersTaskRowsPerPage;
    return sortedAllUsersTasks.slice(start, start + allUsersTaskRowsPerPage);
  }, [sortedAllUsersTasks, allUsersTaskPage, allUsersTaskRowsPerPage]);

  const paginatedUsers = React.useMemo(() => {
    const start = usersPage * usersRowsPerPage;
    return sortedUsers.slice(start, start + usersRowsPerPage);
  }, [sortedUsers, usersPage, usersRowsPerPage]);

  const handleAllUsersTaskMenuOpen = (event, task) => {
    setAllUsersTaskMenuAnchor(event.currentTarget);
    setSelectedAllUsersTask(task);
  };

  const handleAllUsersTaskMenuClose = () => {
    setAllUsersTaskMenuAnchor(null);
    setSelectedAllUsersTask(null);
  };

  return (
    <Layout onAdminToggle={() => {}} currentAdminPage="management">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: "primary.dark" }}>
            User Management
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
            Manage users and view their tasks
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
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
      />
    </Layout>
  );
};

export default AdminManagementPage;

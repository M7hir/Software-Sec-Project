import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../routes/hooks/useAuth";
import { editTaskAcrossUsers, removeTaskAcrossUsers } from "./taskSlice";
import dayjs from "dayjs";
import { AdminTasksSection } from "./HomePageSections";
import { EditTask } from "./EditTask";
import { CreateTask } from "./CreateTask";
import HomePageDialogs from "./HomePageDialogs";
import Layout from "../../Components/Layout";
import { taskService } from "../../api/taskService";

const AdminTasksPage = () => {
  const dispatch = useDispatch();
  const { fullName } = useAuth();
  const currentUser = useSelector((state) => state.auth);
  const taskState = useSelector((state) => state.tasks);

  const [adminTaskTab, setAdminTaskTab] = React.useState(0);
  const [adminEditTaskOpen, setAdminEditTaskOpen] = React.useState(false);
  const [adminTaskToEdit, setAdminTaskToEdit] = React.useState(null);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = React.useState(false);
  const [descriptionTaskSelected, setDescriptionTaskSelected] = React.useState(null);
  const [adminTaskDeleteConfirmOpen, setAdminTaskDeleteConfirmOpen] = React.useState(false);
  const [adminTaskToDelete, setAdminTaskToDelete] = React.useState(null);
  const [open, setOpen] = React.useState(false);

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

        const users = Object.entries(taskState || {})
          .filter(([, val]) => val?.tasks?.some(t => t.id === task.id))
          .map(([uid]) => {
            const userTasks = taskState[uid]?.tasks || [];
            const userTask = userTasks.find(t => t.id === task.id);
            return userTask?.assignedToName || "Unknown User";
          });
        
        users.forEach(user => uniqueTaskMap.get(task.id).visibleFor.add(user));
      });
    });

    return Array.from(uniqueTaskMap.values()).map((task) => ({
      ...task,
      visibleFor: Array.from(task.visibleFor),
      visibleForDisplay: Array.from(task.visibleFor).join(", "),
    }));
  }, [taskState, currentUser.id]);

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

  const handleAdminTaskDelete = (taskId) => {
    dispatch(removeTaskAcrossUsers({ taskId }));
  };

  const handleAdminTaskStatusChange = async (taskId, newStatus) => {
    const task = adminTasks.find((item) => item.id === taskId);
    if (!task) return;

    // Optimistically update Redux
    dispatch(editTaskAcrossUsers({ taskId, task: { ...task, status: newStatus } }));

    // Persist to backend
    try {
      await taskService.updateTask(taskId, {
        taskName: task.taskName,
        description: task.description,
        priority: task.priority,
        status: newStatus,
        startDateTime: task.startDateTime,
        endDateTime: task.endDateTime,
        assigneeId: task.assigneeId,
        assignedToId: task.assignedToId,
      });
    } catch (error) {
      // Revert on error
      dispatch(editTaskAcrossUsers({ taskId, task }));
      console.error("Failed to update task status:", error);
    }
  };

  const handleAdminTaskEditOpen = (task) => {
    setAdminTaskToEdit(task);
    setAdminEditTaskOpen(true);
  };

  const handleAdminTaskEditSave = (taskData) => {
    dispatch(editTaskAcrossUsers({ taskId: taskData.id, task: taskData }));
  };

  const handleAdminTaskDeleteConfirm = (task) => {
    setAdminTaskToDelete(task);
    setAdminTaskDeleteConfirmOpen(true);
  };

  const handleConfirmAllUsersTaskDelete = () => {
    if (adminTaskToDelete) {
      handleAdminTaskDelete(adminTaskToDelete.id);
      setAdminTaskDeleteConfirmOpen(false);
      setAdminTaskToDelete(null);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  return (
    <Layout onAdminToggle={() => {}} currentAdminPage="tasks">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: "primary.dark" }}>
            Admin Tasks
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
            Manage tasks created by you for all users
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

      <EditTask
        open={adminEditTaskOpen}
        setOpen={setAdminEditTaskOpen}
        task={adminTaskToEdit}
        onSubmitTask={handleAdminTaskEditSave}
      />

      <CreateTask open={open} setOpen={setOpen} />

      <HomePageDialogs
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

export default AdminTasksPage;

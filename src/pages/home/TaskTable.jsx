import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeTask, editTask } from "./taskSlice";
import { useAuthContext } from "../../hooks/useAuthContext";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { Typography, Card, CardContent, Chip, Snackbar, Alert } from "@mui/material";
import TaskTableContent from "./TaskTableContent";
import { EditTask } from "./EditTask";
import { taskService } from "../../api/taskService";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function TaskTable() {
  const dispatch = useDispatch();
  const user = useAuthContext();
  const [tabValue, setTabValue] = React.useState(0);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [taskToEdit, setTaskToEdit] = React.useState(null);
  const [statusError, setStatusError] = React.useState("");
  const [openStatusError, setOpenStatusError] = React.useState(false);

  const taskState = useSelector((state) => state.tasks);
  const allTasks = React.useMemo(() => {
    return taskState[user.id]?.tasks || [];
  }, [taskState, user.id]);

  const todoTasks = React.useMemo(
    () => allTasks.filter((task) => task.status === "To-Do"),
    [allTasks],
  );

  const inProgressTasks = React.useMemo(
    () => allTasks.filter((task) => task.status === "In-Progress"),
    [allTasks],
  );

  const completedTasks = React.useMemo(
    () => allTasks.filter((task) => task.status === "Completed"),
    [allTasks],
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteTask = (taskId) => {
    const task = allTasks.find((item) => item.id === taskId);
    const canDelete = task?.createdByUserId ? task.createdByUserId === user.id : true;

    if (!canDelete) {
      return;
    }

    dispatch(removeTask({ userId: user.id, taskId }));
  };

  const canDeleteTask = (task) => (task?.createdByUserId ? task.createdByUserId === user.id : true);
  const canEditTask = (task) => (task?.createdByUserId ? task.createdByUserId === user.id : true);
  const canChangeStatus = (task) => {
    // Allow status change if user CREATED the task OR is the ASSIGNEE
    // Convert to numbers for comparison to avoid string/number mismatches
    const currentUserIdNum = Number(user.id);
    const taskCreatorIdNum = Number(task?.createdByUserId);
    const taskAssigneeIdNum = Number(task?.assigneeId);
    
    const isCreator = (task?.createdByUserId) ? (taskCreatorIdNum === currentUserIdNum) : false;
    const isAssignee = (task?.assigneeId) ? (taskAssigneeIdNum === currentUserIdNum) : false;
    return isCreator || isAssignee;
  };
  const currentUserName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  const handleStatusChange = (taskId, newStatus) => {
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistically update Redux
    dispatch(editTask({ userId: user.id, task: { ...task, status: newStatus } }));

    // Persist to backend
    taskService
      .updateTask(taskId, {
        taskName: task.taskName,
        description: task.description,
        priority: task.priority,
        status: newStatus,
        startDateTime: task.startDateTime,
        endDateTime: task.endDateTime,
        assigneeId: task.assigneeId,
        assignedToId: task.assignedToId,
      })
      .catch((error) => {
        // Revert Redux state on error
        dispatch(editTask({ userId: user.id, task: task }));
        setStatusError(error.message || "Failed to update task status");
        setOpenStatusError(true);
      });
  };

  const handleCloseStatusError = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenStatusError(false);
  };

  const handleEditClick = (task) => {
    if (!canEditTask(task)) {
      return;
    }

    setTaskToEdit(task);
    setEditDialogOpen(true);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ pb: 1 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="task status tabs"
            sx={{
              "& .MuiTabs-indicator": {
                background: "linear-gradient(135deg, #1a73e8 0%, #1565c0 100%)",
                height: 3,
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>To-Do</Typography>
                  <Chip 
                    label={todoTasks.length} 
                    size="small"
                    sx={{
                      background: "linear-gradient(135deg, #ff6b6b 0%, #f06a3c 100%)",
                      color: "white",
                      fontWeight: 700,
                    }}
                  />
                </Box>
              }
              id="tab-0"
              aria-controls="tabpanel-0"
              sx={{
                fontWeight: 600,
                "&.Mui-selected": {
                  color: "#1a73e8",
                },
              }}
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>In Progress</Typography>
                  <Chip 
                    label={inProgressTasks.length} 
                    size="small"
                    sx={{
                      background: "linear-gradient(135deg, #ffa500 0%, #ff8c42 100%)",
                      color: "white",
                      fontWeight: 700,
                    }}
                  />
                </Box>
              }
              id="tab-1"
              aria-controls="tabpanel-1"
              sx={{
                fontWeight: 600,
                "&.Mui-selected": {
                  color: "#1a73e8",
                },
              }}
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>Completed</Typography>
                  <Chip 
                    label={completedTasks.length} 
                    size="small"
                    sx={{
                      background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
                      color: "white",
                      fontWeight: 700,
                    }}
                  />
                </Box>
              }
              id="tab-2"
              aria-controls="tabpanel-2"
              sx={{
                fontWeight: 600,
                "&.Mui-selected": {
                  color: "#1a73e8",
                },
              }}
            />
          </Tabs>
        </CardContent>
      </Card>

      <TabPanel value={tabValue} index={0}>
        {todoTasks.length === 0 ? (
          <Card sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
            <Typography variant="body1" color="textSecondary" sx={{ fontSize: "1.1rem" }}>
              📝 No To-Do tasks yet. Create one to get started!
            </Typography>
          </Card>
        ) : (
          <TaskTableContent
            tasks={todoTasks}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onEdit={handleEditClick}
            canDeleteTask={canDeleteTask}
            canEditTask={canEditTask}
            currentUserId={user.id}
            currentUserName={currentUserName}
          />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {inProgressTasks.length === 0 ? (
          <Card sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
            <Typography variant="body1" color="textSecondary" sx={{ fontSize: "1.1rem" }}>
              ⚙️ No tasks in progress. Move a task here to get started!
            </Typography>
          </Card>
        ) : (
          <TaskTableContent
            tasks={inProgressTasks}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onEdit={handleEditClick}
            canDeleteTask={canDeleteTask}
            canEditTask={canEditTask}
            currentUserId={user.id}
            currentUserName={currentUserName}
          />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {completedTasks.length === 0 ? (
          <Card sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
            <Typography variant="body1" color="textSecondary" sx={{ fontSize: "1.1rem" }}>
              ✅ No completed tasks yet. Complete a task to see it here!
            </Typography>
          </Card>
        ) : (
          <TaskTableContent
            tasks={completedTasks}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onEdit={handleEditClick}
            canDeleteTask={canDeleteTask}
            canEditTask={canEditTask}
            currentUserId={user.id}
            currentUserName={currentUserName}
          />
        )}
      </TabPanel>

      <EditTask open={editDialogOpen} setOpen={setEditDialogOpen} task={taskToEdit} />

      <Snackbar open={openStatusError} autoHideDuration={6000} onClose={handleCloseStatusError}>
        <Alert
          onClose={handleCloseStatusError}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {statusError}
        </Alert>
      </Snackbar>
    </Box>
  );
}

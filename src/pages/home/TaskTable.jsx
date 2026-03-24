import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeTask, editTask } from "./taskSlice";
import { useAuthContext } from "../../hooks/useAuthContext";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { Typography } from "@mui/material";
import TaskTableContent from "./TaskTableContent";
import { EditTask } from "./EditTask";

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
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function TaskTable() {
  const dispatch = useDispatch();
  const user = useAuthContext();
  const [tabValue, setTabValue] = React.useState(0);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [taskToEdit, setTaskToEdit] = React.useState(null);

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
  const currentUserName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  const handleStatusChange = (taskId, newStatus) => {
    const task = allTasks.find((t) => t.id === taskId);
    if (task && canEditTask(task)) {
      dispatch(editTask({ userId: user.id, task: { ...task, status: newStatus } }));
    }
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
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="task status tabs"
        >
          <Tab
            label={`To-Do (${todoTasks.length})`}
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab
            label={`In-Progress (${inProgressTasks.length})`}
            id="tab-1"
            aria-controls="tabpanel-1"
          />
          <Tab
            label={`Completed (${completedTasks.length})`}
            id="tab-2"
            aria-controls="tabpanel-2"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {todoTasks.length === 0 ? (
          <Typography variant="body1" color="textSecondary">
            No To-Do tasks yet. Create one to get started!
          </Typography>
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
          <Typography variant="body1" color="textSecondary">
            No tasks in progress. Move a task here to get started!
          </Typography>
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
          <Typography variant="body1" color="textSecondary">
            No completed tasks yet. Complete a task to see it here!
          </Typography>
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
    </Box>
  );
}

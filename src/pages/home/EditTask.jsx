import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useForm } from "react-hook-form";
import { Field } from "../../Components/Fields";
import { FormProvider as RHFForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { editTask } from "./taskSlice";
import { useAuthContext } from "../../hooks/useAuthContext";
import { taskService } from "../../api/taskService";
import { useTaskAssignableUsers } from "./useTaskAssignableUsers";
import { getSelectedTaskUsers, validateTaskFile } from "./taskFormUtils";

dayjs.extend(isSameOrBefore);

const EditTask = ({ open, setOpen, task, onSubmitTask }) => {
  const [dateError, setDateError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const dispatch = useDispatch();
  const user = useAuthContext();
  const { users, loadingUsers, userLabelMap, assigneeOptions, assignedToOptions } =
    useTaskAssignableUsers({ open, user, enabled: Boolean(task && user?.id) });

  const methods = useForm({
    defaultValues: {
      taskName: task?.taskName || "",
      description: task?.description || "",
      assignee: String(task?.assigneeId || user?.id),
      assignedTo: String(task?.assignedToId || user?.id),
      priority: task?.priority || "Medium",
      status: task?.status || "To-Do",
      startDateTime: task?.startDateTime ? dayjs(task.startDateTime) : dayjs(),
      endDateTime: task?.endDateTime ? dayjs(task.endDateTime) : dayjs().add(1, "hour"),
    },
    mode: "onChange",
  });
  const { reset } = methods;

  useEffect(() => {
    if (open && task && users.length > 0) {
      reset({
        taskName: task.taskName,
        description: task.description,
        assignee: String(task.assigneeId || user?.id),
        assignedTo: String(task.assignedToId || user?.id),
        priority: task.priority,
        status: task.status,
        startDateTime: dayjs(task.startDateTime),
        endDateTime: dayjs(task.endDateTime),
      });
    }
  }, [open, task, users, user?.id, reset]);

  const handleClose = (_, reason) => {
    if (reason === "backdropClick") {
      return;
    }
    setOpen(false);
    setDateError(null);
    setFileError("");
    setSelectedFile(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateTaskFile(file);
    if (validationError) {
      setFileError(validationError);
      setSelectedFile(null);
      return;
    }

    setFileError("");
    setSelectedFile(file);
  };

  const onSubmit = async (data) => {
    // Validate end date is greater than start date
    if (dayjs(data.endDateTime).isSameOrBefore(dayjs(data.startDateTime))) {
      setDateError("End date must be greater than start date");
      return;
    }

    const { assigneeData, assignedToData } = getSelectedTaskUsers(
      users,
      data.assignee,
      data.assignedTo,
    );

    if (!assigneeData || !assignedToData) {
      setDateError("Please select valid users for Assignee and Assigned To");
      return;
    }

    // Prepare task data for backend
    const taskPayload = {
      taskName: data.taskName,
      description: data.description,
      priority: data.priority,
      status: data.status,
      startDateTime: data.startDateTime.toISOString(),
      endDateTime: data.endDateTime.toISOString(),
      assigneeId: assigneeData.id,
      assignedToId: assignedToData.id,
    };

    try {
      setDateError(null);

      // Update task via backend API
      const apiResponse = await taskService.updateTask(task.id, taskPayload);
      const updatedTask = apiResponse?.task || apiResponse;

      // Upload file if selected and capture file info from response
      let uploadedFileInfo = task.files || [];
      if (selectedFile) {
        try {
          const fileResponse = await taskService.uploadFile(task.id, selectedFile);
          uploadedFileInfo = fileResponse?.file ? [fileResponse.file] : [];
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          setFileError("Task updated but file upload failed. Please try uploading the file again.");
        }
      }

      // Update Redux with backend response
      const taskData = {
        ...task,
        ...updatedTask,
        assigneeName: `${assigneeData.firstName} ${assigneeData.lastName}`,
        assignedToName: `${assignedToData.firstName} ${assignedToData.lastName}`,
        files: uploadedFileInfo,
      };

      // Update task under current user's ID
      dispatch(editTask({ userId: user?.id, task: taskData }));
      
      // Also update under assignee's ID in case it was changed
      if (assigneeData.id !== user?.id) {
        dispatch(editTask({ userId: assigneeData.id, task: taskData }));
      }
      
      // Also update under assignedTo's ID in case it was changed
      if (assignedToData.id !== user?.id && assignedToData.id !== assigneeData.id) {
        dispatch(editTask({ userId: assignedToData.id, task: taskData }));
      }

      if (onSubmitTask) {
        onSubmitTask(taskData);
      }

      handleClose();
    } catch (error) {
      console.error("Error updating task:", error);
      setDateError(error.message || "Failed to update task. Please try again.");
    }
  };

  return (
    <RHFForm {...methods}>
      <Dialog
        open={open}
        onClose={handleClose}
        component="form"
        onSubmit={methods.handleSubmit(onSubmit)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent sx={{ paddingTop: 2 }}>
          {dateError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dateError}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Field.TextField
                name="taskName"
                label="Task Name"
                fullWidth
                required
                rules={{
                  minLength: {
                    value: 2,
                    message: "Task name must be at least 2 characters",
                  },
                  maxLength: {
                    value: 50,
                    message: "Task name cannot exceed 50 characters",
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Field.TextField
                name="description"
                label="Description"
                rows={4}
                multiline
                fullWidth
                required
                rules={{
                  minLength: {
                    value: 2,
                    message: "Description must be at least 2 characters",
                  },
                  maxLength: {
                    value: 400,
                    message: "Description cannot exceed 400 characters",
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Field.AutoComplete
                name="assignee"
                disablePortal
                options={assigneeOptions}
                sx={{ width: "100%" }}
                label="Assignee"
                disableClearable
                getOptionLabel={(option) => userLabelMap[option] || ""}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Field.AutoComplete
                name="assignedTo"
                disablePortal
                options={assignedToOptions}
                sx={{ width: "100%" }}
                label="Assigned To"
                disableClearable
                getOptionLabel={(option) => userLabelMap[option] || ""}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Field.AutoComplete
                name="priority"
                disablePortal
                options={["High", "Medium", "Low"]}
                sx={{ width: "100%" }}
                label="Priority"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Field.AutoComplete
                name="status"
                disablePortal
                options={["To-Do", "In-Progress", "Completed"]}
                sx={{ width: "100%" }}
                label="Status"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field.DateTimePicker
                name="startDateTime"
                label="Start date and time"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field.DateTimePicker
                name="endDateTime"
                label="End date and time"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Upload File (Optional - Replace Existing)
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: "text.secondary", mb: 1 }}>
                  Allowed: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 5MB) - 1 file per task
                </Typography>
              </Box>
              {task?.files && task.files.length > 0 && !selectedFile && (
                <Box sx={{ mb: 2, p: 1.5, backgroundColor: "info.light", borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: "info.main", fontWeight: "bold", mb: 0.5 }}>
                    Current File:
                  </Typography>
                  <Typography variant="body2" sx={{ color: "info.dark" }}>
                    📄 {task.files[0].originalName}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ color: "info.main", display: "block", mt: 0.5 }}
                  >
                    Upload a new file to replace it
                  </Typography>
                </Box>
              )}
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ width: "100%" }}
                disabled={!!selectedFile}
              />
              {selectedFile && (
                <Box sx={{ mt: 1, p: 1, backgroundColor: "warning.light", borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: "warning.dark", fontWeight: "bold" }}>
                    ⚠️ New File (will replace): {selectedFile.name}
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setSelectedFile(null)}
                    sx={{ mt: 0.5 }}
                  >
                    Cancel Replacement
                  </Button>
                </Box>
              )}
              {fileError && (
                <Typography variant="body2" sx={{ mt: 1, color: "error.main" }}>
                  {fileError}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={loadingUsers}>Update</Button>
        </DialogActions>
      </Dialog>
    </RHFForm>
  );
};

export { EditTask };

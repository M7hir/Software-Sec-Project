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
import { v4 as uuidv4 } from "uuid";
import { useDispatch } from "react-redux";
import { addTask } from "./taskSlice";
import { useAuthContext } from "../../hooks/useAuthContext";
import { taskService } from "../../api/taskService";
import { useTaskAssignableUsers } from "./useTaskAssignableUsers";
import { getSelectedTaskUsers, validateTaskFile } from "./taskFormUtils";

dayjs.extend(isSameOrBefore);

const CreateTask = ({ open, setOpen }) => {
  const [dateError, setDateError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const user = useAuthContext();
  const { users, loadingUsers, userLabelMap, assigneeOptions, assignedToOptions } =
    useTaskAssignableUsers({ open, user });
  
  const methods = useForm({
    defaultValues: {
      taskName: "",
      description: "",
      assignee: String(user.id),
      assignedTo: String(user.id),
      priority: "Medium",
      status: "To-Do",
      startDateTime: dayjs(),
      endDateTime: dayjs().add(1, "hour"),
    },
    mode: "onChange",
  });
  const { reset } = methods;

  useEffect(() => {
    if (open && users.length > 0) {
      reset({
        taskName: "",
        description: "",
        assignee: String(user.id),
        assignedTo: String(user.id),
        priority: "Medium",
        status: "To-Do",
        startDateTime: dayjs(),
        endDateTime: dayjs().add(1, "hour"),
      });
    }
  }, [open, users, user.id, reset]);

  const dispatch = useDispatch();

  const handleClose = (_, reason) => {
    if (reason === "backdropClick") {
      return;
    }
    setDateError(null);
    setFileError("");
    setSelectedFile(null);
    setOpen(false);
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
    // Validate file is selected and has no errors
    if (!selectedFile) {
      setFileError("File upload is required");
      return;
    }

    if (fileError) {
      return;
    }

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
      
      // Save task to backend API
      const apiResponse = await taskService.createTask(taskPayload);
      const createdTask = apiResponse?.task || apiResponse;

      // Upload file if selected and capture file info from response
      let uploadedFileInfo = null;
      if (selectedFile) {
        try {
          const fileResponse = await taskService.uploadFile(createdTask.id, selectedFile);
          uploadedFileInfo = fileResponse?.file;
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          setFileError("Task created but file upload failed. Please try uploading the file again.");
        }
      }

      // Update Redux with backend response
      const taskData = {
        ...createdTask,
        id: createdTask.id || uuidv4(),
        assigneeName: `${assigneeData.firstName} ${assigneeData.lastName}`,
        assignedToName: `${assignedToData.firstName} ${assignedToData.lastName}`,
        createdByUserId: user.id,
        files: uploadedFileInfo ? [uploadedFileInfo] : []
      };

      // Store task under assignee's user ID
      dispatch(addTask({ userId: assigneeData.id, task: { ...taskData } }));

      // Store task under assignedTo's user ID if different
      if (assignedToData.id !== assigneeData.id) {
        dispatch(addTask({ userId: assignedToData.id, task: { ...taskData } }));
      }

      // Store task under current user's ID so they can see it in their task list
      if (user.id !== assigneeData.id && user.id !== assignedToData.id) {
        dispatch(addTask({ userId: user.id, task: { ...taskData } }));
      }

      handleClose();
    } catch (error) {
      console.error("Error creating task:", error);
      setDateError(error.message || "Failed to create task. Please try again.");
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
        <DialogTitle>Create New Task</DialogTitle>
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
                  Upload File <span style={{ color: "red" }}>*</span>
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: "text.secondary", mb: 1 }}>
                  Allowed: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 5MB) - 1 file per task
                </Typography>
              </Box>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ width: "100%" }}
                required
                disabled={!!selectedFile}
              />
              {selectedFile && (
                <Box sx={{ mt: 1, p: 1, backgroundColor: "success.light", borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: "success.main", fontWeight: "bold" }}>
                    ✓ Selected: {selectedFile.name}
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setSelectedFile(null)}
                    sx={{ mt: 0.5 }}
                  >
                    Remove File
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
          <Button type="submit" disabled={loadingUsers}>Create</Button>
        </DialogActions>
      </Dialog>
    </RHFForm>
  );
};

export { CreateTask };

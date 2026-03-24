import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Alert,
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

dayjs.extend(isSameOrBefore);

const CreateTask = ({ open, setOpen }) => {
  const [dateError, setDateError] = useState(null);
  const user = useAuthContext();
  const isAdmin = user.role === "admin";
  const users = JSON.parse(localStorage.getItem("userData")) || [];

  const userLabelMap = {};
  users.forEach((item) => {
    userLabelMap[item.id] = `${item.firstName} ${item.lastName} (${item.email})`;
  });

  if (user.id && !userLabelMap[user.id]) {
    userLabelMap[user.id] = `${user.firstName} ${user.lastName} (${user.email})`;
  }

  const userOptions = Object.keys(userLabelMap);
  const assigneeOptions = isAdmin ? userOptions : [user.id];
  const assignedToOptions = isAdmin ? userOptions : [user.id];
  
  const methods = useForm({
    defaultValues: {
      taskName: "",
      description: "",
      assignee: user.id,
      assignedTo: user.id,
      priority: "Medium",
      status: "To-Do",
      startDateTime: dayjs(),
      endDateTime: dayjs().add(1, "hour"),
    },
    mode: "onChange",
  });
  const { reset } = methods;

  useEffect(() => {
    if (open) {
      reset({
        taskName: "",
        description: "",
        assignee: user.id,
        assignedTo: user.id,
        priority: "Medium",
        status: "To-Do",
        startDateTime: dayjs(),
        endDateTime: dayjs().add(1, "hour"),
      });
    }
  }, [open, reset, user.id]);

  const dispatch = useDispatch();

  const handleClose = (_, reason) => {
    if (reason === "backdropClick") {
      return;
    }
    setDateError(null);
    setOpen(false);
  };

  const onSubmit = (data) => {
    // Validate end date is greater than start date
    if (dayjs(data.endDateTime).isSameOrBefore(dayjs(data.startDateTime))) {
      setDateError("End date must be greater than start date");
      return;
    }

    console.log("Submitted data:", data);

    const selectedAssignee = users.find((item) => item.id === data.assignee) || (data.assignee === user.id
      ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        }
      : null);

    const selectedAssignedTo = users.find((item) => item.id === data.assignedTo) || (data.assignedTo === user.id
      ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        }
      : null);

    if (!selectedAssignee || !selectedAssignedTo) {
      setDateError("Please select valid users for Assignee and Assigned To");
      return;
    }

    const taskData = {
      ...data,
      id: uuidv4(),
      assigneeId: selectedAssignee.id,
      assigneeName: `${selectedAssignee.firstName} ${selectedAssignee.lastName}`,
      assignedToId: selectedAssignedTo.id,
      assignedToName: `${selectedAssignedTo.firstName} ${selectedAssignedTo.lastName}`,
      createdByUserId: user.id,
      startDateTime: data.startDateTime.toISOString(),
      endDateTime: data.endDateTime.toISOString(),
    };

    dispatch(addTask({ userId: selectedAssignee.id, task: { ...taskData } }));

    if (selectedAssignedTo.id !== selectedAssignee.id) {
      dispatch(addTask({ userId: selectedAssignedTo.id, task: { ...taskData } }));
    }

    setDateError(null);
    handleClose();
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Create</Button>
        </DialogActions>
      </Dialog>
    </RHFForm>
  );
};

export { CreateTask };

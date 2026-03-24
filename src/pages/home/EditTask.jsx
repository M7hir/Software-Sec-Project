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
import { useDispatch } from "react-redux";
import { editTask } from "./taskSlice";
import { useAuthContext } from "../../hooks/useAuthContext";

dayjs.extend(isSameOrBefore);

const EditTask = ({ open, setOpen, task }) => {
  const [dateError, setDateError] = useState(null);

  const methods = useForm({
    defaultValues: {
      taskName: task?.taskName || "",
      description: task?.description || "",
      priority: task?.priority || "Medium",
      status: task?.status || "To-Do",
      startDateTime: task?.startDateTime ? dayjs(task.startDateTime) : dayjs(),
      endDateTime: task?.endDateTime ? dayjs(task.endDateTime) : dayjs().add(1, "hour"),
    },
    mode: "onChange",
  });
  const { reset } = methods;

  useEffect(() => {
    if (open && task) {
      reset({
        taskName: task.taskName,
        description: task.description,
        priority: task.priority,
        status: task.status,
        startDateTime: dayjs(task.startDateTime),
        endDateTime: dayjs(task.endDateTime),
      });
    }
  }, [open, task, reset]);

  const dispatch = useDispatch();
  const user = useAuthContext();

  const handleClose = (_, reason) => {
    if (reason === "backdropClick") {
      return;
    }
    setOpen(false);
    setDateError(null);
  };

  const onSubmit = (data) => {
    // Validate end date is greater than start date
    if (dayjs(data.endDateTime).isSameOrBefore(dayjs(data.startDateTime))) {
      setDateError("End date must be greater than start date");
      return;
    }

    const taskData = {
      ...task,
      ...data,
      startDateTime: data.startDateTime.toISOString(),
      endDateTime: data.endDateTime.toISOString(),
    };

    dispatch(editTask({ userId: user.id, task: taskData }));
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
          <Button type="submit">Update</Button>
        </DialogActions>
      </Dialog>
    </RHFForm>
  );
};

export { EditTask };

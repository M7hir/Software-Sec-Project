import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { useEffect } from "react";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { Field } from "../../Components/Fields";
import { FormProvider as RHFForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { useDispatch } from "react-redux";
import { addTask } from "./taskSlice";

const CreateTask = ({ open, setOpen }) => {
  const methods = useForm({
    defaultValues: {
      taskName: "",
      description: "",
      priority: "Medium",
      startDateTime: dayjs(),
      endDateTime: dayjs().add(1, "hour"),
    },
  });
  const { reset } = methods;

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);
  //    const [open, setOpen] = React.useState(false);

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };
  const dispatch = useDispatch();
  const handleClose = (_, reason) => {
    if (reason === "backdropClick") {
      return;
    }
    setOpen(false);
  };

  const onSubmit = (data) => {
    console.log("Submitted data:", data);
    const taskData = {
      ...data,
      id: uuidv4(),
      startDateTime: data.startDateTime.toISOString(),
      endDateTime: data.endDateTime.toISOString(),
    };

    dispatch(addTask(taskData));
    handleClose();
  };
  return (
    <RHFForm {...methods}>
      <Dialog
        open={open}
        onClose={handleClose}
        component="form"
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent sx={{ paddingTop: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Field.TextField
                name="taskName"
                label="Task Name"
                fullWidth
                required
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

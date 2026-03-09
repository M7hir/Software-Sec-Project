import { Button, Typography } from "@mui/material";
import React from "react";
import { CreateTask } from "./CreateTask";
import TaskTable from "./TaskTable";

const HomePage = () => {
  const handleClick = () => {
    localStorage.removeItem("AuthToken");
    window.location.reload();
  };
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  return (
    <div>
      <Typography>Home page</Typography>
      <Button onClick={handleClick} variant="contained">
        Log out
      </Button>
      <Button onClick={handleClickOpen}>Create task</Button>
      <CreateTask open={open} setOpen={setOpen} />
      <TaskTable />
    </div>
  );
};

export { HomePage };

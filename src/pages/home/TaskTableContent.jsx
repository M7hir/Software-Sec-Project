import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { visuallyHidden } from "@mui/utils";
import dayjs from "dayjs";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Typography,
  Menu,
} from "@mui/material";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const getHeadCells = (showAssignedTo) => [
  {
    id: "taskName",
    align: "left",
    disablePadding: false,
    label: "Task Name",
    width: "200px",
  },
  {
    id: "description",
    disablePadding: false,
    align: "left",
    label: "Description",
    width: "250px",
  },
  {
    id: "priority",
    disablePadding: false,
    align: "center",
    label: "Priority",
    width: "100px",
  },
  {
    id: "status",
    disablePadding: false,
    align: "center",
    label: "Status",
    width: "130px",
  },
  {
    id: "startDateTime",
    disablePadding: false,
    align: "center",
    label: "Start Date",
    width: "140px",
  },
  {
    id: "endDateTime",
    disablePadding: false,
    align: "center",
    label: "End Date",
    width: "140px",
  },
  {
    id: "assigneeName",
    disablePadding: false,
    align: "left",
    label: "Assignee",
    width: "180px",
  },
  ...(showAssignedTo
    ? [
        {
          id: "assignedToName",
          disablePadding: false,
          align: "left",
          label: "Assigned To",
          width: "180px",
        },
      ]
    : []),
  {
    id: "actions",
    disablePadding: false,
    align: "center",
    label: "Actions",
    width: "80px",
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort, showAssignedTo } = props;
  const headCells = getHeadCells(showAssignedTo);
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align ? headCell.align : "left"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ paddingLeft: 2, width: headCell.width }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default function TaskTableContent({ tasks, onDelete, onStatusChange, onEdit, canDeleteTask, canEditTask, currentUserId, currentUserName, showAssignedTo }) {
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("taskName");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [descriptionDialog, setDescriptionDialog] = React.useState(false);
  const [selectedDescription, setSelectedDescription] = React.useState("");

  const handleMenuOpen = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleEdit = () => {
    if (selectedTask && !canEditTask(selectedTask)) {
      handleMenuClose();
      return;
    }

    if (selectedTask) {
      onEdit(selectedTask);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedTask && !canDeleteTask(selectedTask)) {
      handleMenuClose();
      return;
    }

    if (selectedTask) {
      setTaskToDelete(selectedTask);
      setOpenDeleteDialog(true);
    }
    handleMenuClose();
  };

  const handleDescriptionDoubleClick = (description) => {
    setSelectedDescription(description);
    setDescriptionDialog(true);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClose = (_, reason) => {
    if (reason === "backdropClick") {
      return;
    }
    setOpenDeleteDialog(false);
    setTaskToDelete(null);
  };

  const handleDeleteTask = (id) => {
    onDelete(id);
    handleClose();
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tasks.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      [...tasks]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, tasks],
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              showAssignedTo={showAssignedTo}
              rowCount={tasks.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;
                const assigneeName = row.assigneeName || currentUserName || "Unknown";
                const assignedToName = row.assignedToName || currentUserName || "Unknown";
                const isSelfAssigned =
                  (row.assigneeId ? row.assigneeId === currentUserId : true) &&
                  (row.createdByUserId ? row.createdByUserId === currentUserId : true);

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.id}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      sx={{ paddingLeft: 2 }}
                    >
                      {row.taskName}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        width: "250px",
                        maxWidth: "250px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                      onDoubleClick={() =>
                        handleDescriptionDoubleClick(row.description)
                      }
                      title={row.description}
                    >
                      {row.description}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "100px" }}>
                      {row.priority}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "130px" }}>
                      <FormControl sx={{ minWidth: 120 }} size="small">
                        <Select
                          value={row.status || "To-Do"}
                          onChange={(e) => onStatusChange(row.id, e.target.value)}
                          size="small"
                          disabled={!canEditTask(row)}
                        >
                          <MenuItem value="To-Do">To-Do</MenuItem>
                          <MenuItem value="In-Progress">In-Progress</MenuItem>
                          <MenuItem value="Completed">Completed</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="center" sx={{ width: "140px" }}>
                      {dayjs(row.startDateTime).format("MMM-DD-YYYY")}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "140px" }}>
                      {dayjs(row.endDateTime).format("MMM-DD-YYYY")}
                    </TableCell>
                    <TableCell align="left" sx={{ width: "180px" }}>
                      {assigneeName}
                      {isSelfAssigned ? " (self)" : ""}
                    </TableCell>
                    {showAssignedTo && (
                      <TableCell align="left" sx={{ width: "180px" }}>
                        {assignedToName}
                      </TableCell>
                    )}
                    <TableCell align="center" sx={{ width: "80px" }}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, row)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={showAssignedTo ? 9 : 8} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={tasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog open={openDeleteDialog} onClose={handleClose}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent sx={{ paddingTop: 2 }}>
          <Typography>
            Are you sure you want to delete {taskToDelete?.taskName} ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (taskToDelete) {
                handleDeleteTask(taskToDelete.id);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit} disabled={selectedTask ? !canEditTask(selectedTask) : true}>
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          disabled={selectedTask ? !canDeleteTask(selectedTask) : true}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={descriptionDialog} onClose={() => setDescriptionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Full Description</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
            {selectedDescription}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDescriptionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

TaskTableContent.propTypes = {
  tasks: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  canDeleteTask: PropTypes.func.isRequired,
  canEditTask: PropTypes.func.isRequired,
  currentUserId: PropTypes.string,
  currentUserName: PropTypes.string,
  showAssignedTo: PropTypes.bool,
};

TaskTableContent.defaultProps = {
  showAssignedTo: false,
};

import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tabs,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import dayjs from "dayjs";
import TaskTableContent from "./TaskTableContent";
import { taskService } from "../../api/taskService";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export function AdminManagementSection({
  adminManagementTab,
  setAdminManagementTab,
  allUsersTaskSortBy,
  allUsersTaskSortOrder,
  handleAllUsersTaskSort,
  allUsersTasks,
  paginatedAllUsersTasks,
  taskOwnerMap,
  setDescriptionTaskSelected,
  setDescriptionDialogOpen,
  handleAllUsersTaskMenuOpen,
  allUsersTaskRowsPerPage,
  allUsersTaskPage,
  setAllUsersTaskPage,
  setAllUsersTaskRowsPerPage,
  usersError,
  setAddUserDialogOpen,
  usersSortOrder,
  handleUsersSort,
  paginatedUsers,
  currentUser,
  handleUserMenuOpen,
  usersLength,
  usersRowsPerPage,
  usersPage,
  setUsersPage,
  setUsersRowsPerPage,
}) {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Admin Portal
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={adminManagementTab} onChange={(_, value) => setAdminManagementTab(value)}>
          <Tab label="All Users Tasks" />
          <Tab label="User Management" />
        </Tabs>
      </Box>

      {adminManagementTab === 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={allUsersTaskSortBy === "ownerName"}
                      direction={allUsersTaskSortBy === "ownerName" ? allUsersTaskSortOrder : "asc"}
                      onClick={() => handleAllUsersTaskSort("ownerName")}
                    >
                      User
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={allUsersTaskSortBy === "taskName"}
                      direction={allUsersTaskSortBy === "taskName" ? allUsersTaskSortOrder : "asc"}
                      onClick={() => handleAllUsersTaskSort("taskName")}
                    >
                      Task Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Assignee</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={allUsersTaskSortBy === "startDateTime"}
                      direction={allUsersTaskSortBy === "startDateTime" ? allUsersTaskSortOrder : "asc"}
                      onClick={() => handleAllUsersTaskSort("startDateTime")}
                    >
                      Start Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={allUsersTaskSortBy === "endDateTime"}
                      direction={allUsersTaskSortBy === "endDateTime" ? allUsersTaskSortOrder : "asc"}
                      onClick={() => handleAllUsersTaskSort("endDateTime")}
                    >
                      End Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>File</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allUsersTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11}>No tasks available for any user.</TableCell>
                  </TableRow>
                ) : (
                  paginatedAllUsersTasks.map((task) => (
                    <TableRow key={`${task.ownerId}-${task.id}`}>
                      <TableCell>{task.ownerName || taskOwnerMap[task.ownerId] || "Unknown User"}</TableCell>
                      <TableCell>{task.taskName}</TableCell>
                      <TableCell
                        onDoubleClick={() => {
                          setDescriptionTaskSelected(task);
                          setDescriptionDialogOpen(true);
                        }}
                        sx={{
                          cursor: "pointer",
                          maxWidth: "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title="Double-click to view full description"
                      >
                        {task.description ? task.description.substring(0, 50) + "..." : "-"}
                      </TableCell>
                      <TableCell>{task.assigneeName || "-"}</TableCell>
                      <TableCell>{task.assignedToName || "-"}</TableCell>
                      <TableCell>{task.status}</TableCell>
                      <TableCell>{task.priority}</TableCell>
                      <TableCell>
                        {task.startDateTime ? dayjs(task.startDateTime).format("MMM-DD-YYYY") : "-"}
                      </TableCell>
                      <TableCell>
                        {task.endDateTime ? dayjs(task.endDateTime).format("MMM-DD-YYYY") : "-"}
                      </TableCell>
                      <TableCell>
                        {task.files && task.files.length > 0 ? (
                          <Button
                            size="small"
                            startIcon={<FileDownloadIcon />}
                            onClick={() =>
                              taskService.downloadFile(task.files[0].id, task.files[0].originalName)
                            }
                          >
                            Download
                          </Button>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            No file
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(event) => handleAllUsersTaskMenuOpen(event, task)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={allUsersTasks.length}
            rowsPerPage={allUsersTaskRowsPerPage}
            page={allUsersTaskPage}
            onPageChange={(_, newPage) => setAllUsersTaskPage(newPage)}
            onRowsPerPageChange={(event) => {
              setAllUsersTaskRowsPerPage(parseInt(event.target.value, 10));
              setAllUsersTaskPage(0);
            }}
          />
        </Paper>
      )}

      {adminManagementTab === 1 && (
        <Box>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" onClick={() => setAddUserDialogOpen(true)}>
              Add User
            </Button>
          </Box>

          {usersError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {usersError}
            </Alert>
          )}

          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel active direction={usersSortOrder} onClick={handleUsersSort}>
                        Full Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role || "user"}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(event) => handleUserMenuOpen(event, user)}
                          disabled={user.id === currentUser.id || user.role === "admin"}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={usersLength}
              rowsPerPage={usersRowsPerPage}
              page={usersPage}
              onPageChange={(_, newPage) => setUsersPage(newPage)}
              onRowsPerPageChange={(event) => {
                setUsersRowsPerPage(parseInt(event.target.value, 10));
                setUsersPage(0);
              }}
            />
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export function AdminTasksSection({
  adminTaskTab,
  setAdminTaskTab,
  adminTodoTasks,
  adminInProgressTasks,
  adminCompletedTasks,
  handleAdminTaskDelete,
  handleAdminTaskStatusChange,
  handleAdminTaskEditOpen,
  currentUser,
}) {
  const currentUserName = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Admin Tasks
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={adminTaskTab}
          onChange={(_, newValue) => setAdminTaskTab(newValue)}
          aria-label="admin task status tabs"
        >
          <Tab label={`To-Do (${adminTodoTasks.length})`} />
          <Tab label={`In-Progress (${adminInProgressTasks.length})`} />
          <Tab label={`Completed (${adminCompletedTasks.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={adminTaskTab} index={0}>
        {adminTodoTasks.length === 0 ? (
          <Typography variant="body1" color="textSecondary">
            No To-Do admin tasks yet.
          </Typography>
        ) : (
          <TaskTableContent
            tasks={adminTodoTasks}
            onDelete={handleAdminTaskDelete}
            onStatusChange={handleAdminTaskStatusChange}
            onEdit={handleAdminTaskEditOpen}
            canDeleteTask={() => true}
            canEditTask={() => true}
            currentUserId={currentUser.id}
            currentUserName={currentUserName}
            showAssignedTo
          />
        )}
      </TabPanel>

      <TabPanel value={adminTaskTab} index={1}>
        {adminInProgressTasks.length === 0 ? (
          <Typography variant="body1" color="textSecondary">
            No admin tasks in progress.
          </Typography>
        ) : (
          <TaskTableContent
            tasks={adminInProgressTasks}
            onDelete={handleAdminTaskDelete}
            onStatusChange={handleAdminTaskStatusChange}
            onEdit={handleAdminTaskEditOpen}
            canDeleteTask={() => true}
            canEditTask={() => true}
            currentUserId={currentUser.id}
            currentUserName={currentUserName}
            showAssignedTo
          />
        )}
      </TabPanel>

      <TabPanel value={adminTaskTab} index={2}>
        {adminCompletedTasks.length === 0 ? (
          <Typography variant="body1" color="textSecondary">
            No completed admin tasks yet.
          </Typography>
        ) : (
          <TaskTableContent
            tasks={adminCompletedTasks}
            onDelete={handleAdminTaskDelete}
            onStatusChange={handleAdminTaskStatusChange}
            onEdit={handleAdminTaskEditOpen}
            canDeleteTask={() => true}
            canEditTask={() => true}
            currentUserId={currentUser.id}
            currentUserName={currentUserName}
            showAssignedTo
          />
        )}
      </TabPanel>
    </Box>
  );
}

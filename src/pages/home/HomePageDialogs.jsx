import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

export default function HomePageDialogs({
  addUserDialogOpen,
  setAddUserDialogOpen,
  resetNewUserForm,
  addUserError,
  newUser,
  setNewUser,
  handleAddUser,
  userMenuAnchor,
  handleUserMenuClose,
  handleEditUserOpen,
  handleDeleteUserFromMenu,
  allUsersTaskMenuAnchor,
  handleAllUsersTaskMenuClose,
  handleAllUsersTaskMenuEdit,
  handleAllUsersTaskMenuDelete,
  editUserDialogOpen,
  setEditUserDialogOpen,
  setEditingUser,
  setEditUserError,
  editUserError,
  editingUser,
  handleEditUserSave,
  deleteUserConfirmOpen,
  setDeleteUserConfirmOpen,
  setUserToDelete,
  userToDelete,
  handleConfirmDeleteUser,
  descriptionDialogOpen,
  setDescriptionDialogOpen,
  setDescriptionTaskSelected,
  descriptionTaskSelected,
  adminTaskDeleteConfirmOpen,
  setAdminTaskDeleteConfirmOpen,
  setAdminTaskToDelete,
  adminTaskToDelete,
  handleConfirmAllUsersTaskDelete,
}) {
  return (
    <>
      <Dialog
        open={addUserDialogOpen}
        onClose={() => {
          setAddUserDialogOpen(false);
          resetNewUserForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {addUserError && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="error">{addUserError}</Alert>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                value={newUser.firstName}
                onChange={(e) => setNewUser((prev) => ({ ...prev, firstName: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                value={newUser.lastName}
                onChange={(e) => setNewUser((prev) => ({ ...prev, lastName: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddUserDialogOpen(false);
              resetNewUserForm();
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddUser}>
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={handleUserMenuClose}>
        <MenuItem onClick={handleEditUserOpen}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteUserFromMenu}>Delete</MenuItem>
      </Menu>

      <Menu
        anchorEl={allUsersTaskMenuAnchor}
        open={Boolean(allUsersTaskMenuAnchor)}
        onClose={handleAllUsersTaskMenuClose}
      >
        <MenuItem onClick={handleAllUsersTaskMenuEdit}>Edit</MenuItem>
        <MenuItem onClick={handleAllUsersTaskMenuDelete}>Delete</MenuItem>
      </Menu>

      <Dialog
        open={editUserDialogOpen}
        onClose={() => {
          setEditUserDialogOpen(false);
          setEditingUser(null);
          setEditUserError("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {editUserError && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="error">{editUserError}</Alert>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                value={editingUser?.firstName || ""}
                onChange={(e) => setEditingUser((prev) => ({ ...prev, firstName: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                value={editingUser?.lastName || ""}
                onChange={(e) => setEditingUser((prev) => ({ ...prev, lastName: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editingUser?.email || ""}
                onChange={(e) => setEditingUser((prev) => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label="Role"
                value={editingUser?.role || "user"}
                onChange={(e) => setEditingUser((prev) => ({ ...prev, role: e.target.value }))}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditUserDialogOpen(false);
              setEditingUser(null);
              setEditUserError("");
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleEditUserSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteUserConfirmOpen}
        onClose={() => {
          setDeleteUserConfirmOpen(false);
          setUserToDelete(null);
        }}
      >
        <DialogTitle>Confirm Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
          </Typography>
          <Typography sx={{ mt: 2, color: "error.main", fontSize: "0.9rem" }}>
            This action will also delete all tasks created by this user.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteUserConfirmOpen(false);
              setUserToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDeleteUser}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={descriptionDialogOpen}
        onClose={() => {
          setDescriptionDialogOpen(false);
          setDescriptionTaskSelected(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Task Description</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            <strong>{descriptionTaskSelected?.taskName}</strong>
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {descriptionTaskSelected?.description || "No description provided"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDescriptionDialogOpen(false);
              setDescriptionTaskSelected(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={adminTaskDeleteConfirmOpen}
        onClose={() => {
          setAdminTaskDeleteConfirmOpen(false);
          setAdminTaskToDelete(null);
        }}
      >
        <DialogTitle>Confirm Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{adminTaskToDelete?.taskName}</strong>?
          </Typography>
          <Typography sx={{ mt: 2, color: "error.main", fontSize: "0.9rem" }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAdminTaskDeleteConfirmOpen(false);
              setAdminTaskToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmAllUsersTaskDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

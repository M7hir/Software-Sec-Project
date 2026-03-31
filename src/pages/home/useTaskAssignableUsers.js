import { useEffect, useMemo, useState } from "react";
import { userService } from "../../api/userService";
import { buildCurrentUserData, buildUserLabelMap } from "./taskFormUtils";

export function useTaskAssignableUsers({ open, user, enabled = true }) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!open || !enabled || !user?.id) {
      return;
    }

    const currentUserData = buildCurrentUserData(user);

    if (!isAdmin) {
      setUsers([currentUserData]);
      return;
    }

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await userService.getUsers(100, 0);
        const fetchedUsers = response?.users || [];
        const userExists = fetchedUsers.some((item) => item.id === user.id);
        setUsers(userExists ? fetchedUsers : [currentUserData, ...fetchedUsers]);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error fetching users:", error);
        }
        setUsers([currentUserData]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [open, enabled, isAdmin, user]);

  const userLabelMap = useMemo(() => buildUserLabelMap(users), [users]);
  const userOptions = useMemo(() => Object.keys(userLabelMap).map(String), [userLabelMap]);

  const fallbackUserOptions = user?.id ? [String(user.id)] : [];
  const assigneeOptions = isAdmin ? userOptions : fallbackUserOptions;
  const assignedToOptions = isAdmin ? userOptions : fallbackUserOptions;

  return {
    users,
    loadingUsers,
    userLabelMap,
    assigneeOptions,
    assignedToOptions,
  };
}

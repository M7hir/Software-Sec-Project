export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

export const ALLOWED_FILE_EXTENSIONS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const normalizeUser = (apiUser) => ({
  id: Number(apiUser.id),
  firstName: apiUser.firstName || apiUser.first_name || "",
  lastName: apiUser.lastName || apiUser.last_name || "",
  email: apiUser.email,
});

export const buildCurrentUserData = (user) => ({
  id: user.id,
  firstName: user.firstName ? String(user.firstName).trim() : "",
  lastName: user.lastName ? String(user.lastName).trim() : "",
  email: user.email || "unknown@example.com",
  role: user.role || "user",
});

export const buildUserLabelMap = (users) => {
  const userLabelMap = {};

  users.forEach((item) => {
    const stringId = String(Number(item.id));
    const firstName = item.firstName || item.first_name || "";
    const lastName = item.lastName || item.last_name || "";
    const displayName = `${firstName} ${lastName}`.trim();
    const label = displayName ? `${displayName} (${item.email})` : item.email;
    userLabelMap[stringId] = label;
  });

  return userLabelMap;
};

export const validateTaskFile = (file) => {
  if (!file) {
    return "";
  }

  const dotIndex = file.name.lastIndexOf(".");
  const fileExtension = dotIndex >= 0 ? file.name.substring(dotIndex).toLowerCase() : "";

  if (!ALLOWED_FILE_TYPES.includes(file.type) || !ALLOWED_FILE_EXTENSIONS.includes(fileExtension)) {
    return "Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG are allowed.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File size exceeds 5MB limit.";
  }

  return "";
};

export const getSelectedTaskUsers = (users, assigneeId, assignedToId) => {
  const numericAssigneeId = Number(assigneeId);
  const numericAssignedToId = Number(assignedToId);

  const selectedAssignee = users.find((item) => Number(item.id) === numericAssigneeId);
  const assigneeData = selectedAssignee ? normalizeUser(selectedAssignee) : null;

  const selectedAssignedTo = users.find((item) => Number(item.id) === numericAssignedToId);
  const assignedToData = selectedAssignedTo ? normalizeUser(selectedAssignedTo) : null;

  return { assigneeData, assignedToData };
};

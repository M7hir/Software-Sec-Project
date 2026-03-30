# Frontend - Task Management System

A modern React + Redux Toolkit frontend for a task management application with authentication, file uploads, and admin dashboard.

## Tech Stack

- **Framework**: React 18+
- **State Management**: Redux Toolkit
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **HTTP Client**: Axios with JWT interceptors
- **Form Validation**: Yes (zod/yup patterns)
- **Date/Time**: MUI DateTimePicker
- **CSS**: MUI styled components
- **Language**: JSX/JavaScript (TypeScript components available)

## Prerequisites

- Node.js v14 or higher
- npm or yarn package manager
- Backend server running on `http://localhost:5000`
- `.env` file configured (see Environment Setup)

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Environment Configuration

Create a `.env` file in the frontend root directory:

```env
# API
VITE_API_URL=http://localhost:5000/api

# App
VITE_APP_NAME=Task Management System
VITE_APP_VERSION=1.0.0
```

### 3. Start Development Server

```bash
# With auto-reload
npm run dev
# or
yarn dev
```

Frontend runs on `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
# or
yarn build
```

## Project Structure

```
src/
├── api/
│   ├── apiClient.js        # Axios instance with JWT interceptors
│   ├── authService.js      # Authentication API calls
│   ├── taskService.js      # Task CRUD API calls
│   └── userService.js      # User management API calls
├── Components/             # Reusable UI components
│   ├── Fields.tsx          # Form field component
│   ├── index.tsx           # Component exports
│   ├── InputAutoComplete.jsx    # Auto-complete input
│   ├── InputDateAndTimePicker.jsx
│   ├── InputPasswordField.jsx
│   └── InputTextField.jsx
├── hooks/
│   └── useAuthContext.js   # Auth context hook
├── pages/
│   ├── auth/               # Authentication pages
│   │   ├── Auth.jsx        # Auth layout
│   │   ├── Login.jsx       # Login page
│   │   ├── SignUp.jsx      # Signup page
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── VerifyEmail.jsx
│   │   ├── authSlice.jsx   # Redux auth state
│   │   ├── authValidationSchemas.js
│   │   ├── routes.jsx      # Auth routes
│   │   └── hooks/          # Auth-specific hooks
│   └── home/               # Main app pages
│       ├── HomePage.jsx    # Main dashboard page
│       ├── CreateTask.jsx  # Create task dialog
│       ├── EditTask.jsx    # Edit task dialog
│       ├── TaskTable.jsx   # Task display table
│       ├── TaskTableContent.jsx
│       ├── index.js        # Home exports
│       └── taskSlice.jsx   # Redux task state
├── routes/
│   ├── auth-guard.jsx      # Route protection
│   ├── ProtectedRoute.jsx  # Protected route wrapper
│   ├── routes.jsx          # Route definitions
│   ├── index.jsx           # Routes setup
│   └── hooks/
│       └── useAuth.js      # Auth hook for routes
├── store/
│   └── store.js            # Redux store configuration
├── App.jsx                 # Root component
├── main.jsx                # Entry point
└── index.css               # Global styles

public/
├── index.html              # HTML template
└── ...static files
```

## Authentication Flow

### Login/Signup

1. User enters credentials
2. Frontend validates input
3. API request to backend
4. Backend returns access & refresh tokens
5. **Access Token** (15 min): Stored in memory (request headers)
6. **Refresh Token** (7 days): Stored in `sessionStorage`
7. Redux state updated
8. User redirected to dashboard

### Token Refresh

1. Access token expires (15 minutes)
2. Axios interceptor catches 401 response
3. Automatically calls `/api/auth/refresh-token`
4. New access token returned
5. Original request retried with new token
6. Seamless user experience (no logout)

### Page Refresh

1. User refreshes page (F5)
2. `App.jsx` calls `setTasks()` action
3. Tasks fetched from backend (requires valid token)
4. Refresh token auto-validates in sessionStorage
5. User stays logged in
6. Tasks restored to Redux state

### Logout

1. User clicks logout button
2. API call to `/api/auth/logout`
3. Tokens removed from storage
4. Redux state cleared
5. User redirected to login page

## State Management (Redux Toolkit)

### Auth State (`authSlice.jsx`)

```javascript
{
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null,
  user: {
    id: number,
    email: string,
    firstName: string,
    lastName: string,
    role: 'user' | 'admin'
  },
  tokens: {
    accessToken: string | null,
    refreshToken: string | null
  }
}
```

### Tasks State (`taskSlice.jsx`)

```javascript
{
  tasks: {
    [userId]: {
      tasks: [
        {
          id: number,
          taskName: string,
          description: string,
          status: 'To-Do' | 'In-Progress' | 'Completed',
          priority: 'Low' | 'Medium' | 'High',
          assigneeId: number,
          assigneeName: string,
          assignedToId: number,
          assignedToName: string,
          createdByUserId: number,
          startDateTime: string,
          endDateTime: string,
          files: File[]
        }
      ]
    }
  },
  loading: boolean,
  error: string | null
}
```

## Key Features

### 1. Task Management

**Create Task**
- Dialog form with validation
- Assign to 1-2 users
- Set priority (Low/Medium/High)
- Optional dates/times
- File upload (1 per task)

**Edit Task**
- Update all fields
- Change assignees
- Update status (if authorized)
- Replace file

**Delete Task**
- Confirmation dialog
- Creator/Admin only

**View Tasks**
- Personal tasks (creator/assignee/assigned_to)
- Admin can view all tasks
- Pagination support
- Status filtering

### 2. File Management

**Upload**
- Supported: PDF, DOC, DOCX, JPG, JPEG, PNG
- Max size: 5 MB
- 1 file per task (auto-replace old)
- Progress indication

**Download**
- Only authorized users
- File naming preserved
- Server-side verification

### 3. Admin Portal

**User Management**
- View all users (paginated)
- Create new user (email, password, role)
- Edit user details
- Delete user (with confirmation)
- Prevent self-deletion/admin deletion

**Task Management (All Users Tasks)**
- View all system tasks
- 11 columns: User, Task Name, Description, Assignee, Assigned To, Status, Priority, Start Date, End Date, File, Actions
- Double-click to expand description
- Edit/delete/change status
- Kebab menu with actions
- Admin has full control

### 4. Authentication Pages

**Login**
- Email/password validation
- "Remember me" option
- Forgot password link
- Error messages

**Sign Up**
- Full name (first + last)
- Email validation
- Strong password requirements
- Auto-login after signup
- Email verification flow

**Forgot Password**
- Email-based reset link
- Token validation
- New password setup

**Verify Email**
- Token-based verification
- Resend verification email
- Auto-redirect on verify

## Component Architecture

### Pages

**Auth Pages** (`pages/auth/`)
- Form validation with zod schemas
- Error handling
- Responsive design

**Home Pages** (`pages/home/`)
- `HomePage.jsx` - Main dashboard with tabs
- `CreateTask.jsx` - Task creation dialog
- `EditTask.jsx` - Task editing dialog
- `TaskTable.jsx` - Task list display

### Reusable Components (`Components/`)

```javascript
<InputTextField />        // Text input
<InputPasswordField />    // Password input
<InputDateAndTimePicker />  // Date/time selection
<InputAutoComplete />     // Autocomplete dropdown
<Fields />               // Field wrapper component
```

## Styling

- **Theme**: MUI theme configuration
- **Components**: Styled Material-UI components
- **Responsive**: Mobile-first design
- **Layout**: Flexbox & CSS Grid

## API Integration

### API Client Setup

```javascript
// src/api/apiClient.js
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Interceptor: Add access token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Handle 401 & refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Auto-refresh token
      const refreshToken = sessionStorage.getItem('refreshToken');
      // Call refresh endpoint
      // Retry original request
    }
    return Promise.reject(error);
  }
);
```

### Service Functions

```javascript
// src/api/authService.js
login(email, password)
signup(firstName, lastName, email, password)
logout()
refreshToken()
verifyEmail(token)
forgotPassword(email)
resetPassword(token, newPassword)

// src/api/taskService.js
getTasks(limit, offset)
createTask(taskData)
updateTask(id, taskData)
deleteTask(id)
updateTaskStatus(id, status)

// src/api/userService.js
getUsers(limit, offset)
createUser(userData)
updateUser(id, userData)
deleteUser(id)

// File upload (in taskService)
uploadFile(taskId, file)
downloadFile(fileId)
```

## Form Validation

### Auth Forms

```javascript
// Sign Up Validation
- Email: valid format, unique
- Password: 8+ chars, uppercase, lowercase, number, special char
- First Name: required, max 50 chars
- Last Name: required, max 50 chars
- Role: user or admin

// Login Validation
- Email: valid format
- Password: required

// Reset Password
- New Password: same as signup rules
- Confirm Password: must match
```

### Task Forms

```javascript
// Create/Edit Task
- Task Name: required, max 255 chars
- Description: optional, escaped
- Assignee: required (valid user ID)
- Assigned To: required (valid user ID)
- Priority: Low/Medium/High
- Status: To-Do/In-Progress/Completed
- Dates: optional, ISO8601 format, endDate > startDate
```

## Session Management

### Storage Strategy

```javascript
// Access Token (15 min)
- Storage: Memory (variable in JS)
- Location: Request headers (Authorization: Bearer)
- Auto-refresh on 401
- NOT persisted (logout on page refresh if expired)

// Refresh Token (7 days)
- Storage: sessionStorage
- Used to: Get new access tokens
- Persists: Until browser window closes OR manual logout
- Page refresh: Automatically validates/restores

// Redux State
- Storage: Memory
- Persists: Via sessionStorage action
- Page refresh: Automatically restored
```

### Auth State Persistence

```javascript
// On App Load (App.jsx)
1. Check sessionStorage for refreshToken
2. If exists, dispatch setTasks() to verify
3. If backend returns 401, clear auth state
4. If valid, restore tasks & stay logged in
5. If no refreshToken, redirect to login
```

## User Flows

### New User Signup

```
SignUp Page → Validate Form → API Call
→ Tokens Created → Redux Updated → HomePage
→ Tasks Loaded → Dashboard Displayed
```

### Existing User Login

```
Login Page → Validate Credentials → API Call
→ Tokens Created → Access Token Stored
→ Refresh Token in sessionStorage → Redux Updated
→ HomePage → Tasks Loaded
```

### Task Lifecycle

```
Create → Assigned Users Notified (backend)
→ Tasks Added to Redux → Display in Table
→ Edit → Update Backend → Redux Updated
→ View/Download File → Check Authorization
→ Delete → Confirmation → Backend Delete → Redux Updated
```

### Admin User Management

```
Admin Portal → View All Users
→ Can Create/Edit/Delete Users
→ Can Manage Permissions/Roles
→ All Actions Logged on Backend
```

## Common Tasks

### Add New Page

1. Create component in `pages/`
2. Define route in `routes/routes.jsx`
3. Add to navigation
4. Protect with `ProtectedRoute` if needed

### Add New API Call

1. Create function in `api/apiService.js`
2. Export from service
3. Import in component
4. Call in event handler or useEffect

### Update Redux State

```javascript
import { useDispatch, useSelector } from 'react-redux';

const dispatch = useDispatch();
const tasks = useSelector((state) => state.tasks);

// Update state
dispatch(updateTask({ id: 1, status: 'Completed' }));
```

### Add Form Validation

```javascript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 chars')
});

const result = schema.safeParse(formData);
if (!result.success) {
  // Handle errors
}
```

## Debugging

### Browser DevTools

- **Redux DevTools**: Time-travel debugging, state inspection
- **Network Tab**: Monitor API calls, responses, headers
- **Console**: Check for errors, logs
- **Local Storage/Session Storage**: Check token storage

### Console Logs

```javascript
// Check Redux state
console.log(store.getState());

// Check API responses
console.log(response.data);

// Check tokens
console.log(sessionStorage.getItem('refreshToken'));
```

### Common Issues

**Blank Page After Login**
- Check: VITE_API_URL in .env
- Check: Redux state in DevTools
- Check: Network tab for API errors

**401 Errors Every Request**
- Check: sessionStorage has refreshToken
- Check: Backend JWT_SECRET matches
- Check: Token not expired

**File Upload Failing**
- Check: File size < 5 MB
- Check: File type is allowed
- Check: storage/uploads/ directory exists on backend

**Tasks Not Loading**
- Check: User is assigned to tasks
- Check: Backend /api/tasks endpoint
- Check: Access token valid

## Performance Tips

- Use React DevTools Profiler to identify slow renders
- Memoize expensive components with `React.memo()`
- Lazy-load pages with `React.lazy()` + `Suspense`
- Implement pagination for large task lists
- Cache API responses in Redux

## Environment Variables Reference

| Variable | Type | Required | Example |
|----------|------|----------|---------|
| VITE_API_URL | string | Yes | http://localhost:5000/api |
| VITE_APP_NAME | string | No | Task Management |
| VITE_APP_VERSION | string | No | 1.0.0 |

## Security Best Practices

✅ **Token Handling**
- Never store access tokens in localStorage
- Refresh tokens expire (7 days)
- Auto-refresh on 401 errors
- Clear tokens on logout

✅ **Input Validation**
- All forms validated client-side
- Server validates again server-side
- XSS prevention through React escaping
- File type validation

✅ **API Communication**
- JWT bearer token in headers
- HTTPS in production
- CORS configured on backend
- Content-Type headers set

✅ **State Management**
- No sensitive data in Redux (except user ID/email)
- Tokens never logged to console
- Passwords never stored anywhere

## Testing

### Unit Tests

```bash
npm run test
```

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] Signup creates new account
- [ ] Page refresh keeps user logged in
- [ ] Create task with all fields
- [ ] Edit task updates correctly
- [ ] Delete task removes from list
- [ ] Upload file to task
- [ ] Download file
- [ ] Admin can view all users
- [ ] Admin can create/edit/delete users
- [ ] Non-admin cannot access admin features
- [ ] Logout clears all data
- [ ] Token refresh happens automatically

## Deployment Checklist

- [ ] Update `VITE_API_URL` to production backend
- [ ] Run `npm run build`
- [ ] Test build output
- [ ] Deploy `dist/` folder to web server
- [ ] Verify CORS on backend
- [ ] Test all flows in production
- [ ] Monitor browser console for errors
- [ ] Set up error tracking (Sentry)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Support

For issues or questions:
1. Check Redux DevTools for state
2. Check Network tab for API responses
3. Review console for errors
4. Check backend logs
5. Verify .env configuration

## License

Internal use only. CS-6417 Software Security Project.

import { createSlice } from "@reduxjs/toolkit";

const taskSlice = createSlice({
    name : "tasks",
    initialState : {},
    reducers: {
        addTask : (state,action) => {
            const { userId, task } = action.payload;
            if (!state[userId]) {
                state[userId] = { tasks: [] };
            }
            state[userId].tasks.push(task);
        },
        editTask : (state,action) => {
            const { userId, task } = action.payload;
            if (state[userId]) {
                const taskIndex = state[userId].tasks.findIndex(t => t.id === task.id);
                if (taskIndex !== -1) {
                    state[userId].tasks[taskIndex] = task;
                }
            }
        },
        removeTask: (state,action) => {
            const { userId, taskId } = action.payload;
            if (state[userId]) {
                state[userId].tasks = state[userId].tasks.filter(task => task.id !== taskId);
            }
        },
        removeUserTasks: (state, action) => {
            const { userId } = action.payload;
            if (state[userId]) {
                delete state[userId];
            }
        },
        removeTasksCreatedByUser: (state, action) => {
            const { creatorUserId } = action.payload;

            Object.keys(state).forEach((userId) => {
                if (state[userId]?.tasks) {
                    state[userId].tasks = state[userId].tasks.filter(
                        (task) => task.createdByUserId !== creatorUserId
                    );
                }
            });
        },
        editTaskAcrossUsers: (state, action) => {
            const { taskId, task } = action.payload;

            Object.keys(state).forEach((userId) => {
                if (state[userId]?.tasks) {
                    const taskIndex = state[userId].tasks.findIndex((t) => t.id === taskId);
                    if (taskIndex !== -1) {
                        state[userId].tasks[taskIndex] = {
                            ...state[userId].tasks[taskIndex],
                            ...task,
                        };
                    }
                }
            });
        },
        removeTaskAcrossUsers: (state, action) => {
            const { taskId } = action.payload;

            Object.keys(state).forEach((userId) => {
                if (state[userId]?.tasks) {
                    state[userId].tasks = state[userId].tasks.filter((task) => task.id !== taskId);
                }
            });
        }
    }
})

export const {
    addTask,
    editTask,
    removeTask,
    removeUserTasks,
    removeTasksCreatedByUser,
    editTaskAcrossUsers,
    removeTaskAcrossUsers,
} = taskSlice.actions;

export const tasksReducer = taskSlice.reducer;
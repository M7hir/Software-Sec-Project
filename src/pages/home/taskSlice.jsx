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
        }
    }
})

export const {addTask, editTask, removeTask} = taskSlice.actions;

export const tasksReducer = taskSlice.reducer;
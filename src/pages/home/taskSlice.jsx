import { createSlice } from "@reduxjs/toolkit";

const taskSlice = createSlice({
    name : "tasks",
    initialState : {
        tasks:[]
    },
    reducers: {
        addTask : (state,action) => {
            state.tasks.push(action.payload);
        },
        editTask : (state,action) => {
            const taskIndex = state.tasks.findIndex(task => task.id === action.payload.id);
            state.tasks[taskIndex] = action.payload;
        },
        removeTask: (state,action) => {
            state.tasks = state.tasks.filter(task => task.id !== action.payload)
        }
    }
})

export const {addTask,removeTask} = taskSlice.actions;

export const tasksReducer = taskSlice.reducer;
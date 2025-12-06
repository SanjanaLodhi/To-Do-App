// src/features/todos/todosSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const todosCollection = collection(db, "todos");

// Thunks
export const fetchTodos = createAsyncThunk("todos/fetchTodos", async () => {
  const snapshot = await getDocs(todosCollection);
  const todos = [];
  snapshot.forEach((docSnap) => {
    todos.push({ id: docSnap.id, ...docSnap.data() });
  });
  return todos;
});

export const addTodo = createAsyncThunk(
  "todos/addTodo",
  async (text, { rejectWithValue }) => {
    if (!text.trim()) return rejectWithValue("Empty todo");
    const docRef = await addDoc(todosCollection, {
      text,
      completed: false,
      createdAt: Date.now(),
    });
    return { id: docRef.id, text, completed: false, createdAt: Date.now() };
  }
);

export const toggleTodo = createAsyncThunk(
  "todos/toggleTodo",
  async (todo, { rejectWithValue }) => {
    try {
      const todoRef = doc(db, "todos", todo.id);
      await updateDoc(todoRef, { completed: !todo.completed });
      return { ...todo, completed: !todo.completed };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteTodo = createAsyncThunk(
  "todos/deleteTodo",
  async (id, { rejectWithValue }) => {
    try {
      const todoRef = doc(db, "todos", id);
      await deleteDoc(todoRef);
      return id;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const todosSlice = createSlice({
  name: "todos",
  initialState: {
    items: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    filter: "all", // 'all' | 'active' | 'completed'
  },
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload; // 'all' | 'active' | 'completed'
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchTodos.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.sort((a, b) => b.createdAt - a.createdAt);
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // add
      .addCase(addTodo.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // toggle
      .addCase(toggleTodo.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      // delete
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export const { setFilter } = todosSlice.actions;
export default todosSlice.reducer;

// src/App.js
import React, { useState, useEffect, useRef } from "react";
import {
  addTodoFirestore,
  updateTodoFirestore,
  deleteTodoFirestore,
  subscribeTodos,
  ensureAnonymousAuth
} from "./firebase";
import "./index.css";

/* ---------------------- TodoInput ---------------------- */
function TodoInput({ onAdd }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    onAdd(text);
    setValue("");
  };

  return (
    <form className="todo-input" onSubmit={submit}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Add a new task..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  );
}

/* ---------------------- TodoItem ---------------------- */
function TodoItem({ task, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(task.text);
  const editRef = useRef(null);

  useEffect(() => {
    if (editing) editRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    setText(task.text);
  }, [task.text]);

  const save = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      await onDelete(task.id);
    } else {
      await onEdit(task.id, trimmed);
    }
    setEditing(false);
  };

  const onKey = (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") {
      setText(task.text);
      setEditing(false);
    }
  };

  return (
    <li className={`todo-item ${task.completed ? "completed" : ""}`}>
      <label className="left">
        <input
          type="checkbox"
          checked={!!task.completed}
          onChange={() => onToggle(task.id, !task.completed)}
        />
      </label>

      {!editing ? (
        <div className="middle" onDoubleClick={() => setEditing(true)}>
          <span>{task.text}</span>
        </div>
      ) : (
        <div className="middle">
          <input
            ref={editRef}
            className="edit-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            onBlur={save}
          />
        </div>
      )}

      <div className="right">
        <button className="edit" onClick={() => setEditing(true)}>Edit</button>
        <button className="delete" onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </li>
  );
}

/* ---------------------- TodoList ---------------------- */
function TodoList({ tasks, onToggle, onDelete, onEdit }) {
  if (!tasks.length) return <p className="empty">No tasks — add one above.</p>;
  return (
    <ul className="todo-list">
      {tasks.map((t) => (
        <TodoItem key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </ul>
  );
}

/* ---------------------- App (root) ---------------------- */
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure auth (optional) and subscribe to Firestore todos
    let unsub = () => {};
    (async () => {
      try {
        await ensureAnonymousAuth(); // safe to call even if already signed in
      } catch (e) {
        console.warn("Auth error", e);
      }

      try {
        unsub = subscribeTodos((items) => {
          // items is an array of { id, ...data }
          setTasks(items);
          setLoading(false);
        });
      } catch (e) {
        console.error("Subscribe failed", e);
        setLoading(false);
      }
    })();

    return () => {
      try {
        unsub();
      } catch {}
    };
  }, []);

  // Add a new task (writes to Firestore)
  // temporary test addTask - paste into App.js and wire to your TodoInput
const addTask = async (text) => {
  console.log("Trying to add task:", text);
  try {
    const docRef = await addTodoFirestore({
      text,
      completed: false,
      createdAt: Date.now()
    });
    console.log("Firestore add succeeded, doc id:", docRef.id);
  } catch (err) {
    console.error("Firestore add FAILED:", err);
    alert("Add failed: " + (err.message || err.code || JSON.stringify(err)));
  }
};


  // Toggle (mark complete/uncomplete)
  const toggleTask = async (id, completed) => {
    try {
      await updateTodoFirestore(id, { completed });
    } catch (e) {
      console.error("Toggle failed:", e);
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      await deleteTodoFirestore(id);
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  // Edit task text
  const editTask = async (id, newText) => {
    try {
      await updateTodoFirestore(id, { text: newText });
    } catch (e) {
      console.error("Edit failed:", e);
    }
  };

  // Clear completed tasks (sequential / parallel deletes)
  const clearCompleted = async () => {
    const completed = tasks.filter((t) => t.completed);
    if (completed.length === 0) return;
    try {
      await Promise.all(completed.map((t) => deleteTodoFirestore(t.id)));
    } catch (e) {
      console.error("Clear completed failed:", e);
    }
  };

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="app">
      <h1>React — Functional To-Do (Firestore)</h1>
      <TodoInput onAdd={addTask} />

      <div className="controls">
        <div className="filters">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
          <button className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>Active</button>
          <button className={filter === "completed" ? "active" : ""} onClick={() => setFilter("completed")}>Completed</button>
        </div>
        <button className="clear" onClick={clearCompleted}>Clear completed</button>
      </div>

      {loading ? <p className="empty">Loading tasks...</p> : <TodoList tasks={filtered} onToggle={toggleTask} onDelete={deleteTask} onEdit={editTask} />}

      <footer className="footer">
        <span>{tasks.filter((t) => !t.completed).length} items left</span>
      </footer>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";

const LOCAL_KEY = "react_todo_func.tasks";

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

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      onDelete(task.id);
    } else {
      onEdit(task.id, trimmed);
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
        <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} />
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

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) setTasks(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text) => {
    const newTask = { id: Date.now().toString(), text, completed: false };
    setTasks((s) => [newTask, ...s]);
  };

  const toggleTask = (id) =>
    setTasks((s) => s.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const deleteTask = (id) => setTasks((s) => s.filter((t) => t.id !== id));

  const editTask = (id, newText) => setTasks((s) => s.map((t) => (t.id === id ? { ...t, text: newText } : t)));

  const clearCompleted = () => setTasks((s) => s.filter((t) => !t.completed));

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="app">
      <h1>React — Functional To-Do</h1>
      <TodoInput onAdd={addTask} />

      <div className="controls">
        <div className="filters">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
          <button className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>Active</button>
          <button className={filter === "completed" ? "active" : ""} onClick={() => setFilter("completed")}>Completed</button>
        </div>
        <button className="clear" onClick={clearCompleted}>Clear completed</button>
      </div>

      <TodoList tasks={filtered} onToggle={toggleTask} onDelete={deleteTask} onEdit={editTask} />

      <footer className="footer">
        <span>{tasks.filter(t => !t.completed).length} items left</span>
      </footer>
    </div>
  );
}

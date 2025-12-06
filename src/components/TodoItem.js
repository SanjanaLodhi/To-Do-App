// src/components/TodoItem.js
import React from "react";
import { useDispatch } from "react-redux";
import { toggleTodo, deleteTodo } from "../features/todos/todosSlice";

export default function TodoItem({ todo }) {
  const dispatch = useDispatch();

  const handleToggle = () => {
    dispatch(toggleTodo(todo));
  };

  const handleDelete = () => {
    dispatch(deleteTodo(todo.id));
  };

  return (
    <li className="todo-item">
      <label>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
        />
        <span className={todo.completed ? "todo-text completed" : "todo-text"}>
          {todo.text}
        </span>
      </label>
      <button className="delete-btn" onClick={handleDelete}>
        ✕
      </button>
    </li>
  );
}

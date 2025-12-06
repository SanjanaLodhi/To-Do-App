// src/components/TodoList.js
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchTodos } from "../features/todos/todosSlice";
import TodoItem from "./TodoItem";

export default function TodoList() {
  const dispatch = useDispatch();
  const { items, status, error, filter } = useSelector((state) => state.todos);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTodos());
    }
  }, [dispatch, status]);

  const filteredItems = items.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true; // all
  });

  if (status === "loading") {
    return <div className="status-msg">Loading...</div>;
  }

  if (status === "failed") {
    return <div className="status-msg error">Error: {error}</div>;
  }

  if (filteredItems.length === 0) {
    return <div className="status-msg">No todos here. Add something 🎯</div>;
  }

  return (
    <ul className="todo-list">
      {filteredItems.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

// src/components/App.js
import React from "react";
import TodoInput from "./TodoInput";
import TodoList from "./TodoList";
import FilterBar from "./FilterBar";

export default function App() {
  return (
    <div className="app">
      <div className="todo-card">
        <h1 className="app-title">Redux + Firebase Todo</h1>
        <TodoInput />
        <FilterBar />
        <TodoList />
      </div>
    </div>
  );
}

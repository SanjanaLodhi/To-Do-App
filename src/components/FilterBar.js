// src/components/FilterBar.js
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFilter } from "../features/todos/todosSlice";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

export default function FilterBar() {
  const dispatch = useDispatch();
  const activeFilter = useSelector((state) => state.todos.filter);
  const items = useSelector((state) => state.todos.items);

  const remaining = items.filter((t) => !t.completed).length;

  return (
    <div className="filter-bar">
      <div className="filter-buttons">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={
              "filter-btn" +
              (activeFilter === f.id ? " filter-btn--active" : "")
            }
            onClick={() => dispatch(setFilter(f.id))}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="filter-info">
        {remaining} item{remaining !== 1 ? "s" : ""} left
      </div>
    </div>
  );
}

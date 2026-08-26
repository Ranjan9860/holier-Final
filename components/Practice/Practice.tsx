"use client";

import { useState } from "react";

export default function Practice() {
  const [count, setCount] = useState(0);

  return (
    <div
      style={{
        padding: "50px",
        background: "white",
        color: "black",
        position: "relative",
        zIndex: 999999,
      }}
    >
      <h1>React Test</h1>

      <h2>Count: {count}</h2>

      <button
        type="button"
        onClick={() => setCount((previous) => previous + 1)}
        style={{
          padding: "20px",
          background: "red",
          color: "white",
          cursor: "pointer",
        }}
      >
        CLICK ME
      </button>
    </div>
  );
}

"use client";
import { useState } from "react"; // Importing the useState hook from React

function App() {
  // Using the useState hook to manage component state
  const [count, setCount] = useState(0);

  return (
    // The return statement contains JSX, which looks like HTML but is JavaScript
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App; // Exporting the App component for use in other files
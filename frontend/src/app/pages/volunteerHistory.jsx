import { useState } from "react"; // Importing the useState hook from React
import reactLogo from "./assets/react.svg"; // Local import of an image asset

function App() {
  // Using the useState hook to manage component state
  const [count, setCount] = useState(0);

  return (
    // The return statement contains JSX, which looks like HTML but is JavaScript
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={reactLogo} className="logo" alt="React logo" />
        </a>
      </div>
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
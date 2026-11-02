import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Load broad rules first; responsive rules come last so they can override them.
import "./styles/base.css";
import "./styles/sidebar.css";
import "./styles/layout.css";
import "./styles/library.css";
import "./styles/extensions.css";
import "./styles/dialogs.css";
import "./styles/history.css";
import "./styles/responsive.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// PWA functionality will be added in a future update
// For now, we'll just render the app

createRoot(document.getElementById("root")!).render(<App />);

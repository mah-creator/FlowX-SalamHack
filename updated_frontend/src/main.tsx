import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import FlowXApp from "@/flowx/FlowXApp";
import "@/styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <FlowXApp />
  </StrictMode>,
);

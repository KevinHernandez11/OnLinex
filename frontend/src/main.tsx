import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import { SessionProvider } from "@/context/session-context"

import App from "./App"
import "./index.css"

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <SessionProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SessionProvider>
  </StrictMode>,
)

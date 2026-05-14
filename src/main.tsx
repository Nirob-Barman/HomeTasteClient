import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "@/app/store";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      <Toaster position="top-right" richColors />
    </Provider>
  </StrictMode>
);

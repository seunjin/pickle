console.log("!!! PIKLE-CLIENT MAIN.TSX STARTING !!!");

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { DialogProvider, Toaster } from "@pickle/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { SessionProvider } from "./features/auth/model/SessionContext";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <DialogProvider>
            <RouterProvider router={router} />
            <Toaster />
          </DialogProvider>
        </SessionProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

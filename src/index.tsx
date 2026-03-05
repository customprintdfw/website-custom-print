import React from "react";
import ReactDOM from "react-dom/client";
import { AnimaProvider } from "@animaapp/playground-react-sdk";
import { CartProvider } from "@/context/CartContext";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <AnimaProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AnimaProvider>
  </React.StrictMode>,
);

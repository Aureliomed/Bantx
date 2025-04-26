import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import store from "./store/store";
import AppRoutes from "./routes/AppRoutes";

import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

import "react-toastify/dist/ReactToastify.css";
import "./styles/globals.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <ToastContainer 
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
            <AppRoutes />
          </SocketProvider>
        </AuthProvider>
      </Router>
    </Provider>
  </React.StrictMode>
);

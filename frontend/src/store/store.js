import { configureStore, createSlice } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

// 📌 Función para manejar localStorage con seguridad
const getStoredState = (key, defaultValue) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error(`⚠️ Error leyendo ${key} desde localStorage:`, error);
    return defaultValue;
  }
};

const initialState = {
  emails: getStoredState("emails", []),
  unreadCount: Number(localStorage.getItem("unreadCount")) || 0,
  filter: getStoredState("filter", { orderBy: "date", orderDirection: "desc", search: "" }),
  loading: false,
  error: null,
  socketConnected: false, // 📡 Estado de conexión WebSocket
};

const emailSlice = createSlice({
  name: "emails",
  initialState,
  reducers: {
    setEmails: (state, action) => {
      state.emails = action.payload;
      state.loading = false;
      state.error = null;
      localStorage.setItem("emails", JSON.stringify(action.payload)); // 🗃 Guardar en localStorage
    },
    addEmail: (state, action) => {
      state.emails.unshift(action.payload);
      state.unreadCount += 1;
      localStorage.setItem("emails", JSON.stringify(state.emails));
      localStorage.setItem("unreadCount", state.unreadCount.toString());
    },
    incrementUnread: (state) => {
      state.unreadCount += 1;
      localStorage.setItem("unreadCount", state.unreadCount.toString());
    },
    resetUnread: (state) => {
      state.unreadCount = 0;
      localStorage.setItem("unreadCount", "0");
    },
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
      localStorage.setItem("filter", JSON.stringify(state.filter));
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    },
  },
});

// WebSocket
export const initEmailWebSocket = (socket) => (dispatch) => {
  socket.on("connect", () => {
    console.log("✅ WebSocket conectado.");
    dispatch(setSocketConnected(true));
  });

  socket.on("disconnect", () => {
    console.warn("⚠️ WebSocket desconectado.");
    dispatch(setSocketConnected(false));
  });

  socket.on("newEmail", (email) => {
    console.log("📩 Nuevo correo recibido en tiempo real:", email);
    dispatch(addEmail(email));
  });

  socket.on("error", (error) => {
    console.error("⚠️ Error en WebSocket:", error);
    dispatch(setError("Error de conexión con WebSocket"));
  });

  socket.on("connect_error", (error) => {
    console.error("⚠️ Error al intentar conectar WebSocket:", error);
    dispatch(setError("No se pudo conectar al WebSocket"));
  });

  return () => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("newEmail");
    socket.off("error");
    socket.off("connect_error");
  };
};

// Exportar acciones
export const {
  setEmails,
  addEmail,
  incrementUnread,
  resetUnread,
  setFilter,
  setLoading,
  setError,
  setSocketConnected,
} = emailSlice.actions;

// Configuración de la store
const store = configureStore({
  reducer: {
    emails: emailSlice.reducer,
    users: userReducer,
  },
});

export default store;

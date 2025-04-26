import { create } from "zustand";
import axios from "axios";
import io from "socket.io-client";

// 📡 Configuración de WebSocket
const socket = io("http://localhost:5000");

// 📌 Estado global con Zustand
const useEmailStore = create((set, get) => ({
  emails: [],
  unreadCount: 0,
  loading: false,
  error: null,
  filter: { orderBy: "date", orderDirection: "desc", search: "" }, // 🔍 Filtros avanzados

  // 📌 Cargar correos desde la API
  fetchEmails: async (page = 1, limit = 5) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/emails?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ emails: res.data.emails, loading: false });
    } catch (error) {
      set({
        error: error.response ? error.response.data.message : "Error al obtener los correos",
        loading: false,
      });
    }
  },

  // 📩 Agregar un nuevo correo en tiempo real (WebSockets)
  addEmail: (email) => {
    set((state) => ({ emails: [email, ...state.emails], unreadCount: state.unreadCount + 1 }));
  },

  // 🔍 Filtrar correos
  setFilter: (newFilter) => {
    set((state) => ({ filter: { ...state.filter, ...newFilter } }));
  },

  // 📩 Resetear cantidad de correos no leídos
  resetUnread: () => set({ unreadCount: 0 }),

  // 📡 Conectar WebSockets para escuchar nuevos correos
  connectWebSocket: () => {
    socket.on("newEmail", (data) => {
      console.log("📩 Nuevo correo recibido:", data);
      get().addEmail(data);
    });
  },
}));

export default useEmailStore;

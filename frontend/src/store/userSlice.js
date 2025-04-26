import { createSlice } from "@reduxjs/toolkit";

// Estado inicial para los usuarios
const initialState = {
  users: [],        // Lista de usuarios
  loading: false,   // Estado de carga para indicar cuando estamos recuperando datos
  error: null,      // Almacenar cualquier error
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      // Actualiza el estado con los usuarios obtenidos de la API
      state.users = action.payload;
      state.loading = false;
      state.error = null; // Limpia cualquier error previo
    },
    addUser: (state, action) => {
      // Verifica si el usuario ya existe para evitar duplicados
      const exists = state.users.some(user => user._id === action.payload._id);
      if (!exists) {
        state.users.push(action.payload); // Agrega el nuevo usuario si no existe
      }
    },
    removeUser: (state, action) => {
      // Elimina un usuario por su ID
      state.users = state.users.filter(user => user._id !== action.payload);
    },
    updateUser: (state, action) => {
      // Encuentra el índice del usuario a actualizar
      const index = state.users.findIndex(user => user._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = action.payload; // Actualiza los detalles del usuario
      }
    },
    setLoading: (state, action) => {
      // Establece el estado de carga
      state.loading = action.payload;
    },
    setError: (state, action) => {
      // Establece un error en caso de que falle la petición
      state.error = action.payload;
      state.loading = false; // Asegurarse de que el estado de carga sea false si hay un error
    },
  },
});

// Exportar las acciones generadas por createSlice
export const { setUsers, addUser, removeUser, updateUser, setLoading, setError } = userSlice.actions;

// Exportar el reducer para integrarlo en el store
export default userSlice.reducer;

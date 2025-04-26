import { createSlice } from "@reduxjs/toolkit";

// 📌 Estado inicial con soporte para persistencia del usuario
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null, // ✅ Recuperar usuario guardado
  token: localStorage.getItem("token") || null, // ✅ Recuperar token guardado
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      // 🔐 Guardar usuario y token en localStorage
      localStorage.setItem("user", JSON.stringify(action.payload.user)); 
      localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      // 🔓 Eliminar usuario y token de localStorage
      localStorage.removeItem("user"); 
      localStorage.removeItem("token"); 
    },
  },
});

// Exportar las acciones para ser utilizadas en los componentes
export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

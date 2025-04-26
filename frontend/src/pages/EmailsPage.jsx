import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import {
  setEmails,
  incrementUnread,
  resetUnread,
  setFilter
} from "../store/store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TopBarAdmin from "../components/TopBarAdmin";
import "../styles/globals.css";
import { useNavigate } from "react-router-dom";

// 📡 Conexión WebSocket única
const socket = io("http://localhost:5000", { autoConnect: false });

const EmailsPage = () => {
  const dispatch = useDispatch();
  const { emails, unreadCount, filter } = useSelector((state) => state.emails);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = unreadCount > 0
      ? `📧 (${unreadCount}) Nuevos Correos`
      : "📧 Gestión de Correos";
  }, [unreadCount]);

  const fetchEmails = async () => {
    setLoading(true);
    setErrorMessage("");
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get(`http://localhost:5000/api/emails?page=${page}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch(setEmails(res.data.emails));
      setTotalPages(res.data.totalPages);
    } catch (error) {
      const msg = error.response?.data?.message || "❌ Error al obtener los correos.";
      setErrorMessage(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("newEmail", () => {
      toast.success("📩 Nuevo correo recibido!");
      dispatch(incrementUnread());
      fetchEmails();
    });

    return () => {
      socket.off("newEmail");
      socket.disconnect();
    };
  }, [dispatch, page]);

  const sortedEmails = [...emails].sort((a, b) => {
    if (filter.orderBy === "date") {
      return filter.orderDirection === "desc"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date);
    } else if (filter.orderBy === "to") {
      return filter.orderDirection === "desc"
        ? b.to.localeCompare(a.to)
        : a.to.localeCompare(b.to);
    }
    return 0;
  });

  const filteredEmails = sortedEmails.filter((email) =>
    email.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <TopBarAdmin />
      <div className="layout-page">
        <div className="content-box">
          <h1 className="title">
            📧 Gestión de Correos {unreadCount > 0 && `(${unreadCount} nuevos)`}
          </h1>

          {unreadCount > 0 && (
            <button className="button" onClick={() => dispatch(resetUnread())}>
              🔄 Resetear contador
            </button>
          )}

          {/* 🔽 Filtros */}
          <div className="filters" style={{ marginTop: "20px" }}>
            <label>Ordenar por:</label>
            <select
              value={filter.orderBy}
              onChange={(e) =>
                dispatch(setFilter({ ...filter, orderBy: e.target.value }))
              }
            >
              <option value="date">Fecha</option>
              <option value="to">Destinatario</option>
            </select>
            <button
              onClick={() =>
                dispatch(
                  setFilter({
                    ...filter,
                    orderDirection: filter.orderDirection === "asc" ? "desc" : "asc",
                  })
                )
              }
            >
              {filter.orderDirection === "asc" ? "⬆️ Ascendente" : "⬇️ Descendente"}
            </button>
          </div>

          {/* ❌ Error */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {/* 🔍 Buscar */}
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Buscar por asunto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* 📨 Tabla */}
          {loading ? (
            <p className="loading">⏳ Cargando correos...</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>📩 Destinatario</th>
                    <th>📌 Asunto</th>
                    <th>📅 Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmails.length > 0 ? (
                    filteredEmails.map((email) => (
                      <tr key={email._id}>
                        <td>{email.to}</td>
                        <td>{email.subject}</td>
                        <td>{new Date(email.date).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3">📭 No hay correos disponibles.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

 {/* 🔁 Paginación */}
 <div className="pagination" style={{ marginTop: "20px" }}>
            <button
              className="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              ◀ Anterior
            </button>
            <span style={{ padding: "10px" }}>
              Página {page} de {totalPages}
            </span>
            <button
              className="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Siguiente ▶
            </button>
          </div>

          {/* 🔙 Volver al panel */}
          <div className="extra-options" style={{ marginTop: "24px" }}>
            <button onClick={() => navigate("/admin")} className="link">
              ⬅ Volver al panel de administración
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailsPage;
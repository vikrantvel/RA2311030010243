import React, { useState, useEffect } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const API_URL = "http://localhost:3001";

function App() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    const res = await fetch(`${API_URL}/notifications`);
    const data = await res.json();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const createNotification = async () => {
    if (!title || !message) return alert("Title and message required");
    setLoading(true);
    await fetch(`${API_URL}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message, type }),
    });
    setTitle("");
    setMessage("");
    setLoading(false);
    fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    await fetch(`${API_URL}/notifications/${id}/read`, { method: "PATCH" });
    fetchNotifications();
  };

  const deleteNotification = async (id: string) => {
    await fetch(`${API_URL}/notifications/${id}`, { method: "DELETE" });
    fetchNotifications();
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "Arial, sans-serif", padding: "0 20px" }}>
      <h1 style={{ color: "#2c3e50" }}>Notification Center</h1>

      <div style={{ background: "#f8f9fa", padding: 20, borderRadius: 8, marginBottom: 30 }}>
        <h2 style={{ marginTop: 0 }}>Create Notification</h2>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 4, border: "1px solid #ccc", boxSizing: "border-box" }}
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 4, border: "1px solid #ccc", boxSizing: "border-box", height: 80 }}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: 10, marginBottom: 10, borderRadius: 4, border: "1px solid #ccc" }}
        >
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="success">Success</option>
        </select>
        <br />
        <button
          onClick={createNotification}
          disabled={loading}
          style={{ background: "#3498db", color: "white", padding: "10px 20px", border: "none", borderRadius: 4, cursor: "pointer", marginTop: 10 }}
        >
          {loading ? "Sending..." : "Send Notification"}
        </button>
      </div>

      <h2>All Notifications ({notifications.length})</h2>
      {notifications.length === 0 && <p style={{ color: "#999" }}>No notifications yet.</p>}
      {notifications.map((n) => (
        <div key={n.id} style={{
          background: n.read ? "#f0f0f0" : "white",
          border: `2px solid ${n.type === "error" ? "#e74c3c" : n.type === "warning" ? "#f39c12" : n.type === "success" ? "#2ecc71" : "#3498db"}`,
          borderRadius: 8, padding: 16, marginBottom: 12
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: n.read ? "#999" : "#2c3e50" }}>
              {n.read ? "✓ " : ""}{n.title}
            </h3>
            <span style={{ fontSize: 12, color: "#999" }}>{new Date(n.createdAt).toLocaleString()}</span>
          </div>
          <p style={{ color: n.read ? "#aaa" : "#555", margin: "8px 0" }}>{n.message}</p>
          <div style={{ display: "flex", gap: 8 }}>
            {!n.read && (
              <button onClick={() => markAsRead(n.id)}
                style={{ background: "#2ecc71", color: "white", padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer" }}>
                Mark as Read
              </button>
            )}
            <button onClick={() => deleteNotification(n.id)}
              style={{ background: "#e74c3c", color: "white", padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer" }}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
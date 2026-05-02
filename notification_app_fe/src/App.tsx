import React, { useState, useEffect } from "react";
import "./App.css";

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

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="app">
      <div className="header">
        <h1>Notifications {unread > 0 && <span className="badge">{unread}</span>}</h1>
        <p>Manage your notifications in one place</p>
      </div>
      <div className="form-card">
        <h2>New Notification</h2>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
        <div className="form-row">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <button className="btn-primary" onClick={createNotification} disabled={loading}>
            {loading ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </div>
      <div className="section-title">All Notifications ({notifications.length})</div>
      {notifications.length === 0 && <div className="empty">No notifications yet. Create one above!</div>}
      {notifications.map((n) => (
        <div key={n.id} className={`notification-card type-${n.type} ${n.read ? "read" : ""}`}>
          <div className="card-header">
            <span className="card-title">{n.title}</span>
            <div className="card-meta">
              <span className="type-pill">{n.type}</span>
              <span className="card-time">{new Date(n.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
          <p className="card-message">{n.message}</p>
          <div className="card-actions">
            {!n.read && <button className="btn-read" onClick={() => markAsRead(n.id)}>Mark as Read</button>}
            <button className="btn-delete" onClick={() => deleteNotification(n.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;

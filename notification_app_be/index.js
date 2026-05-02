const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Log } = require("../logging_middleware/index");

const app = express();
app.use(cors());
app.use(express.json());

const CREDS = {
    email: "ss0043@srmist.edu.in",
    name: "vikrantvel.s.p",
    rollNo: "ra2311030010243",
    accessCode: "QkbpxH",
    clientID: "e3ddda19-407e-4bb8-b922-a36c1e16b8cc",
    clientSecret: "sMYxTpFvCgBjVnng",
};

async function getToken() {
    const res = await axios.post("http://20.207.122.201/evaluation-service/auth", CREDS);
    return res.data.access_token;
}

app.get("/campus-notifications", async (req, res) => {
    try {
        const token = await getToken();
        const result = await axios.get("http://20.207.122.201/evaluation-service/notifications", {
            headers: { Authorization: `Bearer ${token}` },
        });
        res.json(result.data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

let notifications = [];

const safeLog = async (stack, level, pkg, message) => {
    try {
        await Log(stack, level, pkg, message);
    } catch (e) {
        console.error("Log failed:", e.message);
    }
};

app.get("/notifications", async (req, res) => {
    await safeLog("backend", "info", "route", "Fetching all notifications");
    res.json(notifications);
});

app.post("/notifications", async (req, res) => {
    const { title, message, type } = req.body;
    if (!title || !message) {
        await safeLog("backend", "warn", "handler", "Missing title or message");
        return res.status(400).json({ error: "title and message are required" });
    }
    const notification = {
        id: Date.now().toString(),
        title,
        message,
        type: type || "info",
        read: false,
        createdAt: new Date().toISOString(),
    };
    notifications.push(notification);
    await safeLog("backend", "info", "service", `Notification created: ${title}`);
    res.status(201).json(notification);
});

app.patch("/notifications/:id/read", async (req, res) => {
    const { id } = req.params;
    const notification = notifications.find((n) => n.id === id);
    if (!notification) {
        await safeLog("backend", "error", "handler", `Not found: ${id}`);
        return res.status(404).json({ error: "Notification not found" });
    }
    notification.read = true;
    await safeLog("backend", "info", "service", `Marked as read: ${id}`);
    res.json(notification);
});

app.delete("/notifications/:id", async (req, res) => {
    const { id } = req.params;
    const index = notifications.findIndex((n) => n.id === id);
    if (index === -1) {
        await safeLog("backend", "error", "handler", `Delete failed: ${id}`);
        return res.status(404).json({ error: "Notification not found" });
    }
    notifications.splice(index, 1);
    await safeLog("backend", "info", "service", `Deleted: ${id}`);
    res.json({ message: "Deleted successfully" });
});

const PORT = 3001;
app.listen(PORT, async () => {
    await safeLog("backend", "info", "config", `Server running on port ${PORT}`);
    console.log(`Server running on http://localhost:${PORT}`);
});
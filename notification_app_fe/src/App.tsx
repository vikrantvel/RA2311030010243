import React, { useState, useEffect } from "react";
import {
  Box, Container, Typography, Chip, Card, CardContent,
  Button, TextField, Select, MenuItem, FormControl,
  InputLabel, AppBar, Toolbar, Tab, Tabs, CircularProgress, Alert
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";

interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
  score?: number;
}

const WEIGHTS: Record<string, number> = { Placement: 3, Result: 2, Event: 1 };

export default function App() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topN, setTopN] = useState(10);
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("http://localhost:3001/campus-notifications");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (e: any) {
      setError(`Failed to fetch: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getPriority = (list: Notification[]) => {
    const now = Date.now();
    const scored = list.map((n) => {
      const weight = WEIGHTS[n.Type] || 0;
      const ageInHours = (now - new Date(n.Timestamp).getTime()) / (1000 * 60 * 60);
      const recency = Math.max(0, 1 - ageInHours / 24);
      return { ...n, score: weight + recency };
    });
    scored.sort((a, b) => (b.score || 0) - (a.score || 0));
    return scored.slice(0, topN);
  };

  const markViewed = (id: string) => {
    setViewed((prev) => new Set([...prev, id]));
  };

  const typeColor = (type: string) => {
    if (type === "Placement") return "#ef5350";
    if (type === "Result") return "#ff9800";
    return "#42a5f5";
  };

  const filtered = filterType === "All"
    ? notifications
    : notifications.filter((n) => n.Type === filterType);

  const priorityList = getPriority(notifications).slice(0, topN);

  const unviewed = notifications.filter((n) => !viewed.has(n.ID)).length;

  const renderCard = (n: Notification, index?: number) => {
    const isViewed = viewed.has(n.ID);
    return (
      <Card
        key={n.ID}
        onClick={() => markViewed(n.ID)}
        sx={{
          mb: 1.5,
          cursor: "pointer",
          opacity: isViewed ? 0.55 : 1,
          borderLeft: `4px solid ${typeColor(n.Type)}`,
          background: isViewed ? "#1a1a2e" : "#16213e",
          transition: "all 0.2s",
          "&:hover": { transform: "translateY(-2px)", boxShadow: 6 },
        }}
      >
        <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {index !== undefined && (
                <Typography sx={{ color: "#ffd700", fontWeight: 700, mr: 0.5 }}>
                  #{index + 1}
                </Typography>
              )}
              <Chip
                label={n.Type}
                size="small"
                sx={{ background: typeColor(n.Type), color: "white", fontWeight: 700, fontSize: "0.7rem" }}
              />
              {!isViewed && (
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#00e676" }} />
              )}
            </Box>
            <Typography variant="caption" sx={{ color: "#888" }}>
              {new Date(n.Timestamp).toLocaleString()}
            </Typography>
          </Box>
          <Typography sx={{ mt: 1, color: isViewed ? "#666" : "#e0e0e0", fontSize: "0.95rem" }}>
            {n.Message}
          </Typography>
          {n.score !== undefined && (
            <Typography variant="caption" sx={{ color: "#ffd700" }}>
              Score: {n.score.toFixed(3)}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "#0d0d1a", color: "white" }}>
      <AppBar position="static" sx={{ background: "#1a1a2e", boxShadow: "none", borderBottom: "1px solid #333" }}>
        <Toolbar>
          <NotificationsIcon sx={{ mr: 1, color: "#6c63ff" }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Campus Notifications
          </Typography>
          <Chip
            label={`${unviewed} unread`}
            size="small"
            sx={{ background: "#6c63ff", color: "white" }}
          />
          <Button onClick={fetchNotifications} sx={{ ml: 2, color: "#6c63ff" }}>
            Refresh
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 3, "& .MuiTab-root": { color: "#888" }, "& .Mui-selected": { color: "#6c63ff" }, "& .MuiTabs-indicator": { background: "#6c63ff" } }}
        >
          <Tab icon={<NotificationsIcon />} label="All Notifications" />
          <Tab icon={<StarIcon />} label="Priority Inbox" />
        </Tabs>
        {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}><CircularProgress sx={{ color: "#6c63ff" }} /></Box>}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <>
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel sx={{ color: "#888" }}>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Type"
                  sx={{ color: "white", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#333" } }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Placement">Placement</MenuItem>
                  <MenuItem value="Result">Result</MenuItem>
                  <MenuItem value="Event">Event</MenuItem>
                </Select>
              </FormControl>

              {tab === 1 && (
                <TextField
                  size="small"
                  label="Top N"
                  type="number"
                  value={topN}
                  onChange={(e) => setTopN(Math.max(1, parseInt(e.target.value) || 10))}
                  sx={{ width: 100, "& .MuiInputLabel-root": { color: "#888" }, "& .MuiInputBase-input": { color: "white" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#333" } }}
                />
              )}
            </Box>

            {tab === 0 && (
              <>
                <Typography variant="body2" sx={{ color: "#888", mb: 2 }}>
                  {filtered.length} notifications
                </Typography>
                {filtered.map((n) => renderCard(n))}
              </>
            )}

            {tab === 1 && (
              <>
                <Typography variant="body2" sx={{ color: "#888", mb: 2 }}>
                  Showing top {topN} by priority (Placement &gt; Result &gt; Event + recency)
                </Typography>
                {priorityList.map((n, i) => renderCard(n, i))}
              </>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
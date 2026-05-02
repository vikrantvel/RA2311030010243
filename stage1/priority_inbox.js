const { Log } = require("../logging_middleware/index");

const CREDS = {
  email: "ss0043@srmist.edu.in",
  name: "vikrantvel.s.p",
  rollNo: "ra2311030010243",
  accessCode: "QkbpxH",
  clientID: "e3ddda19-407e-4bb8-b922-a36c1e16b8cc",
  clientSecret: "sMYxTpFvCgBjVnng",
};

const WEIGHTS = { Placement: 3, Result: 2, Event: 1 };

async function getToken() {
  const res = await fetch("http://20.207.122.201/evaluation-service/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(CREDS),
  });
  const data = await res.json();
  return data.access_token;
}

async function getPriorityInbox(topN = 10) {
  await Log("backend", "info", "auth", "Authenticating with evaluation service");
  const token = await getToken();

  await Log("backend", "info", "service", `Fetching notifications for priority inbox top ${topN}`);
  const res = await fetch("http://20.207.122.201/evaluation-service/notifications", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  const notifications = data.notifications;
  await Log("backend", "info", "service", `Fetched ${notifications.length} notifications`);

  const now = Date.now();
  const scored = notifications.map((n) => {
    const weight = WEIGHTS[n.Type] || 0;
    const ageInHours = (now - new Date(n.Timestamp).getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 1 - ageInHours / 24);
    const totalScore = weight + recencyScore;
    return { ...n, score: totalScore };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, topN);
  await Log("backend", "info", "service", `Top ${topN} priority notifications selected`);
  return top;
}

async function main() {
  try {
    const top10 = await getPriorityInbox(10);
    console.log("\n=== TOP 10 PRIORITY NOTIFICATIONS ===\n");
    top10.forEach((n, i) => {
      console.log(`${i + 1}. [${n.Type}] ${n.Message}`);
      console.log(`   Timestamp: ${n.Timestamp}`);
      console.log(`   Score: ${n.score.toFixed(4)}`);
      console.log();
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();

import { useEffect, useState } from "react";
import api from "../services/api";

export default function Admin() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get("/admin/reports").then((res) => setReports(res.data));
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/reports/${id}/status`, { status });
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Panel</h2>

      {reports.map((r) => (
        <div
          key={r.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <h3>{r.title}</h3>
          <p>{r.description}</p>
          <p><strong>User:</strong> {r.user.name} ({r.user.email})</p>
          <p><strong>Status:</strong> {r.status}</p>

          <button onClick={() => updateStatus(r.id, "Answered")}>Answered</button>
          <button onClick={() => updateStatus(r.id, "Sent")}>Sent</button>
          <button onClick={() => updateStatus(r.id, "Closed")}>Closed</button>
        </div>
      ))}
    </div>
  );
}

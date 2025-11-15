import { useEffect, useState } from "react";
import api from "../services/api";

export default function Admin() {
  const [reports, setReports] = useState([]);
  const [institution, setInstitution] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/reports")
      .then((res) => {
        console.log("ADMIN REPORTS:", res.data);
        setReports(res.data);
      })
      .catch((err) => {
        console.error("Error loading admin reports:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const sendToInstitution = async (id) => {
    if (!institution) {
      alert("Please select an institution first!");
      return;
    }

    try {
      const res = await api.patch(`/admin/reports/${id}/send`, {
        institution,
      });

      // Понеже след изпращане не искаме да го виждаме тук (Sent),
      // го махаме от списъка:
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error sending report:", err);
      alert("Error sending report");
    }
  };

  const markResolved = async (id) => {
    try {
      const res = await api.patch(`/admin/reports/${id}/resolve`);

      // Resolved репортите също не се показват в този списък:
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error resolving report:", err);
      alert("Error resolving report");
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Panel</h2>

      <h4>Select Institution</h4>
      <select
        value={institution}
        onChange={(e) => setInstitution(e.target.value)}
        style={{ marginBottom: "20px", padding: "5px" }}
      >
        <option value="">-- Select Institution --</option>
        <option value="Municipality">Municipality</option>
        <option value="Road Department">Road Department</option>
        <option value="Waste Management">Waste Management</option>
        <option value="Traffic Control">Traffic Control</option>
      </select>

      {reports.length === 0 && (
        <p>No pending reports. 🎉</p>
      )}

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
          <p>
            <strong>Category:</strong> {r.category}
          </p>
          <p>
            <strong>User:</strong> {r.user?.name} ({r.user?.email})
          </p>
          <p>
            <strong>Status:</strong> {r.status || "Pending"}
          </p>
          {r.institution && (
            <p>
              <strong>Institution:</strong> {r.institution}
            </p>
          )}

          <button
            onClick={() => sendToInstitution(r.id)}
            style={{ marginRight: "10px" }}
          >
            Send to Institution
          </button>
          <button onClick={() => markResolved(r.id)}>Mark Resolved</button>
        </div>
      ))}

      <a href="/admin/resolved">See Resolved Reports →</a>
    </div>
  );
}

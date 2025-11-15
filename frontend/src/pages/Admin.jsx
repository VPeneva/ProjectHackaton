import { useEffect, useState } from "react";
import api from "../services/api";

export default function Admin() {
  const [reports, setReports] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [loading, setLoading] = useState(true);

  // Зареждане на институции
  useEffect(() => {
    api.get("/institutions").then((res) => {
      setInstitutions(res.data);
    });
  }, []);

  // Зареждане на репорти
  const loadReports = () => {
    setLoading(true);

    const url = selectedInstitution
      ? `/admin/reports?institutionId=${selectedInstitution}`
      : `/admin/reports`;

    api
      .get(url)
      .then((res) => setReports(res.data))
      .catch((err) => console.error("Error loading admin reports:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, [selectedInstitution]);

  const sendToInstitution = async (id) => {
    if (!selectedInstitution) {
      alert("Select an institution first.");
      return;
    }

    await api.patch(`/admin/reports/${id}/send`, {
      institutionId: Number(selectedInstitution)
    });

    loadReports();
  };

  const markResolved = async (id) => {
    await api.patch(`/admin/reports/${id}/resolve`);
    loadReports();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Panel</h2>

      <h4>Filter / Send by institution</h4>
      <select
        value={selectedInstitution}
        onChange={(e) => setSelectedInstitution(e.target.value)}
        style={{ marginBottom: "20px", padding: "5px" }}
      >
        <option value="">-- All institutions --</option>
        {institutions.map((inst) => (
          <option key={inst.id} value={inst.id}>
            {inst.name}
          </option>
        ))}
      </select>

      {reports.length === 0 ? (
        <p>No reports for this institution.</p>
      ) : (
        reports.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px"
            }}
          >
            <h3>{r.title}</h3>
            <p>{r.description}</p>
            <p><b>Category:</b> {r.category}</p>
            <p><b>User:</b> {r.user?.name}</p>
            <p><b>Status:</b> {r.status || "Pending"}</p>
            <p><b>Institution:</b> {r.institutionRecord?.name || "None"}</p>

            <button onClick={() => sendToInstitution(r.id)} style={{ marginRight: "10px" }}>
              Send
            </button>

            <button onClick={() => markResolved(r.id)}>Resolve</button>
          </div>
        ))
      )}
    </div>
  );
}

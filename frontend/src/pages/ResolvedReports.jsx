import { useEffect, useState } from "react";
import api from "../services/api";

export default function ResolvedReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get("/admin/reports/resolved").then((res) => setReports(res.data));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Resolved Reports</h2>

      {reports.map((r) => (
        <div 
          key={r.id} 
          style={{
            border: "1px solid green",
            padding: "10px",
            marginBottom: "10px"
          }}
        >
          <h3>{r.title}</h3>
          <p>{r.description}</p>
          <p><strong>Category:</strong> {r.category}</p>
          <p><strong>Resolved:</strong> Yes</p>
        </div>
      ))}
    </div>
  );
}

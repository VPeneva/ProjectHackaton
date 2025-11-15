import { useEffect, useState } from "react";
import api from "../services/api";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get("/reports").then((res) => {
      setReports(res.data);
    });
  }, []);

  return (
    <div>
      <h2>Reports</h2>

      {reports.map((r) => (
        <div key={r.id} style={{ padding: "10px", margin: "10px", border: "1px solid #ccc" }}>
          <h3>{r.title}</h3>
          <p>{r.description}</p>
          <small>Category: {r.category}</small>
          <br />
          <small>By: {r.user.name}</small>
        </div>
      ))}
    </div>
  );
}

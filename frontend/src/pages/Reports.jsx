import { useEffect, useState } from "react";
import api from "../services/api";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get("/reports").then((res) => {
      setReports(res.data);
    });
  }, []);

  const renderStatus = (report) => {
    if (report.status === "Sent") {
      return (
        <span>
          Изпратено към <strong>{report.institution}</strong> (в процес на
          отстраняване)
        </span>
      );
    }

    if (report.status === "Resolved") {
      return <span>Проблемът е <strong>отстранен</strong>.</span>;
    }

    // Pending / null / други
    return <span>Очаква обработка</span>;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Reports</h2>

      {reports.map((r) => (
        <div
          key={r.id}
          style={{
            padding: "10px",
            margin: "10px 0",
            border: "1px solid #ccc",
          }}
        >
          <h3>{r.title}</h3>
          <p>{r.description}</p>
          <p>
            <strong>Category:</strong> {r.category}
          </p>
          <p>
            <strong>Reported by:</strong> {r.user?.name}
          </p>
          <p>
            <strong>Status:</strong> {renderStatus(r)}
          </p>
        </div>
      ))}
    </div>
  );
}

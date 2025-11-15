import { useEffect, useState } from "react";
import api from "../services/api";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get("/reports").then((res) => {
      console.log("REPORTS:", res.data);
      setReports(res.data);
    }).catch(err => {
      console.error("Error loading reports:", err);
    });
  }, []);

  const renderStatus = (report) => {
    if (report.status === "Sent") {
      return (
        <span>
          Изпратено към{" "}
          <strong>{report.institution?.name || "няма институция"}</strong>{" "}
          (в процес на отстраняване)
        </span>
      );
    }

    if (report.status === "Resolved") {
      return <span>Проблемът е <strong>отстранен</strong>.</span>;
    }

    return <span>Очаква обработка</span>;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Reports</h2>

      {reports.length === 0 && <p>Няма репорти.</p>}

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

          {r.description && <p>{r.description}</p>}

          <p>
            <strong>Category:</strong>{" "}
            {r.category?.name || "Няма категория"}
          </p>

          <p>
            <strong>Institution:</strong>{" "}
            {r.institution?.name || "Няма институция"}
          </p>

          <p>
            <strong>Reported by:</strong>{" "}
            {r.user?.name || "Unknown"}
          </p>

          <p>
            <strong>Status:</strong> {renderStatus(r)}
          </p>
        </div>
      ))}
    </div>
  );
}

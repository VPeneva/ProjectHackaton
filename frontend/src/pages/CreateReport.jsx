import { useEffect, useState } from "react";
import api from "../services/api";

export default function CreateReport() {
  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState(null);

  useEffect(() => {
    api.get("/institutions").then((res) => {
      setInstitutions(res.data);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.post("/reports", {
      title,
      description,
      category,
      lat,
      lng,
      institutionId, // <-- вече изпращаме ID
    });

    alert("Report created!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Institution:</label>
      <select onChange={(e) => setInstitutionId(parseInt(e.target.value))}>
        <option value="">-- Select Institution --</option>
        {institutions.map((i) => (
          <option key={i.id} value={i.id}>{i.name}</option>
        ))}
      </select>
      {/* Останалите полета */}
      <button type="submit">Create</button>
    </form>
  );
}

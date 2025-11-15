import { useEffect, useState } from "react";
import api from "../services/api";

export default function ManageCategories() {
  const [institutions, setInstitutions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [institutionId, setInstitutionId] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    api.get("/institutions").then(res => setInstitutions(res.data));
  }, []);

  // Зареждане на категории според избраната институция
  useEffect(() => {
    if (institutionId) {
      api.get(`/categories?institutionId=${institutionId}`).then(res => setCategories(res.data));
    }
  }, [institutionId]);

  const addCategory = async () => {
    if (!name || !institutionId) return alert("Missing fields");

    await api.post("/categories", {
      name,
      institutionId
    });

    setName("");
    api.get(`/categories?institutionId=${institutionId}`).then(res => setCategories(res.data));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Manage Categories</h2>

      <select value={institutionId} onChange={(e) => setInstitutionId(e.target.value)}>
        <option value="">-- Select Institution --</option>
        {institutions.map((i) => (
          <option key={i.id} value={i.id}>{i.name}</option>
        ))}
      </select>

      {institutionId && (
        <>
          <h3>Categories for this institution</h3>

          <ul>
            {categories.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>

          <input 
            placeholder="New category name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />

          <button onClick={addCategory}>Add Category</button>
        </>
      )}
    </div>
  );
}

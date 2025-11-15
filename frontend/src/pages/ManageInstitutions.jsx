import { useEffect, useState } from "react";
import api from "../services/api";

export default function ManageInstitutions() {
  const [institutions, setInstitutions] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    api.get("/institutions").then((res) => setInstitutions(res.data));
  };

  const addInstitution = async () => {
    if (!name) return;
    await api.post("/institutions", { name });
    setName("");
    load();
  };

  const deleteInstitution = async (id) => {
    await api.delete(`/institutions/${id}`);
    load();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Manage Institutions</h2>

      <div>
        <input 
          placeholder="Institution name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={addInstitution}>Add</button>
      </div>

      <ul>
        {institutions.map((i) => (
          <li key={i.id}>
            {i.name} 
            <button onClick={() => deleteInstitution(i.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

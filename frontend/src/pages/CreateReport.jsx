import { useEffect, useState } from "react";
import api from "../services/api";

export default function CreateReport() {
  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState(null);

  // Липсващите state променливи
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  useEffect(() => {
    api.get("/institutions").then((res) => {
      setInstitutions(res.data);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !category || !lat || !lng) {
      alert("Please fill all required fields!");
      return;
    }

    await api.post("/reports", {
      title,
      description,
      category,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      institutionId,
    });

    alert("Report created!");

    // Reset form
    setTitle("");
    setDescription("");
    setCategory("");
    setLat("");
    setLng("");
    setInstitutionId(null);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", maxWidth: "400px" }}>
      <h2>Create Report</h2>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <input
        placeholder="Latitude"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
      />

      <input
        placeholder="Longitude"
        value={lng}
        onChange={(e) => setLng(e.target.value)}
      />

      <label>Select Institution:</label>
      <select
        value={institutionId || ""}
        onChange={(e) =>
          setInstitutionId(e.target.value ? parseInt(e.target.value) : null)
        }
      >
        <option value="">-- Select Institution --</option>
        {institutions.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name}
          </option>
        ))}
      </select>

      <button type="submit">Create</button>
    </form>
  );
}

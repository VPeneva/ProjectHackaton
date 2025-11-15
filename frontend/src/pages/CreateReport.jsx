import { useEffect, useState } from "react";
import api from "../services/api";

export default function CreateReport() {
  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState("");

  // Categories – Може да ги направим по институция ако желаеш
  const categories = [
    "Road Damage",
    "Trash Issue",
    "Street Lighting",
    "Water Issue",
    "Electricity Issue",
    "Dangerous Area",
    "Environmental Issue",
    "Other",
  ];

  const [category, setCategory] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // Load institutions from database
  useEffect(() => {
    api.get("/institutions").then((res) => {
      setInstitutions(res.data);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!institutionId) {
      return alert("Please select an institution.");
    }
    if (!category) {
      return alert("Please select a category.");
    }

    if (!title || !description || !lat || !lng) {
      return alert("Please fill all fields.");
    }

    await api.post("/reports", {
      title,
      description,
      category,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      institutionId: Number(institutionId),
    });

    alert("Report created!");

    // Reset
    setTitle("");
    setDescription("");
    setLat("");
    setLng("");
    setCategory("");
    setInstitutionId("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        maxWidth: "400px",
      }}
    >
      <h2>Create Report</h2>

      {/* Select institution */}
      <label><strong>Select Institution:</strong></label>
      <select
        value={institutionId}
        onChange={(e) => {
          setInstitutionId(e.target.value);
          setCategory(""); // Clear category if institution changes
        }}
      >
        <option value="">-- Select Institution --</option>
        {institutions.map((inst) => (
          <option key={inst.id} value={inst.id}>
            {inst.name}
          </option>
        ))}
      </select>

      {/* Category appears ONLY AFTER institution is selected */}
      {institutionId && (
        <>
          <label><strong>Select Category:</strong></label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">-- Select Category --</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </>
      )}

      {/* These fields appear ALWAYS */}
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
        placeholder="Latitude"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
      />

      <input
        placeholder="Longitude"
        value={lng}
        onChange={(e) => setLng(e.target.value)}
      />

      <button type="submit">Create</button>
    </form>
  );
}

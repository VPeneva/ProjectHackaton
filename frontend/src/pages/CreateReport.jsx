import { useEffect, useState } from "react";
import api from "../services/api";

export default function CreateReport() {
  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // Зареждане на институции
  useEffect(() => {
    api.get("/institutions").then((res) => {
      setInstitutions(res.data);
    });
  }, []);

  // Зареждане на категории според избраната институция
  useEffect(() => {
    if (institutionId) {
      api
        .get(`/categories?institutionId=${institutionId}`)
        .then((res) => setCategories(res.data));
    } else {
      setCategories([]);
    }
  }, [institutionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!institutionId) return alert("Please select an institution.");
    if (!categoryId) return alert("Please select a category.");

    if (!title || !description || !lat || !lng) {
      return alert("All fields are required.");
    }

    await api.post("/reports", {
      title,
      description,
      categoryId: Number(categoryId),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      institutionId: Number(institutionId),
    });

    alert("Report created successfully!");

    // Reset
    setTitle("");
    setDescription("");
    setLat("");
    setLng("");
    setInstitutionId("");
    setCategoryId("");
    setCategories([]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Report</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "400px",
          gap: "12px",
        }}
      >
        {/* Institution */}
        <label><strong>Select Institution:</strong></label>
        <select
          value={institutionId}
          onChange={(e) => {
            setInstitutionId(e.target.value);
            setCategoryId("");
          }}
        >
          <option value="">-- Select Institution --</option>
          {institutions.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>

        {/* Categories (only visible after selecting institution) */}
        {institutionId && (
          <>
            <label><strong>Select Category:</strong></label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Title */}
        <input
          placeholder="Report Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Description */}
        <textarea
          placeholder="Describe the issue..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Coordinates */}
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

        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
}

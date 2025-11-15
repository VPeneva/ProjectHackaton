import { useEffect, useState } from "react";
import api from "../services/api";

export default function CreateReport() {
  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // OPTIONAL
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // Зареждане на институции
  useEffect(() => {
    api.get("/institutions").then((res) => {
      setInstitutions(res.data);
    });
  }, []);

  // Зареждане на категории за институция
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
    if (!title || !lat || !lng) {
      return alert("Title and coordinates are required.");
    }

    await api.post("/reports", {
    title,
    description: description || null,
    categoryId: categoryId ? Number(categoryId) : null,
    institutionId: institutionId ? Number(institutionId) : null,
    lat: Number(lat),
    lng: Number(lng),
   });

    alert("Report created successfully!");

    setTitle("");
    setDescription(""); // OPTIONAL RESET
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

        {/* Category */}
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
          placeholder="Report Title (required)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Description (OPTIONAL) */}
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Coordinates */}
        <input
          placeholder="Latitude (required)"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
        <input
          placeholder="Longitude (required)"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
        />

        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
}

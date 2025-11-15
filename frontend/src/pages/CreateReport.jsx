import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CreateReport() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/reports", {
        title,
        description,
        category,
        lat,
        lng
      });

      alert("Report created!");
      navigate("/");
    } catch (err) {
      alert("Error creating report");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Report</h2>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", maxWidth: "300px" }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ marginBottom: "10px" }}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ marginBottom: "10px" }}
        />

        <input
          placeholder="Category (e.g. Road, Lighting)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          style={{ marginBottom: "10px" }}
        />

        <input
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          required
          style={{ marginBottom: "10px" }}
        />

        <input
          placeholder="Longitude"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          required
          style={{ marginBottom: "10px" }}
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

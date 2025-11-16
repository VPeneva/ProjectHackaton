import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

export default function ResolvedReports() {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState("ALL");

  // Load resolved reports
  useEffect(() => {
    api.get("/admin/reports/resolved").then((res) => setReports(res.data));
  }, []);

  // Load categories
  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  // Filter reports by category
  const filteredReports =
    filterCategory === "ALL"
      ? reports
      : reports.filter((r) => r.categoryId === Number(filterCategory));

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Resolved Reports
      </Typography>

      {/* Dropdown Filter */}
      <FormControl sx={{ minWidth: 250, mb: 3 }}>
        <InputLabel>Filter by Category</InputLabel>
        <Select
          value={filterCategory}
          label="Filter by Category"
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <MenuItem value="ALL">All Categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Report Cards */}
      {filteredReports.length === 0 && (
        <Typography sx={{ mt: 2, opacity: 0.7 }}>
          No reports found for this category.
        </Typography>
      )}

      {filteredReports.map((r) => (
        <Card
          key={r.id}
          sx={{
            borderLeft: "5px solid green",
            mb: 2,
          }}
        >
          <CardContent>
            <Typography variant="h6">{r.title}</Typography>

            <Typography sx={{ mb: 1, opacity: 0.8 }}>
              {r.description}
            </Typography>

            <Typography>
              <strong>Category:</strong> {r.category?.name || "N/A"}
            </Typography>

            <Typography>
              <strong>Institution:</strong> {r.institution?.name || "N/A"}
            </Typography>

            <Typography sx={{ mt: 1, color: "green" }}>
              Status: Resolved
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

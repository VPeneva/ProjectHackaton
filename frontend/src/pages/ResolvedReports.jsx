import { useEffect, useState } from "react";
import api from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, FileText, Building2, Loader2 } from "lucide-react";

export default function ResolvedReports() {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/reports/resolved")
      .then((res) => setReports(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  const filteredReports =
    filterCategory === "all"
      ? reports
      : reports.filter((r) => r.categoryId === Number(filterCategory));

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Resolved Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filter */}
            <div className="space-y-2">
              <Label>Filter by Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* No reports */}
            {!isLoading && filteredReports.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No resolved reports found for this category.</p>
              </div>
            )}

            {/* Reports */}
            {!isLoading && filteredReports.length > 0 && (
              <div className="space-y-4">
                {filteredReports.map((r) => (
                  <Card key={r.id} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold">{r.title}</h3>
                        <Badge variant="success">Resolved</Badge>
                      </div>

                      {r.description && (
                        <p className="text-muted-foreground mb-4">{r.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Category:</span>
                          <span>{r.category?.name || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Institution:</span>
                          <span>{r.institution?.name || "N/A"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

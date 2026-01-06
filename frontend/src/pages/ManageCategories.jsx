import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tags, Building2, Plus, Trash2, Loader2 } from "lucide-react";

export default function ManageCategories() {
  const [institutions, setInstitutions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [institutionId, setInstitutionId] = useState("");
  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    api.get("/institutions").then((res) => setInstitutions(res.data));
  }, []);

  useEffect(() => {
    if (institutionId) {
      setIsLoading(true);
      api
        .get(`/categories?institutionId=${institutionId}`)
        .then((res) => setCategories(res.data))
        .finally(() => setIsLoading(false));
    } else {
      setCategories([]);
    }
  }, [institutionId]);

  const loadCategories = () => {
    if (institutionId) {
      api
        .get(`/categories?institutionId=${institutionId}`)
        .then((res) => setCategories(res.data));
    }
  };

  const addCategory = async () => {
    if (!name.trim() || !institutionId) {
      toast.error("Please select an institution and enter a category name");
      return;
    }
    setIsAdding(true);
    try {
      await api.post("/categories", { name, institutionId });
      toast.success("Category added successfully");
      setName("");
      loadCategories();
    } catch {
      toast.error("Failed to add category");
    } finally {
      setIsAdding(false);
    }
  };

  const deleteCategory = async () => {
    try {
      await api.delete(`/categories/${deleteId}`);
      toast.success("Category deleted");
      setDeleteId(null);
      loadCategories();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 px-4">
      <div className="container max-w-2xl mx-auto">
        {/* Delete Confirmation Dialog */}
        <Dialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this category? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteCategory}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Tags className="h-6 w-6" />
              Manage Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Select Institution */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Select Institution
              </Label>
              <Select value={institutionId} onValueChange={setInstitutionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an institution" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {institutionId && (
              <>
                <Separator />

                {/* Existing Categories */}
                <div>
                  <h3 className="font-semibold mb-4">Existing Categories</h3>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : categories.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No categories yet. Add one below.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {categories.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <span className="font-medium">{c.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(c.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Add Category */}
                <Card className="border">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4">Add New Category</h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Category name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCategory()}
                      />
                      <Button onClick={addCategory} disabled={isAdding}>
                        {isAdding ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

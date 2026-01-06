import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, Plus, Trash2, Loader2 } from "lucide-react";

export default function ManageInstitutions() {
  const [institutions, setInstitutions] = useState([]);
  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const load = () => {
    setIsLoading(true);
    api
      .get("/institutions")
      .then((res) => setInstitutions(res.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const addInstitution = async () => {
    if (!name.trim()) {
      toast.error("Please enter an institution name");
      return;
    }
    setIsAdding(true);
    try {
      await api.post("/institutions", { name });
      toast.success("Institution added successfully");
      setName("");
      load();
    } catch {
      toast.error("Failed to add institution");
    } finally {
      setIsAdding(false);
    }
  };

  const deleteInstitution = async () => {
    try {
      await api.delete(`/institutions/${deleteId}`);
      toast.success("Institution deleted");
      setDeleteId(null);
      load();
    } catch {
      toast.error("Failed to delete institution");
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 px-4">
      <div className="container max-w-2xl mx-auto">
        {/* Delete Confirmation Dialog */}
        <Dialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Institution</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this institution? This action
                cannot be undone and may impact existing reports.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteInstitution}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Building2 className="h-6 w-6" />
              Manage Institutions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Section */}
            <Card className="border">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Add New Institution</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Institution name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addInstitution()}
                  />
                  <Button onClick={addInstitution} disabled={isAdding}>
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* List Section */}
            <div>
              <h3 className="font-semibold mb-4">Existing Institutions</h3>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : institutions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No institutions yet. Add one above.
                </p>
              ) : (
                <div className="space-y-2">
                  {institutions.map((inst) => (
                    <div
                      key={inst.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <span className="font-medium">{inst.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(inst.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

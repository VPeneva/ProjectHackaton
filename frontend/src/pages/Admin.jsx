import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Loader2,
  Settings,
  Send,
  CheckCircle,
  Building2,
  User,
  FileText,
  Image,
} from "lucide-react";

export default function Admin() {
  const [reports, setReports] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/institutions").then((res) => setInstitutions(res.data));
  }, []);

  const loadReports = () => {
    setLoading(true);
    const url = selectedInstitution !== "all"
      ? `/admin/reports?institutionId=${selectedInstitution}`
      : `/admin/reports`;

    api
      .get(url)
      .then((res) => setReports(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, [selectedInstitution]);

  const handleLocalInstitutionChange = (id, value) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, _selectedInstitution: value } : r))
    );
  };

  const sendToInstitution = async (id) => {
    const report = reports.find((r) => r.id === id);
    const instId = report._selectedInstitution || report.institution?.id || null;

    if (!instId) {
      toast.error("Please select an institution to send the report to.");
      return;
    }

    try {
      await api.patch(`/admin/reports/${id}/send`, { institutionId: Number(instId) });
      toast.success("Report sent to institution");
      loadReports();
    } catch {
      toast.error("Failed to send report");
    }
  };

  const markResolved = async (id) => {
    try {
      await api.patch(`/admin/reports/${id}/resolve`);
      toast.success("Report marked as resolved");
      loadReports();
    } catch {
      toast.error("Failed to resolve report");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "SENT":
        return <Badge variant="warning">Sent</Badge>;
      case "FINISHED":
        return <Badge variant="success">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Settings className="h-6 w-6" />
              Admin Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Filter by Institution
              </Label>
              <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="All Institutions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutions</SelectItem>
                  {institutions.map((inst) => (
                    <SelectItem key={inst.id} value={String(inst.id)}>
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* No reports */}
            {!loading && reports.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No reports found for this filter.</p>
              </div>
            )}

            {/* Reports */}
            {!loading && reports.length > 0 && (
              <div className="space-y-4">
                {reports.map((r) => {
                  const localInst = r._selectedInstitution ?? r.institution?.id ?? "";
                  const isSent = r.status === "SENT";
                  const isFinished = r.status === "FINISHED";

                  return (
                    <Card key={r.id} className="border">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg font-semibold">{r.title}</h3>
                          {getStatusBadge(r.status)}
                        </div>

                        {r.description && (
                          <p className="text-muted-foreground">{r.description}</p>
                        )}

                        {r.imageUrl && (
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-1">
                              <Image className="h-4 w-4" />
                              Photo
                            </p>
                            <a href={r.imageUrl} target="_blank" rel="noreferrer">
                              <img
                                src={r.imageUrl}
                                alt="Report"
                                className="max-w-60 max-h-40 rounded-lg object-cover hover:opacity-90 transition-opacity"
                              />
                            </a>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Category:</span>
                            <span>{r.category?.name || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">User:</span>
                            <span>{r.user?.name} ({r.user?.email})</span>
                          </div>
                        </div>

                        {/* Actions */}
                        {isSent && !isFinished && (
                          <div className="flex gap-2 pt-2">
                            <Button onClick={() => markResolved(r.id)} className="gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Mark Resolved
                            </Button>
                          </div>
                        )}

                        {!isSent && !isFinished && (
                          <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                              <Label>Send to Institution</Label>
                              <Select
                                value={String(localInst)}
                                onValueChange={(v) => handleLocalInstitutionChange(r.id, v)}
                              >
                                <SelectTrigger className="max-w-sm">
                                  <SelectValue placeholder="Select institution" />
                                </SelectTrigger>
                                <SelectContent>
                                  {institutions.map((inst) => (
                                    <SelectItem key={inst.id} value={String(inst.id)}>
                                      {inst.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => sendToInstitution(r.id)} className="gap-2">
                                <Send className="h-4 w-4" />
                                Send
                              </Button>
                              <Button variant="outline" onClick={() => markResolved(r.id)} className="gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Resolve
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

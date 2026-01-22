import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Loader2,
  Settings,
  Send,
  CheckCircle,
  Building2,
  User,
  FileText,
  Image,
  Plus,
  Trash2,
  Tags,
  MessageSquare,
  Mail,
  Clock,
  LayoutDashboard,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");

  // Reports state
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");
  const [institutionFilter, setInstitutionFilter] = useState("all");

  // Institutions state
  const [institutions, setInstitutions] = useState([]);
  const [institutionName, setInstitutionName] = useState("");
  const [deleteInstitutionId, setDeleteInstitutionId] = useState(null);
  const [isAddingInstitution, setIsAddingInstitution] = useState(false);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [selectedInstitutionForCategories, setSelectedInstitutionForCategories] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Messages state
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  // Overview stats
  const [stats, setStats] = useState({
    pending: 0,
    sent: 0,
    resolved: 0,
    unreadMessages: 0,
  });

  // Load data on mount
  useEffect(() => {
    loadInstitutions();
    loadAllReports();
    loadMessages();
  }, []);

  useEffect(() => {
    if (selectedInstitutionForCategories) {
      loadCategories();
    } else {
      setCategories([]);
    }
  }, [selectedInstitutionForCategories]);

  useEffect(() => {
    filterReports();
  }, [statusFilter, institutionFilter, allReports]);

  const loadInstitutions = () => {
    api.get("/institutions").then((res) => setInstitutions(res.data));
  };

  const loadAllReports = () => {
    setReportsLoading(true);
    api
      .get("/admin/reports")
      .then((res) => {
        setAllReports(res.data);
        calculateStats(res.data);
      })
      .finally(() => setReportsLoading(false));
  };

  const loadCategories = () => {
    setCategoriesLoading(true);
    api
      .get(`/categories?institutionId=${selectedInstitutionForCategories}`)
      .then((res) => setCategories(res.data))
      .finally(() => setCategoriesLoading(false));
  };

  const loadMessages = () => {
    setMessagesLoading(true);
    api
      .get("/contact")
      .then((res) => setMessages(res.data))
      .finally(() => setMessagesLoading(false));
  };

  const calculateStats = (reportData) => {
    const pending = reportData.filter((r) => r.status === "Pending").length;
    const sent = reportData.filter((r) => r.status === "Sent").length;
    const resolved = reportData.filter((r) => r.status === "Finished").length;
    setStats({ pending, sent, resolved, unreadMessages: 0 });
  };

  const filterReports = () => {
    let filtered = [...allReports];

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((r) => r.status !== "Finished");
    } else if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Institution filter
    if (institutionFilter !== "all") {
      filtered = filtered.filter(
        (r) => String(r.institution?.id) === institutionFilter
      );
    }

    setReports(filtered);
  };

  // Report actions
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
      loadAllReports();
    } catch {
      toast.error("Failed to send report");
    }
  };

  const markResolved = async (id) => {
    try {
      await api.patch(`/admin/reports/${id}/resolve`);
      toast.success("Report marked as resolved");
      loadAllReports();
    } catch {
      toast.error("Failed to resolve report");
    }
  };

  // Institution actions
  const addInstitution = async () => {
    if (!institutionName.trim()) {
      toast.error("Please enter an institution name");
      return;
    }
    setIsAddingInstitution(true);
    try {
      await api.post("/institutions", { name: institutionName });
      toast.success("Institution added successfully");
      setInstitutionName("");
      loadInstitutions();
    } catch {
      toast.error("Failed to add institution");
    } finally {
      setIsAddingInstitution(false);
    }
  };

  const deleteInstitution = async () => {
    try {
      await api.delete(`/institutions/${deleteInstitutionId}`);
      toast.success("Institution deleted");
      setDeleteInstitutionId(null);
      loadInstitutions();
    } catch {
      toast.error("Failed to delete institution");
    }
  };

  // Category actions
  const addCategory = async () => {
    if (!categoryName.trim() || !selectedInstitutionForCategories) {
      toast.error("Please select an institution and enter a category name");
      return;
    }
    setIsAddingCategory(true);
    try {
      await api.post("/categories", {
        name: categoryName,
        institutionId: selectedInstitutionForCategories,
      });
      toast.success("Category added successfully");
      setCategoryName("");
      loadCategories();
    } catch {
      toast.error("Failed to add category");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const deleteCategory = async () => {
    try {
      await api.delete(`/categories/${deleteCategoryId}`);
      toast.success("Category deleted");
      setDeleteCategoryId(null);
      loadCategories();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <Badge variant="warning">Pending</Badge>;
      case "Sent":
        return <Badge>In Progress</Badge>;
      case "Finished":
        return <Badge variant="success">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        {/* Delete Dialogs */}
        <Dialog
          open={Boolean(deleteInstitutionId)}
          onOpenChange={() => setDeleteInstitutionId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Institution</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this institution? This may impact
                existing reports.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteInstitutionId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteInstitution}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(deleteCategoryId)}
          onOpenChange={() => setDeleteCategoryId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this category?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteCategoryId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteCategory}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-7 w-7" />
            Admin Console
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage reports, institutions, categories, and messages
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4 hidden sm:inline" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4 hidden sm:inline" />
              Reports
              {stats.pending + stats.sent > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {stats.pending + stats.sent}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Building2 className="h-4 w-4 hidden sm:inline" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="h-4 w-4 hidden sm:inline" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-500/10">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.pending}</p>
                        <p className="text-sm text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Send className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.sent}</p>
                        <p className="text-sm text-muted-foreground">In Progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.resolved}</p>
                        <p className="text-sm text-muted-foreground">Resolved</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{messages.length}</p>
                        <p className="text-sm text-muted-foreground">Messages</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Requires Attention</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : allReports.filter((r) => r.status === "Pending").length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-10 w-10 mx-auto text-green-500 mb-2" />
                      <p className="text-muted-foreground">
                        No pending reports. Great job!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allReports
                        .filter((r) => r.status === "Pending")
                        .slice(0, 5)
                        .map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div>
                              <p className="font-medium">{r.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {r.category?.name || "Uncategorized"}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setActiveTab("reports");
                                setStatusFilter("Pending");
                              }}
                            >
                              Review
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* REPORTS TAB */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-lg">Manage Reports</CardTitle>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Sent">In Progress</SelectItem>
                        <SelectItem value="Finished">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Institution" />
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
                </div>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No reports match your filters.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((r) => {
                      const localInst = r._selectedInstitution ?? r.institution?.id ?? "";
                      const isSent = r.status === "Sent";
                      const isFinished = r.status === "Finished";

                      return (
                        <Card key={r.id} className="border">
                          <CardContent className="pt-6 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <h3 className="font-semibold">{r.title}</h3>
                              {getStatusBadge(r.status)}
                            </div>

                            {r.description && (
                              <p className="text-sm text-muted-foreground">{r.description}</p>
                            )}

                            {r.imageUrl && (
                              <a href={r.imageUrl} target="_blank" rel="noreferrer">
                                <img
                                  src={r.imageUrl}
                                  alt="Report"
                                  className="max-w-48 max-h-32 rounded-lg object-cover hover:opacity-90 transition-opacity"
                                />
                              </a>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-1.5">
                                <Tags className="h-4 w-4 text-muted-foreground" />
                                <span>{r.category?.name || "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span>{r.institution?.name || "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{r.user?.name}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            {isSent && !isFinished && (
                              <Button size="sm" onClick={() => markResolved(r.id)} className="gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Mark Resolved
                              </Button>
                            )}

                            {!isSent && !isFinished && (
                              <div className="flex flex-wrap items-end gap-3 pt-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Send to</Label>
                                  <Select
                                    value={String(localInst)}
                                    onValueChange={(v) => handleLocalInstitutionChange(r.id, v)}
                                  >
                                    <SelectTrigger className="w-[180px]">
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
                                <Button size="sm" onClick={() => sendToInstitution(r.id)} className="gap-2">
                                  <Send className="h-4 w-4" />
                                  Send
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => markResolved(r.id)} className="gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  Resolve
                                </Button>
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
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Institutions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Institutions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="New institution name"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addInstitution()}
                    />
                    <Button onClick={addInstitution} disabled={isAddingInstitution}>
                      {isAddingInstitution ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <Separator />

                  {institutions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No institutions yet
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {institutions.map((inst) => (
                        <div
                          key={inst.id}
                          className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <span className="text-sm font-medium">{inst.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteInstitutionId(inst.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tags className="h-5 w-5" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={selectedInstitutionForCategories}
                    onValueChange={setSelectedInstitutionForCategories}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution first" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((i) => (
                        <SelectItem key={i.id} value={String(i.id)}>
                          {i.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedInstitutionForCategories && (
                    <>
                      <div className="flex gap-2">
                        <Input
                          placeholder="New category name"
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addCategory()}
                        />
                        <Button onClick={addCategory} disabled={isAddingCategory}>
                          {isAddingCategory ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <Separator />

                      {categoriesLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : categories.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No categories yet
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-[240px] overflow-y-auto">
                          {categories.map((c) => (
                            <div
                              key={c.id}
                              className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                              <span className="text-sm font-medium">{c.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteCategoryId(c.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* MESSAGES TAB */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Contact Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No messages yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((m) => (
                      <Card key={m.id} className="border">
                        <CardContent className="pt-6">
                          <div className="flex flex-wrap items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{m.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <a href={`mailto:${m.email}`} className="hover:underline">
                                {m.email}
                              </a>
                            </div>
                          </div>

                          <p className="text-sm whitespace-pre-wrap">{m.message}</p>

                          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(m.createdAt).toLocaleString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

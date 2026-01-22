import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  FileText,
  Compass,
  Clock,
  Send,
  CheckCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const statusConfig = {
  Pending: { color: "warning", icon: Clock, label: "Pending" },
  Sent: { color: "default", icon: Send, label: "In Progress" },
  Finished: { color: "success", icon: CheckCircle, label: "Resolved" },
};

export default function UserDashboard() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Use the ?mine=true parameter to fetch only user's reports
        const res = await api.get("/reports?mine=true&limit=100");
        // Handle both old array format and new paginated format
        const userReports = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setReports(userReports);

        const pending = userReports.filter((r) => r.status === "Pending").length;
        const inProgress = userReports.filter((r) => r.status === "Sent").length;
        const resolved = userReports.filter((r) => r.status === "Finished").length;
        setStats({
          total: userReports.length,
          pending,
          inProgress,
          resolved,
        });
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReports();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.Pending;
    return <Badge variant={config.color}>{config.label}</Badge>;
  };

  const recentReports = reports.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-8 px-4 border-b bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your civic reporting activity
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Stats Cards */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Your Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <p className="text-2xl font-bold">{stats.total}</p>
                    )}
                    <p className="text-sm text-muted-foreground">Total Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <p className="text-2xl font-bold">{stats.pending}</p>
                    )}
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
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <p className="text-2xl font-bold">{stats.inProgress}</p>
                    )}
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
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <p className="text-2xl font-bold">{stats.resolved}</p>
                    )}
                    <p className="text-sm text-muted-foreground">Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              asChild
              size="lg"
              className="h-auto py-6 flex-col gap-2"
            >
              <Link to="/reports/new">
                <PlusCircle className="h-6 w-6" />
                <span>New Report</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 flex-col gap-2"
            >
              <Link to="/reports">
                <FileText className="h-6 w-6" />
                <span>View All Reports</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 flex-col gap-2"
            >
              <Link to="/explore">
                <Compass className="h-6 w-6" />
                <span>Explore Map</span>
              </Link>
            </Button>
          </div>
        </section>

        {/* Recent Reports */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Reports</h2>
            {reports.length > 3 && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/reports">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No reports yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start contributing to your community by reporting an issue
                </p>
                <Button asChild>
                  <Link to="/reports/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Report
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <Card
                  key={report.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="py-4">
                    <Link
                      to={`/reports/${report.id}`}
                      className="flex items-center gap-4"
                    >
                      {report.imageUrl ? (
                        <img
                          src={report.imageUrl.startsWith("http") ? report.imageUrl : `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}${report.imageUrl}`}
                          alt=""
                          className="h-14 w-14 rounded object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded bg-muted flex items-center justify-center">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{report.title}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {report.category?.name || "Uncategorized"} •{" "}
                          {report.institution?.name || "Unknown"}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

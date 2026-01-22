import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HowItWorks } from "@/components/landing/HowItWorks";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import {
  FileText,
  Clock,
  Send,
  CheckCircle,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "0.75rem",
};

const defaultCenter = { lat: 42.6977, lng: 23.3219 };

export default function LandingPage() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    resolved: 0,
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API,
  });

  useEffect(() => {
    api
      .get("/reports?limit=1000")
      .then((res) => {
        // Handle both old array format and new paginated format
        const reportsData = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setReports(reportsData);
        const pending = reportsData.filter((r) => r.status === "Pending").length;
        const sent = reportsData.filter((r) => r.status === "Sent").length;
        const resolved = reportsData.filter((r) => r.status === "Finished").length;
        setStats({ total: reportsData.length, pending, sent, resolved });
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 px-4">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_50%,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4 gap-1">
            <Sparkles className="h-3 w-3" />
            Community-Powered
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            See a Problem?{" "}
            <span className="text-primary">Report It.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Help improve your community by reporting infrastructure issues.
            Track progress and see real-time updates as problems get resolved.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {user ? (
              <>
                <Button size="lg" asChild>
                  <Link to="/reports/new">
                    Report an Issue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/explore">Explore Issues</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Stats Section */}
      <section className="py-12 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Community Impact
            </h2>
            <p className="text-muted-foreground">
              Real-time statistics from our reporting platform
            </p>
          </div>
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
                      <p className="text-2xl font-bold">{stats.sent}</p>
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
        </div>
      </section>

      {/* Map Preview Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Live Issue Map
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/explore">
                  View Full Map
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {!isLoaded || loading ? (
                <Skeleton className="w-full h-[400px]" />
              ) : (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  zoom={12}
                  center={defaultCenter}
                  options={{
                    styles: [
                      {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }],
                      },
                    ],
                  }}
                >
                  {reports.slice(0, 50).map((r) => (
                    <Marker
                      key={r.id}
                      position={{ lat: r.lat, lng: r.lng }}
                      onClick={() => setSelectedReport(r)}
                    />
                  ))}

                  {selectedReport && (
                    <InfoWindow
                      position={{ lat: selectedReport.lat, lng: selectedReport.lng }}
                      onCloseClick={() => setSelectedReport(null)}
                    >
                      <div className="p-2 max-w-[200px]">
                        <h4 className="font-semibold text-sm mb-1">
                          {selectedReport.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-1">
                          Status: {selectedReport.status}
                        </p>
                        <p className="text-xs text-gray-600 mb-1">
                          Category: {selectedReport.category?.name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">
                          Institution: {selectedReport.institution?.name || "N/A"}
                        </p>
                        {user && (
                          <Link
                            to={`/reports/${selectedReport.id}`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View details →
                          </Link>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Ready to make a difference?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join hundreds of citizens who are actively improving their communities
            by reporting infrastructure issues.
          </p>
          {user ? (
            <Button size="lg" asChild>
              <Link to="/reports/new">
                Create a Report
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/signup">
                  Sign Up Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Loader2,
} from "lucide-react";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "0.75rem",
};

const defaultCenter = { lat: 42.6977, lng: 23.3219 };

export default function LandingPage() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    resolved: 0,
  });
  const [selectedReport, setSelectedReport] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API,
  });

  useEffect(() => {
    api
      .get("/reports")
      .then((res) => {
        setReports(res.data);
        const pending = res.data.filter((r) => r.status === "Pending").length;
        const sent = res.data.filter((r) => r.status === "SENT").length;
        const resolved = res.data.filter((r) => r.status === "FINISHED").length;
        setStats({ total: res.data.length, pending, sent, resolved });
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_50%,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4">
            Community-Powered
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Report Civic Issues,{" "}
            <span className="text-primary">Build Better Cities</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Help improve your community by reporting infrastructure problems.
            Track progress and see real-time updates on issues across the city.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/create">
                Report an Issue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/reports">View All Reports</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
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
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Live Issue Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isLoaded ? (
                <div className="flex items-center justify-center h-[500px] bg-muted rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  zoom={12}
                  center={defaultCenter}
                >
                  {reports.map((r) => (
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
                        <Link
                          to={`/report/${selectedReport.id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View details →
                        </Link>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

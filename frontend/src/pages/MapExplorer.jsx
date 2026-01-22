import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import {
  MapPin,
  Clock,
  Send,
  CheckCircle,
  ArrowRight,
  X,
  Filter,
} from "lucide-react";

const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 200px)",
  minHeight: "500px",
};

const defaultCenter = { lat: 42.6977, lng: 23.3219 };

const statusConfig = {
  Pending: { color: "warning", icon: Clock, label: "Pending" },
  Sent: { color: "default", icon: Send, label: "In Progress" },
  Finished: { color: "success", icon: CheckCircle, label: "Resolved" },
};

export default function MapExplorer() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, institutionsRes] = await Promise.all([
          api.get("/reports?limit=1000"),
          api.get("/institutions"),
        ]);
        // Handle both old array format and new paginated format
        const reportsData = Array.isArray(reportsRes.data) ? reportsRes.data : (reportsRes.data.data || []);
        setReports(reportsData);
        setFilteredReports(reportsData);
        setInstitutions(institutionsRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredReports(reports);
    } else {
      setFilteredReports(
        reports.filter((r) => r.institution?.name === activeFilter)
      );
    }
    setSelectedReport(null);
  }, [activeFilter, reports]);

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.Pending;
    return <Badge variant={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-8 px-4 border-b bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Explore Issues
              </h1>
              <p className="text-muted-foreground mt-1">
                View reported infrastructure issues across the city
              </p>
            </div>
            {!user && (
              <Button asChild>
                <Link to="/signup">
                  Report an Issue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 px-4 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <Button
              variant={activeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("all")}
            >
              All Issues
              <Badge variant="secondary" className="ml-2">
                {reports.length}
              </Badge>
            </Button>
            {institutions.map((inst) => {
              const count = reports.filter(
                (r) => r.institution?.name === inst.name
              ).length;
              if (count === 0) return null;
              return (
                <Button
                  key={inst.id}
                  variant={activeFilter === inst.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(inst.name)}
                >
                  {inst.name}
                  <Badge variant="secondary" className="ml-2">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="relative">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <Card className="overflow-hidden border-0 shadow-lg">
            <CardContent className="p-0">
              {!isLoaded || loading ? (
                <Skeleton className="w-full h-[calc(100vh-200px)] min-h-[500px]" />
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
                  {filteredReports.map((report) => (
                    <Marker
                      key={report.id}
                      position={{ lat: report.lat, lng: report.lng }}
                      onClick={() => setSelectedReport(report)}
                    />
                  ))}

                  {selectedReport && (
                    <InfoWindow
                      position={{
                        lat: selectedReport.lat,
                        lng: selectedReport.lng,
                      }}
                      onCloseClick={() => setSelectedReport(null)}
                    >
                      <div className="p-2 max-w-[250px]">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-sm">
                            {selectedReport.title}
                          </h4>
                          <button
                            onClick={() => setSelectedReport(null)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-1.5 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Status:</span>
                            {getStatusBadge(selectedReport.status)}
                          </div>
                          <p>
                            <span className="font-medium">Category:</span>{" "}
                            {selectedReport.category?.name || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Institution:</span>{" "}
                            {selectedReport.institution?.name || "N/A"}
                          </p>
                        </div>
                        {user && (
                          <Link
                            to={`/reports/${selectedReport.id}`}
                            className="mt-3 inline-flex items-center text-xs text-primary hover:underline"
                          >
                            View details
                            <ArrowRight className="ml-1 h-3 w-3" />
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

      {/* CTA for non-logged in users */}
      {!user && (
        <section className="py-12 px-4 bg-muted/50">
          <div className="container mx-auto max-w-2xl text-center">
            <MapPin className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Want to report an issue?
            </h2>
            <p className="text-muted-foreground mb-4">
              Sign up to report infrastructure problems and help improve your
              community
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

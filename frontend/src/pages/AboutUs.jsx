import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Code, Heart } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">About Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We are a passionate team of developers working to make cities better
            through technology.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card>
            <CardHeader>
              <div className="p-2 rounded-lg bg-primary/10 w-fit mb-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Our Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A small team of aspiring developers who believe in the power of
                community-driven solutions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 rounded-lg bg-primary/10 w-fit mb-2">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                To create tools that empower citizens to report issues and
                collaborate with local governments effectively.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 rounded-lg bg-primary/10 w-fit mb-2">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Transparency, community involvement, and a commitment to making
                our cities better places to live.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold mb-4">Our Story</h3>
              <p className="text-muted-foreground mb-4">
                We are a small team of aspiring developers who strive for a
                better future. This application was created during a 24-hour
                hackathon as an example of how technology can help protect our
                communities, cities, and environment.
              </p>
              <p className="text-muted-foreground">
                Our goal is to make it easy for citizens to report infrastructure
                issues and track their resolution, creating a transparent bridge
                between communities and local governments.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

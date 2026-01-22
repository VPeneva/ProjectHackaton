import { Card, CardContent } from "@/components/ui/card";
import { Eye, MapPin, Bell } from "lucide-react";

const steps = [
  {
    icon: Eye,
    title: "1. Spot",
    description: "See a pothole, broken light, or other issue in your community",
  },
  {
    icon: MapPin,
    title: "2. Report",
    description: "Take a photo, pin the location, and describe the problem",
  },
  {
    icon: Bell,
    title: "3. Track",
    description: "Follow progress as authorities review and resolve your report",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            How CivicReport Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Report issues in three simple steps and help make your city better
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="border-0 shadow-sm text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

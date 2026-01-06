import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ScrollText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Terms of Service</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">1. Acceptance of Terms</h3>
            <p className="text-muted-foreground">
              By accessing and using CivicReport, you accept and agree to be bound
              by the terms and provisions of this agreement.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">2. Use of Service</h3>
            <p className="text-muted-foreground">
              You agree to use the service only for lawful purposes and in
              accordance with these Terms. You are responsible for all content
              you submit.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">3. User Content</h3>
            <p className="text-muted-foreground">
              By submitting reports and other content, you grant us the right to
              use, modify, and display that content in connection with our
              services.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">4. Intellectual Property</h3>
            <p className="text-muted-foreground">
              All content and materials available on CivicReport are protected by
              applicable intellectual property laws. Don't steal our website.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">5. Changes to Terms</h3>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued
              use of the service after changes constitutes acceptance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

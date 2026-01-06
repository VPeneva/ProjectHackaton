import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function Legal() {
  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Privacy Policy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">1. Information We Collect</h3>
            <p className="text-muted-foreground">
              We collect information you provide directly to us, such as when you
              create an account, submit a report, or contact us.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">2. How We Use Information</h3>
            <p className="text-muted-foreground">
              We use the information to provide, maintain, and improve our
              services, process reports, and communicate with you.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">3. Information Sharing</h3>
            <p className="text-muted-foreground">
              We do not sell your personal information. We may share information
              with relevant local authorities to process your reports.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">4. Data Security</h3>
            <p className="text-muted-foreground">
              We take reasonable measures to help protect your personal
              information from loss, theft, misuse, and unauthorized access.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">5. Your Rights</h3>
            <p className="text-muted-foreground">
              You may access, update, or delete your account information at any
              time by contacting us or through your account settings.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">6. Contact Us</h3>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us
              through our contact form.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

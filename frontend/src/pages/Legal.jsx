import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, Shield } from "lucide-react";

export default function Legal() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "terms";
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Legal Information
          </h1>
          <p className="text-muted-foreground mt-2">
            Our terms of service and privacy policy
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="terms" className="gap-2">
                  <ScrollText className="h-4 w-4" />
                  Terms of Service
                </TabsTrigger>
                <TabsTrigger value="privacy" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy Policy
                </TabsTrigger>
              </TabsList>

              {/* Terms of Service */}
              <TabsContent value="terms">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm text-muted-foreground mb-6">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-2">
                    1. Acceptance of Terms
                  </h3>
                  <p className="text-muted-foreground">
                    By accessing and using CivicReport, you accept and agree to be
                    bound by the terms and provisions of this agreement.
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-2">
                    2. Use of Service
                  </h3>
                  <p className="text-muted-foreground">
                    You agree to use the service only for lawful purposes and in
                    accordance with these Terms. You are responsible for all
                    content you submit.
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-2">
                    3. User Content
                  </h3>
                  <p className="text-muted-foreground">
                    By submitting reports and other content, you grant us the
                    right to use, modify, and display that content in connection
                    with our services.
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-2">
                    4. Intellectual Property
                  </h3>
                  <p className="text-muted-foreground">
                    All content and materials available on CivicReport are
                    protected by applicable intellectual property laws.
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-2">
                    5. Changes to Terms
                  </h3>
                  <p className="text-muted-foreground">
                    We reserve the right to modify these terms at any time.
                    Continued use of the service after changes constitutes
                    acceptance.
                  </p>
                </div>
              </TabsContent>

              {/* Privacy Policy */}
              <TabsContent value="privacy">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm text-muted-foreground mb-6">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-2">
                    1. Information We Collect
                  </h3>
                  <p className="text-muted-foreground">
                    We collect information you provide directly to us, such as
                    when you create an account, submit a report, or contact us.
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-2">
                    2. How We Use Information
                  </h3>
                  <p className="text-muted-foreground">
                    We use the information to provide, maintain, and improve our
                    services, process reports, and communicate with you.
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-2">
                    3. Information Sharing
                  </h3>
                  <p className="text-muted-foreground">
                    We do not sell your personal information. We may share
                    information with relevant local authorities to process your
                    reports.
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-2">
                    4. Data Security
                  </h3>
                  <p className="text-muted-foreground">
                    We take reasonable measures to help protect your personal
                    information from loss, theft, misuse, and unauthorized
                    access.
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-2">
                    5. Your Rights
                  </h3>
                  <p className="text-muted-foreground">
                    You may access, update, or delete your account information at
                    any time by contacting us or through your account settings.
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-2">
                    6. Contact Us
                  </h3>
                  <p className="text-muted-foreground">
                    If you have questions about this Privacy Policy, please
                    contact us through our contact form.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

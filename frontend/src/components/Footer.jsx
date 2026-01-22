import { Link } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const handleSubscribe = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    toast.success("Thanks for subscribing!");
    e.target.reset();
  };

  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-semibold mb-4">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">CR</span>
              </div>
              <span>CivicReport</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Report and track civic infrastructure issues in your community. Together we can make our cities better.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button type="submit" size="sm">
                Subscribe
              </Button>
            </form>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium mb-3">Product</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Explore Map
              </Link>
              <Link to="/reports" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                My Reports
              </Link>
              <Link to="/reports/new" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Create Report
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-medium mb-3">Company</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/aboutus" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link to="/contactus" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link to="/legal?tab=privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
            </nav>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CivicReport. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://github.com/VPeneva/ProjectHackaton"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://www.linkedin.com/in/bozhidar-kamenski-862817253/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/contactus" aria-label="Contact">
                <Mail className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

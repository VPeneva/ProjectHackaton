import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  product: [
    { href: '/reports', label: 'Browse Reports' },
    { href: '/map', label: 'Map Explorer' },
    { href: '/create-report', label: 'Submit Report' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ],
  legal: [
    { href: '/legal', label: 'Terms of Service' },
    { href: '/legal', label: 'Privacy Policy' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                CR
              </div>
              <span className="font-bold">CivicReport</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Empowering citizens to improve their communities through collaborative infrastructure reporting.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CivicReport. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Made with care for our communities</p>
        </div>
      </div>
    </footer>
  )
}

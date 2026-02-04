import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/context/I18nContext'

export default function Footer() {
  const { t } = useI18n()

  const footerLinks = {
    product: [
      { href: '/reports', label: t('nav.reports') },
      { href: '/map', label: t('nav.map') },
      { href: '/create-report', label: t('nav.reportIssue') },
    ],
    company: [
      { href: '/about', label: t('nav.about') },
      { href: '/contact', label: t('nav.contact') },
    ],
    legal: [
      { href: '/legal', label: 'Terms of Service' },
      { href: '/legal', label: 'Privacy Policy' },
    ],
  }

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
              {t('footer.tagline')}
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.quickLinks')}</h3>
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
            <h3 className="font-semibold mb-4">{t('footer.resources')}</h3>
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
            <h3 className="font-semibold mb-4">{t('footer.legal')}</h3>
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
          <p>
            &copy; {new Date().getFullYear()} CivicReport. {t('footer.rights')}
          </p>
          <p className="mt-2 sm:mt-0">Made with care for our communities</p>
        </div>
      </div>
    </footer>
  )
}

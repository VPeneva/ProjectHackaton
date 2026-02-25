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
      { href: '/legal', label: t('footer.termsOfService') },
      { href: '/legal', label: t('footer.privacyPolicy') },
    ],
  }

  return (
    <footer className="border-t-4 border-primary bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        {/* Top section: Logo + Tagline */}
        <div className="mb-12">
          <Link to="/" className="inline-block">
            <span className="font-display text-3xl font-black uppercase tracking-tight text-background">
              CITYCLARITY<span className="text-primary">.</span>
            </span>
          </Link>
          <p className="mt-3 font-mono text-sm text-background/50 tracking-wider">
            // CITY CLARITY INFRASTRUCTURE SYSTEM
          </p>
          <p className="mt-2 text-sm text-background/60">
            {t('footer.tagline')}
          </p>
        </div>

        {/* Grid: 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Product Links */}
          <div>
            <h3 className="uppercase font-bold text-primary font-mono text-xs tracking-widest mb-6">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    to={link.href}
                    className="text-xs uppercase tracking-wider text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="uppercase font-bold text-primary font-mono text-xs tracking-widest mb-6">
              {t('footer.resources')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    to={link.href}
                    className="text-xs uppercase tracking-wider text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="uppercase font-bold text-primary font-mono text-xs tracking-widest mb-6">
              {t('footer.legal')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-xs uppercase tracking-wider text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Status block */}
          <div>
            <h3 className="uppercase font-bold text-primary font-mono text-xs tracking-widest mb-6">
              {t('footer.systemStatus')}
            </h3>
            <div className="space-y-2 font-mono text-xs text-background/50">
              <p>STATUS: <span className="text-green-400">ONLINE</span></p>
              <p>BUILD: v1.0.0</p>
              <p>REGION: BG</p>
            </div>
          </div>
        </div>

        <Separator className="my-10 h-[2px] bg-background/20" />

        {/* Footer bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-mono text-xs text-background/50">
          <p className="uppercase tracking-wider">
            &copy; {new Date().getFullYear()} CITYCLARITY. {t('footer.rights')}
          </p>
          <p className="uppercase tracking-wider">
            Made with care for our communities
          </p>
          <p className="uppercase tracking-wider">
            {t('footer.madeWithCare')}
          </p>
        </div>
      </div>
    </footer>
  )
}

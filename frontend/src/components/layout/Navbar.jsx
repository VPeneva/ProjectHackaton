import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useI18n } from '@/context/I18nContext'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Menu,
  Sun,
  Moon,
  Accessibility,
  LogOut,
  User,
  LayoutDashboard,
  FileText,
  Plus,
  Shield,
  Building2,
  MessageSquare,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isInstitution, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useI18n()
  const { data: notifications = [] } = useNotifications(isAuthenticated)
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const publicLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/reports', label: t('nav.reports') },
    { href: '/map', label: t('nav.map') },
    { href: '/leaderboard', label: t('nav.leaderboard') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-foreground bg-background transition-none">
      <div className="container mx-auto flex h-[72px] items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 transition-none">
          <span className="font-display text-2xl font-black uppercase tracking-tight leading-none select-none">
            CIVIC
          </span>
          <span className="inline-block h-[6px] w-[6px] bg-primary -translate-y-1" />
          <span className="font-display text-2xl font-black uppercase tracking-tight leading-none select-none">
            REPORT
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'text-xs font-semibold uppercase tracking-[0.1em] transition-none pb-1',
                isActive(link.href)
                  ? 'text-foreground border-b-[3px] border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:border-b-[3px] hover:border-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="hidden sm:flex w-[88px] h-9 rounded-none border-2 border-foreground text-xs font-semibold uppercase tracking-[0.08em] transition-none">
              <SelectValue placeholder={t('nav.language')} />
            </SelectTrigger>
            <SelectContent className="rounded-none border-2 border-foreground">
              <SelectItem value="en" className="rounded-none text-xs font-semibold uppercase tracking-[0.08em]">EN</SelectItem>
              <SelectItem value="bg" className="rounded-none text-xs font-semibold uppercase tracking-[0.08em]">BG</SelectItem>
            </SelectContent>
          </Select>

          {/* Theme toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex rounded-none border-2 border-transparent hover:border-foreground transition-none"
                aria-label={t('nav.lightMode')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : theme === 'high-contrast' ? (
                  <Accessibility className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none border-2 border-foreground">
              <DropdownMenuItem onClick={() => setTheme('light')} className="rounded-none text-xs font-semibold uppercase tracking-wide transition-none">
                <Sun className="mr-2 h-4 w-4" />
                {t('nav.lightMode')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className="rounded-none text-xs font-semibold uppercase tracking-wide transition-none">
                <Moon className="mr-2 h-4 w-4" />
                {t('nav.darkMode')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('high-contrast')} className="rounded-none text-xs font-semibold uppercase tracking-wide transition-none">
                <Accessibility className="mr-2 h-4 w-4" />
                {t('nav.highContrast')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <>
              {/* Create Report button */}
              <Button asChild size="sm" variant="default" className="hidden sm:flex rounded-none border-2 border-primary font-semibold text-xs uppercase tracking-[0.08em] transition-none">
                <Link to="/create-report">
                  <span className="mr-1 font-normal">[</span>
                  <Plus className="mr-1 h-4 w-4" />
                  {t('nav.reportIssue')}
                  <span className="ml-1 font-normal">]</span>
                </Link>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" asChild className="relative rounded-none border-2 border-transparent hover:border-foreground transition-none">
                <Link to="/notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center px-1 rounded-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Link>
              </Button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-none border-2 border-foreground p-0 transition-none">
                    <Avatar className="h-full w-full rounded-none">
                      <AvatarFallback className="rounded-none bg-primary text-primary-foreground font-bold text-xs">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-none border-2 border-foreground" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal rounded-none">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none uppercase">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground font-mono">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-foreground h-[2px]" />
                  <DropdownMenuItem asChild className="rounded-none text-xs font-semibold uppercase tracking-wide transition-none">
                    <Link to="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t('nav.dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-none text-xs font-semibold uppercase tracking-wide transition-none">
                    <Link to={`/users/${user?.id}`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      {t('nav.myProfile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-none text-xs font-semibold uppercase tracking-wide transition-none">
                    <Link to="/my-reports" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      {t('nav.myReports')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-none text-xs font-semibold uppercase tracking-wide transition-none">
                    <Link to="/messages" className="cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {t('nav.messages')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-none text-xs font-semibold uppercase tracking-wide transition-none">
                    <Link to="/notifications" className="cursor-pointer">
                      <Bell className="mr-2 h-4 w-4" />
                      {t('nav.notifications')}
                    </Link>
                  </DropdownMenuItem>
                  {isInstitution && (
                    <DropdownMenuItem asChild className="rounded-none text-xs font-semibold uppercase tracking-wide transition-none">
                      <Link to="/institution" className="cursor-pointer">
                        <Building2 className="mr-2 h-4 w-4" />
                        {t('institution.title')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-foreground h-[2px]" />
                      <DropdownMenuItem asChild className="rounded-none text-xs font-semibold uppercase tracking-wide transition-none">
                        <Link to="/admin" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          {t('nav.adminPanel')}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-foreground h-[2px]" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-none text-xs font-semibold uppercase tracking-wide transition-none">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.logOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" asChild className="rounded-none border-2 border-transparent hover:border-foreground text-xs font-semibold uppercase tracking-[0.08em] transition-none">
                <Link to="/login">{t('nav.signIn')}</Link>
              </Button>
              <Button asChild variant="default" className="rounded-none border-2 border-primary text-xs font-semibold uppercase tracking-[0.08em] transition-none">
                <Link to="/register">
                  <span className="mr-1 font-normal">[</span>
                  {t('nav.getStarted')}
                  <span className="ml-1 font-normal">]</span>
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-none border-2 border-foreground transition-none">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] rounded-none border-l-4 border-foreground">
              <SheetHeader>
                <SheetTitle className="font-display text-xl font-black uppercase tracking-tight text-left">
                  {t('nav.menu')}
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-0 mt-6">
                {publicLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'text-sm font-semibold uppercase tracking-[0.1em] transition-none py-3 border-b-2 border-muted',
                      isActive(link.href)
                        ? 'text-primary border-b-[3px] border-primary'
                        : 'text-foreground hover:text-primary'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <>
                    <div className="border-t-4 border-foreground mt-4 pt-4">
                      <Link
                        to="/create-report"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center text-sm font-bold uppercase tracking-[0.1em] text-primary transition-none py-2"
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        [ {t('nav.reportIssue')} ]
                      </Link>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center text-sm font-semibold uppercase tracking-[0.1em] transition-none py-3 border-b-2 border-muted"
                    >
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      {t('nav.dashboard')}
                    </Link>
                    <Link
                      to={`/users/${user?.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center text-sm font-semibold uppercase tracking-[0.1em] transition-none py-3 border-b-2 border-muted"
                    >
                      <User className="mr-2 h-5 w-5" />
                      {t('nav.myProfile')}
                    </Link>
                    <Link
                      to="/my-reports"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center text-sm font-semibold uppercase tracking-[0.1em] transition-none py-3 border-b-2 border-muted"
                    >
                      <FileText className="mr-2 h-5 w-5" />
                      {t('nav.myReports')}
                    </Link>
                    <Link
                      to="/messages"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center text-sm font-semibold uppercase tracking-[0.1em] transition-none py-3 border-b-2 border-muted"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      {t('nav.messages')}
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center text-sm font-semibold uppercase tracking-[0.1em] transition-none py-3 border-b-2 border-muted"
                    >
                      <Bell className="mr-2 h-5 w-5" />
                      {t('nav.notifications')}
                    </Link>
                    {isInstitution && (
                      <Link
                        to="/institution"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center text-sm font-semibold uppercase tracking-[0.1em] transition-none py-3 border-b-2 border-muted"
                      >
                        <Building2 className="mr-2 h-5 w-5" />
                        {t('institution.title')}
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center text-sm font-semibold uppercase tracking-[0.1em] transition-none py-3 border-b-2 border-muted"
                      >
                        <Shield className="mr-2 h-5 w-5" />
                        {t('nav.adminPanel')}
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileOpen(false)
                      }}
                      className="flex items-center text-sm font-bold uppercase tracking-[0.1em] text-destructive transition-none py-3 border-b-2 border-muted"
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      {t('nav.logOut')}
                    </button>
                  </>
                ) : (
                  <div className="border-t-4 border-foreground mt-4 pt-4 space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block text-sm font-semibold uppercase tracking-[0.1em] transition-none py-2"
                    >
                      {t('nav.signIn')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block text-sm font-bold uppercase tracking-[0.1em] text-primary transition-none py-2"
                    >
                      [ {t('nav.getStarted')} ]
                    </Link>
                  </div>
                )}

                <div className="border-t-4 border-foreground mt-4 pt-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">{t('nav.highContrast')}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => setTheme('light')}
                      className="rounded-none border-2 border-foreground text-xs font-semibold uppercase tracking-wide transition-none"
                    >
                      {t('nav.lightMode')}
                    </Button>
                    <Button
                      size="sm"
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setTheme('dark')}
                      className="rounded-none border-2 border-foreground text-xs font-semibold uppercase tracking-wide transition-none"
                    >
                      {t('nav.darkMode')}
                    </Button>
                    <Button
                      size="sm"
                      variant={theme === 'high-contrast' ? 'default' : 'outline'}
                      onClick={() => setTheme('high-contrast')}
                      className="rounded-none border-2 border-foreground text-xs font-semibold uppercase tracking-wide transition-none"
                    >
                      {t('nav.highContrast')}
                    </Button>
                  </div>
                </div>

                <div className="border-t-4 border-foreground mt-4 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">{t('nav.language')}</span>
                    <div className="flex items-center gap-0">
                      <button
                        onClick={() => setLanguage('en')}
                        className={cn(
                          'px-3 py-1 text-xs font-bold uppercase tracking-wide border-2 border-foreground transition-none',
                          language === 'en' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'
                        )}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLanguage('bg')}
                        className={cn(
                          'px-3 py-1 text-xs font-bold uppercase tracking-wide border-2 border-l-0 border-foreground transition-none',
                          language === 'bg' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'
                        )}
                      >
                        BG
                      </button>
                    </div>
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

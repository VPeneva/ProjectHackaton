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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            CR
          </div>
          <span className="hidden font-bold sm:inline-block">CityClarity</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                isActive(link.href)
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Language selector */}
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="hidden sm:flex w-[88px] h-9">
              <SelectValue placeholder={t('nav.language')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="bg">BG</SelectItem>
            </SelectContent>
          </Select>

          {/* Theme toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex"
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                {t('nav.lightMode')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                {t('nav.darkMode')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('high-contrast')}>
                <Accessibility className="mr-2 h-4 w-4" />
                {t('nav.highContrast')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <>
              {/* Create Report button */}
              <Button asChild size="sm" className="hidden sm:flex">
                <Link to="/create-report">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('nav.reportIssue')}
                </Link>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link to="/notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground flex items-center justify-center px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Link>
              </Button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t('nav.dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/users/${user?.id}`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      {t('nav.myProfile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-reports" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      {t('nav.myReports')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {t('nav.messages')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/notifications" className="cursor-pointer">
                      <Bell className="mr-2 h-4 w-4" />
                      {t('nav.notifications')}
                    </Link>
                  </DropdownMenuItem>
                  {isInstitution && (
                    <DropdownMenuItem asChild>
                      <Link to="/institution" className="cursor-pointer">
                        <Building2 className="mr-2 h-4 w-4" />
                        {t('institution.title')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          {t('nav.adminPanel')}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.logOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">{t('nav.signIn')}</Link>
              </Button>
              <Button asChild>
                <Link to="/register">{t('nav.getStarted')}</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>{t('nav.menu')}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-6">
                {publicLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-primary',
                      isActive(link.href) ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <>
                    <div className="border-t pt-4">
                      <Link
                        to="/create-report"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center text-lg font-medium"
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        {t('nav.reportIssue')}
                      </Link>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center text-lg font-medium"
                    >
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      {t('nav.dashboard')}
                    </Link>
                    <Link
                      to={`/users/${user?.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center text-lg font-medium"
                    >
                      <User className="mr-2 h-5 w-5" />
                      {t('nav.myProfile')}
                    </Link>
                    <Link
                      to="/my-reports"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center text-lg font-medium"
                    >
                      <FileText className="mr-2 h-5 w-5" />
                      {t('nav.myReports')}
                    </Link>
                    <Link
                      to="/messages"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center text-lg font-medium"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      {t('nav.messages')}
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center text-lg font-medium"
                    >
                      <Bell className="mr-2 h-5 w-5" />
                      {t('nav.notifications')}
                    </Link>
                    {isInstitution && (
                      <Link
                        to="/institution"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center text-lg font-medium"
                      >
                        <Building2 className="mr-2 h-5 w-5" />
                        {t('institution.title')}
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center text-lg font-medium"
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
                      className="flex items-center text-lg font-medium text-destructive"
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      {t('nav.logOut')}
                    </button>
                  </>
                ) : (
                  <div className="border-t pt-4 space-y-4">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block text-lg font-medium"
                    >
                      {t('nav.signIn')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block text-lg font-medium text-primary"
                    >
                      {t('nav.getStarted')}
                    </Link>
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">{t('nav.highContrast')}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => setTheme('light')}
                    >
                      {t('nav.lightMode')}
                    </Button>
                    <Button
                      size="sm"
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setTheme('dark')}
                    >
                      {t('nav.darkMode')}
                    </Button>
                    <Button
                      size="sm"
                      variant={theme === 'high-contrast' ? 'default' : 'outline'}
                      onClick={() => setTheme('high-contrast')}
                    >
                      {t('nav.highContrast')}
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('nav.language')}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLanguage('en')}
                        className={`text-sm font-medium ${language === 'en' ? 'text-primary' : ''}`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLanguage('bg')}
                        className={`text-sm font-medium ${language === 'bg' ? 'text-primary' : ''}`}
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

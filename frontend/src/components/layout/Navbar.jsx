import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  User,
  LayoutDashboard,
  FileText,
  Map,
  Plus,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/reports', label: 'Reports' },
  { href: '/map', label: 'Map' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            CR
          </div>
          <span className="hidden font-bold sm:inline-block">CivicReport</span>
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
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden sm:flex"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isAuthenticated ? (
            <>
              {/* Create Report button */}
              <Button asChild size="sm" className="hidden sm:flex">
                <Link to="/create-report">
                  <Plus className="mr-2 h-4 w-4" />
                  Report Issue
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
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-reports" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      My Reports
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
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
                <SheetTitle>Menu</SheetTitle>
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
                        Report Issue
                      </Link>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center text-lg font-medium"
                    >
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      Dashboard
                    </Link>
                    <Link
                      to="/my-reports"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center text-lg font-medium"
                    >
                      <FileText className="mr-2 h-5 w-5" />
                      My Reports
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center text-lg font-medium"
                      >
                        <Shield className="mr-2 h-5 w-5" />
                        Admin Panel
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
                      Log out
                    </button>
                  </>
                ) : (
                  <div className="border-t pt-4 space-y-4">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block text-lg font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block text-lg font-medium text-primary"
                    >
                      Get Started
                    </Link>
                  </div>
                )}

                <div className="border-t pt-4">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center text-lg font-medium"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="mr-2 h-5 w-5" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-5 w-5" />
                        Dark Mode
                      </>
                    )}
                  </button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

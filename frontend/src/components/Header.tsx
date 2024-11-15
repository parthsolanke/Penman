import { Link, useLocation } from 'react-router-dom'
import { Pen } from 'lucide-react'

export default function Header() {
  const { pathname } = useLocation();

  const renderNavLinks = () => {
    switch (pathname) {
      case '/playground':
        return (
          <>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="/">
              Home
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="/cards">
              Cards
            </Link>
          </>
        );
      case '/cards':
        return (
          <>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="/">
              Home
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="/playground">
              Playground
            </Link>
          </>
        );
      default:
        return (
          <>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="/">
              Home
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="/playground">
              Playground
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="/cards">
              Cards
            </Link>
          </>
        );
    }
  };

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background">
      <Link className="flex items-center justify-center gap-2" to="/">
        <Pen className="h-6 w-6" />
        <span className="font-bold text-2xl">Penman</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        {renderNavLinks()}
      </nav>
    </header>
  )
}
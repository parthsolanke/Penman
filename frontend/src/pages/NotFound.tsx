
import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link to="/">
        <Button>
          <Home className="mr-2 h-4 w-4" />
          Return Home
        </Button>
      </Link>
    </div>
  )
}
import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Edit, Wand2, Heart } from 'lucide-react'
import Header from '@/components/Header'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/hero-image.svg')] bg-no-repeat bg-center bg-[length:120%] opacity-[0.12] scale-110"></div>
          </div>
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Welcome to Penman
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-700 md:text-xl dark:text-gray-300">
                  Create digital content with authentic human handwriting styles
                </p>
              </div>
              <div className="space-x-4">
                <Link to="/playground">
                  <Button>
                    Try Playground
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/cards">
                  <Button variant="outline">
                    Create Cards
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 items-center">
              <div className="flex flex-col justify-center space-y-8 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Features
                  </h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 mx-auto">
                    Discover what Penman can do for you
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <Wand2 className="h-10 w-10 mb-2" />
                    <CardTitle>Diverse Handwriting Styles</CardTitle>
                    <CardDescription>
                      Choose from a collection of authentic human handwriting styles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    Select from our curated collection of natural handwriting styles, each mimicking real human penmanship.
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <Edit className="h-10 w-10 mb-2" />
                    <CardTitle>Custom Card Creation</CardTitle>
                    <CardDescription>
                      Design beautiful cards with realistic handwritten text
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    Create personalized cards by combining your chosen handwriting style with our versatile templates.
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Developed with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> by{" "}
            <span className="font-medium">Parth Solanke</span>
          </p>
          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://github.com/parthsolanke"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <img 
                src="/github.svg"
                alt="GitHub" 
                className="mr-2 h-4 w-4" 
              />
              GitHub
            </a>
          </Button>
        </div>
      </footer>
    </div>
  )
}
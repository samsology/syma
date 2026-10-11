import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, Home, Shield } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-20 text-slate-900 flex items-center">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="font-heading text-2xl font-black">404</span>
          </div>

          <p className="text-sm font-bold uppercase tracking-wider text-primary">Page Not Found</p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold text-slate-950 sm:text-4xl">
            We couldn't find the page you're looking for.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
            The page may have moved, the URL was entered incorrectly, or you may need to navigate from your learning portal or admin console.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/">
              <Button size="lg" className="inline-flex items-center gap-2">
                <Home className="h-4 w-4" />
                Return Home
              </Button>
            </Link>
            <Link href="/programs">
              <Button variant="outline" size="lg" className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Explore Courses
              </Button>
            </Link>
            <Link href="/student">
              <Button variant="outline" size="lg" className="inline-flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Student Portal
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button variant="outline" size="lg" className="inline-flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin Console
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

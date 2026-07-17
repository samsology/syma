import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white py-20 text-slate-900">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">Page not found</p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold text-slate-950 sm:text-5xl">
            This insight is not available here.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500">
            The page may have moved, but Syma Tech Solutions can still help you explore healthcare analytics, research intelligence, business intelligence, and professional education.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/solutions">
              <Button size="lg" className="w-full sm:w-auto">
                Explore Solutions <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

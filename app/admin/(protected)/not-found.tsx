import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm max-w-md w-full">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Admin Console</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">Page or Record Not Found</h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          The requested administrative page, course, or curriculum resource does not exist or has been moved.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/admin/courses"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to Courses
          </Link>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

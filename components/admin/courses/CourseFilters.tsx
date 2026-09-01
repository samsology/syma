import { Search } from 'lucide-react';
import { courseCategories, courseLevels, courseSortOptions } from '@/lib/courses/options';

type CourseFiltersProps = {
  searchParams: Record<string, string | undefined>;
};

export function CourseFilters({ searchParams }: CourseFiltersProps) {
  return (
    <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_160px_180px_160px_180px]">
      <div>
        <label htmlFor="q" className="sr-only">
          Search courses
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="q"
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search courses..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm"
          />
        </div>
      </div>
      <select name="status" defaultValue={searchParams.status ?? 'ALL'} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" aria-label="Filter by status">
        <option value="ALL">All statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
        <option value="ARCHIVED">Archived</option>
      </select>
      <select name="category" defaultValue={searchParams.category ?? 'ALL'} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" aria-label="Filter by category">
        <option value="ALL">All categories</option>
        {courseCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <select name="level" defaultValue={searchParams.level ?? 'ALL'} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" aria-label="Filter by level">
        <option value="ALL">All levels</option>
        {courseLevels.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <select name="sort" defaultValue={searchParams.sort ?? 'recent'} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm" aria-label="Sort courses">
          {courseSortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-secondary">
          Apply
        </button>
      </div>
    </form>
  );
}

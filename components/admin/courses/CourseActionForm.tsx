'use client';

import { useFormStatus } from 'react-dom';

type CourseActionFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  courseId: string;
  label: string;
  confirmMessage: string;
  variant?: 'primary' | 'danger' | 'neutral';
};

function SubmitButton({ label, variant = 'neutral' }: Pick<CourseActionFormProps, 'label' | 'variant'>) {
  const { pending } = useFormStatus();
  const styles = {
    primary: 'bg-primary text-white hover:bg-secondary',
    danger: 'bg-red-50 text-error hover:bg-red-100',
    neutral: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  };

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]}`}
    >
      {pending ? 'Working...' : label}
    </button>
  );
}

export function CourseActionForm({ action, courseId, label, confirmMessage, variant }: CourseActionFormProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      <input type="hidden" name="courseId" value={courseId} />
      <SubmitButton label={label} variant={variant} />
    </form>
  );
}

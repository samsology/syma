import { z } from 'zod';

const validResourceUrl = z
  .string()
  .trim()
  .min(1, 'Resource URL or file path is required.')
  .refine((val) => /^https?:\/\/.+/i.test(val) || val.startsWith('/'), {
    message: 'Enter a valid URL (https://...) or site-relative file path (/...).',
  });

const supportedFileTypeRegex =
  /^(pdf|doc|docx|xls|xlsx|csv|ppt|pptx|png|jpg|jpeg|webp|txt|zip|sql|json|pbix|ipynb)$/i;

export const resourceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Resource name is required.')
    .max(120, 'Keep the resource name under 120 characters.'),
  fileUrl: validResourceUrl,
  fileType: z
    .string()
    .trim()
    .min(1, 'File type is required.')
    .regex(supportedFileTypeRegex, 'Use a supported educational file type (e.g. PDF, CSV, DOCX, ZIP, PBIX, IPYNB).'),
  fileSize: z.coerce
    .number()
    .int()
    .min(0, 'File size cannot be negative')
    .max(50_000_000, 'Keep resources under 50 MB.')
    .optional()
    .or(z.literal('')),
});

export type ResourceInput = z.infer<typeof resourceSchema>;

export const updateResourceSchema = resourceSchema;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

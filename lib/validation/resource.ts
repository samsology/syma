import { z } from 'zod';

const validResourceUrl = z
  .string()
  .trim()
  .min(1, 'Resource URL or file path is required.')
  .refine((val) => /^https?:\/\/.+/i.test(val) || val.startsWith('/'), {
    message: 'Enter a valid URL (https://...) or site-relative file path (/...).',
  });

const supportedFileTypeRegex =
  /^(pdf|doc|docx|xls|xlsx|csv|ppt|pptx|png|jpg|jpeg|webp|txt|zip|sql|json|pbix|ipynb|mp4|webm|mov|m4v|youtube|drive|link|url|file)$/i;

export const resourceTypeSchema = z.enum(['VIDEO', 'DOCUMENT', 'FILE', 'LINK']);
export const resourceSourceSchema = z.enum(['YOUTUBE', 'GOOGLE_DRIVE', 'UPLOAD', 'EXTERNAL']);

export const resourceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Resource name is required.')
    .max(120, 'Keep the resource name under 120 characters.'),
  description: z
    .string()
    .trim()
    .max(500, 'Keep description under 500 characters.')
    .optional()
    .or(z.literal('')),
  resourceType: resourceTypeSchema.default('FILE'),
  sourceType: resourceSourceSchema.default('EXTERNAL'),
  fileUrl: validResourceUrl,
  fileType: z
    .string()
    .trim()
    .min(1, 'File type is required.')
    .regex(
      supportedFileTypeRegex,
      'Use a supported educational or media file type (e.g. PDF, CSV, MP4, PBIX, ZIP, YOUTUBE, DRIVE, LINK).'
    ),
  fileSize: z.coerce
    .number()
    .int()
    .min(0, 'File size cannot be negative')
    .max(50_000_000, 'Keep resources under 50 MB.')
    .optional()
    .or(z.literal('')),
  sortOrder: z.coerce.number().int().default(0).optional(),
  isDownloadable: z.coerce.boolean().default(true).optional(),
  isActive: z.coerce.boolean().default(true).optional(),
});

export type ResourceInput = z.infer<typeof resourceSchema>;

export const updateResourceSchema = resourceSchema;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

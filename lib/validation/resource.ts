import { z } from 'zod';

export const resourceSchema = z.object({
  name: z.string().trim().min(1, 'Resource name is required.').max(120, 'Keep the resource name under 120 characters.'),
  fileUrl: z.string().trim().url('Invalid file URL'),
  fileType: z
    .string()
    .trim()
    .min(1, 'File type is required.')
    .regex(/^(pdf|doc|docx|xls|xlsx|csv|ppt|pptx|png|jpg|jpeg|webp)$/i, 'Use a supported educational file type.'),
  fileSize: z.coerce.number().int().min(0, 'File size cannot be negative').max(50_000_000, 'Keep resources under 50 MB.').optional().or(z.literal('')),
});

export type ResourceInput = z.infer<typeof resourceSchema>;

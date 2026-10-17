const commonTypes: Record<string, string[]> = {
  pdf: ['application/pdf'],
  csv: ['text/csv', 'application/csv', 'application/vnd.ms-excel'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  xls: ['application/vnd.ms-excel', 'application/x-ms-excel'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  doc: ['application/msword', 'application/vnd.ms-word'],
  pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  ppt: ['application/vnd.ms-powerpoint'],
  zip: ['application/zip', 'application/x-zip-compressed'],
};

export const ASSIGNMENT_MAX_FILE_SIZE = Number(process.env.ASSIGNMENT_MAX_FILE_SIZE_BYTES) || 4 * 1024 * 1024;
export const ASSIGNMENT_RESOURCE_EXTENSIONS = new Set(Object.keys(commonTypes));
export const ASSIGNMENT_SUBMISSION_EXTENSIONS = new Set(['pdf', 'csv', 'xlsx', 'xls', 'docx', 'doc']);

export function validateAssignmentFile(file: File, allowedExtensions = ASSIGNMENT_RESOURCE_EXTENSIONS): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!allowedExtensions.has(extension)) return 'File type is not supported.';
  if (file.size < 1 || file.size > ASSIGNMENT_MAX_FILE_SIZE) return 'File is empty or exceeds the upload limit.';
  const mime = file.type.toLowerCase();
  if (mime && mime !== 'application/octet-stream' && !commonTypes[extension]?.includes(mime)) {
    return 'The file type does not match its extension.';
  }
  return null;
}

'use client';

import { useActionState, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Edit2,
  ExternalLink,
  Eye,
  FileText,
  Presentation,
  Trash2,
  UploadCloud,
  Video,
  X,
} from 'lucide-react';
import type { LessonResource } from '@prisma/client';
import type { CurriculumFormState } from '@/app/admin/(protected)/courses/[id]/curriculum/actions';
import {
  createResourceAction,
  deleteResourceAction,
  moveResourceAction,
  updateResourceAction,
} from '@/app/admin/(protected)/courses/[id]/curriculum/actions';
import { ResourceRenderer } from '@/components/resources/ResourceRenderer';
import { inferResourceMetaFromUrl } from '@/lib/resources/embed';
import type { ResourceType, ResourceSource } from '@/lib/resources/types';

const initialState: CurriculumFormState = {};

export type ConceptualResourceType = 'VIDEO' | 'SLIDES' | 'DOCUMENT' | 'DATASET' | 'LINK';

export function getConceptualType(
  resourceType?: ResourceType,
  fileType?: string,
  sourceType?: ResourceSource,
  url?: string
): ConceptualResourceType {
  if (resourceType === 'VIDEO') return 'VIDEO';
  if (resourceType === 'FILE') return 'DATASET';
  if (resourceType === 'LINK') return 'LINK';
  if (resourceType === 'DOCUMENT') {
    const ft = (fileType || '').toLowerCase();
    const u = (url || '').toLowerCase();
    if (ft === 'pptx' || ft === 'ppt' || u.includes('presentation') || sourceType === 'GOOGLE_DRIVE') {
      return 'SLIDES';
    }
    return 'DOCUMENT';
  }
  return 'DATASET';
}

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ResourcePreviewModal({
  title,
  fileUrl,
  resourceType,
  sourceType,
  fileType,
  onClose,
}: {
  title: string;
  fileUrl: string;
  resourceType: ResourceType;
  sourceType: ResourceSource;
  fileType: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
              Admin Live Resource Preview
            </span>
            <h4 className="text-base font-bold text-slate-900">{title || 'Untitled Resource'}</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ResourceRenderer
          title={title || 'Preview Resource'}
          fileUrl={fileUrl}
          resourceType={resourceType}
          sourceType={sourceType}
          fileType={fileType}
        />

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

function R2FileUploader({
  courseId,
  lessonId,
  resourceType,
  onUploadSuccess,
}: {
  courseId: string;
  lessonId: string;
  resourceType: ResourceType;
  onUploadSuccess: (data: {
    storageKey: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
    fileType: string;
    fileName: string;
  }) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(15);

    try {
      let finalStorageKey: string | null = null;

      // 1. Attempt direct presigned upload to R2
      try {
        const res = await fetch('/api/admin/resources/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId,
            lessonId,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type || 'application/octet-stream',
            resourceType,
          }),
        });

        const json = await res.json();
        if (res.ok && json.success && json.data?.uploadUrl) {
          setUploadProgress(40);
          const { uploadUrl, storageKey } = json.data;

          const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
            body: file,
          });

          if (uploadRes.ok) {
            finalStorageKey = storageKey;
          }
        }
      } catch (directErr) {
        console.warn('Direct R2 presigned upload encountered an issue (e.g. CORS). Falling back to server upload route...', directErr);
      }

      // 2. If direct upload didn't complete (e.g. CORS blocked fetch), fallback to server upload proxy
      if (!finalStorageKey) {
        setUploadProgress(50);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('courseId', courseId);
        formData.append('lessonId', lessonId);
        formData.append('resourceType', resourceType || 'file');

        const fallbackRes = await fetch('/api/admin/resources/upload', {
          method: 'POST',
          body: formData,
        });

        const fallbackJson = await fallbackRes.json();
        if (!fallbackRes.ok || !fallbackJson.success) {
          throw new Error(fallbackJson.error || 'Failed to upload file to Cloudflare R2.');
        }

        finalStorageKey = fallbackJson.data.storageKey;
      }

      if (!finalStorageKey) {
        throw new Error('Upload completed but storage key was not returned.');
      }

      setUploadProgress(100);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'file';

      setUploadedName(file.name);
      onUploadSuccess({
        storageKey: finalStorageKey,
        fileUrl: `r2://${finalStorageKey}`,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size,
        fileType: ext,
        fileName: file.name,
      });
    } catch (err: unknown) {
      setUploadError((err as Error).message || 'File upload to Cloudflare R2 failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-2 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wide">
          <UploadCloud className="h-4 w-4" />
          <span>Cloudflare R2 Direct Bucket Upload</span>
        </div>
        {uploadedName && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Uploaded: {uploadedName}</span>
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-600 leading-snug">
        Select a local file to upload directly to private Cloudflare R2 storage via presigned PUT URL.
      </p>

      <input
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        className="w-full text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer disabled:opacity-50"
      />

      {isUploading && (
        <div className="space-y-1 pt-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-[11px] font-bold text-primary">Uploading to Cloudflare R2... ({uploadProgress}%)</p>
        </div>
      )}

      {uploadError && <p className="text-xs font-semibold text-error">{uploadError}</p>}
    </div>
  );
}

function ResourceEditRow({
  courseId,
  resource,
  onDone,
}: {
  courseId: string;
  resource: LessonResource;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateResourceAction.bind(null, courseId, resource.id),
    initialState
  );

  const [conceptualType, setConceptualType] = useState<ConceptualResourceType>(
    getConceptualType(
      resource.resourceType as ResourceType,
      resource.fileType,
      resource.sourceType as ResourceSource,
      resource.fileUrl
    )
  );
  const [resourceType, setResourceType] = useState<ResourceType>(
    (resource.resourceType as ResourceType) || 'FILE'
  );
  const [sourceType, setSourceType] = useState<ResourceSource>(
    (resource.sourceType as ResourceSource) || 'EXTERNAL'
  );
  const [fileUrl, setFileUrl] = useState(resource.fileUrl);
  const [fileType, setFileType] = useState(resource.fileType);
  const [fileSize, setFileSize] = useState<number | null>(resource.fileSize || null);
  const [storageKey, setStorageKey] = useState<string | null>(resource.storageKey || null);
  const [mimeType, setMimeType] = useState<string | null>(resource.mimeType || null);
  const [name, setName] = useState(resource.name);
  const [showPreview, setShowPreview] = useState(false);

  const handleConceptualChange = (type: ConceptualResourceType) => {
    setConceptualType(type);
    if (type === 'VIDEO') {
      setResourceType('VIDEO');
      if (sourceType === 'R2') {
        setFileType('mp4');
      } else if (fileUrl.includes('youtube') || fileUrl.includes('youtu.be') || !fileUrl) {
        setSourceType('YOUTUBE');
        setFileType('youtube');
      } else {
        setSourceType('UPLOAD');
        setFileType('mp4');
      }
    } else if (type === 'SLIDES') {
      setResourceType('DOCUMENT');
      if (sourceType !== 'R2') setSourceType('GOOGLE_DRIVE');
      setFileType('pptx');
    } else if (type === 'DOCUMENT') {
      setResourceType('DOCUMENT');
      if (sourceType !== 'R2') setSourceType('UPLOAD');
      setFileType('pdf');
    } else if (type === 'DATASET') {
      setResourceType('FILE');
      if (sourceType !== 'R2') setSourceType('UPLOAD');
      setFileType('csv');
    } else if (type === 'LINK') {
      setResourceType('LINK');
      setSourceType('EXTERNAL');
      setFileType('link');
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setFileUrl(newUrl);
    if (sourceType !== 'R2') {
      const inferred = inferResourceMetaFromUrl(newUrl);
      setResourceType(inferred.resourceType);
      setSourceType(inferred.sourceType);
      setFileType(inferred.suggestedFileType);
      setConceptualType(
        getConceptualType(inferred.resourceType, inferred.suggestedFileType, inferred.sourceType, newUrl)
      );
    }
  };

  return (
    <form
      action={formAction}
      className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4 shadow-sm"
    >
      <input type="hidden" name="storageKey" value={storageKey || ''} />
      <input type="hidden" name="mimeType" value={mimeType || ''} />

      <div className="flex items-center justify-between border-b border-primary/10 pb-2">
        <span className="text-xs font-bold text-primary uppercase tracking-wider">
          Edit Resource: {resource.name}
        </span>
        <button type="button" onClick={onDone} className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
            Resource Title
          </label>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Introduction to Exploratory Data Analysis"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
            Resource Type &amp; Delivery Source
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={conceptualType}
              onChange={(e) => handleConceptualChange(e.target.value as ConceptualResourceType)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium"
            >
              <option value="VIDEO">🎥 Video</option>
              <option value="SLIDES">📊 Slides / PPTX</option>
              <option value="DOCUMENT">📄 PDF / Document</option>
              <option value="DATASET">📁 Dataset / File</option>
              <option value="LINK">🔗 External Link</option>
            </select>

            <select
              name="sourceType"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as ResourceSource)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium"
            >
              <option value="R2">Cloudflare R2 Storage (Direct Upload)</option>
              <option value="YOUTUBE">YouTube Video</option>
              <option value="GOOGLE_DRIVE">Google Drive / Slides</option>
              <option value="UPLOAD">Hosted / File Path</option>
              <option value="EXTERNAL">External URL</option>
            </select>
          </div>
          <input type="hidden" name="resourceType" value={resourceType} />
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
            <span>Student Experience:</span>
            <span className="font-bold text-primary">
              {sourceType === 'R2'
                ? 'Cloudflare R2 Private Presigned Delivery'
                : conceptualType === 'VIDEO'
                ? 'In-Portal Learning Viewer (Video)'
                : conceptualType === 'SLIDES'
                ? 'In-Portal Learning Viewer (Slides)'
                : conceptualType === 'DOCUMENT'
                ? 'In-Portal Learning Viewer (Document / PDF)'
                : conceptualType === 'DATASET'
                ? 'Direct Download Action'
                : 'External Resource'}
            </span>
          </div>
        </div>
      </div>

      {sourceType === 'R2' && (
        <R2FileUploader
          courseId={courseId}
          lessonId={resource.lessonId}
          resourceType={resourceType}
          onUploadSuccess={(data) => {
            setStorageKey(data.storageKey);
            setMimeType(data.mimeType);
            setFileUrl(data.fileUrl);
            setFileSize(data.fileSize);
            setFileType(data.fileType);
            if (!name) setName(data.fileName);
          }}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_120px_120px]">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
            {sourceType === 'R2' ? 'R2 Storage Key / URI' : 'Resource URL or Site File Path'}
          </label>
          <div className="flex gap-2">
            <input
              name="fileUrl"
              value={fileUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              readOnly={sourceType === 'R2'}
              placeholder={
                sourceType === 'R2'
                  ? 'r2://courses/... (auto-generated on upload)'
                  : sourceType === 'YOUTUBE'
                  ? 'https://www.youtube.com/watch?v=... or youtu.be/...'
                  : sourceType === 'GOOGLE_DRIVE'
                  ? 'https://docs.google.com/presentation/d/... or drive.google.com/...'
                  : 'https://... or /assets/...'
              }
              required
              className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-xs ${
                sourceType === 'R2' ? 'bg-slate-100 font-mono text-[11px] text-slate-600' : 'bg-white'
              }`}
            />
            {fileUrl && (
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-white px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 shrink-0"
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
            Format / Type
          </label>
          <input
            name="fileType"
            value={fileType}
            onChange={(e) => setFileType(e.target.value.toLowerCase())}
            placeholder="pdf, mp4, csv"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs uppercase"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
            Size (Bytes)
          </label>
          <input
            name="fileSize"
            type="number"
            min={0}
            value={fileSize ?? ''}
            onChange={(e) => setFileSize(e.target.value ? Number(e.target.value) : null)}
            placeholder="e.g. 1048576"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
          Description / Instructions (Optional)
        </label>
        <input
          name="description"
          defaultValue={resource.description ?? ''}
          placeholder="Brief student instructions, reference points, or chapter notes"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              name="isDownloadable"
              defaultChecked={resource.isDownloadable}
              className="h-3.5 w-3.5 rounded text-primary"
            />
            <span>Allow Download</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={resource.isActive}
              className="h-3.5 w-3.5 rounded text-primary"
            />
            <span>Active in Portal</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-secondary disabled:opacity-60 shadow-xs"
          >
            {pending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {showPreview && (
        <ResourcePreviewModal
          title={name}
          fileUrl={fileUrl}
          resourceType={resourceType}
          sourceType={sourceType}
          fileType={fileType}
          onClose={() => setShowPreview(false)}
        />
      )}

      {state.formError && <p className="text-xs font-semibold text-error">{state.formError}</p>}
      {Object.values(state.fieldErrors ?? {}).flat()[0] && (
        <p className="text-xs font-semibold text-error">
          {Object.values(state.fieldErrors ?? {}).flat()[0]}
        </p>
      )}
    </form>
  );
}

export function ResourceManager({
  courseId,
  lessonId,
  resources,
}: {
  courseId: string;
  lessonId: string;
  resources: LessonResource[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewingResource, setPreviewingResource] = useState<LessonResource | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newConceptualType, setNewConceptualType] = useState<ConceptualResourceType>('VIDEO');
  const [newResourceType, setNewResourceType] = useState<ResourceType>('VIDEO');
  const [newSourceType, setNewSourceType] = useState<ResourceSource>('R2');
  const [newFileType, setNewFileType] = useState('mp4');
  const [newFileSize, setNewFileSize] = useState<number | null>(null);
  const [newStorageKey, setNewStorageKey] = useState<string>('');
  const [newMimeType, setNewMimeType] = useState<string>('');
  const [newIsDownloadable, setNewIsDownloadable] = useState(false);
  const [showAddPreview, setShowAddPreview] = useState(false);

  const [state, formAction, pending] = useActionState(
    createResourceAction.bind(null, courseId, lessonId),
    initialState
  );

  const handleNewConceptualChange = (type: ConceptualResourceType) => {
    setNewConceptualType(type);
    if (type === 'VIDEO') {
      setNewResourceType('VIDEO');
      if (newSourceType === 'R2') {
        setNewFileType('mp4');
      } else if (newUrl.includes('youtube') || newUrl.includes('youtu.be') || !newUrl) {
        setNewSourceType('YOUTUBE');
        setNewFileType('youtube');
      } else {
        setNewSourceType('UPLOAD');
        setNewFileType('mp4');
      }
      setNewIsDownloadable(false);
    } else if (type === 'SLIDES') {
      setNewResourceType('DOCUMENT');
      if (newSourceType !== 'R2') setNewSourceType('GOOGLE_DRIVE');
      setNewFileType('pptx');
      setNewIsDownloadable(true);
    } else if (type === 'DOCUMENT') {
      setNewResourceType('DOCUMENT');
      if (newSourceType !== 'R2') setNewSourceType('UPLOAD');
      setNewFileType('pdf');
      setNewIsDownloadable(true);
    } else if (type === 'DATASET') {
      setNewResourceType('FILE');
      if (newSourceType !== 'R2') setNewSourceType('UPLOAD');
      setNewFileType('csv');
      setNewIsDownloadable(true);
    } else if (type === 'LINK') {
      setNewResourceType('LINK');
      setNewSourceType('EXTERNAL');
      setNewFileType('link');
      setNewIsDownloadable(false);
    }
  };

  const handleNewUrlChange = (url: string) => {
    setNewUrl(url);
    if (newSourceType !== 'R2') {
      const inferred = inferResourceMetaFromUrl(url);
      setNewResourceType(inferred.resourceType);
      setNewSourceType(inferred.sourceType);
      setNewFileType(inferred.suggestedFileType);
      const conceptual = getConceptualType(
        inferred.resourceType,
        inferred.suggestedFileType,
        inferred.sourceType,
        url
      );
      setNewConceptualType(conceptual);
      setNewIsDownloadable(conceptual === 'DATASET' || conceptual === 'DOCUMENT');
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h5 className="text-sm font-bold text-slate-900">
            Lesson Resources &amp; Materials ({resources.length})
          </h5>
          <p className="text-xs text-slate-500">
            Manage interactive videos, presentations, datasets, and guides consumed inside the portal.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase">
          LMS Resource Engine
        </span>
      </div>

      {/* Existing Resources List */}
      <div className="space-y-2.5">
        {resources.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
            No resources attached yet. Add an embedded video, slide deck, dataset, or guide below.
          </p>
        )}

        {resources.map((resource, index) =>
          editingId === resource.id ? (
            <ResourceEditRow
              key={resource.id}
              courseId={courseId}
              resource={resource}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <div
              key={resource.id}
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-xs transition ${
                resource.isActive ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-60'
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-2 text-slate-700 shrink-0">
                  {resource.resourceType === 'VIDEO' ? (
                    <Video className="h-4 w-4 text-sky-600" />
                  ) : resource.resourceType === 'DOCUMENT' ? (
                    <Presentation className="h-4 w-4 text-indigo-600" />
                  ) : resource.resourceType === 'FILE' ? (
                    <FileText className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <ExternalLink className="h-4 w-4 text-slate-600" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-bold text-slate-900">{resource.name}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-black uppercase text-slate-600">
                      {resource.resourceType || 'FILE'}
                    </span>
                    {resource.sourceType === 'R2' && (
                      <span className="rounded bg-sky-100 px-1.5 py-0.2 text-[10px] font-bold text-sky-800">
                        Cloudflare R2
                      </span>
                    )}
                    {!resource.isActive && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                        Hidden
                      </span>
                    )}
                  </div>

                  {resource.description && (
                    <p className="text-xs text-slate-500 truncate max-w-md">{resource.description}</p>
                  )}

                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                    <span className="uppercase font-semibold">{resource.fileType}</span>
                    <span>·</span>
                    <span>{resource.sourceType || 'EXTERNAL'}</span>
                    {resource.fileSize ? (
                      <>
                        <span>·</span>
                        <span>{formatBytes(resource.fileSize)}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                {/* Reorder Buttons */}
                <form action={moveResourceAction}>
                  <input type="hidden" name="courseId" value={courseId} />
                  <input type="hidden" name="resourceId" value={resource.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label="Move resource up"
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                </form>

                <form action={moveResourceAction}>
                  <input type="hidden" name="courseId" value={courseId} />
                  <input type="hidden" name="resourceId" value={resource.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={index === resources.length - 1}
                    aria-label="Move resource down"
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </form>

                {/* Preview Button */}
                <button
                  type="button"
                  onClick={() => setPreviewingResource(resource)}
                  aria-label="Preview resource in LMS"
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary"
                  title="Live preview in portal"
                >
                  <Eye className="h-4 w-4" />
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => setEditingId(resource.id)}
                  aria-label={`Edit ${resource.name}`}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  title="Edit details"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>

                {/* Delete Button */}
                <form
                  action={deleteResourceAction}
                  onSubmit={(event) => {
                    if (!window.confirm(`Remove resource "${resource.name}"?`)) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="courseId" value={courseId} />
                  <input type="hidden" name="resourceId" value={resource.id} />
                  <button
                    type="submit"
                    aria-label={`Remove ${resource.name}`}
                    className="rounded-md p-1.5 text-error hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )
        )}
      </div>

      {/* Add New Resource Form */}
      <form
        action={formAction}
        className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5 shadow-xs"
      >
        <input type="hidden" name="storageKey" value={newStorageKey} />
        <input type="hidden" name="mimeType" value={newMimeType} />

        <h6 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Add New Lesson Resource
        </h6>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Resource Title
            </label>
            <input
              name="name"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Statistical Significance Walkthrough"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Resource Type &amp; Delivery Source
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newConceptualType}
                onChange={(e) => handleNewConceptualChange(e.target.value as ConceptualResourceType)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium"
              >
                <option value="VIDEO">🎥 Video</option>
                <option value="SLIDES">📊 Slides / PPTX</option>
                <option value="DOCUMENT">📄 PDF / Document</option>
                <option value="DATASET">📁 Dataset / File</option>
                <option value="LINK">🔗 External Link</option>
              </select>

              <select
                name="sourceType"
                value={newSourceType}
                onChange={(e) => setNewSourceType(e.target.value as ResourceSource)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium"
              >
                <option value="R2">Cloudflare R2 Storage (Direct Upload)</option>
                <option value="YOUTUBE">YouTube Video</option>
                <option value="GOOGLE_DRIVE">Google Drive / Slides</option>
                <option value="UPLOAD">Hosted / File Path</option>
                <option value="EXTERNAL">External URL</option>
              </select>
            </div>
            <input type="hidden" name="resourceType" value={newResourceType} />
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span>Student Experience:</span>
              <span className="font-bold text-primary">
                {newSourceType === 'R2'
                  ? 'Cloudflare R2 Private Presigned Delivery'
                  : newConceptualType === 'VIDEO'
                  ? 'In-Portal Learning Viewer (Video Player)'
                  : newConceptualType === 'SLIDES'
                  ? 'In-Portal Viewer (Slides / Presentation)'
                  : newConceptualType === 'DOCUMENT'
                  ? 'In-Portal Viewer (Document / PDF)'
                  : newConceptualType === 'DATASET'
                  ? 'Direct Download Action (Dataset / File)'
                  : 'External Resource (Opens Link)'}
              </span>
            </div>
          </div>
        </div>

        {newSourceType === 'R2' && (
          <R2FileUploader
            courseId={courseId}
            lessonId={lessonId}
            resourceType={newResourceType}
            onUploadSuccess={(data) => {
              setNewStorageKey(data.storageKey);
              setNewMimeType(data.mimeType);
              setNewUrl(data.fileUrl);
              setNewFileSize(data.fileSize);
              setNewFileType(data.fileType);
              if (!newTitle) setNewTitle(data.fileName);
            }}
          />
        )}

        <div className="grid gap-3 sm:grid-cols-[1fr_110px_110px]">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              {newSourceType === 'R2' ? 'R2 Storage Key / URI' : 'Resource URL or Site Path'}
            </label>
            <div className="flex gap-2">
              <input
                name="fileUrl"
                value={newUrl}
                onChange={(e) => handleNewUrlChange(e.target.value)}
                readOnly={newSourceType === 'R2'}
                placeholder={
                  newSourceType === 'R2'
                    ? 'r2://courses/... (auto-generated on upload)'
                    : newSourceType === 'YOUTUBE'
                    ? 'https://www.youtube.com/watch?v=... or youtu.be/...'
                    : newSourceType === 'GOOGLE_DRIVE'
                    ? 'https://docs.google.com/presentation/d/... or drive.google.com/...'
                    : 'https://... or /assets/...'
                }
                required
                className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-xs ${
                  newSourceType === 'R2' ? 'bg-slate-100 font-mono text-[11px] text-slate-600' : 'bg-white'
                }`}
              />
              {newUrl && (
                <button
                  type="button"
                  onClick={() => setShowAddPreview(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shrink-0"
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Format
            </label>
            <input
              name="fileType"
              value={newFileType}
              onChange={(e) => setNewFileType(e.target.value.toLowerCase())}
              placeholder="pdf, mp4, csv"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Size (Bytes)
            </label>
            <input
              name="fileSize"
              type="number"
              min={0}
              value={newFileSize ?? ''}
              onChange={(e) => setNewFileSize(e.target.value ? Number(e.target.value) : null)}
              placeholder="Optional size"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
            Description (Optional)
          </label>
          <input
            name="description"
            placeholder="Brief description, chapter markers, or practical notes"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                name="isDownloadable"
                checked={newIsDownloadable}
                onChange={(e) => setNewIsDownloadable(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-primary"
              />
              <span>Allow Download</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked
                className="h-3.5 w-3.5 rounded text-primary"
              />
              <span>Active in Portal</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60 shadow-xs"
          >
            {pending ? 'Adding...' : 'Attach Resource'}
          </button>
        </div>

        {state.formError && <p className="text-xs font-semibold text-error">{state.formError}</p>}
        {Object.values(state.fieldErrors ?? {}).flat()[0] && (
          <p className="text-xs font-semibold text-error">
            {Object.values(state.fieldErrors ?? {}).flat()[0]}
          </p>
        )}
      </form>

      {/* Live Preview Modal for Add Form */}
      {showAddPreview && (
        <ResourcePreviewModal
          title={newTitle}
          fileUrl={newUrl}
          resourceType={newResourceType}
          sourceType={newSourceType}
          fileType={newFileType}
          onClose={() => setShowAddPreview(false)}
        />
      )}

      {/* Live Preview Modal for Existing Item */}
      {previewingResource && (
        <ResourcePreviewModal
          title={previewingResource.name}
          fileUrl={previewingResource.fileUrl}
          resourceType={(previewingResource.resourceType as ResourceType) || 'FILE'}
          sourceType={(previewingResource.sourceType as ResourceSource) || 'EXTERNAL'}
          fileType={previewingResource.fileType}
          onClose={() => setPreviewingResource(null)}
        />
      )}
    </div>
  );
}

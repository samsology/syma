# Admin CMS Phase 4 Curriculum Builder

Phase 4 adds curriculum content management to the protected admin CMS.

## Curriculum Structure

```text
Course
  -> CourseWeek
      -> CourseModule
          -> Lesson
              -> LessonResource
```

The implementation reuses the Prisma models and cascade rules created in Phase 1.

## Admin Workflow

```text
Create Course
  -> Build Curriculum
  -> Add Lessons
  -> Add Resource Metadata
  -> Preview
  -> Publish
```

Publishing now requires at least one week, one module, and one lesson.

## Storage

Lesson resources store metadata only:

- name
- fileUrl
- fileType
- fileSize

No binary files are stored in PostgreSQL. File upload/storage can be connected later through the existing production storage choice.

## Operations

Curriculum management is implemented with protected server actions for creating, editing, deleting, and reordering weeks, modules, lessons, and lesson resources. The JSON endpoint `GET /api/admin/courses/[id]/curriculum` returns the authenticated curriculum tree.

All mutations verify admin authorization and parent-child ownership before writing.

# Phase 3a Implementation: Exercise Management UI

## Context

WorkoutBro - Athlete/Trainer collaboration app. We just created the Exercise data model. Now build the Admin UI to manage exercises.

## Current State

- ✅ Exercise model exists in Prisma (see `prisma/schema.prisma`)
- ✅ Migration applied (`20260215170404_add_exercise_model`)
- ✅ Admin panel exists at `/admin/users`

## Task

Build complete Exercise Management UI at `/admin/exercises`

---

## Route Structure

```
/admin/exercises          → List all exercises
/admin/exercises/new      → Create new exercise (optional separate route, or modal)
/admin/exercises/[id]     → Edit exercise (optional separate route, or modal)
```

Recommendation: Use modals/forms on same page to avoid navigation overhead.

---

## UI Specification

### Layout: `/admin/exercises`

**Header:**

```tsx
<div className="flex justify-between items-center mb-6">
  <h2>Übungsverwaltung</h2>
  <button>+ Neue Übung</button>
</div>
```

**Exercise List:**

- Group by category (CHEST, BACK, SHOULDERS, LEGS, ARMS, CORE, CARDIO, CUSTOM)
- Each category gets a section with header
- Display exercises as cards

**Exercise Card (Mobile-first, Responsive):**

```
┌──────────────────────────────────────┐
│ [Video]      Name: Bench Press       │
│ 150x100      ─────────────────       │
│              Kategorie: CHEST         │
│              Felder: Weight, Reps     │
│              ─────────────────       │
│              [Edit] [Delete]          │
└──────────────────────────────────────┘
```

Grid:

- Mobile: 1 column
- Tablet (md:): 2 columns
- Desktop (lg:): 3 columns

### Form: Create/Edit Exercise

**Fields:**

1. **Name** (required)
   - `<input type="text" required />`
   - Placeholder: "z.B. Bench Press"

2. **Category** (required)
   - `<select>` with options: CHEST, BACK, SHOULDERS, LEGS, ARMS, CORE, CARDIO, CUSTOM
   - If CUSTOM selected → show additional text input for custom category name

3. **Video** (optional)
   - `<input type="file" accept="video/mp4,video/webm" />`
   - Max 50MB
   - Show preview after selection
   - On submit: Upload to `/public/exercise-videos/{exercise-id}-{timestamp}.ext`
   - Store path in DB: `/exercise-videos/{filename}`

4. **Required Fields** (min 1 required)
   - Multi-checkbox
   - Options:
     - ☐ Gewicht (kg) → ExerciseField.WEIGHT
     - ☐ Wiederholungen → ExerciseField.REPS
     - ☐ Distanz (m) → ExerciseField.DISTANCE
     - ☐ Zeit (s) → ExerciseField.TIME
     - ☐ RPE (1-10) → ExerciseField.RPE
     - ☐ Notizen → ExerciseField.NOTES

**Buttons:**

- "Abbrechen" → Close form
- "Erstellen" / "Speichern" → Submit

### Empty State

If no exercises exist:

```tsx
<div className="text-center py-12">
  <p className="text-gray-500 mb-4">Noch keine Übungen vorhanden</p>
  <button>+ Erste Übung erstellen</button>
</div>
```

---

## Server Actions

**File:** `src/lib/actions/exercise.ts`

```typescript
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

// Helper: Check admin access
async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  const roles = ((session.user as any)?.roles as string[]) ?? [];
  if (!roles.includes("ADMIN")) throw new Error("Forbidden");
  return session;
}

// Create exercise
export async function createExercise(formData: FormData) {
  const session = await requireAdmin();

  const name = formData.get("name") as string;
  const category = formData.get("category") as any;
  const customCategory = formData.get("customCategory") as string | null;
  const requiredFields = formData.getAll("requiredFields") as any[];
  const videoFile = formData.get("video") as File | null;

  // Validate
  if (!name || !category) throw new Error("Name and category required");
  if (requiredFields.length === 0)
    throw new Error("At least one field required");

  // Handle video upload
  let videoPath = null;
  if (videoFile && videoFile.size > 0) {
    if (videoFile.size > 50 * 1024 * 1024) {
      throw new Error("Video must be less than 50MB");
    }

    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = videoFile.name.split(".").pop();
    const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const filepath = path.join(
      process.cwd(),
      "public",
      "exercise-videos",
      filename,
    );

    await writeFile(filepath, buffer);
    videoPath = `/exercise-videos/${filename}`;
  }

  // Create exercise
  await prisma.exercise.create({
    data: {
      name,
      category,
      customCategory: category === "CUSTOM" ? customCategory : null,
      videoPath,
      requiredFields,
      createdBy: (session.user as any).id,
    },
  });

  revalidatePath("/admin/exercises");
}

// Update exercise
export async function updateExercise(id: string, formData: FormData) {
  await requireAdmin();

  // Similar to create, but use prisma.exercise.update()
  // Handle video: if new video uploaded, delete old one first

  revalidatePath("/admin/exercises");
}

// Delete exercise
export async function deleteExercise(id: string) {
  await requireAdmin();

  // Get exercise to find video path
  const exercise = await prisma.exercise.findUnique({ where: { id } });

  // Delete video file if exists
  if (exercise?.videoPath) {
    const filepath = path.join(process.cwd(), "public", exercise.videoPath);
    await unlink(filepath).catch(() => {}); // Ignore if file doesn't exist
  }

  // Delete from DB
  await prisma.exercise.delete({ where: { id } });

  revalidatePath("/admin/exercises");
}

// Query exercises
export async function getExercises() {
  return await prisma.exercise.findMany({
    include: { creator: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}
```

---

## File Structure

Create these files:

```
src/
├── app/
│   └── admin/
│       └── exercises/
│           └── page.tsx              # Main list page
├── components/
│   └── ui/
│       ├── CreateExerciseForm.tsx   # Form component (client)
│       └── ExerciseCard.tsx         # Card component (client)
└── lib/
    └── actions/
        └── exercise.ts              # Server actions
```

---

## Important Notes

1. **File Upload:**
   - Create `/public/exercise-videos/` directory first
   - Add to `.gitignore`: `public/exercise-videos/*` (but keep folder with `.gitkeep`)

2. **Prisma Enums:**
   - Import from `@prisma/client`: `import { ExerciseCategory, ExerciseField } from "@prisma/client";`

3. **Video Display:**
   - Use `<video>` tag with `loop`, `autoplay`, `muted` attributes
   - Show thumbnail: use first frame or placeholder

4. **Error Handling:**
   - Show errors in form (toast or inline)
   - Validate file size client-side before upload

5. **Responsive:**
   - Touch-friendly buttons (min-height: 44px)
   - Grid columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

6. **Security:**
   - Admin-only access via middleware (already exists)
   - Double-check in server actions with `requireAdmin()`

---

## Acceptance Criteria

- [ ] Route `/admin/exercises` accessible by admin only
- [ ] List shows all exercises grouped by category
- [ ] Create form works with all fields
- [ ] Video upload works and displays correctly
- [ ] Custom category input appears when CUSTOM selected
- [ ] At least one required field must be selected
- [ ] Edit functionality works
- [ ] Delete functionality works (with confirmation)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Error states handled gracefully

---

## Testing

After implementation, test:

1. Create exercise without video
2. Create exercise with video (MP4, <50MB)
3. Try to upload video >50MB (should fail)
4. Edit exercise and change video
5. Delete exercise (video file should be removed)
6. Test as non-admin user (should be blocked)

---

## Questions?

Check existing code patterns in:

- `/admin/users/page.tsx` for list layout
- `CreateUserForm.tsx` for form patterns
- `admin.ts` server actions for permission checks

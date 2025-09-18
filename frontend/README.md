# ComicStop Frontend

Recent UI improvements focus on the Upload experience:
- Relaxed layout spacing and visual hierarchy on the Upload page.
- Genres and Trigger Warnings now render in responsive checkbox grids (multi-column, wraps on small screens).
- FileUpload shows selected files as large square tiles with image thumbnails when available; images can be reordered via drag-and-drop.
 - FileUpload shows selected files as large square tiles with image thumbnails when available; images can be reordered via drag-and-drop.
 - Robust image detection: if a dropped/selected file has an empty or missing MIME type, we fall back to its filename extension to decide if it's an image. This ensures drag-and-drop works reliably across browsers and file sources.

All related tests have been updated to assert DOM structure (tile cards, preview thumbnails) and the suite passes under jsdom with CSS Modules.

This frontend is a React + Vite app. Below are the conventions and patterns for CreatorHub form components, starting with `UploadComicForm`.

## UploadComicForm

Purpose: Structured comic upload UI used by the `Upload` page.

Props:

Form state shape (passed to onSubmit):

Validation:

Reordering:

Integration example (Upload page):

Features:
- Two-step upload: files are uploaded first via FileUpload; create payload uses returned `file_id` (single) or `page_order` (multi-image).
- Preview thumbnails: when multiple images are selected, a sortable tile grid is shown with thumbnails and the final order; the Preview section mirrors this with numbered thumbnails.
- Series selector: populated via GET `/api/series?user_id=current` and included in the create payload as `series_id`.
- Contributors: manage contributors as rows of `{ role, names[] }`. Names are added as chips with Enter/comma. Validation prevents names without a role and dedupes names per row.
- Draft autosave: the form is auto-saved to `localStorage` under `upload:draft` (excluding raw File objects) and restored on mount. Reset clears the draft.
- Cover Thumbnail: uses `ThumbnailField` to allow either a URL or an uploaded image; shows a live preview. When set to URL mode, `thumbnail_url` is included in the create payload.
	- URL validation: basic http(s) check plus a best‑effort HEAD probe (may be opaque due to CORS; treated as non-blocking). Invalid inputs show an inline error.
	- Remove: quick "Remove" action clears the current thumbnail value and preview.
	- File mode: when a local image is chosen, the Upload page sends `multipart/form-data` with a `thumbnailUpload` file field alongside other fields. Arrays may be sent either as JSON or repeated fields per browser/platform.

### Preview Mode & Draft Flow
- The form now has a "Preview & Save Draft" action. After validation, it calls the Upload page to create a draft comic via POST `/api/comics` using the current form values (including `file_id` or `page_order`, contributors, series, and optional thumbnail URL/file).
- On success, the app navigates to `/preview/:id`, where `:id` is the draft comic ID returned by the create API.
- The preview page (`ComicPreview`) fetches draft data from GET `/api/comics/:id/preview` and renders a publish-like view: cover thumbnail, title, description, and a grid of page thumbnails in order.
- A "← Back to Edit" button returns to `/upload` to continue editing. The upload form persists its draft state in `localStorage` for a smooth round-trip.

### Required fields and submission
- Required before publishing: File (via FileUpload -> fileRef), Title, Series selection, and Upload Agreement.
- The Save & Continue (publish) button is disabled until these are satisfied.
- Submission behavior:
	- If no draft exists (no `upload:lastDraftId` saved), the form submits with POST `/api/comics`.
	- If a draft exists (after using Preview), the form submits with PATCH `/api/comics/:id` including `status: 'published'` to publish.
	- Multipart is used automatically when a thumbnail file is included; otherwise JSON is used.

## ContributorsField component

## ThumbnailField component
	- Location: `src/components/ThumbnailField/`
	- Props: `value` ({ mode: 'url'|'file', url?: string, file?: File, previewUrl?: string }), `onChange(next)`, optional `label`, `error`, and `accept` extensions.
	- Behavior: radio to switch between URL and file; keeps a preview visible; emits normalized value. For file mode, preview uses a local object URL only on the client.
	- Location: `src/components/ContributorsField/`
	- Props: `value` (Array<{ role: string, names: string[] }>), `onChange(next)`, optional `roleOptions`, `label`, and `error`.
	- Behavior: add/remove rows, select role, add contributor names via chips input (type name and press Enter or comma). Emits the normalized array to parent. Dedupes names per row automatically; shows inline error when provided.
## Patterns for future forms
- Use controlled components and CSS modules co-located with component
## Dev commands
- Lint: `npm run lint`
- Basic client-side checks (required fields, file type/size per `config`)

## Testing
- Run all tests: `npm test`
- What’s covered:
	- Upload flow integration: upload → preview (draft create) → publish (patch) with mocked API and FileUpload
	- FileUpload unit tests: filtering, single vs multi-image upload, preview items emission
	- UploadComicForm validation: required fields, contributors validation, draft restore, preview thumbnails
	- Auth/Settings/Login/Signup behaviors already present in suite
- Notes:
	- React 19’s concurrent rendering can amplify setState timing in tests. Our FileUpload test doubles and integration mocks trigger parent updates inside a mount effect, guarded with a ref, to avoid update-depth loops.

## Manual validation checklist
Use these quick steps while developing to sanity-check the UI:
- Start dev server: npm run dev (served on a free port near 5173)
- Verify Navbar shows ComicStop brand (orange), Upload (orange), and Sign Up / Login (dark gray)
- Open /upload and confirm:
  - Relaxed spacing and visual hierarchy is present
  - Genres and Trigger Warnings are in responsive checkbox grids
  - Selecting files shows large tile previews; images display thumbnails and can be reordered via drag-and-drop
  - Manual file selection and drag-and-drop both work; mixed or non-image files are filtered per config
- Start preview server: npm run preview (served near 4173) and spot-check the production build

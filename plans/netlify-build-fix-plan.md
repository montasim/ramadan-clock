# Netlify Build Failure Fix Plan

## Build Error Summary

The Netlify build is failing with the following critical error:

```
Error occurred prerendering page "/_global-error"
TypeError: Cannot read properties of null (reading 'useContext')
```

This error occurs during the static page generation phase when Next.js tries to prerender the global error page.

---

## Root Causes Identified

### 1. **Critical Issue: Missing `_global-error.tsx` File**
- **Problem**: Next.js 16 expects a custom global error page, but none exists
- **Impact**: When Next.js tries to auto-generate one during build, it fails because the root layout's `<Providers>` wrapper (which includes `<SessionProvider>`) creates a React context that's not available during error page prerendering
- **Error Location**: `TypeError: Cannot read properties of null (reading 'useContext')` at `.next/server/chunks/ssr/b2b3e_next_dist_esm_3f7918f8._.js:4:15008`

### 2. **Metadata Configuration Issues (Warnings)**
Multiple pages have `themeColor` and `viewport` in metadata exports, which Next.js 16 wants moved to a separate `viewport` export:
- `/_not-found`
- `/admin/fetch`
- `/calendar`
- `/admin/import`
- `/admin/upload`

### 3. **Missing Key Props (Warnings)**
Multiple React warnings about missing "key" props in lists across various components.

---

## Proposed Solutions

### Solution 1: Create `_global-error.tsx` (CRITICAL)

**File**: `app/global-error.tsx`

**Approach**: Create a standalone global error page that doesn't depend on the root layout's providers. This page should:
- Be a simple server component
- Not use any React hooks or context
- Provide a user-friendly error message
- Include a link to return to the homepage

**Why this fixes the issue**: The global error page is rendered outside the normal layout hierarchy. By creating a custom one that doesn't rely on providers, we avoid the useContext error.

### Solution 2: Move `themeColor` and `viewport` to Separate Exports

**Files to modify**:
- `lib/seo/metadata.ts` - Remove `themeColor` and `viewport` from base metadata
- Create `app/layout.tsx` - Add `viewport` export
- Create `app/(home)/calendar/viewport.ts` - Add viewport export for calendar page
- Create `app/admin/fetch/viewport.ts` - Add viewport export for fetch page
- Create `app/admin/import/viewport.ts` - Add viewport export for import page
- Create `app/admin/upload/viewport.ts` - Add viewport export for upload page

**Approach**:
1. Remove `themeColor` and `viewport` from the `getBaseMetadata()` function
2. Create a new `generateViewport()` helper function
3. Add `viewport` exports to each page that needs custom viewport settings

**Why this fixes the issue**: Next.js 16 changed how viewport and themeColor are handled. They should be in a separate `viewport` export, not in the `metadata` export.

### Solution 3: Fix Missing Key Props

**Files to check and fix**:
- Components rendering lists without keys
- Focus on components mentioned in build warnings

**Approach**: Add unique `key` props to all mapped elements in lists.

---

## Implementation Steps

### Step 1: Create Global Error Page
- [ ] Create `app/global-error.tsx`
- [ ] Implement simple error UI without providers
- [ ] Test locally to ensure no useContext errors

### Step 2: Update Metadata Configuration
- [ ] Modify `lib/seo/metadata.ts`:
  - Remove `themeColor` from `getBaseMetadata()`
  - Remove `viewport` from `getBaseMetadata()`
  - Create `generateViewport()` helper function
- [ ] Add `viewport` export to `app/layout.tsx`
- [ ] Create `app/(home)/calendar/viewport.ts`
- [ ] Create `app/admin/fetch/viewport.ts`
- [ ] Create `app/admin/import/viewport.ts`
- [ ] Create `app/admin/upload/viewport.ts`

### Step 3: Fix Missing Key Props
- [ ] Search for `.map(` calls without keys
- [ ] Add unique keys to all list items
- [ ] Verify no React warnings remain

### Step 4: Testing
- [ ] Run `pnpm run build` locally
- [ ] Verify build completes successfully
- [ ] Check for any remaining warnings
- [ ] Test error page functionality

---

## Expected Outcome

After implementing these fixes:
- ✅ Build completes successfully without errors
- ✅ No useContext errors during prerendering
- ✅ No metadata configuration warnings
- ✅ Clean build log with only informational messages
- ✅ Functional error page that displays correctly

---

## Risk Assessment

**Low Risk**:
- Moving metadata properties to viewport exports is a straightforward Next.js 16 migration step
- Creating a global error page is a recommended best practice

**Medium Risk**:
- Fixing missing key props requires careful review of all list mappings
- Need to ensure viewport settings are consistent across all pages

**Mitigation**:
- Test locally before deploying
- Review Next.js 16 migration documentation
- Keep changes minimal and focused on the specific issues

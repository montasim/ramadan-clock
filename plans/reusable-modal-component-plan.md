# Reusable Modal Component Plan

## Overview
Create a reusable modal component based on the Edit Entry modal structure to replace all existing modals in the project.

## Analysis of Existing Modals

### Current Modal Locations
1. **Edit Entry Modal** - `components/admin/calendar-view.tsx` (lines 187-253)
2. **Single Delete Modal** - `components/admin/calendar-view.tsx` (lines 255-295)
3. **Bulk Delete Modal** - `components/admin/calendar-view.tsx` (lines 297-332)
4. **Confirm Upload Modal** - `app/admin/upload/page.tsx` (lines 339-358)
5. **Result Dialog** - `app/admin/upload/page.tsx` (lines 360-398)
6. **Logout Modal** - `components/shared/logout-button.tsx` (lines 34-51)

### Common Patterns Identified
- All use `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
- Some have gradient top border (`h-[2px] w-full rounded-t-lg`)
- Some have icon + title in header
- All have Cancel and Action buttons
- Some have custom content (forms, tables, alerts)
- Some use `rounded-full` button variants

## Component Design

### Component Name
`components/ui/app-modal.tsx`

### Props Interface

```typescript
interface AppModalProps {
  // Control
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Header
  title: string;
  description?: string;
  icon?: React.ReactNode;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;

  // Visual Customization
  showGradientBorder?: boolean;
  gradientColor?: string; // "primary", "success", "danger"
  maxWidth?: "sm" | "md" | "lg" | "xl";
  className?: string;

  // Content
  children?: React.ReactNode;

  // Footer
  showFooter?: boolean;
  primaryAction?: {
    label: string | ((loading: boolean) => string);
    onClick: () => void | Promise<void>;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    disabled?: boolean;
    loading?: boolean;
    loadingText?: string;
    className?: string;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    disabled?: boolean;
    className?: string;
  };
  footerClassName?: string;

  // Close Button
  showCloseButton?: boolean;
}
```

### Gradient Colors
- `"primary"` - `var(--grad-primary)` (blue-purple gradient)
- `"success"` - `linear-gradient(135deg,#10b981,#059669)` (green gradient)
- `"danger"` - `linear-gradient(135deg,#ef4444,#dc2626)` (red gradient)

## Implementation Plan

### Step 1: Create Base Component
Create `components/ui/app-modal.tsx` with:
- Full TypeScript props interface
- Radix UI Dialog integration
- Flexible header with optional icon
- Gradient border support
- Customizable footer with primary/secondary actions
- Loading state support for async actions
- Responsive design

### Step 2: Replace Modals

#### 2.1 Edit Entry Modal (`calendar-view.tsx`)
- Convert to use `AppModal`
- Pass form content as children
- Use primary action for save
- Use secondary action for cancel

#### 2.2 Single Delete Modal (`calendar-view.tsx`)
- Use `AppModal` with `icon` (AlertTriangle)
- Set `gradientColor="danger"`
- Use destructive variant for primary action

#### 2.3 Bulk Delete Modal (`calendar-view.tsx`)
- Use `AppModal` with `icon` (AlertTriangle)
- Set `gradientColor="danger"`
- Show count in title
- Use destructive variant for primary action

#### 2.4 Confirm Upload Modal (`upload/page.tsx`)
- Use `AppModal` with `gradientColor="primary"`
- Show entry count in description
- Use primary action for confirm

#### 2.5 Result Dialog (`upload/page.tsx`)
- Use `AppModal` with dynamic `gradientColor` based on success/failure
- Conditionally show errors content
- Use single button for close

#### 2.6 Logout Modal (`logout-button.tsx`)
- Use `AppModal` with simple confirmation
- Use destructive variant for logout action

## Component Features

### 1. Flexible Header
- Title with optional custom styling
- Optional description
- Optional icon with customizable background

### 2. Visual Customization
- Gradient top border (optional)
- Three gradient color presets (primary, success, danger)
- Configurable max width
- Custom className support

### 3. Action Buttons
- Primary action with loading state
- Optional secondary action
- Button variants (default, destructive, outline, etc.)
- Optional icons

### 4. Content Area
- Fully customizable children
- Supports forms, tables, alerts, etc.

### 5. Accessibility
- Full Radix UI Dialog accessibility features
- Proper focus management
- Keyboard navigation

## Example Usage

### Simple Confirmation Modal
```tsx
<AppModal
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Confirm Logout"
  description="Are you sure you want to log out?"
  primaryAction={{
    label: "Logout",
    onClick: handleLogout,
    variant: "destructive"
  }}
  secondaryAction={{
    label: "Cancel",
    onClick: () => setIsOpen(false)
  }}
/>
```

### Modal with Icon and Gradient
```tsx
<AppModal
  open={!!deletingEntry}
  onOpenChange={() => setDeletingEntry(null)}
  title="Delete Entry"
  description="Are you sure you want to delete this entry?"
  icon={<AlertTriangle className="h-5 w-5" />}
  iconClassName="bg-destructive/10"
  titleClassName="text-destructive"
  gradientColor="danger"
  primaryAction={{
    label: "Delete",
    onClick: handleDelete,
    variant: "destructive",
    loading: isDeleting,
    loadingText: "Deleting…"
  }}
  secondaryAction={{
    label: "Cancel",
    onClick: () => setDeletingEntry(null)
  }}
/>
```

### Modal with Form Content
```tsx
<AppModal
  open={!!editingEntry}
  onOpenChange={() => setEditingEntry(null)}
  title="Edit Entry"
  description="Update Sehri & Iftar times for this date"
  gradientColor="primary"
  primaryAction={{
    label: "Save Changes",
    onClick: handleUpdate,
    loading: isUpdating,
    loadingText: "Saving…"
  }}
  secondaryAction={{
    label: "Cancel",
    onClick: () => setEditingEntry(null)
  }}
>
  <div className="grid gap-4 py-2">
    <div className="grid gap-1.5">
      <Label htmlFor="edit-date">Date</Label>
      <Input
        id="edit-date"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
      />
    </div>
    {/* More form fields */}
  </div>
</AppModal>
```

## Benefits

1. **Consistency**: All modals will have the same look and feel
2. **Maintainability**: Changes to modal styling only need to be made in one place
3. **Type Safety**: Full TypeScript support with proper prop types
4. **Flexibility**: Supports all current modal patterns and future needs
5. **Reduced Code**: Less duplication across the codebase
6. **Accessibility**: Built-in Radix UI accessibility features

## Migration Checklist

- [ ] Create `components/ui/app-modal.tsx`
- [ ] Update `components/admin/calendar-view.tsx` (3 modals)
- [ ] Update `app/admin/upload/page.tsx` (2 modals)
- [ ] Update `components/shared/logout-button.tsx` (1 modal)
- [ ] Test all modal interactions
- [ ] Verify responsive behavior
- [ ] Check accessibility features

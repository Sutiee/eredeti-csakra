# CSVUploadComponent

A React client component for CSV file upload, validation, and preview for the newsletter admin system.

## Features

- **Drag-and-drop file upload** with visual feedback
- **Client-side CSV parsing** using PapaParse
- **Comprehensive validation**:
  - Required columns: `name`, `email`, `variant`
  - Optional column: `result_id`
  - Email format validation (regex)
  - Variant values must be 'a', 'b', or 'c'
- **Preview table** displaying first 10 rows
- **Summary statistics**:
  - Total valid recipients
  - Breakdown by variant (A, B, C)
  - Invalid rows count with error messages
- **Template download** for easy CSV creation
- **Error handling** with inline validation feedback
- **Responsive design** optimized for mobile

## Installation

The component requires the following dependencies (already installed):

```bash
npm install papaparse react-dropzone sonner @types/papaparse
```

## Usage

### Basic Example

```typescript
import { CSVUploadComponent, NewsletterRecipient } from '@/components/admin';

function NewsletterPage() {
  const handleDataUploaded = (data: NewsletterRecipient[]) => {
    console.log('Uploaded recipients:', data);
    // Process the data (e.g., send to API)
  };

  return (
    <CSVUploadComponent
      onDataUploaded={handleDataUploaded}
      maxRows={1000}
    />
  );
}
```

### With Full Newsletter Flow

See `CSVUploadComponent.example.tsx` for a complete implementation example.

## Props

### CSVUploadComponentProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onDataUploaded` | `(data: NewsletterRecipient[]) => void` | Yes | - | Callback function called when valid data is uploaded |
| `maxRows` | `number` | No | `1000` | Maximum number of rows allowed in CSV |

## Types

### NewsletterRecipient

```typescript
type NewsletterRecipient = {
  name: string;           // Recipient name
  email: string;          // Valid email address (lowercase)
  variant: 'a' | 'b' | 'c'; // A/B/C test variant
  resultId?: string;      // Optional quiz result ID
};
```

## CSV Format

### Required Columns

- `name` - Recipient's full name
- `email` - Valid email address
- `variant` - Test variant ('a', 'b', or 'c')

### Optional Columns

- `result_id` - Quiz result UUID (if recipient completed quiz)

### Example CSV

```csv
name,email,variant,result_id
Anna Kiss,anna.kiss@example.com,a,
Katalin Nagy,katalin.nagy@example.com,b,uuid-123-456
Éva Szabó,eva.szabo@example.com,c,uuid-789-012
```

### Download Template

The component includes a "Sablon letöltése" (Download Template) button that generates a sample CSV file.

## Validation Rules

### Email Validation

- Must match regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Automatically converted to lowercase

### Variant Validation

- Must be exactly 'a', 'b', or 'c' (case-insensitive)
- Invalid values show error: "A variáns értéke csak 'a', 'b' vagy 'c' lehet"

### Required Fields

- All required fields must be non-empty
- Empty fields show error: "A [mező] mező kötelező"

### File Constraints

- **File type**: Only `.csv` files accepted
- **File size**: Maximum 5MB
- **Row limit**: Configurable via `maxRows` prop (default: 1000)

## UI States

### Upload Zone States

1. **Default**: Dashed border, hover effect
2. **Drag Active**: Purple border, purple background overlay
3. **Processing**: Animated pulse, disabled interaction
4. **File Loaded**: Shows filename with delete button

### Validation States

1. **Valid Rows**: Green checkmark (✓), normal background
2. **Invalid Rows**: Red X (✗), red tinted background, error message
3. **Blocked Upload**: Upload button disabled if any validation errors

## Error Handling

### Toast Notifications

- **Success**: File uploaded successfully with row count
- **Error**: Validation errors, file size/type errors
- **Info**: Template downloaded, data cleared

### Inline Error Display

Invalid rows are highlighted in the preview table with:
- Red background tint (`bg-red-500/5`)
- Red X icon
- Error message description

## Styling

### Design System

The component follows the Eredeti Csakra admin design system:

- **Glass morphism**: `backdrop-blur-md bg-gray-800/70`
- **Gradient borders**: `border-gray-700`
- **Purple gradient buttons**: `from-purple-600 to-rose-600`
- **Hover effects**: `hover:from-purple-700 hover:to-rose-700`
- **Responsive grid**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

### Custom Animations

- **Pulse**: Processing state
- **Hover scale**: Card hover effects
- **Transitions**: Smooth color and transform transitions

## Accessibility

- **ARIA labels**: All interactive elements have descriptive labels
- **Keyboard navigation**: Full keyboard support for all actions
- **Screen reader friendly**: Proper semantic HTML and ARIA attributes
- **Focus indicators**: Visible focus rings on interactive elements

## Performance

- **Client-side parsing**: No server round-trip for CSV parsing
- **Preview limit**: Only first 10 rows shown to avoid DOM overload
- **Lazy rendering**: Statistics calculated via `useMemo`
- **Optimized re-renders**: Proper use of React hooks

## Browser Support

- Modern browsers with ES6+ support
- File API support required
- Drag-and-drop API support required

## Troubleshooting

### "Érvénytelen fájl formátum"

- Ensure file has `.csv` extension
- Check file is valid CSV format (comma-separated)

### "Hiányzó oszlopok"

- CSV must have header row with: `name`, `email`, `variant`
- Column names are case-insensitive

### "Túl sok sor"

- Reduce number of rows in CSV
- Or increase `maxRows` prop if needed

### "Érvénytelen email formátum"

- Check email addresses are valid format
- Remove any spaces or special characters

## Future Enhancements

- [ ] Bulk email validation via API
- [ ] Duplicate email detection
- [ ] CSV import history
- [ ] Undo/redo functionality
- [ ] Column mapping UI for non-standard CSVs
- [ ] Export validated data as JSON
- [ ] Pagination for large datasets (>10 preview rows)

## Related Files

- `CSVUploadComponent.tsx` - Main component
- `CSVUploadComponent.example.tsx` - Usage example
- `components/admin/index.ts` - Exports

## License

Internal use only - Eredeti Csakra project

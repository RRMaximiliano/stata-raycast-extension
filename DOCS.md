# Code Documentation

This document provides detailed technical information about the Stata extension implementation.

## Architecture Overview

The extension consists of 5 main commands, each implemented as a separate TypeScript file:

### 1. Open New Do File (`open-new-do-file.ts`)

**Purpose**: Quick launcher that opens Stata and creates a new do file

**Implementation**:
- Uses AppleScript to activate Stata
- Sends Command+9 keyboard shortcut to open Do-file Editor
- Works whether Stata is running or not
- No UI component (mode: "no-view")

```typescript
// Core AppleScript command
const script = `
  tell application "StataMP" to activate
  tell application "System Events" to keystroke "9" using {command down}
`;
```

**Key Features**:
- Reliable cross-platform AppleScript execution
- Error handling with user feedback
- Fast execution for daily workflow

### 2. Recent Do Files (`recent-stata-do-files.tsx`)

**Purpose**: Browse and open recently used .do files

**Data Source**: 
- Reads from `~/Library/Preferences/com.stata.stata19.plist`
- Uses `NSRecentDocumentPaths` array
- Filters for .do file extensions

**Implementation Details**:
```typescript
// Convert binary plist to XML for parsing
execSync(`plutil -convert xml1 -o "${tempXmlPath}" "${originalPlistPath}"`);
const parsed = plist.parse(raw) as { NSRecentDocumentPaths?: string[] };
const doFiles = paths.filter((file) => file.endsWith(".do") && fs.existsSync(file));
```

**Features**:
- Real-time file existence checking
- File availability indicators (Available/Missing)
- Direct Stata integration for opening files
- Show in Finder capability

### 3. Recent Datasets (`recent-datasets.tsx`)

**Purpose**: Browse and open recently used .dta files

**Data Source**:
- Reads from `~/Library/Preferences/com.stata.stata19.plist`
- Uses `Recent_Files.0` through `Recent_Files.19` keys
- Handles quoted file paths from Stata

**Implementation Details**:
```typescript
// Parse Recent_Files.X keys and handle quoted paths
for (let i = 0; i < 20; i++) {
  const key = `Recent_Files.${i}`;
  if (parsed[key] && typeof parsed[key] === 'string') {
    let filePath = parsed[key];
    // Remove quotes if present
    if (filePath.startsWith('"') && filePath.endsWith('"')) {
      filePath = filePath.slice(1, -1);
    }
    if (filePath.endsWith('.dta')) {
      dtaFiles.push(filePath);
    }
  }
}
```

**Key Differences from Do Files**:
- Uses different plist keys (Recent_Files vs NSRecentDocumentPaths)
- Handles quoted paths from Stata preferences
- Shows files regardless of disk existence (cloud storage support)
- Uses Command+U shortcut to open datasets in Stata

### 4. Create Do File (`create-do-file.tsx`)

**Purpose**: Create new .do files using professional templates

**Template System**:
- 5 pre-built templates covering common analysis patterns
- Dynamic content generation with current date
- Structured comments and best practices

**Folder Selection**:
- Uses Raycast's native `Form.FilePicker` component
- Replaces AppleScript folder selection for better UX
- Supports directory-only selection

**Implementation Details**:
```typescript
// FilePicker configuration
<Form.FilePicker
  id="projectPath"
  title="Save Location"
  allowMultipleSelection={false}
  canChooseDirectories={true}
  canChooseFiles={false}
  value={projectPath}
  onChange={setProjectPath}
/>

// Path handling from FilePicker array
const selectedPath = values.projectPath[0];
const fullPath = join(selectedPath, fileNameWithExt);
```

**Templates Included**:
1. **Basic Analysis**: General data analysis structure
2. **Data Cleaning**: Data preparation and validation
3. **Regression Analysis**: Statistical modeling
4. **Panel Data Analysis**: Fixed/random effects models
5. **Time Series Analysis**: Time series modeling

### 5. Stata Help (`stata-help.tsx`)

**Purpose**: Comprehensive reference for advanced Stata commands

**Content Strategy**:
- Focus on complex/advanced commands users need to reference
- Exclude basic commands (describe, summarize) that users know
- Include real-world examples and best practices
- Provide direct links to official documentation

**Data Structure**:
```typescript
interface StataReference {
  name: string;
  syntax: string;
  description: string;
  category: string;
  examples?: string[];
  tips?: string[];
  onlineHelp?: string;
}
```

**Categories Covered**:
- Advanced Data Management (reshape, merge, egen)
- Panel Data (xtset, xtreg)
- Advanced Statistics (ivregress, margins, bootstrap)
- Programming (foreach, macros)
- Data Cleaning (duplicates, misstable)
- Time Series (tsset, operators)
- Graphics (twoway, marginsplot)

**UI Features**:
- Category filtering dropdown
- Search functionality
- Detailed view with examples
- Copy-to-clipboard actions
- Direct links to Stata documentation

## Technical Implementation Details

### Plist Parsing Strategy

**Challenge**: Stata preferences are stored in binary plist format
**Solution**: Convert to XML using macOS `plutil` command

```typescript
// Safe plist parsing with cleanup
const tempXmlPath = path.join(os.tmpdir(), "stata.plist.xml");
execSync(`plutil -convert xml1 -o "${tempXmlPath}" "${originalPlistPath}"`);
const raw = fs.readFileSync(tempXmlPath, "utf8");
const parsed = plist.parse(raw);
// Always cleanup temp file
if (fs.existsSync(tempXmlPath)) fs.unlinkSync(tempXmlPath);
```

### Error Handling Pattern

**Consistent Pattern Across All Commands**:
```typescript
try {
  // Main logic
} catch (error) {
  await showToast({
    style: Toast.Style.Failure,
    title: "Action Failed",
    message: String(error),
  });
} finally {
  setIsLoading(false);
  // Cleanup resources
}
```

### AppleScript Integration

**Stata Communication Strategy**:
- Use application activation first
- Send keyboard shortcuts for reliability
- Handle errors gracefully
- Provide user feedback

```typescript
// Standard pattern for Stata commands
execSync(`osascript -e 'tell application "StataMP" to activate' -e 'tell application "System Events" to keystroke "command"'`);
```

### Performance Considerations

1. **Lazy Loading**: Commands only read preferences when activated
2. **Efficient Filtering**: Pre-filter data before rendering
3. **Cleanup**: Always remove temporary files
4. **Caching**: UI state management to avoid re-reads

### File Path Handling

**Challenges**:
- Cloud storage paths (Dropbox, Google Drive)
- Quoted paths from Stata preferences
- Special characters in file names

**Solutions**:
- Robust path parsing with quote removal
- Existence checking without requiring files to exist
- Path normalization for display

## Development Guidelines

### Adding New Commands

1. Create new `.tsx` file in `src/`
2. Add command configuration to `package.json`
3. Follow established patterns for error handling
4. Include comprehensive TypeScript interfaces
5. Add appropriate documentation

### Modifying Templates

Templates are stored as string constants in `create-do-file.tsx`:
- Include current date in headers
- Use structured comments
- Follow Stata best practices
- Include placeholder sections for user customization

### Extending Help System

Add new commands to `stataReferences` array in `stata-help.tsx`:
- Focus on advanced/complex commands
- Include multiple practical examples
- Add pro tips and gotchas
- Provide official documentation links

## Testing Strategy

### Manual Testing Checklist

1. **Open New Do File**: Test with Stata running and not running
2. **Recent Files**: Verify file existence indicators
3. **Recent Datasets**: Test with cloud storage paths
4. **Create Do File**: Test folder picker and template generation
5. **Help System**: Verify search, filtering, and clipboard actions

### Edge Cases to Test

- Missing Stata preferences file
- Corrupted plist data
- Very long file paths
- Special characters in file names
- Empty recent files lists
- Cloud storage connectivity issues

## Future Enhancement Opportunities

1. **Additional Templates**: More specialized analysis templates
2. **Custom Templates**: User-defined template system
3. **Stata Version Detection**: Adapt behavior based on Stata version
4. **Syntax Highlighting**: Rich text display for code examples
5. **Integration**: Direct code execution in Stata
6. **Settings**: User preferences for paths and behavior

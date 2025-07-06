# Stata for Raycast

A streamlined Stata integration extension for Raycast that enhances your Stata workflow with quick access to files, creation tools, and documentation.

## Features

### 🚀 **Quick Actions**
- **Open New Do File**: Opens Stata and creates a new do file (works whether Stata is running or not)
- **Recent Do Files**: Browse and open your recently used .do files with status indicators
- **Recent Datasets**: Access recently used .dta files from Stata preferences

### 📁 **File Management**
- **Create Do File**: Create new .do files with professional templates and folder browser:
  - Basic Analysis
  - Data Cleaning
  - Regression Analysis
  - Panel Data Analysis
  - Time Series Analysis
  - Custom templates
  - Built-in folder selection (⌘B) for save location

### 📚 **Documentation & Help**
- **Stata Help & Documentation**: Searchable command reference with syntax examples
- Categorized commands (Data Management, Statistics, Graphics, etc.)
- Copy syntax and examples directly to clipboard
- Open official Stata help for any command

## Commands

| Command | Description | Type |
|---------|-------------|------|
| `Open New Do File` | Open Stata and create new do file | Quick Action |
| `Recent Do Files` | List and open recently used .do files | File Browser |
| `Recent Datasets` | List and open recently used .dta files | File Browser |
| `Create Do File` | Create new .do files with templates | File Creator |
| `Stata Help & Documentation` | Search commands and documentation | Reference |

## Workflow

### Daily Usage
1. **Open New Do File** - Start your analysis with a fresh do file
2. **Recent Do Files** - Continue working on existing projects  
3. **Recent Datasets** - Quickly load datasets you've been working with
4. **Stata Help** - Look up command syntax when needed

### Project Setup
1. **Create Do File** - Use templates for structured project files
2. **Browse Folder** (⌘B) - Choose exactly where to save your files
3. **Template Selection** - Pick the right template for your analysis type

## Requirements

- macOS
- Stata (tested with StataMP)
- Raycast

## Installation

1. Clone or download this extension
2. Open in Raycast
3. Build and install

## Usage Tips

- **Recent Files**: Both do files and datasets show availability status
- **Smart Opening**: Open New Do File detects if Stata is already running
- **Template System**: Speeds up new project creation with best practices
- **Folder Browser**: Use ⌘B in Create Do File to select save location
- **Quick Actions**: All commands optimized for speed and efficiency

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build extension
npm run build

# Lint code
npm run lint
```

## License

MIT License
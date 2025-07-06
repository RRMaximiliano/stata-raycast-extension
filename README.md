# Stata Extension for Raycast

A comprehensive Stata integration extension for Raycast that streamlines your statistical analysis workflow with quick file access, intelligent templates, and comprehensive documentation.

![Stata Extension Demo](assets/extension-icon.png)

## ✨ Features

### 🚀 **Quick File Access**
- **Open New Do File**: Instantly open Stata with a new do file (detects if Stata is running)
- **Recent Do Files**: Browse and open recently used .do files with availability indicators
- **Recent Datasets**: Access recently used .dta files directly from Stata preferences

### 📁 **Smart File Creation**
- **Create Do File**: Professional templates with native folder picker
  - Basic Analysis Template
  - Data Cleaning Template  
  - Regression Analysis Template
  - Panel Data Analysis Template
  - Time Series Analysis Template
  - Custom content editing
- **Native Folder Browser**: Click to select save location (no more typing paths!)

### 📚 **Advanced Documentation**
- **Stata Help & Documentation**: Comprehensive command reference
  - Advanced commands (reshape, merge, egen, xtreg, margins, etc.)
  - Real-world examples with copy-to-clipboard functionality
  - Pro tips and best practices
  - Direct links to official Stata documentation
  - Category filtering and search

## 🎯 Commands Overview

| Command | Description | Mode | Use Case |
|---------|-------------|------|----------|
| **Open New Do File** | Launch Stata + new do file | Action | Quick analysis start |
| **Recent Do Files** | Browse recent .do files | List | Continue existing work |
| **Recent Datasets** | Browse recent .dta files | List | Quick data access |
| **Create Do File** | Template-based file creation | Form | Structured project setup |
| **Stata Help** | Advanced command reference | List | Syntax lookup & learning |

## 🚀 Quick Start

### Installation
1. Clone this repository or download the extension
2. Open Raycast and navigate to Extensions
3. Import the Stata extension
4. Enjoy streamlined Stata workflow!

### Daily Workflow
```
1. 🎯 Open New Do File → Start fresh analysis
2. 📁 Recent Do Files → Continue existing projects  
3. 📊 Recent Datasets → Load your working data
4. 📚 Stata Help → Look up command syntax
5. 📝 Create Do File → Start structured projects
```

## 💡 Key Features Detail

### Smart Do File Management
- **Availability Status**: See which files exist vs. are missing
- **Quick Open**: Direct integration with Stata application
- **Path Display**: Full file paths for context

### Intelligent Templates
The Create Do File command includes professionally structured templates:

```stata
* Basic Analysis Template
clear all
set more off
* Set working directory
cd "~/Documents/Stata"
* Load data
* use "dataset.dta", clear
* [Additional structured sections...]
```

### Advanced Command Reference
Unlike basic command lists, our help system covers:
- **Complex commands**: reshape, merge, egen, xtreg, margins
- **Programming constructs**: foreach loops, macros, conditionals  
- **Advanced statistics**: IV regression, panel data, time series
- **Real examples**: Copy-paste ready code snippets
- **Pro tips**: Best practices and common gotchas

## 🛠️ Technical Details

### Requirements
- **macOS**: Extension uses native AppleScript integration
- **Stata**: Any version (tested with StataMP 19)
- **Raycast**: Latest version recommended

### Data Sources
- **Recent Files**: Reads from Stata preferences (`com.stata.stata19.plist`)
- **Do Files**: From `NSRecentDocumentPaths`
- **Datasets**: From `Recent_Files.X` keys (handles quoted paths)

### File Operations
- **Path Resolution**: Supports cloud storage paths (Dropbox, Google Drive)
- **Existence Checking**: Real-time file availability status
- **Smart Opening**: AppleScript integration for reliable Stata launching
## Requirements

- macOS
- Stata (tested with StataMP)
- Raycast

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

## Project Structure

```
src/
├── open-new-do-file.ts      # Quick Stata + do file launcher
├── recent-stata-do-files.tsx # Recent .do files browser
├── recent-datasets.tsx       # Recent .dta files browser  
├── create-do-file.tsx       # Template-based file creator
└── stata-help.tsx           # Advanced command reference
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

## Acknowledgments

- Built for the Stata community
- Inspired by real workflow needs
- Optimized for speed and efficiency
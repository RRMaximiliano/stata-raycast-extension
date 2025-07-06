# Changelog

All notable changes to the Stata extension for Raycast will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-07-06

### Added

- **Open New Do File**: Reliable AppleScript-based Stata launcher
- **Recent Do Files**: Browse and open recently used .do files with availability status
- **Recent Datasets**: Access recently used .dta files from Stata preferences
- **Create Do File**: Template-based file creation with native folder picker
- **Stata Help & Documentation**: Comprehensive reference for advanced commands

### Fixed

- **Recent Datasets**: Now opens .dta files using system file association (like double-clicking in Finder)
- Replaced AppleScript command typing with native `open` command for reliable file opening
- Datasets now open directly in Stata without command interpretation issues

### Features

- Native macOS folder picker for file creation
- Real-time file availability checking
- Professional do file templates (Basic Analysis, Data Cleaning, Regression, Panel Data, Time Series)
- Advanced command reference with examples and tips
- Direct links to official Stata documentation
- Category filtering and search functionality
- Copy-to-clipboard for syntax and examples
- System-native file opening (identical to Finder double-click behavior)

### Technical

- Reads Stata preferences from `com.stata.stata19.plist`
- Supports quoted file paths and cloud storage locations
- Uses system `open` command for file association handling
- TypeScript implementation with proper error handling

### Templates Included

- Basic Analysis Template
- Data Cleaning Template
- Regression Analysis Template
- Panel Data Analysis Template
- Time Series Analysis Template

### Commands Covered in Help

- Advanced Data Management: reshape, merge, egen
- Panel Data: xtset, xtreg
- Advanced Statistics: ivregress, margins, bootstrap
- Programming: foreach, macros
- Data Cleaning: duplicates, misstable
- Time Series: tsset, time operators
- Graphics: twoway, marginsplot
- Advanced Techniques: reghdfe

## [Development Notes]

### Architecture Decisions

- Used AppleScript for Stata integration (most reliable method)
- Uses system `open` command for file association (native behavior)
- Native Raycast FilePicker for better UX than manual path entry
- Separate commands for different workflows (quick access vs. creation)
- Comprehensive help system focusing on advanced/complex commands

### Performance Optimizations

- Efficient plist parsing with cleanup
- Real-time file existence checking
- Category-based filtering for large command sets

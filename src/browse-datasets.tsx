import { 
  Action, 
  ActionPanel, 
  Icon, 
  List, 
  showToast, 
  Toast,
  showInFinder 
} from "@raycast/api";
import { useState, useEffect } from "react";
import { readdirSync, statSync, existsSync } from "fs";
import { join, extname, basename, dirname } from "path";
import { homedir } from "os";
import { exec } from "child_process";

interface DatasetFile {
  name: string;
  path: string;
  size: string;
  modified: string;
  directory: string;
}

export default function Command() {
  const [datasets, setDatasets] = useState<DatasetFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const commonDirectories = [
    join(homedir(), "Documents", "Stata"),
    join(homedir(), "Desktop"),
    join(homedir(), "Downloads"),
    join(homedir(), "Documents"),
    "/Applications/Stata/ado/base",
    "/System/Library/Frameworks/Stata.framework/Versions/Current/Resources/ado/base"
  ];

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  function scanDirectory(dirPath: string): DatasetFile[] {
    const datasets: DatasetFile[] = [];
    
    try {
      if (!existsSync(dirPath)) return datasets;
      
      const items = readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = join(dirPath, item);
        
        try {
          const stats = statSync(fullPath);
          
          if (stats.isFile() && extname(item).toLowerCase() === ".dta") {
            datasets.push({
              name: basename(item),
              path: fullPath,
              size: formatFileSize(stats.size),
              modified: stats.mtime.toLocaleDateString(),
              directory: basename(dirPath)
            });
          } else if (stats.isDirectory() && !item.startsWith(".")) {
            // Recursively scan subdirectories (but limit depth to avoid performance issues)
            const subDatasets = scanDirectory(fullPath);
            datasets.push(...subDatasets);
          }
        } catch {
          // Skip files that can't be accessed
          continue;
        }
      }
    } catch {
      // Skip directories that can't be accessed
    }
    
    return datasets;
  }

  useEffect(() => {
    async function findDatasets() {
      setIsLoading(true);
      
      try {
        let allDatasets: DatasetFile[] = [];
        
        for (const dir of commonDirectories) {
          const dirDatasets = scanDirectory(dir);
          allDatasets.push(...dirDatasets);
        }
        
        // Remove duplicates and sort by name
        const uniqueDatasets = allDatasets.filter((dataset, index, self) => 
          index === self.findIndex(d => d.path === dataset.path)
        );
        
        uniqueDatasets.sort((a, b) => a.name.localeCompare(b.name));
        
        setDatasets(uniqueDatasets);
        
        if (uniqueDatasets.length === 0) {
          await showToast({
            style: Toast.Style.Success,
            title: "No .dta files found",
            message: "No Stata datasets found in common directories",
          });
        }
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Error scanning for datasets",
          message: String(error),
        });
      } finally {
        setIsLoading(false);
      }
    }

    findDatasets();
  }, []);

  const filteredDatasets = datasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchText.toLowerCase()) ||
    dataset.directory.toLowerCase().includes(searchText.toLowerCase())
  );

  // Group datasets by directory
  const groupedDatasets = filteredDatasets.reduce((acc, dataset) => {
    const dirName = dirname(dataset.path);
    if (!acc[dirName]) {
      acc[dirName] = [];
    }
    acc[dirName].push(dataset);
    return acc;
  }, {} as Record<string, DatasetFile[]>);

  async function openInStata(filePath: string) {
    try {
      exec(`osascript -e 'tell application "StataMP" to activate' -e 'tell application "System Events" to keystroke "u" using {command down}' -e 'delay 0.5' -e 'tell application "System Events" to keystroke "${filePath.replace(/"/g, '\\"')}"' -e 'tell application "System Events" to keystroke return'`);
      
      await showToast({
        style: Toast.Style.Success,
        title: "Opening in Stata",
        message: basename(filePath),
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to open in Stata",
        message: String(error),
      });
    }
  }

  return (
    <List
      isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search Stata datasets (.dta files)..."
    >
      {Object.entries(groupedDatasets).map(([directory, files]) => (
        <List.Section key={directory} title={directory} subtitle={`${files.length} file${files.length !== 1 ? 's' : ''}`}>
          {files.map((dataset) => (
            <List.Item
              key={dataset.path}
              title={dataset.name}
              subtitle={`${dataset.size} • Modified ${dataset.modified}`}
              icon={Icon.Document}
              accessories={[{ text: dataset.directory }]}
              actions={
                <ActionPanel>
                  <Action
                    title="Open in Stata"
                    icon={Icon.Play}
                    onAction={() => openInStata(dataset.path)}
                  />
                  <Action
                    title="Show in Finder"
                    icon={Icon.Finder}
                    onAction={() => showInFinder(dataset.path)}
                  />
                  <Action.CopyToClipboard
                    title="Copy File Path"
                    content={dataset.path}
                    icon={Icon.Clipboard}
                  />
                  <Action.CopyToClipboard
                    title="Copy Use Command"
                    content={`use "${dataset.path}", clear`}
                    icon={Icon.Code}
                  />
                  <Action
                    title="Quick Describe"
                    icon={Icon.Info}
                    onAction={() => {
                      exec(`osascript -e 'tell application "StataMP" to activate' -e 'tell application "System Events" to keystroke "use \\"${dataset.path.replace(/"/g, '\\"')}\\", clear" & return' -e 'delay 0.5' -e 'tell application "System Events" to keystroke "describe" & return'`);
                    }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}
      
      {filteredDatasets.length === 0 && !isLoading && (
        <List.EmptyView
          title="No Stata datasets found"
          description="No .dta files found in common directories. Try placing datasets in ~/Documents/Stata"
          icon={Icon.Document}
        />
      )}
    </List>
  );
}

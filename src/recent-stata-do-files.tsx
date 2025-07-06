import { Action, ActionPanel, Icon, List, showToast, Toast, showInFinder } from "@raycast/api";
import { useEffect, useState } from "react";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as plist from "plist";

export default function Command() {
  const [files, setFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const homeDir = os.homedir();
      const originalPlistPath = path.join(homeDir, "Library/Preferences/com.stata.stata19.plist");
      const tempXmlPath = path.join(os.tmpdir(), "stata.plist.xml");

      try {
        // Convert binary plist to XML
        execSync(`plutil -convert xml1 -o "${tempXmlPath}" "${originalPlistPath}"`);
        const raw = fs.readFileSync(tempXmlPath, "utf8");
        const parsed = plist.parse(raw) as { NSRecentDocumentPaths?: string[] };

        const paths = parsed.NSRecentDocumentPaths || [];
        const doFiles = paths.filter((file) => file.endsWith(".do") && fs.existsSync(file));

        setFiles(doFiles);
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Could not read Stata recent files",
          message: String(error),
        });
        setFiles([]);
      } finally {
        setIsLoading(false);
        if (fs.existsSync(tempXmlPath)) fs.unlinkSync(tempXmlPath); // cleanup temp file
      }
    })();
  }, []);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search recent .do files">
      <List.Section title="Recent .do Files">
        {files.map((file, index) => (
          <List.Item
            key={index}
            title={path.basename(file)}
            subtitle={file}
            icon={Icon.Document}
            accessories={[
              { 
                text: fs.existsSync(file) ? "Available" : "Missing",
                icon: fs.existsSync(file) ? Icon.Check : Icon.XMarkCircle
              }
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="Open in Stata"
                  icon={Icon.Play}
                  onAction={() => {
                    try {
                      if (!fs.existsSync(file)) {
                        showToast({ 
                          style: Toast.Style.Failure, 
                          title: "File not found",
                          message: "This file no longer exists"
                        });
                        return;
                      }
                      execSync(`open -a StataMP "${file}"`);
                      showToast({ 
                        style: Toast.Style.Success, 
                        title: "Opening in Stata",
                        message: path.basename(file)
                      });
                    } catch {
                      showToast({ style: Toast.Style.Failure, title: "Failed to open file" });
                    }
                  }}
                />
                <Action
                  title="Show in Finder"
                  icon={Icon.Finder}
                  onAction={() => {
                    if (fs.existsSync(file)) {
                      showInFinder(file);
                    } else {
                      showToast({ 
                        style: Toast.Style.Failure, 
                        title: "File not found",
                        message: "This file no longer exists"
                      });
                    }
                  }}
                />
                <Action.CopyToClipboard title="Copy File Path" content={file} />
                <Action.OpenWith path={file} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
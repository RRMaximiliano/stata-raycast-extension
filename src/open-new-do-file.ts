import { closeMainWindow, showHUD } from "@raycast/api";
import { exec } from "child_process";

export default async function main() {
  await closeMainWindow();

  const script = `
    tell application "Finder"
      open POSIX file "/System/Volumes/Data/Applications/StataNow/StataMP.app"
    end tell
    delay 1
    tell application "System Events"
      tell process "StataMP"
        keystroke "9" using {command down}
      end tell
    end tell
  `;

  exec(`osascript -e '${script.replace(/\n/g, "' -e '")}'`, (error) => {
    if (error) {
      showHUD("Failed to open Do-file Editor");
    } else {
      showHUD("Do-file Editor opened");
    }
  });
}

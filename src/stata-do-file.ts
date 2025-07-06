// Opens the Stata Do-file Editor using optimized AppleScript commands
// This script provides a reliable way to open Stata and activate the Do-file Editor
// with proper error handling and user feedback
import { closeMainWindow, showHUD } from "@raycast/api";
import { exec } from "child_process";

export default async function main() {
  await closeMainWindow();

  // First, try to activate Stata if it's already running
  const checkStataScript = `
    tell application "System Events"
      if exists (processes where name is "StataMP") then
        tell application "StataMP" to activate
        tell process "StataMP"
          keystroke "9" using {command down}
        end tell
        return "activated"
      else
        return "not_running"
      end if
    end tell
  `;

  exec(`osascript -e '${checkStataScript.replace(/\n/g, "' -e '")}'`, (error, stdout) => {
    if (error) {
      showHUD("Failed to check Stata status");
      return;
    }

    if (stdout.trim() === "activated") {
      showHUD("Do-file Editor opened");
    } else {
      // Stata is not running, so launch it and then open the editor
      const launchScript = `
        tell application "StataMP" to activate
        delay 2
        tell application "System Events"
          tell process "StataMP"
            keystroke "9" using {command down}
          end tell
        end tell
      `;

      exec(`osascript -e '${launchScript.replace(/\n/g, "' -e '")}'`, (launchError) => {
        if (launchError) {
          showHUD("Failed to open Stata");
        } else {
          showHUD("Stata launched - Do-file Editor opened");
        }
      });
    }
  });
}

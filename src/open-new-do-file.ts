// Opens Stata and creates a new do file
// This command will open Stata if not already running, or create a new do file if Stata is already open
import { closeMainWindow, showHUD } from "@raycast/api";
import { exec } from "child_process";

export default async function main() {
  await closeMainWindow();

  // Check if Stata is already running and create new do file
  const newDoFileScript = `
    tell application "System Events"
      if exists (processes where name is "StataMP") then
        tell application "StataMP" to activate
        tell process "StataMP"
          keystroke "n" using {command down}
        end tell
        return "new_file_created"
      else
        return "not_running"
      end if
    end tell
  `;

  exec(`osascript -e '${newDoFileScript.replace(/\n/g, "' -e '")}'`, (error, stdout) => {
    if (error) {
      showHUD("Failed to check Stata status");
      return;
    }

    if (stdout.trim() === "new_file_created") {
      showHUD("New do file created");
    } else {
      // Stata is not running, so launch it and create a new do file
      const launchScript = `
        tell application "StataMP" to activate
        delay 2
        tell application "System Events"
          tell process "StataMP"
            keystroke "n" using {command down}
          end tell
        end tell
      `;

      exec(`osascript -e '${launchScript.replace(/\n/g, "' -e '")}'`, (launchError) => {
        if (launchError) {
          showHUD("Failed to open Stata");
        } else {
          showHUD("Stata launched - New do file created");
        }
      });
    }
  });
}

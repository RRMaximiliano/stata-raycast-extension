import { 
  Action, 
  ActionPanel, 
  Detail, 
  Form, 
  Icon, 
  showToast, 
  Toast, 
  useNavigation 
} from "@raycast/api";
import { useState } from "react";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { exec } from "child_process";

interface CodeResult {
  code: string;
  output: string;
  error?: string;
}

function ResultView({ result }: { result: CodeResult }) {
  const markdown = `
# Stata Code Execution Result

## Code Executed:
\`\`\`stata
${result.code}
\`\`\`

## Output:
\`\`\`
${result.output || "No output"}
\`\`\`

${result.error ? `## Error:\n\`\`\`\n${result.error}\n\`\`\`` : ""}
  `;

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Output" content={result.output} />
          <Action.CopyToClipboard title="Copy Code" content={result.code} />
        </ActionPanel>
      }
    />
  );
}

export default function Command() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { push } = useNavigation();

  const commonCommands = [
    { title: "Summary Statistics", code: "summarize" },
    { title: "Data Description", code: "describe" },
    { title: "List First 10 Observations", code: "list in 1/10" },
    { title: "Regression", code: "regress y x1 x2" },
    { title: "Clear Memory", code: "clear" },
    { title: "Display Working Directory", code: "pwd" },
  ];

  async function runStataCode(stataCode: string) {
    setIsLoading(true);
    
    try {
      const tempFile = join(tmpdir(), `raycast_stata_${Date.now()}.do`);
      const logFile = join(tmpdir(), `raycast_stata_${Date.now()}.log`);
      
      // Create do file with log
      const doFileContent = `
log using "${logFile}", replace text
${stataCode}
log close
exit
`;
      
      writeFileSync(tempFile, doFileContent);
      
      await showToast({
        style: Toast.Style.Animated,
        title: "Running Stata code...",
      });

      exec(`/Applications/Stata/StataMP.app/Contents/MacOS/StataMP -b do "${tempFile}"`, 
        { timeout: 30000 }, 
        (error, stdout, stderr) => {
          try {
            let output = "";
            let errorMsg = "";

            if (stderr) {
              errorMsg = stderr;
            }

            // Try to read log file
            try {
              const fs = require("fs");
              if (fs.existsSync(logFile)) {
                output = fs.readFileSync(logFile, "utf8");
              } else {
                output = stdout || "No output generated";
              }
            } catch {
              output = stdout || "Could not read output";
            }

            const result: CodeResult = {
              code: stataCode,
              output,
              error: error ? error.message : errorMsg || undefined,
            };

            push(<ResultView result={result} />);

            // Cleanup
            [tempFile, logFile].forEach(file => {
              try { unlinkSync(file); } catch {}
            });

          } catch (cleanupError) {
            showToast({
              style: Toast.Style.Failure,
              title: "Error processing results",
              message: String(cleanupError),
            });
          } finally {
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to run Stata code",
        message: String(error),
      });
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Run Code"
            icon={Icon.Play}
            onSubmit={() => runStataCode(code)}
          />
          {commonCommands.map((cmd, index) => (
            <Action
              key={index}
              title={`Insert: ${cmd.title}`}
              icon={Icon.Plus}
              onAction={() => setCode(prev => prev + (prev ? "\n" : "") + cmd.code)}
            />
          ))}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="code"
        title="Stata Code"
        placeholder="Enter your Stata commands here..."
        value={code}
        onChange={setCode}
      />
      <Form.Separator />
      <Form.Description text="Quick Commands:" />
      {commonCommands.map((cmd, index) => (
        <Form.Description key={index} text={`• ${cmd.title}: ${cmd.code}`} />
      ))}
    </Form>
  );
}

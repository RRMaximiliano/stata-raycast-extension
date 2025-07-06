import { Action, ActionPanel, Detail, Icon, List, useNavigation } from "@raycast/api";
import { useState } from "react";
import { exec } from "child_process";

interface StataCommand {
  name: string;
  syntax: string;
  description: string;
  category: string;
  examples?: string[];
}

const stataCommands: StataCommand[] = [
  // Data Management
  {
    name: "use",
    syntax: "use [filename]",
    description: "Load Stata dataset",
    category: "Data Management",
    examples: ['use "dataset.dta"', 'use "dataset.dta", clear', 'use var1 var2 using "dataset.dta"'],
  },
  {
    name: "save",
    syntax: "save [filename]",
    description: "Save current dataset",
    category: "Data Management",
    examples: ['save "newfile.dta"', 'save "newfile.dta", replace'],
  },
  {
    name: "import",
    syntax: "import delimited [filename]",
    description: "Import CSV or delimited files",
    category: "Data Management",
    examples: ['import delimited "data.csv"', 'import delimited "data.txt", delimiter(tab)'],
  },
  {
    name: "export",
    syntax: "export delimited [filename]",
    description: "Export data to CSV or delimited files",
    category: "Data Management",
    examples: ['export delimited "output.csv"', 'export delimited "output.txt", delimiter(tab) replace'],
  },

  // Data Exploration
  {
    name: "describe",
    syntax: "describe [varlist]",
    description: "Display variable information",
    category: "Data Exploration",
    examples: ["describe", "describe var1 var2", "describe, simple"],
  },
  {
    name: "summarize",
    syntax: "summarize [varlist]",
    description: "Display summary statistics",
    category: "Data Exploration",
    examples: ["summarize", "summarize var1 var2", "summarize, detail"],
  },
  {
    name: "tabulate",
    syntax: "tabulate var1 [var2]",
    description: "Create frequency tables",
    category: "Data Exploration",
    examples: ["tabulate gender", "tabulate gender education", "tabulate gender, missing"],
  },
  {
    name: "list",
    syntax: "list [varlist] [if] [in]",
    description: "Display data values",
    category: "Data Exploration",
    examples: ["list", "list in 1/10", "list var1 var2 if age > 30"],
  },

  // Statistics
  {
    name: "regress",
    syntax: "regress depvar [indepvars]",
    description: "Linear regression",
    category: "Statistics",
    examples: ["regress y x1 x2", "regress y x1 x2, robust", "regress y x1 x2 if sample == 1"],
  },
  {
    name: "logit",
    syntax: "logit depvar [indepvars]",
    description: "Logistic regression",
    category: "Statistics",
    examples: ["logit outcome x1 x2", "logit outcome x1 x2, or"],
  },
  {
    name: "ttest",
    syntax: "ttest var [== value]",
    description: "t-tests",
    category: "Statistics",
    examples: ["ttest weight == 150", "ttest weight, by(gender)"],
  },
  {
    name: "correlate",
    syntax: "correlate [varlist]",
    description: "Correlation matrix",
    category: "Statistics",
    examples: ["correlate", "correlate var1 var2 var3", "correlate, covariance"],
  },

  // Graphics
  {
    name: "scatter",
    syntax: "scatter yvar xvar",
    description: "Scatterplot",
    category: "Graphics",
    examples: ["scatter y x", "scatter y x, by(group)", 'scatter y x, title("My Scatterplot")'],
  },
  {
    name: "histogram",
    syntax: "histogram var",
    description: "Histogram",
    category: "Graphics",
    examples: ["histogram age", "histogram age, by(gender)", "histogram age, normal"],
  },
  {
    name: "graph",
    syntax: "graph command",
    description: "General graphing command",
    category: "Graphics",
    examples: ["graph bar y, over(group)", "graph box y, over(group)", 'graph export "plot.png", replace'],
  },

  // Data Manipulation
  {
    name: "generate",
    syntax: "generate newvar = expression",
    description: "Create new variables",
    category: "Data Manipulation",
    examples: [
      "generate age_squared = age^2",
      "generate log_income = log(income)",
      "generate high_income = income > 50000",
    ],
  },
  {
    name: "replace",
    syntax: "replace var = expression [if]",
    description: "Replace variable values",
    category: "Data Manipulation",
    examples: ["replace age = . if age < 0", "replace income = income * 1000"],
  },
  {
    name: "drop",
    syntax: "drop varlist",
    description: "Drop variables or observations",
    category: "Data Manipulation",
    examples: ["drop var1 var2", "drop if age < 18", "drop in 1/10"],
  },
  {
    name: "keep",
    syntax: "keep varlist",
    description: "Keep only specified variables or observations",
    category: "Data Manipulation",
    examples: ["keep var1 var2 var3", "keep if age >= 18"],
  },
];

function CommandDetail({ command }: { command: StataCommand }) {
  const markdown = `
# ${command.name}

**Category:** ${command.category}

**Syntax:** \`${command.syntax}\`

**Description:** ${command.description}

${
  command.examples
    ? `
## Examples:
${command.examples.map((example) => `\`\`\`stata\n${example}\n\`\`\``).join("\n\n")}
`
    : ""
}

---

*Use the actions below to copy syntax or open Stata documentation.*
  `;

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Syntax" content={command.syntax} icon={Icon.Clipboard} />
          <Action.CopyToClipboard title="Copy Command Name" content={command.name} icon={Icon.Text} />
          <Action
            title="Open Stata Documentation"
            icon={Icon.Book}
            onAction={() => {
              exec(
                `osascript -e 'tell application "StataMP" to activate' -e 'tell application "System Events" to keystroke "h" using {command down}' -e 'delay 0.5' -e 'tell application "System Events" to keystroke "${command.name}"'`,
              );
            }}
          />
          {command.examples && command.examples.length > 0 && (
            <Action.CopyToClipboard title="Copy First Example" content={command.examples[0]} icon={Icon.Code} />
          )}
        </ActionPanel>
      }
    />
  );
}

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { push } = useNavigation();

  const categories = ["All", ...Array.from(new Set(stataCommands.map((cmd) => cmd.category)))];

  const filteredCommands = stataCommands.filter((command) => {
    const matchesSearch =
      command.name.toLowerCase().includes(searchText.toLowerCase()) ||
      command.description.toLowerCase().includes(searchText.toLowerCase()) ||
      command.syntax.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory = selectedCategory === "All" || command.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const groupedCommands = categories.slice(1).reduce(
    (acc, category) => {
      acc[category] = filteredCommands.filter((cmd) => cmd.category === category);
      return acc;
    },
    {} as Record<string, StataCommand[]>,
  );

  return (
    <List
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search Stata commands..."
      searchBarAccessory={
        <List.Dropdown tooltip="Filter by Category" value={selectedCategory} onChange={setSelectedCategory}>
          {categories.map((category) => (
            <List.Dropdown.Item key={category} title={category} value={category} />
          ))}
        </List.Dropdown>
      }
    >
      {selectedCategory === "All" ? (
        categories.slice(1).map((category) => (
          <List.Section key={category} title={category}>
            {groupedCommands[category].map((command) => (
              <List.Item
                key={command.name}
                title={command.name}
                subtitle={command.description}
                accessories={[{ text: command.syntax }]}
                icon={Icon.Terminal}
                actions={
                  <ActionPanel>
                    <Action
                      title="View Details"
                      icon={Icon.Eye}
                      onAction={() => push(<CommandDetail command={command} />)}
                    />
                    <Action.CopyToClipboard title="Copy Syntax" content={command.syntax} icon={Icon.Clipboard} />
                    <Action
                      title="Open Stata Help"
                      icon={Icon.Book}
                      onAction={() => {
                        exec(
                          `osascript -e 'tell application "StataMP" to activate' -e 'tell application "System Events" to keystroke "h" using {command down}' -e 'delay 0.5' -e 'tell application "System Events" to keystroke "${command.name}"'`,
                        );
                      }}
                    />
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
        ))
      ) : (
        <List.Section title={selectedCategory}>
          {filteredCommands.map((command) => (
            <List.Item
              key={command.name}
              title={command.name}
              subtitle={command.description}
              accessories={[{ text: command.syntax }]}
              icon={Icon.Terminal}
              actions={
                <ActionPanel>
                  <Action
                    title="View Details"
                    icon={Icon.Eye}
                    onAction={() => push(<CommandDetail command={command} />)}
                  />
                  <Action.CopyToClipboard title="Copy Syntax" content={command.syntax} icon={Icon.Clipboard} />
                  <Action
                    title="Open Stata Help"
                    icon={Icon.Book}
                    onAction={() => {
                      exec(
                        `osascript -e 'tell application "StataMP" to activate' -e 'tell application "System Events" to keystroke "h" using {command down}' -e 'delay 0.5' -e 'tell application "System Events" to keystroke "${command.name}"'`,
                      );
                    }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}

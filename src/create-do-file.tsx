import { Action, ActionPanel, Form, Icon, showToast, Toast, showInFinder, open } from "@raycast/api";
import { useState } from "react";
import { writeFileSync, existsSync } from "fs";
import { join } from "path";

interface DoFileTemplate {
  name: string;
  description: string;
  content: string;
}

const templates: DoFileTemplate[] = [
  {
    name: "Basic Analysis",
    description: "Template for basic data analysis",
    content: `* ${new Date().toLocaleDateString()} - Basic Data Analysis
* Author: [Your Name]

clear all
set more off

* Set working directory
cd "~/Documents/Stata"

* Load data
* use "dataset.dta", clear

* Describe data
describe
summarize

* Basic analysis
* Add your analysis here

* Save results
* save "results.dta", replace
`,
  },
  {
    name: "Data Cleaning",
    description: "Template for data cleaning and preparation",
    content: `* ${new Date().toLocaleDateString()} - Data Cleaning
* Author: [Your Name]

clear all
set more off

* Load raw data
* import delimited "rawdata.csv", clear

* Data cleaning steps
* 1. Check for missing values
* misstable summarize

* 2. Remove duplicates
* duplicates report
* duplicates drop

* 3. Label variables
* label variable var1 "Variable 1 Description"

* 4. Create new variables
* generate new_var = old_var * 100

* Save cleaned data
* save "cleaned_data.dta", replace
`,
  },
  {
    name: "Regression Analysis",
    description: "Template for regression analysis",
    content: `* ${new Date().toLocaleDateString()} - Regression Analysis
* Author: [Your Name]

clear all
set more off

* Load data
* use "dataset.dta", clear

* Descriptive statistics
summarize

* Correlation matrix
correlate

* Basic regression
regress dependent_var independent_var1 independent_var2

* Check assumptions
* Residual plots
predict residuals, residuals
scatter residuals independent_var1

* Additional diagnostics
estat hettest
estat vif

* Robust regression
regress dependent_var independent_var1 independent_var2, robust
`,
  },
  {
    name: "Panel Data Analysis",
    description: "Template for panel data analysis",
    content: `* ${new Date().toLocaleDateString()} - Panel Data Analysis
* Author: [Your Name]

clear all
set more off

* Load panel data
* use "panel_data.dta", clear

* Set panel structure
* xtset id time

* Describe panel structure
xtdescribe
xtsum

* Fixed effects regression
xtreg dependent_var independent_var1 independent_var2, fe

* Random effects regression
xtreg dependent_var independent_var1 independent_var2, re

* Hausman test
hausman fe re

* First difference regression
reg D.(dependent_var independent_var1 independent_var2)
`,
  },
  {
    name: "Time Series Analysis",
    description: "Template for time series analysis",
    content: `* ${new Date().toLocaleDateString()} - Time Series Analysis
* Author: [Your Name]

clear all
set more off

* Load time series data
* use "timeseries.dta", clear

* Set time series structure
* tsset date

* Describe time series
tsline variable

* Unit root tests
dfuller variable
pperron variable

* If non-stationary, difference
* generate d_variable = D.variable
* dfuller d_variable

* ARIMA modeling
* arima variable, arima(1,1,1)

* Forecasting
* predict forecast, y
* tsline variable forecast
`,
  },
  {
    name: "Empty Template",
    description: "Blank do file with basic header",
    content: `* ${new Date().toLocaleDateString()} - [Project Name]
* Author: [Your Name]
* Description: [Brief description of what this do file does]

clear all
set more off

* Set working directory
* cd "~/Documents/Stata"

* Your code here

`,
  },
];

export default function Command() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [projectPath, setProjectPath] = useState<string[]>([]);
  const [customContent, setCustomContent] = useState<string>("");

  function handleTemplateChange(templateName: string) {
    setSelectedTemplate(templateName);
    const template = templates.find((t) => t.name === templateName);
    if (template) {
      setCustomContent(template.content);
    } else {
      setCustomContent("");
    }
  }

  async function createDoFile(values: { fileName: string; projectPath: string[]; selectedTemplate: string }) {
    try {
      if (!values.fileName) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Please enter a file name",
        });
        return;
      }

      // Get the selected directory path (FilePicker returns an array)
      const selectedPath = values.projectPath[0];
      if (!selectedPath) {
        await showToast({
          style: Toast.Style.Failure,
          title: "No location selected",
          message: "Please select a location to save the do file",
        });
        return;
      }

      const template = templates.find((t) => t.name === values.selectedTemplate);
      const content = template ? template.content : customContent;

      // Ensure file has .do extension
      const fileNameWithExt = values.fileName.endsWith(".do") ? values.fileName : `${values.fileName}.do`;
      const fullPath = join(selectedPath, fileNameWithExt);

      // Check if file already exists
      if (existsSync(fullPath)) {
        await showToast({
          style: Toast.Style.Failure,
          title: "File already exists",
          message: `A file named "${fileNameWithExt}" already exists at the specified location`,
        });
        return;
      }

      // Write the file
      writeFileSync(fullPath, content);

      await showToast({
        style: Toast.Style.Success,
        title: "Do file created successfully",
        message: fullPath,
      });

      // Open the file in Stata
      try {
        await open(fullPath, "StataMP");
      } catch {
        // If opening in Stata fails, show in Finder
        showInFinder(fullPath);
      }
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to create do file",
        message: String(error),
      });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Do File" icon={Icon.NewDocument} onSubmit={createDoFile} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="fileName"
        title="File Name"
        placeholder="my_analysis"
        value={fileName}
        onChange={setFileName}
        info="File name without extension (.do will be added automatically)"
      />

      <Form.FilePicker
        id="projectPath"
        title="Save Location"
        allowMultipleSelection={false}
        canChooseDirectories={true}
        canChooseFiles={false}
        value={projectPath}
        onChange={setProjectPath}
        info="Select the folder where you want to save the do file"
      />

      <Form.Dropdown
        id="selectedTemplate"
        title="Template"
        placeholder="Choose a template"
        value={selectedTemplate}
        onChange={handleTemplateChange}
      >
        {templates.map((template) => (
          <Form.Dropdown.Item key={template.name} value={template.name} title={template.name} icon={Icon.Document} />
        ))}
      </Form.Dropdown>

      {selectedTemplate && (
        <Form.Description text={templates.find((t) => t.name === selectedTemplate)?.description || ""} />
      )}

      <Form.TextArea
        id="customContent"
        title="Preview/Edit Content"
        placeholder="Template content will appear here..."
        value={customContent}
        onChange={setCustomContent}
      />
    </Form>
  );
}

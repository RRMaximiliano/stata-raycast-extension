import { Action, ActionPanel, Detail, Icon, List, useNavigation } from "@raycast/api";
import { useState } from "react";

interface StataReference {
  name: string;
  syntax: string;
  description: string;
  category: string;
  examples?: string[];
  tips?: string[];
  onlineHelp?: string;
}

const stataReferences: StataReference[] = [
  // Advanced Data Management
  {
    name: "reshape",
    syntax: "reshape wide|long stub, i(varlist) j(varname)",
    description: "Reshape data from wide to long format or vice versa",
    category: "Advanced Data Management",
    examples: [
      'reshape long income, i(id) j(year)',
      'reshape wide score, i(student) j(subject) string',
      'reshape long x, i(id) j(time)'
    ],
    tips: [
      "Use 'describe' first to understand your data structure",
      "Variables must have consistent stub names for reshaping",
      "Use 'string' option when j() variable contains strings"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?reshape"
  },
  {
    name: "merge",
    syntax: "merge 1:1|1:m|m:1|m:m varlist using filename",
    description: "Merge datasets using specified variables as keys",
    category: "Advanced Data Management", 
    examples: [
      'merge 1:1 id using "other_data.dta"',
      'merge m:1 state year using "state_data.dta"',
      'merge 1:m company using "company_info.dta", keep(3)'
    ],
    tips: [
      "_merge variable shows merge results: 1=master only, 2=using only, 3=matched",
      "Use keep() option to specify which observations to keep",
      "Sort data on merge variables before merging for best performance"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?merge"
  },
  {
    name: "egen",
    syntax: "egen newvar = function(arguments) [if] [in] [, by(varlist)]",
    description: "Generate variables using built-in or user-written functions",
    category: "Advanced Data Management",
    examples: [
      'egen mean_score = mean(score), by(class)',
      'egen row_total = rowtotal(var1-var10)',
      'egen group_id = group(state year)',
      'egen pct_rank = rank(income), by(year)'
    ],
    tips: [
      "Much more powerful than generate for complex calculations",
      "Use by() option for group-wise operations",
      "Common functions: mean, median, min, max, count, total"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?egen"
  },

  // Panel Data
  {
    name: "xtset",
    syntax: "xtset panelvar [timevar] [, options]",
    description: "Declare data to be panel/time-series data",
    category: "Panel Data",
    examples: [
      'xtset company year',
      'xtset id',
      'xtset country year, yearly'
    ],
    tips: [
      "Must be set before using any xt commands",
      "Use xtdescribe to check panel structure after setting",
      "Timevar should be numeric for time-series operations"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?xtset"
  },
  {
    name: "xtreg",
    syntax: "xtreg depvar indepvars [if] [in], fe|re|be [options]",
    description: "Panel data regression with fixed or random effects",
    category: "Panel Data",
    examples: [
      'xtreg wage educ exper, fe',
      'xtreg gdp investment population, re',
      'xtreg outcome treatment controls, fe cluster(id)'
    ],
    tips: [
      "Use hausman test to choose between FE and RE",
      "FE removes time-invariant unobserved heterogeneity",
      "Add cluster() for robust standard errors"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?xtreg"
  },

  // Advanced Statistics
  {
    name: "ivregress",
    syntax: "ivregress method depvar [varlist1] (varlist_iv = varlist_instruments)",
    description: "Instrumental variables regression",
    category: "Advanced Statistics",
    examples: [
      'ivregress 2sls wage exper (educ = father_educ mother_educ)',
      'ivregress gmm income age (schooling = distance_college)',
      'ivregress liml y x1 x2 (x3 = z1 z2 z3)'
    ],
    tips: [
      "Test instrument strength with first-stage F-statistic",
      "Use estat overid to test overidentifying restrictions",
      "GMM is more efficient with heteroskedasticity"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?ivregress"
  },
  {
    name: "margins",
    syntax: "margins [marginlist] [if] [in] [, options]",
    description: "Calculate marginal effects and predictions",
    category: "Advanced Statistics",
    examples: [
      'margins, dydx(*)',
      'margins race, at(age=(20(10)60))',
      'margins, at(educ=12 experience=(0(5)20))',
      'margins i.treatment##c.age'
    ],
    tips: [
      "Use dydx() for marginal effects (derivatives)",
      "at() specifies values for predictions",
      "Use marginsplot for visualization",
      "Works after most estimation commands"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?margins"
  },

  // Programming & Macros
  {
    name: "foreach",
    syntax: "foreach local_macro in|of varlist|numlist|newlist { commands }",
    description: "Loop over lists of variables, numbers, or values",
    category: "Programming",
    examples: [
      'foreach var in age income education { summarize `var\' }',
      'foreach x of varlist price-weight { generate ln_`x\' = ln(`x\') }',
      'foreach num of numlist 1/10 { display `num\' }'
    ],
    tips: [
      "Use `var' (with backticks) to reference the macro",
      "'of varlist' is safer than 'in' for variable lists",
      "Combine with 'if' conditions for selective operations"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?foreach"
  },
  {
    name: "local & global",
    syntax: "local|global macroname = expression or \"string\"",
    description: "Create local or global macros for storing values",
    category: "Programming",
    examples: [
      'local controls "age income education"',
      'global datapath "/Users/name/Documents/data"',
      'local n = _N',
      'regress y x `controls\''
    ],
    tips: [
      "Local macros disappear after program/do-file ends",
      "Global macros persist across sessions",
      "Use local for temporary values, global for paths/settings"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?macro"
  },

  // Data Validation & Cleaning
  {
    name: "duplicates",
    syntax: "duplicates report|list|tag|drop [varlist]",
    description: "Identify and handle duplicate observations",
    category: "Data Cleaning",
    examples: [
      'duplicates report',
      'duplicates list id year',
      'duplicates tag id, generate(dup_flag)',
      'duplicates drop id year, force'
    ],
    tips: [
      "Always use 'report' first to understand duplicates",
      "Use 'tag' to flag duplicates without dropping",
      "'force' required if duplicates differ on other variables"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?duplicates"
  },
  {
    name: "misstable",
    syntax: "misstable summarize|patterns|tree [varlist]",
    description: "Analyze missing data patterns",
    category: "Data Cleaning",
    examples: [
      'misstable summarize',
      'misstable patterns age income education',
      'misstable tree'
    ],
    tips: [
      "Use patterns to see combinations of missing values",
      "Tree view shows hierarchical missing patterns",
      "Consider multiple imputation for systematic missingness"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?misstable"
  },

  // Time Series
  {
    name: "tsset",
    syntax: "tsset timevar [, options]",
    description: "Declare data to be time series",
    category: "Time Series",
    examples: [
      'tsset date',
      'tsset year, yearly',
      'tsset company_id date'
    ],
    tips: [
      "Required before using time series operators (L., D., F.)",
      "Date variable should be in Stata date format",
      "Use format %td, %tm, etc. for proper date display"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?tsset"
  },
  {
    name: "time series operators",
    syntax: "L. D. F. S. varname",
    description: "Time series operators for lags, differences, leads, and seasonal differences",
    category: "Time Series",
    examples: [
      'generate lag_gdp = L.gdp',
      'generate diff_gdp = D.gdp',
      'regress gdp L.gdp L2.gdp D.inflation',
      'generate seasonal_diff = S12.monthly_sales'
    ],
    tips: [
      "L. = lag, D. = difference, F. = lead (forward)",
      "Use L2., L3. for multiple periods",
      "S. for seasonal differences (S12. for monthly data)",
      "Must tsset data first"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?tsvarlist"
  },

  // Graphics
  {
    name: "graph twoway",
    syntax: "graph twoway plottype varlist [, options]",
    description: "Create customizable two-way graphs",
    category: "Graphics", 
    examples: [
      'twoway (scatter y x) (lfit y x)',
      'twoway line gdp year, by(country)',
      'twoway (bar count category) (line average category, yaxis(2))'
    ],
    tips: [
      "Combine multiple plot types in parentheses",
      "Use by() for panels, yaxis(2) for dual y-axes",
      "Add scheme() for different color schemes"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?twoway"
  },
  {
    name: "marginsplot",
    syntax: "marginsplot [, options]",
    description: "Graph results from margins command",
    category: "Graphics",
    examples: [
      'margins, at(age=(20(5)65)) dydx(education)',
      'marginsplot',
      'marginsplot, recast(line) recastci(rarea)'
    ],
    tips: [
      "Must run margins command first",
      "Use recast() to change plot type",
      "Great for visualizing interaction effects"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?marginsplot"
  },

  // Advanced Techniques
  {
    name: "bootstrap",
    syntax: "bootstrap [exp_list], reps(#): command",
    description: "Bootstrap estimation of standard errors and confidence intervals",
    category: "Advanced Statistics",
    examples: [
      'bootstrap: regress y x1 x2',
      'bootstrap r(r2), reps(1000): regress y x1 x2',
      'bootstrap, cluster(id): xtreg y x, fe'
    ],
    tips: [
      "Useful when analytical standard errors are unavailable",
      "Use cluster() for panel data",
      "reps() specifies number of bootstrap replications"
    ],
    onlineHelp: "https://www.stata.com/help.cgi?bootstrap"
  },
  {
    name: "reghdfe",
    syntax: "reghdfe depvar indepvars, absorb(varlist) [options]",
    description: "High-dimensional fixed effects regression (user-written)",
    category: "Advanced Statistics",
    examples: [
      'reghdfe wage education experience, absorb(company year)',
      'reghdfe y x1 x2, absorb(id time) cluster(id)',
      'ssc install reghdfe'
    ],
    tips: [
      "Much faster than xtreg for multiple fixed effects",
      "Install with: ssc install reghdfe",
      "Can absorb multiple categorical variables simultaneously"
    ],
    onlineHelp: "https://github.com/sergiocorreia/reghdfe"
  }
];

const categories = ["All", ...Array.from(new Set(stataReferences.map(cmd => cmd.category)))];

export default function Command() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { push } = useNavigation();

  const filteredCommands = selectedCategory === "All" 
    ? stataReferences 
    : stataReferences.filter(cmd => cmd.category === selectedCategory);

  function showCommandDetail(command: StataReference) {
    push(<CommandDetail command={command} />);
  }

  return (
    <List
      searchBarPlaceholder="Search Stata commands..."
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by Category"
          value={selectedCategory}
          onChange={setSelectedCategory}
        >
          {categories.map((category) => (
            <List.Dropdown.Item key={category} title={category} value={category} />
          ))}
        </List.Dropdown>
      }
    >
      {categories.slice(1).map((category) => {
        const categoryCommands = stataReferences.filter(cmd => cmd.category === category);
        if (selectedCategory !== "All" && selectedCategory !== category) return null;
        
        return (
          <List.Section key={category} title={category}>
            {categoryCommands.map((command, index) => (
              <List.Item
                key={`${category}-${index}`}
                title={command.name}
                subtitle={command.description}
                accessories={[{ text: command.syntax }]}
                icon={Icon.Code}
                actions={
                  <ActionPanel>
                    <Action
                      title="View Details & Examples"
                      icon={Icon.Document}
                      onAction={() => showCommandDetail(command)}
                    />
                    <Action.CopyToClipboard
                      title="Copy Syntax"
                      content={command.syntax}
                      icon={Icon.Clipboard}
                    />
                    {command.onlineHelp && (
                      <Action.OpenInBrowser
                        title="Open Stata Documentation"
                        url={command.onlineHelp}
                        icon={Icon.Globe}
                      />
                    )}
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
        );
      })}
    </List>
  );
}

function CommandDetail({ command }: { command: StataReference }) {
  const markdown = `
# ${command.name}

**Syntax:** \`${command.syntax}\`

**Description:** ${command.description}

## Examples

${command.examples?.map(example => `\`\`\`stata\n${example}\n\`\`\``).join('\n\n') || 'No examples available.'}

${command.tips ? `## Tips & Notes\n\n${command.tips.map(tip => `• ${tip}`).join('\n')}` : ''}

${command.onlineHelp ? `## Official Documentation\n\n[View complete Stata documentation](${command.onlineHelp})` : ''}
  `.trim();

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="Copy Syntax"
            content={command.syntax}
            icon={Icon.Clipboard}
          />
          {command.examples && (
            <Action.CopyToClipboard
              title="Copy First Example"
              content={command.examples[0]}
              icon={Icon.Code}
            />
          )}
          {command.onlineHelp && (
            <Action.OpenInBrowser
              title="Open Official Documentation"
              url={command.onlineHelp}
              icon={Icon.Globe}
            />
          )}
        </ActionPanel>
      }
    />
  );
}

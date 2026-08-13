# Standards

This document defines the baseline for quality, consistency, and precision across all projects in this account.

## 1. Coding Standards
- **Consistency Over Preference**: Adhere to the project's established pattern. If no pattern exists, follow the language's official style guide (e.g., PEP 8 for Python).
- **Precision**: Variable and function names must be descriptive and unambiguous. Avoid abbreviations unless they are industry standard.
- **Complexity**: Favor clarity over cleverness. Complex logic must be decomposed into smaller, testable units.
- **Type Safety**: Use strong typing where available to reduce runtime errors and improve DX.

## 2. Documentation Standards
- **Minimalism**: Write the least amount of text required to convey the maximum amount of information.
- **Precision**: Avoid qualifiers like "simply," "just," "easy," or "quickly." State exactly what the code does.
- **Structure**: Use hierarchical headings and bullet points. Avoid long paragraphs.
- **Up-to-date**: Documentation is code. Outdated documentation is a bug.

## 3. Git & Workflow
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/).
  - `feat:` New feature.
  - `fix:` Bug fix.
  - `docs:` Documentation change.
  - `style:` Formatting, missing semi colons, etc.
  - `refactor:` Code change that neither fixes a bug nor adds a feature.
  - `perf:` Code change that improves performance.
  - `test:` Adding missing tests or correcting existing tests.
  - `chore:` Updating build tasks, package manager configs, etc.
- **Pull Requests**: 
  - Small, atomic changes.
  - Descriptive titles.
  - Linked issues.
  - Verified by CI.

## 4. Quality Assurance
- **Testing**: Every new feature requires a corresponding test.
- **Linting**: All code must pass project-specific linting rules before submission.
- **Review**: No code enters the main branch without at least one peer review or a self-audit against these standards.

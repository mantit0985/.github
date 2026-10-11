# .github - Account Configuration Hub

This repository serves as the central configuration and governance hub for the `mantit0985` GitHub organization. It provides account-wide defaults, profile configuration, and repository hygiene standards.

## Getting Started

### Purpose

This repository is not a software project. It manages:

- **Public Profile**: Source for the account profile README.
- **Global Defaults**: Community health files (`CONTRIBUTING.md`, `SECURITY.md`, etc.) inherited by other repositories.
- **Workflow Templates**: Standardized GitHub Actions for reuse across the organization.

### Key Components

- `profile/README.md`: The source for the public profile rendered at `github.com/mantit0985`.
- `.github/workflow-templates/`: Reusable CI/CD templates for member repositories.
- `standards.md`: The account-wide documentation and hygiene contract.

## Governance

### Account-Level Inheritance

Files stored in the root or `.github/` of this repository act as defaults for all other `mantit0985` repositories that do not define their own. This ensures consistency in security policies, contribution guidelines, and issue templates across the entire account.

### Contributing

Contributions to this hub must follow the guidelines outlined in [CONTRIBUTING.md](CONTRIBUTING.md), including the use of Conventional Commits and strict branch naming conventions.


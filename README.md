# 🛠️ .github Hub

This repository serves as the central configuration, governance, and automation hub for the `mantit0985` GitHub account. It provides a single source of truth for workflows, templates, and account-wide standards.

## 🎯 Goals

- **Minimalist Profile**: Maintain a high-signal public presence.
- **Reusable Infrastructure**: Provide shared workflows (CI/CD, Linting) for all satellite repositories.
- **Automated Governance**: Use the RQE (Reasoning-Query-Execution) loop to audit account health and update the profile.

## 📂 Architecture

- `.github/`: Centralized GitHub Actions workflows, issue/PR templates, and internal scripts.
- `profile/`: Source data for the GitHub profile README.
- `docs/`: High-level standards and guidelines for the entire account.

## 🚀 Key Automations

- **Account Health Auditor**: Scans all public repositories to ensure they meet quality standards.
- **Profile Activity Tracker**: Syncs recent activity to the profile README.
- **Markdown Linter**: Enforces consistent documentation standards across the account.

## 🛠️ Maintenance

For detailed instructions on how to manage this hub or add new satellite repositories, please refer to [MAINTENANCE.md](MAINTENANCE.md).

---
*Part of the mantit0985 RQE Ecosystem*

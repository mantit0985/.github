# Agent Instructions: Control Plane

This document provides the operational constraints and logic for AI agents maintaining the `mantit0985/.github` hub.

## Core Philosophy

The hub is the **Single Source of Truth** for the hub's CI/CD logic. The goal is absolute consistency. Do not introduce "special cases" into the reusable workflows unless they can be generalized into inputs.

## Maintenance Guidelines

### Updating Reusable Workflows

When modifying `ci.yml` or `cd.yml`:

1. **Zero Regression**: Ensure that existing templates (`rust`, `python`, `go`, etc.) continue to function without modification to their wrapper files.
2. **Input-Driven Flexibility**: If a new requirement arises for one template, implement it as an optional input (e.g., `build-verify-cmd`) rather than hardcoding logic for a specific repository.
3. **Dependency Order**: Maintain the strict job sequence: `quality` → `build-verify` → `security` → `smoke`.

### Adding Language Support

To support a new language:

1. Update the `quality` job in `ci.yml` with the required toolchain setup and quality check commands.
2. Map the new language to a corresponding `semgrep_config` in the `security` job.
3. Verify the new profile against a pilot template before marking it as supported.

## The Symmetry Contract

Always enforce the Symmetry Contract in any workflow you author or review:

- **One CI run per trigger.**
- **One CD run per trigger.**
- **CD is strictly gated by CI success.**

## Critical Constraints

- **Self-Hosted Only**: All jobs must use `runs-on: self-hosted`. Never introduce `ubuntu-latest` or other GitHub-hosted runners to avoid credit consumption.
- **Thin Wrappers**: When updating template repositories, always prefer moving logic into the Hub workflows over adding logic to the template's `.yml` file.

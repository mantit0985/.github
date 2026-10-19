# Contributing Guidelines

## Commit Messages

We follow **Conventional Commits**. Every commit must start with one of the following types:

- `feat:` A new feature or configuration addition
- `fix:` A bug fix or correction
- `chore:` Maintenance, tooling, or dependency updates
- `docs:` Documentation changes
- `refactor:` Code or configuration changes that neither fix a bug nor add a feature
- `test:` Adding missing tests or correcting existing tests

Example: `docs(profile): update bio in profile README`

## Pull Request Process

1. **Branching**: Create a feature branch from `main`. Branch names must use the prefixes defined in the commit types (e.g., `feat/`, `fix/`).
2. **Focus**: Keep PRs focused on a single change to facilitate review.
3. **Referencing**: The PR body must reference a related issue using `Closes #`, `Fixes #`, or `Resolves #`.
4. **Validation**: Ensure all status checks pass before requesting a merge.
5. **Target**: Target the `main` branch.

## Documentation Standards

- **Conciseness**: Write the least amount of text required to convey the maximum amount of information.
- **Accuracy**: Outdated documentation is treated as a bug. Update documentation in the same PR that changes the feature it describes.
- **Style**: Use a professional, neutral tone. Avoid emojis and colloquialisms.

## Reporting Issues

Search existing issues first. When reporting, use the appropriate issue template and provide concrete reproduction steps, expected behavior, and actual behavior.

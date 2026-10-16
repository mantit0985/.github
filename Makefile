.PHONY: all hooks help
all: hooks
hooks:
	git config core.hooksPath .github/hooks
help:
	@echo " targets: hooks (install fleet commit-msg guard via core.hooksPath)"
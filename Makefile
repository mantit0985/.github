.PHONY: all hooks help
all: hooks
hooks:
	git config core.hooksPath .github/hooks
help:
	@echo " targets: hooks (install the shared commit-msg guard via core.hooksPath)"
# Go Linting

## golangci-lint (Linter) + gofmt (Formatter)

```bash
# Install golangci-lint
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
# Or: brew install golangci-lint
```

`.golangci.yml`:
```yaml
linters:
  enable:
    - errcheck
    - gosimple
    - govet
    - ineffassign
    - staticcheck
    - unused
    - gofmt
    - goimports

linters-settings:
  gofmt:
    simplify: true

run:
  timeout: 5m
```

**Git hook commands:**
```bash
# Pre-commit: format check + lint
gofmt -l . | grep -q . && echo "Files need formatting" && exit 1
golangci-lint run

# Pre-push: vet + tests
go vet ./...
go test ./...
```

# CI/CD Pipeline Documentation

This directory contains GitHub Actions workflows for automated testing and deployment.

## Workflows

### `test.yml` - Test Suite

Runs comprehensive test suite on all pull requests and pushes to main.

**Triggers:**
- Pull requests to any branch
- Pushes to `main` or `master` branch

**Jobs:**

#### 1. Backend Tests
- **Runtime:** ~8-10 seconds
- **Python Version:** 3.11
- **Coverage:** 97% line coverage
- **Tests:** 112 passing tests
- **Artifacts:** HTML coverage report

**Steps:**
1. Checkout code
2. Set up Python with pip cache
3. Install dependencies
4. Run pytest with coverage
5. Upload coverage artifacts
6. Generate coverage summary

#### 2. Frontend Tests
- **Runtime:** ~5-7 seconds
- **Node Version:** 18
- **Tests:** API client + Component tests
- **Artifacts:** Coverage report

**Steps:**
1. Checkout code
2. Set up Node.js with npm cache
3. Install dependencies (npm ci)
4. Run Vitest with coverage
5. Upload coverage artifacts
6. Generate test summary

#### 3. Test Summary
- **Depends on:** Backend + Frontend tests
- **Always runs:** Even if tests fail
- **Purpose:** Aggregate results and fail PR if any test fails

## Status Badges

Add these to your main README.md:

```markdown
![Test Suite](https://github.com/Samuel-Levesque/poul_le_fun_app/actions/workflows/test.yml/badge.svg)
```

## Local Development

Before pushing, run tests locally:

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm test
```

## Caching Strategy

### Backend (pip)
- **Cache Key:** Python version + requirements.txt hash
- **Cache Path:** pip cache directory
- **Invalidation:** requirements.txt changes

### Frontend (npm)
- **Cache Key:** Node version + package-lock.json hash
- **Cache Path:** node_modules
- **Invalidation:** package-lock.json changes

## Performance Optimization

Current timings:
- Backend setup: ~15s (cached: ~5s)
- Backend tests: ~10s
- Frontend setup: ~20s (cached: ~5s)
- Frontend tests: ~5s
- **Total:** ~50s (cached: ~25s)

## Viewing Results

### In Pull Requests
- Status checks appear at the bottom of PR
- Click "Details" to view workflow logs
- Coverage reports available as artifacts

### In Actions Tab
1. Go to repository Actions tab
2. Click on workflow run
3. View job logs and artifacts
4. Download coverage reports

## Coverage Reports

### Backend
- **Format:** HTML + XML + Terminal
- **Location:** `backend/htmlcov/`
- **Minimum:** 97% (current)
- **View:** Download artifact and open `index.html`

### Frontend
- **Format:** HTML + LCOV
- **Location:** `frontend/coverage/`
- **View:** Download artifact and open `index.html`

## Troubleshooting

### Tests pass locally but fail in CI?

1. **Python version mismatch**
   ```bash
   python --version  # Should be 3.11
   ```

2. **Node version mismatch**
   ```bash
   node --version  # Should be 18.x
   ```

3. **Dependency issues**
   - Backend: `pip install -r requirements.txt`
   - Frontend: `rm -rf node_modules && npm install`

### Cache issues?

Clear cache by:
1. Going to Actions tab
2. Click "Caches" in sidebar
3. Delete relevant cache
4. Re-run workflow

### Workflow not triggering?

1. Check workflow file is on default branch
2. Verify YAML syntax: `yamllint .github/workflows/test.yml`
3. Check repository permissions

## Extending the Pipeline

### Adding New Tests

1. Add test files following existing patterns
2. Tests automatically discovered by pytest/vitest
3. No workflow changes needed

### Adding New Jobs

Example: Add linting

```yaml
lint:
  name: Lint Code
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Run linter
      run: |
        flake8 backend/
        npm run lint --prefix frontend
```

### Adding Deployment

Example: Deploy on successful tests

```yaml
deploy:
  name: Deploy
  needs: [backend-tests, frontend-tests]
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to production
      run: |
        # Your deployment script
```

## Security Considerations

- Secrets stored in GitHub Secrets
- No sensitive data in logs
- Artifacts expire after 90 days
- Write access required for status updates

## Cost Optimization

- Caching reduces build time by 50%
- Parallel jobs maximize throughput
- Conditional jobs save minutes
- Public repos: Free unlimited minutes
- Private repos: 2000 free minutes/month

## Best Practices

1. ✅ Keep workflows fast (< 5 minutes)
2. ✅ Use caching aggressively
3. ✅ Run jobs in parallel when possible
4. ✅ Fail fast on critical errors
5. ✅ Generate useful artifacts
6. ✅ Write clear job/step names
7. ✅ Use specific action versions
8. ✅ Monitor workflow execution time

## Related Documentation

- [Branch Protection Setup](../BRANCH_PROTECTION.md)
- [Backend Tests README](../../backend/tests/README.md)
- [Frontend Tests README](../../frontend/src/test/README.md)

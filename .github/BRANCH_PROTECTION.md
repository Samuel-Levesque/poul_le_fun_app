# Branch Protection Setup

This guide explains how to configure branch protection rules to require passing tests before merging PRs.

## Required Status Checks

The CI/CD pipeline includes the following checks that should be required:

1. **Backend Tests** - `backend-tests`
2. **Frontend Tests** - `frontend-tests`
3. **Test Summary** - `test-summary`

## Setting Up Branch Protection

### Via GitHub UI

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Branches**
3. Click **Add branch protection rule**
4. Configure the following:

#### Branch name pattern
```
main
```
(or `master` if that's your default branch)

#### Protection Rules

**✅ Require a pull request before merging**
- Require approvals: 1 (recommended)
- Dismiss stale pull request approvals when new commits are pushed: ✅

**✅ Require status checks to pass before merging**
- Require branches to be up to date before merging: ✅
- Status checks that are required:
  - `Backend Tests`
  - `Frontend Tests`
  - `Test Summary`

**✅ Require conversation resolution before merging** (recommended)

**⚠️ Do not allow bypassing the above settings** (recommended for production)

#### Additional Recommended Settings

- ✅ Require linear history (prevents merge commits)
- ✅ Require deployments to succeed before merging (if you set up deployments)
- ✅ Lock branch (for critical branches in production)

### Via GitHub CLI (Alternative)

```bash
# Enable branch protection with required status checks
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks[strict]=true \
  --field required_status_checks[contexts][]=backend-tests \
  --field required_status_checks[contexts][]=frontend-tests \
  --field required_status_checks[contexts][]=test-summary \
  --field required_pull_request_reviews[required_approving_review_count]=1 \
  --field enforce_admins=true \
  --field restrictions=null
```

## Workflow Triggers

The test suite runs automatically on:

- **Pull Requests**: All branches
- **Push to main/master**: Direct pushes (if allowed)

## Test Requirements

### Backend Tests (97% coverage required)
- All pytest tests must pass
- Coverage report generated
- Minimum 112 tests passing

### Frontend Tests
- All Vitest tests must pass
- Component tests included
- API client tests included

## Bypassing Protection (Emergency Only)

If you need to bypass protection rules temporarily:

1. You must be a repository admin
2. GitHub will log the bypass
3. Protection rules should be re-enabled immediately after

## Monitoring Test Status

- Check the **Actions** tab to see workflow runs
- PR page shows status checks at the bottom
- Green checkmarks indicate passing tests
- Red X indicates failures - click for details

## Troubleshooting

### Tests failing in CI but passing locally?

1. Check Python/Node versions match
2. Verify dependencies are properly cached
3. Check for environment-specific issues

### Status checks not appearing?

1. Ensure workflow file is on the base branch (main/master)
2. Check workflow syntax with `gh workflow view`
3. Verify workflow has run at least once

### Need to update required checks?

1. Go to **Settings** → **Branches**
2. Edit the protection rule
3. Add/remove status checks as needed

## Best Practices

1. **Run tests locally** before pushing: `pytest` and `npm test`
2. **Keep tests fast** - Currently ~15 seconds total
3. **Fix failing tests immediately** - Don't merge with failing tests
4. **Review coverage reports** - Maintain high coverage
5. **Update tests with code changes** - Tests should evolve with the codebase

## Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Required Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)

# Branch Protection Setup Instructions

## GitHub Repository Settings

To enforce the test pipeline for pull requests, configure the following branch protection rules for the `main` branch:

### 1. Navigate to Repository Settings

- Go to your GitHub repository
- Click on "Settings" tab
- Select "Branches" from the left sidebar

### 2. Add Branch Protection Rule

- Click "Add rule"
- Branch name pattern: `main`

### 3. Configure Protection Settings

#### ✅ Required Status Checks

- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging
- Required status checks:
  - `Run Tests`
  - `Security & Quality Checks`
  - `All Tests Passed`

#### ✅ Additional Protection Rules

- [x] Require pull request reviews before merging
  - Required approving reviews: 1
  - [x] Dismiss stale PR reviews when new commits are pushed
- [x] Require conversation resolution before merging
- [x] Restrict pushes that create files larger than 100MB
- [x] Do not allow bypassing the above settings

#### ✅ Optional (Recommended)

- [x] Require linear history
- [x] Include administrators (applies rules to admins too)

## Test Pipeline Features

### 🔄 Automatic Triggers

- **Pull Requests**: Runs on all PRs targeting `main` branch
- **Direct Pushes**: Runs on pushes to `main` branch (if allowed)

### 🧪 Test Jobs

1. **Database Setup**: PostgreSQL 15 service with health checks
2. **Dependency Installation**: Fast npm ci with caching
3. **Database Migration**: Prisma migrate and generate
4. **Test Execution**: Full test suite (106/106 tests)
5. **Build Verification**: Ensures production build succeeds

### 🔒 Security Checks

1. **TypeScript Validation**: Strict type checking
2. **Dependency Audit**: npm audit for vulnerabilities
3. **Security Report**: Detailed vulnerability analysis

### ✅ Status Reporting

- Clear pass/fail indicators
- Detailed logs for debugging
- Prevents merge until all checks pass

## Setup Commands

```bash
# The pipeline will automatically run these commands:
npm ci                    # Install dependencies
npx prisma migrate deploy # Setup database
npx prisma generate      # Generate Prisma client
npm test                 # Run all tests (106/106)
npm run build           # Verify build succeeds
npx tsc --noEmit        # TypeScript validation
npm audit               # Security audit
```

## Pipeline Status

Once configured, you'll see status checks on pull requests:

- ✅ **Run Tests** - All 106 tests passing
- ✅ **Security & Quality Checks** - No vulnerabilities found
- ✅ **All Tests Passed** - Ready for merge

## Benefits

- **Quality Assurance**: Prevents broken code from reaching main
- **Security**: Automatic vulnerability scanning
- **Consistency**: Standardized testing across all contributors
- **Confidence**: Merge with confidence knowing tests pass
- **Documentation**: Clear test results visible to reviewers

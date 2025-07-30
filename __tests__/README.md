# Test Documentation

This document describes the comprehensive test suite for the lead submission form and API.

## Test Structure

```
__tests__/
├── api/
│   └── leads.test.ts                 # API endpoint tests
├── components/
│   └── Home.test.tsx                 # Frontend component tests
├── integration/
│   └── form-submission.test.ts       # End-to-end integration tests
└── utils/
    └── test-helpers.ts               # Test utilities and helpers
```

## Test Categories

### 1. API Endpoint Tests (`__tests__/api/leads.test.ts`)

Tests the `/api/leads` POST endpoint with focus on:

#### Successful Submissions

- ✅ Complete form with all fields
- ✅ Minimal required fields only
- ✅ Form with PDF file upload
- ✅ All valid file types (PDF, DOC, DOCX, TXT)

#### Validation Edge Cases

- ❌ Missing required fields
- ❌ Invalid email format
- ❌ Invalid categories
- ❌ Names with invalid characters
- ❌ Reason too short/long
- ❌ Fields exceeding maximum length
- ❌ Invalid website URLs

#### File Upload Edge Cases

- ❌ Files too large (>5MB)
- ❌ Invalid file types
- ✅ Files at maximum size limit
- ✅ Valid file types validation

#### Rate Limiting

- ✅ 5 requests per IP within 15 minutes
- ❌ 6th request gets rate limited
- ✅ Different IPs get separate limits

#### Error Handling

- ❌ Database connection errors
- ❌ Unique constraint violations
- ❌ Malformed request data

#### Security Testing

- ✅ Input sanitization (whitespace, case)
- ❌ Malicious input patterns (XSS, SQL injection)

### 2. Frontend Component Tests (`__tests__/components/Home.test.tsx`)

Tests the main form component with focus on:

#### Successful Submissions

- ✅ Valid form data submission
- ✅ Loading state during submission
- ✅ File upload handling
- ✅ Redirect to thank-you page

#### Client-side Validation

- ❌ Empty form validation
- ❌ Email format validation
- ❌ Minimum reason length
- ❌ Name format validation
- ❌ Website URL validation

#### Error Handling

- ❌ Server validation errors
- ❌ Rate limiting responses
- ❌ Server errors (500)
- ❌ Network errors
- ❌ Malformed JSON responses

#### Form State Management

- ✅ Error clearing on retry
- ✅ Form data persistence during errors
- ✅ Prevent rapid successive submissions

### 3. Integration Tests (`__tests__/integration/form-submission.test.ts`)

End-to-end tests covering the complete flow:

#### Boundary Testing

- ✅ Maximum length fields
- ✅ Minimum length fields
- ❌ Fields exceeding limits
- ❌ Fields below minimums

#### Input Sanitization

- ✅ Whitespace trimming
- ✅ Email case normalization
- ✅ Special characters in names
- ❌ Malicious input patterns

#### File Upload Boundaries

- ✅ File at exact size limit (5MB)
- ❌ File just over limit
- ✅ All valid file types

#### Rate Limiting Integration

- ✅ Cross-request rate limiting
- ✅ Per-IP rate limiting

#### Error Recovery

- ❌ Database error handling
- ✅ Concurrent submission handling

#### Security Edge Cases

- ❌ XSS attempts
- ❌ SQL injection attempts
- ❌ LDAP injection attempts
- ✅ Unicode/international characters

## Test Data

### Valid Test Data

```typescript
const validFormData = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  country: "United States",
  website: "https://johndoe.com",
  reason: "I am seeking immigration assistance for my O-1 visa application.",
  categories: ["O-1"],
};
```

### Edge Case Data

- **Minimal valid**: Shortest acceptable values
- **Maximum valid**: Longest acceptable values
- **Invalid characters**: Names with numbers/symbols
- **Malicious inputs**: XSS, SQL injection patterns
- **Boundary values**: Exactly at limits

### File Test Cases

- **Valid types**: PDF, DOC, DOCX, TXT
- **Invalid types**: JPG, PNG, ZIP, EXE
- **Size limits**: 5MB max, test at boundary
- **Content validation**: MIME type checking

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

## Test Coverage Goals

- **API Routes**: 100% line coverage
- **Form Validation**: 100% branch coverage
- **Error Handling**: All error paths tested
- **Security**: All attack vectors covered
- **File Upload**: All file scenarios tested

## Security Test Matrix

| Attack Vector         | Test Coverage                   | Status     |
| --------------------- | ------------------------------- | ---------- |
| XSS                   | Script injection in form fields | ❌ Blocked |
| SQL Injection         | SQL commands in form fields     | ❌ Blocked |
| LDAP Injection        | LDAP commands in form fields    | ❌ Blocked |
| Path Traversal        | Directory traversal attempts    | ❌ Blocked |
| File Upload Abuse     | Malicious file types/sizes      | ❌ Blocked |
| Rate Limiting Bypass  | Rapid requests from same IP     | ❌ Blocked |
| Input Length Overflow | Extremely long inputs           | ❌ Blocked |
| Unicode Exploitation  | Invalid unicode sequences       | ❌ Blocked |
| MIME Type Spoofing    | Fake file type headers          | ❌ Blocked |
| Null Byte Injection   | Null bytes in filenames         | ❌ Blocked |

## Validation Test Matrix

| Field      | Valid                                 | Invalid          | Edge Cases                    |
| ---------- | ------------------------------------- | ---------------- | ----------------------------- |
| firstName  | Letters, spaces, hyphens, apostrophes | Numbers, symbols | 2-50 chars, Unicode           |
| lastName   | Letters, spaces, hyphens, apostrophes | Numbers, symbols | 2-50 chars, Unicode           |
| email      | Valid email format                    | Invalid format   | 5-100 chars, case insensitive |
| country    | Any string                            | Empty            | 2-100 chars                   |
| website    | Valid URL format                      | Invalid format   | Optional, 200 chars max       |
| reason     | Any text                              | Too short/long   | 10-1000 chars                 |
| categories | O-1, EB-1A, EB-2 NIW, I don't know    | Invalid options  | At least one required         |
| resume     | PDF, DOC, DOCX, TXT                   | Other types      | 5MB max, optional             |

## Performance Test Scenarios

1. **Load Testing**: Multiple concurrent submissions
2. **Stress Testing**: Rate limit boundary testing
3. **File Upload**: Large file processing
4. **Database**: Connection pool exhaustion
5. **Memory**: Large form data handling

## Mocking Strategy

- **Database**: Mock Prisma client for predictable responses
- **File System**: Mock file operations
- **Network**: Mock fetch for frontend tests
- **External Services**: Mock any external API calls
- **Time**: Mock date/time for rate limiting tests

## Continuous Integration

Tests are designed to run in CI environments with:

- Deterministic behavior (no random data)
- Fast execution (under 30 seconds total)
- Isolated test cases (no shared state)
- Clear failure messages
- Coverage reporting
- Security vulnerability scanning

## Test Maintenance

- Update tests when adding new validation rules
- Add tests for new error scenarios
- Verify test coverage stays above 90%
- Review security tests quarterly
- Update test data for new form fields
- Monitor test execution time

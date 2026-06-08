{
    "test_run": {
    "endpoint": "GET https://reqres.in/api/users/2",
        "executed_at": "2026-06-07T18:00:00Z",
        "total": 10,
        "passed": 7,
        "failed": 1,
        "escalated": 2,
        "skipped": 0
},
    "results": [
    {
        "test_case": "TC-001",
        "description": "Happy Path — Valid GET request returns user data with status 200",
        "severity": "Blocker",
        "expected_result": "Status 200, body contains user object with id, email, first_name, last_name, avatar",
        "actual_result": "Status 200, body: { data: { id: 2, email: 'janet.weaver@reqres.in', first_name: 'Janet', last_name: 'Weaver', avatar: 'https://reqres.in/img/faces/2-image.jpg' } }",
        "status": "Passed",
        "steps_to_reproduce": {
            "method": "GET",
            "url": "https://reqres.in/api/users/2",
            "headers": { "Accept": "application/json" },
            "body": {}
        }
    },
    {
        "test_case": "TC-002",
        "description": "Not Found — GET request with non-existent user ID returns 404",
        "severity": "Critical",
        "expected_result": "Status 404, empty body or error message",
        "actual_result": "Status 404, body: {}",
        "status": "Passed",
        "steps_to_reproduce": {
            "method": "GET",
            "url": "https://reqres.in/api/users/9999",
            "headers": { "Accept": "application/json" },
            "body": {}
        }
    },
    {
        "test_case": "TC-003",
        "description": "Unauthorized — Request with invalid Bearer token returns 401",
        "severity": "Critical",
        "expected_result": "Status 401, body contains error field",
        "actual_result": "Status 200 — API does not enforce token validation on GET /users. Endpoint is publicly accessible regardless of auth header.",
        "status": "Escalate",
        "steps_to_reproduce": {
            "method": "GET",
            "url": "https://reqres.in/api/users/2",
            "headers": {
                "Authorization": "Bearer ***REDACTED***",
                "Accept": "application/json"
            },
            "body": {}
        }
    },
    {
        "test_case": "TC-004",
        "description": "Unauthorized — Request with no auth token returns 401",
        "severity": "Critical",
        "expected_result": "Status 401",
        "actual_result": "Status 200 — No authentication enforced. Endpoint returns user data without any token.",
        "status": "Escalate",
        "steps_to_reproduce": {
            "method": "GET",
            "url": "https://reqres.in/api/users/2",
            "headers": { "Accept": "application/json" },
            "body": {}
        }
    },
    {
        "test_case": "TC-005",
        "description": "Edge Case — User ID as string instead of integer",
        "severity": "Major",
        "expected_result": "Status 400 or 422 — invalid type for path parameter",
        "actual_result": "Status 404 — API treats non-numeric ID as not found instead of rejecting it as invalid input. No type validation on path params.",
        "status": "Failed",
        "steps_to_reproduce": {
            "method": "GET",
            "url": "https://reqres.in/api/users/abc",
            "headers": { "Accept": "application/json" },
            "body": {}
        }
    },
    {
        "test_case": "TC-006",
        "description": "Edge Case — User ID as negative integer",
        "severity": "Minor",
        "expected_result": "Status 400 or 404",
        "actual_result": "Status 404 — Negative ID treated as not found. Acceptable behavior.",
        "status": "Passed",
        "steps_to_reproduce": {
            "method": "GET",
            "url": "https://reqres.in/api/users/-1",
            "headers": { "Accept": "application/json" },
            "body": {}
        }
    },
    {
        "test_case": "TC-007",
        "description": "Security — SQL Injection in path parameter",
        "severity": "Critical",
        "expected_result": "Status 400 or 404, no database error exposed, no data leak",
        "actual_result": "Status 404, body: {} — Input not reflected, no stack trace or DB error exposed. Properly handled.",
        "status": "Passed",
        "steps_to_reproduce": {
            "method": "GET",
            "url": "https://reqres.in/api/users/1' OR '1'='1",
            "headers": { "Accept": "application/json" },
            "body": {}
        }
    },
    {
        "test_case": "TC-008",
        "description": "Security — XSS in path parameter",
        "severity": "Critical",
        "expected_result": "Status 400 or 404, script tag not reflected unescaped in response",
        "actual_result": "Status 404, body: {} — Script tag not reflected. Content-Type is application/json. Safe.",
        "status": "Passed",
        "steps_to_reproduce": {
            "method": "GET",
            "url": "https://reqres.in/api/users/<script>alert('xss')</script>",
            "headers": { "Accept": "application/json" },
            "body": {}
        }
    },
    {
        "test_case": "TC-009",
        "description": "Performance — Response time under 800ms",
        "severity": "Major",
        "expected_result": "Response time < 800ms",
        "actual_result": "Response time ~265ms — Well within threshold.",
        "status": "Passed",
        "steps_to_reproduce": {
            "method": "GET",
            "url": "https://reqres.in/api/users/2",
            "headers": { "Accept": "application/json" },
            "body": {}
        }
    },
    {
        "test_case": "TC-010",
        "description": "Error Leakage — Verify server errors do not expose internals",
        "severity": "Major",
        "expected_result": "No stack traces, no framework details, no DB schema in any error response",
        "actual_result": "All error responses return minimal JSON. No internal info exposed.",
        "status": "Passed",
        "steps_to_reproduce": {
            "method": "GET",
            "url": "https://reqres.in/api/users/9999",
            "headers": { "Accept": "application/json" },
            "body": {}
        }
    }
],
    "summary": {
    "invalid_or_missing_fields": [
        "Path parameter 'id' accepts non-integer values without returning 400/422 (TC-005)",
        "No authentication enforced on GET /users/:id — token validation absent (TC-003, TC-004)"
    ],
        "bug_reports": [
        {
            "test_case": "TC-003 / TC-004",
            "title": "[Security] GET /api/users/:id publicly accessible — no authentication enforced",
            "severity": "Critical",
            "expected": "Requests without a valid Bearer token should return 401",
            "actual": "Endpoint returns 200 with user data regardless of auth header presence or validity"
        },
        {
            "test_case": "TC-005",
            "title": "[Validation] GET /api/users/:id does not validate path parameter type — string ID returns 404 instead of 400",
            "severity": "Major",
            "expected": "Status 400 or 422 when ID is a non-integer string like 'abc'",
            "actual": "Status 404 returned — input type not validated, treated as not found"
        }
    ],
        "recommendations": [
        "Implement authentication middleware on all /users endpoints — currently any request returns data without a valid token",
        "Add input validation on path parameters to reject non-integer IDs with a 400 response instead of silently returning 404",
        "Consider rate limiting — no throttling detected across repeated requests"
    ]
}
}

# Ramadan Clock API - Usage Guide

## Overview

The Ramadan Clock API provides endpoints for managing Ramadan prayer schedules, generating PDFs, and fetching hadiths. This guide will help you integrate with our API effectively.

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.example.com/api
```

## Authentication

Some endpoints require authentication. To authenticate:

1. Sign in to the application
2. Your session token will be automatically included in requests made from the browser
3. For programmatic access, include your session cookie in requests

### Example with cURL

```bash
curl -X GET https://api.example.com/api/schedule \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## Rate Limiting

All endpoints are rate-limited to prevent abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/hadith` | 10 requests | 1 minute |
| `/api/pdf` | 5 requests | 1 minute |
| `/api/schedule` (GET) | 30 requests | 1 minute |
| `/api/schedule` (POST/PUT/DELETE) | 10 requests | 1 minute |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 2024-03-12T10:01:00.000Z
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ErrorCode",
    "message": "Human-readable error message",
    "details": {}
  },
  "meta": {
    "requestId": "req_1710240000000_abc123",
    "timestamp": "2024-03-12T10:00:00.000Z"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `BadRequest` | 400 | Invalid request parameters |
| `UnauthorizedError` | 401 | Authentication required |
| `ForbiddenError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Resource already exists |
| `RateLimitExceeded` | 429 | Rate limit exceeded |
| `InternalServerError` | 500 | Internal server error |

## Endpoints

### Health Check

Check the health status of the API.

```http
GET /api/health
```

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-03-12T10:00:00.000Z",
    "version": "1.0.0",
    "checks": {
      "database": {
        "status": "ok",
        "latency": 5
      },
      "memory": {
        "used": 128,
        "total": 512,
        "percentage": 25
      }
    }
  }
}
```

### Get Random Hadith

Retrieve a random hadith from the collection.

```http
GET /api/hadith
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `collection` | string | No | Hadith collection (bukhari, muslim, abudawud, tirmidhi, nasai, ibnmajah) |
| `id` | integer | No | Specific hadith ID (1-10000) |

**Example:**

```bash
curl https://api.example.com/api/hadith?collection=bukhari
```

**Response:**

```json
{
  "success": true,
  "data": {
    "text": "The Prophet (peace be upon him) said...",
    "source": "Sahih Bukhari - Book 1, Hadith 1"
  }
}
```

### Generate PDF Schedule

Generate a PDF file containing the prayer schedule. Requires admin authentication.

```http
GET /api/pdf
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `location` | string | No | - | Location to filter (use 'all' for all locations) |
| `type` | string | No | today | Schedule type (today, full) |

**Example:**

```bash
curl https://api.example.com/api/pdf?location=Dhaka&type=full \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -o schedule.pdf
```

### Get Schedule (Paginated)

Retrieve a paginated list of schedule entries.

```http
GET /api/schedule
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `location` | string | No | - | Location to filter by |
| `startDate` | string | No | - | Start date (YYYY-MM-DD) |
| `endDate` | string | No | - | End date (YYYY-MM-DD) |
| `page` | integer | No | 1 | Page number |
| `limit` | integer | No | 20 | Items per page (1-100) |

**Example:**

```bash
curl "https://api.example.com/api/schedule?location=Dhaka&page=1&limit=20"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "date": "2024-03-12",
      "sehri": "04:30",
      "iftar": "18:15",
      "location": "Dhaka",
      "createdAt": "2024-03-01T10:00:00.000Z",
      "updatedAt": "2024-03-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Create Time Entry (Admin Only)

Create a new time entry. Requires admin authentication.

```http
POST /api/schedule
```

**Request Body:**

```json
{
  "date": "2024-03-12",
  "sehri": "04:30",
  "iftar": "18:15",
  "location": "Dhaka"
}
```

**Example:**

```bash
curl -X POST https://api.example.com/api/schedule \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "date": "2024-03-12",
    "sehri": "04:30",
    "iftar": "18:15",
    "location": "Dhaka"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2024-03-12",
    "sehri": "04:30",
    "iftar": "18:15",
    "location": "Dhaka",
    "createdAt": "2024-03-01T10:00:00.000Z",
    "updatedAt": "2024-03-01T10:00:00.000Z"
  }
}
```

### Get Specific Time Entry

Retrieve a specific time entry by ID.

```http
GET /api/schedule/{id}
```

**Example:**

```bash
curl https://api.example.com/api/schedule/550e8400-e29b-41d4-a716-446655440000
```

### Update Time Entry (Admin Only)

Update a specific time entry. Requires admin authentication.

```http
PUT /api/schedule/{id}
```

**Request Body:**

```json
{
  "sehri": "04:35",
  "iftar": "18:20"
}
```

**Example:**

```bash
curl -X PUT https://api.example.com/api/schedule/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "sehri": "04:35",
    "iftar": "18:20"
  }'
```

### Delete Time Entry (Admin Only)

Delete a specific time entry. Requires admin authentication.

```http
DELETE /api/schedule/{id}
```

**Example:**

```bash
curl -X DELETE https://api.example.com/api/schedule/550e8400-e29b-41d4-a716-446655440000 \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## Code Examples

### JavaScript/TypeScript (Fetch API)

```typescript
// Get schedule
async function getSchedule(location?: string) {
  const params = new URLSearchParams();
  if (location) params.append('location', location);

  const response = await fetch(
    `https://api.example.com/api/schedule?${params.toString()}`
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data;
}

// Create time entry (admin only)
async function createTimeEntry(entry: TimeEntryCreate) {
  const response = await fetch('https://api.example.com/api/schedule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
    body: JSON.stringify(entry),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data;
}
```

### Python (requests)

```python
import requests

# Get schedule
def get_schedule(location=None):
    params = {}
    if location:
        params['location'] = location

    response = requests.get(
        'https://api.example.com/api/schedule',
        params=params
    )

    data = response.json()

    if not data['success']:
        raise Exception(data['error']['message'])

    return data['data']

# Create time entry (admin only)
def create_time_entry(entry):
    response = requests.post(
        'https://api.example.com/api/schedule',
        json=entry,
        cookies={'next-auth.session-token': 'YOUR_SESSION_TOKEN'}
    )

    data = response.json()

    if not data['success']:
        raise Exception(data['error']['message'])

    return data['data']
```

### cURL

```bash
# Get schedule
curl "https://api.example.com/api/schedule?location=Dhaka"

# Create time entry (admin only)
curl -X POST https://api.example.com/api/schedule \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "date": "2024-03-12",
    "sehri": "04:30",
    "iftar": "18:15",
    "location": "Dhaka"
  }'
```

## Best Practices

1. **Handle Errors Gracefully**: Always check the `success` field in responses and handle errors appropriately.

2. **Respect Rate Limits**: Monitor the rate limit headers and implement backoff strategies when limits are approached.

3. **Use Pagination**: For large datasets, use pagination to avoid loading all data at once.

4. **Validate Input**: Validate all input data before sending it to the API to avoid validation errors.

5. **Cache Responses**: Cache responses for endpoints that don't change frequently (e.g., hadith API).

6. **Include Request IDs**: Include the `requestId` from the response meta in your logs for easier debugging.

## Support

For API-related issues or questions, please contact:
- Email: support@example.com
- Documentation: [OpenAPI Specification](./openapi.yaml)

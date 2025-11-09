# Test Words Feature

## Overview
Added a new `test` field to the Word model to mark specific words as test words. Only 20 words should be marked as test words.

## Changes Made

### 1. Model Update
**File**: `src/models/word.js`

Added new field:
```javascript
test: {
    type: Boolean,
    default: false,
}
```

### 2. Controller Update
**File**: `src/controllers/wordController.js`

#### New Function: `getTestWords`
Retrieves only words where `test: true`

**Endpoint**: `GET /api/word/test`

**Query Parameters**:
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page
- `sort` (default: 'rank') - Sort field (rank, word, difficulty_level, or negative for descending)

**Response**:
```json
{
  "success": true,
  "message": "Test words retrieved successfully",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalWords": 20,
    "limit": 20
  }
}
```

#### Updated Functions:
- `createWord` - Now accepts `test` field
- `updateWord` - Now accepts `test` field
- `bulkCreateWords` - Now accepts `test` field

### 3. Routes Update
**File**: `src/routes/words.js`

Added route:
```javascript
router.get("/test", getTestWords);
```

**Important**: Placed before dynamic parameter routes to prevent conflicts.

### 4. Utility Script
**File**: `scripts/markTestWords.js`

Script to randomly mark 20 words as test words.

**Usage**:
```bash
node scripts/markTestWords.js
```

**What it does**:
1. Connects to MongoDB
2. Finds 20 random words that are not already test words
3. Updates them with `test: true`
4. Displays the list of marked words

### 5. Postman Collection Update
**File**: `Test/SignOLingo-Words-API.postman_collection.json`

Added new request:
- **Name**: Get Test Words
- **Method**: GET
- **URL**: `{{baseUrl}}/api/word/test?page=1&limit=20&sort=rank`

## Usage Examples

### Get Test Words
```http
GET http://localhost:3000/api/word/test
```

### Get Test Words with Pagination
```http
GET http://localhost:3000/api/word/test?page=1&limit=10
```

### Get Test Words Sorted by Word Name
```http
GET http://localhost:3000/api/word/test?sort=word
```

### Create Word as Test Word
```http
POST http://localhost:3000/api/word/
Content-Type: application/json

{
  "word": "hello",
  "video": "https://example.com/video.mp4",
  "test": true
}
```

### Update Existing Word to Test Word
```http
PUT http://localhost:3000/api/word/hello
Content-Type: application/json

{
  "test": true
}
```

### Remove Test Status
```http
PUT http://localhost:3000/api/word/hello
Content-Type: application/json

{
  "test": false
}
```

## Marking 20 Test Words

### Option 1: Using the Script (Recommended)
```bash
cd Backend
node scripts/markTestWords.js
```

### Option 2: Manually via MongoDB
```javascript
// Find 20 random words and update
db.words.aggregate([
  { $match: { test: { $ne: true } } },
  { $sample: { size: 20 } }
]).forEach(word => {
  db.words.updateOne(
    { _id: word._id },
    { $set: { test: true } }
  );
});
```

### Option 3: Via API (Bulk Update)
You can manually update specific words by their name using the update endpoint.

## Verification

Check how many test words exist:
```javascript
// In MongoDB
db.words.countDocuments({ test: true })
```

Or via API:
```http
GET http://localhost:3000/api/word/test
```

Check the pagination response for `totalWords` field.

## Notes

- Only 20 words should be marked as `test: true`
- The `test` field defaults to `false` for all existing words
- Test words can be used for quizzes, assessments, or special features
- The script ensures no duplicates by checking `test: { $ne: true }`

## API Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/word/test` | Get all test words |
| GET | `/api/word/test?page=1&limit=10` | Get test words with pagination |
| GET | `/api/word/test?sort=word` | Get test words sorted by name |
| POST | `/api/word/` | Create word (include `"test": true` in body) |
| PUT | `/api/word/:word` | Update word (include `"test": true/false` in body) |

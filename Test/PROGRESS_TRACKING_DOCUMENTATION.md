# SignOLingo Progress Tracking System

## 📋 Overview

The SignOLingo Progress Tracking System is a comprehensive learning management system designed to track user progress through sign language education. It implements a structured learning flow with gamification elements including XP, levels, streaks, and achievements.

## 🏗️ Architecture

### Core Models

1. **UserProgress** - Overall user statistics
2. **AlphabetProgress** - Individual alphabet tracking (26 letters)
3. **WordProgress** - 3-step word learning journey
4. **Achievement** - Unlockable badges and rewards

### Learning Flow

```
Sequential Learning Path:
┌─────────────────┐
│  26 Alphabets   │ → Must complete ALL before words unlock
└────────┬────────┘
         ↓
┌─────────────────┐
│  2000+ Words    │ → 3-step learning process per word
└─────────────────┘
```

---

## 📚 Alphabet Learning

### Process
1. **Start** - Begin learning an alphabet (A-Z)
2. **Practice** - Record practice scores (unlimited attempts)
3. **Complete** - Submit final score and earn 5 XP

### API Endpoints

#### Start Alphabet
```http
POST /api/progress/alphabets/:letter/start
```
- Initializes progress tracking for a specific letter
- Sets status to `in_progress`

#### Practice Alphabet
```http
POST /api/progress/alphabets/:letter/practice
Body: { "score": 85 }
```
- Records practice score (0-100)
- Updates best, last, and average scores
- Tracks attempts and success rate

#### Complete Alphabet
```http
POST /api/progress/alphabets/:letter/complete
Body: { "finalScore": 95 }
```
- Marks alphabet as completed
- Awards 5 XP
- Updates user's total XP and level
- Unlocks words when all 26 alphabets completed
- May trigger achievements

### Achievements
- **First Steps** - Complete your first alphabet (10 XP)
- **Alphabet Master** - Complete all 26 alphabets (50 XP)

---

## 📖 Word Learning (3-Step Flow)

### Prerequisites
- All 26 alphabets must be completed first
- Words remain locked until prerequisite met

### 3-Step Learning Process

```
Step 1: Watch & Learn (2 XP)
    ↓
Step 2: Type Word (3 XP, requires ≥70% score)
    ↓
Step 3: Perform Sign (10 XP, requires ≥70% score)
    ↓
Word Mastered! (15 XP total)
```

### Step Details

#### Step 1: Watch Video and Learn Word
```http
POST /api/progress/words/:wordId/step1
```
- User watches demo video and sees the word
- Awards 2 XP immediately
- Advances to Step 2

#### Step 2: Type the Word
```http
POST /api/progress/words/:wordId/step2
Body: { "typedWord": "hello", "score": 75 }
```
- User watches video and types what they see
- Multiple attempts allowed
- Requires score ≥70% to complete
- Awards 3 XP upon completion
- Tracks all attempts and scores

#### Step 3: Perform Sign Language
```http
POST /api/progress/words/:wordId/step3
Body: { "videoUrl": "cloudinary_url", "score": 90 }
```
- User performs sign language (video recorded)
- Requires score ≥70% to complete
- Awards 10 XP upon completion
- Marks word as `mastered`
- May unlock achievements

### Word Status Progression
- `locked` → Not started (alphabets incomplete)
- `step_1` → Step 1 completed, on Step 2
- `step_2` → Step 2 completed, on Step 3
- `step_3` → All steps completed
- `mastered` → Word fully mastered

### API Endpoints

#### Get All Word Progress
```http
GET /api/progress/words?page=1&limit=20&difficulty=Very easy&status=mastered
```
Query Parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `difficulty` - Filter by difficulty level
- `status` - Filter by progress status

#### Get Word with Progress
```http
GET /api/progress/words/:wordId
```
Returns word details and user's progress for that word

### Achievements
- **Word Explorer** - Complete your first word (10 XP)
- **Easy Learner** - Complete 10 "Very Easy" words (25 XP)
- **Quick Learner** - Complete 5 words in one day (20 XP)
- **Perfectionist** - Score 100% on 10 attempts (30 XP)
- **Sign Master** - Master 50 words (50 XP)
- **Century Club** - Master 100 words (100 XP)

---

## 🎮 XP & Leveling System

### XP Distribution
- **Alphabet Completion**: 5 XP
- **Word Step 1**: 2 XP
- **Word Step 2**: 3 XP
- **Word Step 3**: 10 XP
- **Total per Word**: 15 XP
- **Achievements**: 10-100 XP (varies)

### Level Formula
```javascript
currentLevel = Math.floor(totalXP / 100) + 1
```

Examples:
- 0-99 XP → Level 1
- 100-199 XP → Level 2
- 500-599 XP → Level 6

### Complete One Learning Path
```
26 Alphabets: 26 × 5 = 130 XP
1 Word (all steps): 15 XP
10 Words: 150 XP
50 Words: 750 XP
100 Words: 1,500 XP
```

---

## 🔥 Streak System

### How It Works
- Streak increments when user completes activity on consecutive days
- Resets to 1 if a day is missed (no activity)
- Tracks both current streak and longest streak

### Achievement
- **Dedicated Learner** - Maintain 7-day streak (30 XP)

---

## 🏆 Achievement System

### Available Achievements

| Achievement ID | Name | Description | XP Reward | Trigger |
|---------------|------|-------------|-----------|---------|
| `first_steps` | First Steps | Complete your first alphabet | 10 | Complete 1 alphabet |
| `alphabet_master` | Alphabet Master | Complete all 26 alphabets | 50 | Complete 26 alphabets |
| `word_explorer` | Word Explorer | Complete your first word | 10 | Master 1 word |
| `easy_learner` | Easy Learner | Complete 10 "Very Easy" words | 25 | Master 10 very easy words |
| `dedicated_learner` | Dedicated Learner | Maintain a 7-day streak | 30 | 7 consecutive days |
| `quick_learner` | Quick Learner | Complete 5 words in one day | 20 | 5 words in 24 hours |
| `perfectionist` | Perfectionist | Score 100% on 10 attempts | 30 | 10 perfect scores |
| `sign_master` | Sign Master | Master 50 words | 50 | Master 50 words |
| `century_club` | Century Club | Master 100 words | 100 | Master 100 words |

### API Endpoints

#### Get All Achievements
```http
GET /api/progress/achievements
```
Returns all achievements with unlock status

#### Get Unlocked Achievements
```http
GET /api/progress/achievements/unlocked
```
Returns only achievements user has unlocked

#### Get Achievement Details
```http
GET /api/progress/achievements/:achievementId
```
Returns details of specific achievement

---

## 📊 Dashboard & Statistics

### Dashboard Endpoint
```http
GET /api/progress/dashboard
```

Returns comprehensive overview:
```json
{
  "overview": {
    "totalXP": 245,
    "currentLevel": 3,
    "currentStreak": 5,
    "longestStreak": 7,
    "lastActivityDate": "2024-01-15T10:30:00Z"
  },
  "alphabets": {
    "completed": 26,
    "inProgress": 0,
    "total": 26,
    "unlocked": true
  },
  "words": {
    "mastered": 12,
    "inProgress": 3,
    "byDifficulty": {
      "veryEasy": { "completed": 5, "total": 400 },
      "easy": { "completed": 4, "total": 600 },
      "moderate": { "completed": 2, "total": 500 },
      "hard": { "completed": 1, "total": 300 },
      "veryHard": { "completed": 0, "total": 200 }
    },
    "overallAccuracy": 87.5
  },
  "achievements": {
    "unlocked": 4,
    "recent": [...]
  },
  "badges": [...]
}
```

### Detailed Stats Endpoint
```http
GET /api/progress/stats
```

Returns:
- Full UserProgress document
- All AlphabetProgress with populated alphabet data
- All WordProgress with populated word data
- Additional calculated statistics

---

## 🔐 Authentication

All progress endpoints require authentication via JWT token in HTTP-only cookie. Use `checkLogin` middleware.

```javascript
router.use(checkLogin);
```

---

## 🗄️ Database Schema

### UserProgress
```javascript
{
  userId: ObjectId,
  totalXP: Number,
  currentLevel: Number,
  currentStreak: Number,
  longestStreak: Number,
  lastActivityDate: Date,
  alphabetsCompleted: Number,
  alphabetsMastered: [ObjectId],
  alphabetsUnlocked: Boolean,
  wordsProgress: {
    veryEasy: { completed, total },
    easy: { completed, total },
    moderate: { completed, total },
    hard: { completed, total },
    veryHard: { completed, total }
  },
  overallAccuracy: Number,
  badges: [{ achievementId, name, unlockedAt }]
}
```

### AlphabetProgress
```javascript
{
  userId: ObjectId,
  alphabetId: ObjectId,
  letter: String,
  status: 'locked' | 'in_progress' | 'completed',
  attempts: Number,
  successfulAttempts: Number,
  bestScore: Number,
  lastScore: Number,
  averageScore: Number,
  xpEarned: Number,
  completedAt: Date
}
```

### WordProgress
```javascript
{
  userId: ObjectId,
  wordId: ObjectId,
  word: String,
  difficultyLevel: String,
  currentStep: Number (1-3),
  step1: { completed, completedAt },
  step2: { completed, attempts, score, completedAt },
  step3: { completed, videoUrl, score, completedAt },
  status: 'locked' | 'step_1' | 'step_2' | 'step_3' | 'mastered',
  overallAccuracy: Number,
  xpEarned: Number,
  masteredAt: Date
}
```

### Achievement
```javascript
{
  userId: ObjectId,
  achievementId: String,
  name: String,
  description: String,
  xpReward: Number,
  unlockedAt: Date
}
```

---

## 🚀 Testing with Postman

Import the `SignOLingo-Progress-API.postman_collection.json` file.

### Test Flow Example

1. **Login** (from Auth collection)
2. **Start Alphabet A**
   ```
   POST /api/progress/alphabets/A/start
   ```
3. **Practice multiple times**
   ```
   POST /api/progress/alphabets/A/practice
   Body: { "score": 75 }
   ```
4. **Complete Alphabet**
   ```
   POST /api/progress/alphabets/A/complete
   Body: { "finalScore": 90 }
   ```
5. **Check Dashboard**
   ```
   GET /api/progress/dashboard
   ```
6. **Repeat for all 26 alphabets**
7. **Get a word ID from Word API**
8. **Complete Word Step 1**
   ```
   POST /api/progress/words/{wordId}/step1
   ```
9. **Attempt Word Step 2**
   ```
   POST /api/progress/words/{wordId}/step2
   Body: { "typedWord": "hello", "score": 80 }
   ```
10. **Complete Word Step 3**
    ```
    POST /api/progress/words/{wordId}/step3
    Body: { "videoUrl": "url", "score": 85 }
    ```
11. **Check Achievements**
    ```
    GET /api/progress/achievements
    ```

---

## ⚠️ Important Rules

1. **Sequential Learning**: Users MUST complete all 26 alphabets before accessing words
2. **3-Step Flow**: Words must be completed in order (Step 1 → 2 → 3)
3. **Passing Score**: Steps 2 and 3 require ≥70% score to complete
4. **One-Time XP**: XP is awarded only once per completion (no farming)
5. **Automatic Achievements**: System automatically checks and unlocks achievements
6. **Streak Rules**: Activity required every 24 hours to maintain streak

---

## 🎯 Future Enhancements

- Social features (study groups, challenges)
- Custom learning paths
- Adaptive difficulty adjustment
- Weekly challenges
- Seasonal events
- Premium achievements
- Skill trees

---

## 📝 Notes

- All scores are 0-100 scale
- Timestamps use ISO 8601 format
- Pagination default: 20 items per page
- All routes require authentication
- Achievements unlock automatically based on triggers
- Level calculation is automatic on XP change


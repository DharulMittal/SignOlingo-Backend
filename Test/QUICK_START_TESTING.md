# 🚀 Quick Start Testing Guide

## Prerequisites
- Server running on `http://localhost:3000`
- MongoDB connected
- User account created and logged in
- JWT token in cookies

---

## 📋 Test Sequence

### Phase 1: Complete All Alphabets (Required)

#### 1. Start Alphabet A
```http
POST http://localhost:3000/api/progress/alphabets/A/start
```

#### 2. Practice Alphabet A (Optional, Multiple Times)
```http
POST http://localhost:3000/api/progress/alphabets/A/practice
Content-Type: application/json

{
  "score": 85
}
```

#### 3. Complete Alphabet A
```http
POST http://localhost:3000/api/progress/alphabets/A/complete
Content-Type: application/json

{
  "finalScore": 95
}
```

**Expected Results:**
- ✅ 5 XP awarded
- ✅ Alphabet marked as completed
- ✅ "First Steps" achievement unlocked (1st alphabet)

#### 4. Repeat for All 26 Alphabets (B-Z)
```
B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z
```

**After Completing All 26:**
- ✅ "Alphabet Master" achievement unlocked
- ✅ Words unlocked (alphabetsUnlocked: true)
- ✅ Total: 130 XP
- ✅ Level 2 achieved

---

### Phase 2: Check Dashboard

```http
GET http://localhost:3000/api/progress/dashboard
```

**Expected Dashboard Data:**
```json
{
  "overview": {
    "totalXP": 130,
    "currentLevel": 2,
    "currentStreak": 1,
    "alphabetsCompleted": 26
  },
  "alphabets": {
    "completed": 26,
    "unlocked": true
  },
  "words": {
    "mastered": 0
  },
  "achievements": {
    "unlocked": 2
  }
}
```

---

### Phase 3: Master Your First Word

#### 1. Get a Word ID
```http
GET http://localhost:3000/api/word/all?limit=1
```
Copy the `_id` from the first word in response.

#### 2. Complete Step 1 (Watch Video)
```http
POST http://localhost:3000/api/progress/words/{WORD_ID}/step1
```

**Expected:**
- ✅ 2 XP awarded
- ✅ Step 1 completed
- ✅ Status: "step_1"

#### 3. Complete Step 2 (Type Word)
```http
POST http://localhost:3000/api/progress/words/{WORD_ID}/step2
Content-Type: application/json

{
  "typedWord": "hello",
  "score": 80
}
```

**Expected:**
- ✅ 3 XP awarded (if score ≥70)
- ✅ Step 2 completed
- ✅ Status: "step_2"

#### 4. Complete Step 3 (Perform Sign)
```http
POST http://localhost:3000/api/progress/words/{WORD_ID}/step3
Content-Type: application/json

{
  "videoUrl": "https://cloudinary.com/user-video.mp4",
  "score": 90
}
```

**Expected:**
- ✅ 10 XP awarded (if score ≥70)
- ✅ Word mastered
- ✅ Status: "mastered"
- ✅ "Word Explorer" achievement unlocked
- ✅ Total XP: 145 (130 + 15)

---

### Phase 4: Test Different Scenarios

#### Attempt Word Before Alphabets Complete
1. Create new user
2. Try Step 1 without completing alphabets

**Expected:**
- ❌ 403 Forbidden
- ❌ Message: "You must complete all 26 alphabets before learning words"

#### Fail Step 2 (Score < 70)
```json
{
  "typedWord": "hello",
  "score": 65
}
```

**Expected:**
- ⚠️ Attempt recorded
- ⚠️ Step 2 NOT completed
- ⚠️ No XP awarded
- ✅ Can retry

#### Skip Steps
Try Step 3 before completing Step 2

**Expected:**
- ❌ Error message
- ❌ Steps must be completed in order

---

### Phase 5: Test Achievements

#### Quick Learner (5 words in one day)
Complete 5 words following the 3-step flow.

**Expected:**
- ✅ "Quick Learner" achievement (20 XP)

#### Easy Learner (10 Very Easy words)
1. Get "Very Easy" words:
   ```http
   GET http://localhost:3000/api/word/difficulty/Very%20easy?limit=10
   ```
2. Complete all 10 following 3-step flow

**Expected:**
- ✅ "Easy Learner" achievement (25 XP)

#### Perfectionist (10 perfect scores)
Complete Step 3 with score=100 for 10 different words.

**Expected:**
- ✅ "Perfectionist" achievement (30 XP)

---

### Phase 6: Check All Progress

#### Get All Alphabet Progress
```http
GET http://localhost:3000/api/progress/alphabets
```

#### Get All Word Progress (with filters)
```http
GET http://localhost:3000/api/progress/words?status=mastered&page=1&limit=10
```

#### Get Detailed Stats
```http
GET http://localhost:3000/api/progress/stats
```

#### Get All Achievements
```http
GET http://localhost:3000/api/progress/achievements
```

#### Get Only Unlocked Achievements
```http
GET http://localhost:3000/api/progress/achievements/unlocked
```

---

## 🎯 Expected Final State (After Basic Tests)

```json
{
  "totalXP": 145+,
  "currentLevel": 2+,
  "alphabetsCompleted": 26,
  "alphabetsUnlocked": true,
  "wordsMastered": 1+,
  "achievementsUnlocked": 3+,
  "currentStreak": 1+
}
```

---

## 🧪 Advanced Testing Scenarios

### Test Streak System
1. Complete activity today
2. Wait 24 hours
3. Complete activity next day
4. Check currentStreak should be 2

### Test Level Progression
- At 100 XP → Level 2
- At 200 XP → Level 3
- At 500 XP → Level 6

### Test Pagination
```http
GET http://localhost:3000/api/progress/words?page=2&limit=5
```

### Test Difficulty Filtering
```http
GET http://localhost:3000/api/progress/words?difficulty=Very%20easy
```

### Test Status Filtering
```http
GET http://localhost:3000/api/progress/words?status=step_2
```

---

## 🐛 Common Issues & Solutions

### Issue: "User progress not found"
**Solution:** Complete at least one alphabet to initialize UserProgress

### Issue: Words locked
**Solution:** Complete all 26 alphabets first

### Issue: Step 2/3 not completing despite high score
**Solution:** Score must be ≥70 (check score value in request)

### Issue: Achievement not unlocking
**Solution:** Check if already unlocked, achievements unlock only once

### Issue: XP not increasing
**Solution:** XP awarded only once per completion, can't farm same alphabet/word

---

## 📊 Monitoring Tips

### Check Current XP
```http
GET http://localhost:3000/api/progress/dashboard
```
Look at `overview.totalXP`

### Check Level
Level formula: `floor(totalXP / 100) + 1`

### Check Streak
Must have activity every 24 hours

### Check Achievement Progress
Use `/achievements` endpoint to see locked vs unlocked

---

## ✅ Test Completion Checklist

- [ ] Complete 1 alphabet → "First Steps" unlocked
- [ ] Complete 26 alphabets → "Alphabet Master" unlocked, words unlock
- [ ] Complete 1 word → "Word Explorer" unlocked
- [ ] Dashboard shows correct totals
- [ ] Stats endpoint returns detailed data
- [ ] Alphabet progress shows all 26
- [ ] Word progress shows mastered words
- [ ] Achievements list shows 2-3 unlocked
- [ ] XP calculation correct
- [ ] Level calculation correct
- [ ] Streak tracking works
- [ ] Step 2 requires ≥70% to complete
- [ ] Step 3 requires ≥70% to complete
- [ ] Cannot access words before alphabets complete
- [ ] Pagination works on word progress

---

## 🎉 Success Indicators

✅ All alphabets completed  
✅ At least 1 word mastered  
✅ 2+ achievements unlocked  
✅ Dashboard loads correctly  
✅ XP > 130  
✅ Level ≥ 2  
✅ No server errors  
✅ All endpoints responding  

---

## 📞 Need Help?

- Check server logs for errors
- Verify MongoDB connection
- Ensure JWT token in cookies
- Review `PROGRESS_TRACKING_DOCUMENTATION.md` for API details
- Use Postman collection for pre-configured requests

---

**Happy Testing! 🚀**

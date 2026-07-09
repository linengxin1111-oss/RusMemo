# RusMemo Technical Summary

Last updated: 2026-07-10

This document records the current engineering state of RusMemo. It is meant for handoff, review, and planning the next development steps.

## 1. Project Overview

RusMemo is a WeChat Mini Program for learning Russian words. The MVP focuses on a small, usable personal vocabulary workflow:

- WeChat login
- A1 Russian seed vocabulary
- Word list
- User-created words
- Today study session
- Future review algorithm and learning statistics

The current implementation has completed the basic UI, CloudBase setup, login, A1 word import, word list data access, user word management, and study question loading.

## 2. Tech Stack

Frontend:

- WeChat Mini Program native framework
- WXML
- WXSS
- JavaScript

Backend:

- WeChat CloudBase
- Cloud Database
- Cloud Functions
- WeChat login context through `cloud.getWXContext()`

Repository:

- Local path: `D:\WeChatApps\RusMemo`
- GitHub: `https://github.com/linengxin1111-oss/RusMemo.git`
- Main branch: `main`

## 3. Runtime Configuration

Mini program root:

```text
miniprogram/
```

Cloud function root:

```text
cloudfunctions/
```

Cloud environment ID is configured in:

```text
miniprogram/app.js
```

Current value:

```text
cloud1-d3gk689dk6dc1c4dc
```

Cloud initialization happens in `App.onLaunch()`.

## 4. Directory Structure

Important directories:

```text
miniprogram/
  app.js
  app.json
  app.wxss
  data/mock.js
  pages/
    login/
    index/
    study/
    words/
    addWord/
    editWord/
    wrongWords/
    statistics/

cloudfunctions/
  initCloud/
  login/
  importA1Words/
  listWords/
  manageWord/
  getStudySession/

docs/
  database.md
  a1-word-sources.md
  technical-summary.md
```

There is still a `quickstartFunctions` directory from the original template. It is not part of the current RusMemo business flow.

## 5. UI Status

The v0.2 static UI has been built for all planned MVP pages:

- `pages/login/index`
- `pages/index/index`
- `pages/study/index`
- `pages/words/index`
- `pages/addWord/index`
- `pages/editWord/index`
- `pages/wrongWords/index`
- `pages/statistics/index`

The app uses a minimal Apple-inspired visual direction:

- Large whitespace
- Warm light background
- White cards
- Black/gray text
- Soft blue accent
- Rounded controls
- Minimal shadows

Global layout and shared visual primitives are in:

```text
miniprogram/app.wxss
```

The layout has been adjusted for iPhone safe areas and the WeChat capsule button. Main pages use `.rm-page` with extra top spacing.

## 6. Page Behavior

### Login

Path:

```text
miniprogram/pages/login/index
```

Current behavior:

- Calls the `login` cloud function.
- Creates or updates the current user document.
- Stores basic user info in global state.
- Enters the main app after successful login.

### Home

Path:

```text
miniprogram/pages/index/index
```

Current behavior:

- Displays MVP dashboard cards.
- Entry points include start study, word list, wrong words, and statistics.
- Some numbers are still mock or placeholder values.

### Word List

Path:

```text
miniprogram/pages/words/index
```

Current behavior:

- Calls `listWords`.
- Shows system A1 words and current user's custom words.
- Supports tab filtering between system words and user words.
- Pull-down refresh is available.
- Falls back to local mock data if the cloud function fails.

### Add Word

Path:

```text
miniprogram/pages/addWord/index
```

Current behavior:

- Allows adding user words.
- Required fields: Russian word and Chinese meaning.
- Optional fields: stress word, part of speech, example, example translation.
- Calls `manageWord` with action `add`.
- The `source` field is not shown to the user. It is set internally to `user`.

### Edit Word

Path:

```text
miniprogram/pages/editWord/index
```

Current behavior:

- Opens only user-created words.
- Calls `manageWord` with action `get`, `update`, or `delete`.
- Delete is a soft delete.
- System words are not editable.

### Study

Path:

```text
miniprogram/pages/study/index
```

Current behavior:

- Calls `getStudySession`.
- Loads up to 10 questions from system A1 words and current user's custom words.
- Supports two question types:
  - Russian to Chinese multiple choice
  - Chinese to Russian input
- Shows loading and fallback states.
- Falls back to local mock questions if the cloud function is unavailable.

Not implemented yet:

- Writing answer results to `word_progress`
- Review interval scheduling
- Daily study log

### Wrong Words

Path:

```text
miniprogram/pages/wrongWords/index
```

Current behavior:

- Static UI with mock data.

Not implemented yet:

- Real wrong-word query from `word_progress`.

### Statistics

Path:

```text
miniprogram/pages/statistics/index
```

Current behavior:

- Static UI with mock data.

Not implemented yet:

- Real data from `study_log` and `word_progress`.

## 7. Cloud Functions

### initCloud

Path:

```text
cloudfunctions/initCloud
```

Purpose:

- Initializes required database collections:
  - `user`
  - `word`
  - `word_progress`
  - `study_log`

Expected usage:

- Run once after creating or changing the cloud environment.

### login

Path:

```text
cloudfunctions/login
```

Purpose:

- Reads WeChat login context.
- Creates a `user` document on first login.
- Updates `last_login_at` on later logins.

Primary collection:

```text
user
```

### importA1Words

Path:

```text
cloudfunctions/importA1Words
```

Purpose:

- Imports 87 curated A1 Russian words into the `word` collection.
- Skips duplicates based on existing system A1 words.
- Uses `source: "system"` and `level: "A1"`.

Current known successful result:

```json
{
  "success": true,
  "total": 87,
  "inserted": 6,
  "skipped": 81,
  "failed": 0,
  "errors": []
}
```

This means the A1 vocabulary has already been imported, and only missing words were added in the last run.

### listWords

Path:

```text
cloudfunctions/listWords
```

Purpose:

- Lists all active system words.
- Lists active custom words belonging to the current user.
- Converts database fields into the client display shape.

Primary collection:

```text
word
```

Current query:

- `source = system` and `is_deleted = false`
- or `_openid = current user`, `source = user`, `is_deleted = false`

### manageWord

Path:

```text
cloudfunctions/manageWord
```

Purpose:

- Handles custom word CRUD.

Supported actions:

- `add`
- `get`
- `update`
- `delete`

Important behavior:

- User-created words are saved with `_openid`.
- `source` is always set internally to `user`.
- Only the owner can read, update, or delete a custom word.
- Delete uses `is_deleted: true`.

### getStudySession

Path:

```text
cloudfunctions/getStudySession
```

Purpose:

- Builds a study session from real database words.
- Returns up to 10 questions by default.
- Uses both system words and the current user's custom words.

Question types:

- Multiple choice: Russian word to Chinese meaning
- Input: Chinese meaning to Russian word

Current limitations:

- The function only generates questions.
- It does not read `word_progress` yet.
- It does not prioritize due reviews yet.

Deployment note:

- This cloud function must be uploaded and deployed in WeChat Developer Tools before the study page can use real cloud questions.

## 8. Database Schema

Detailed schema is maintained in:

```text
docs/database.md
```

Current collections:

- `user`
- `word`
- `word_progress`
- `study_log`

### user

Stores one document per WeChat user.

Important fields:

- `_openid`
- `appid`
- `unionid`
- `study_days`
- `learned_count`
- `mastered_count`
- `created_at`
- `last_login_at`

### word

Stores system words and user-created words.

Important fields:

- `_openid`
- `russian_word`
- `stress_word`
- `part_of_speech`
- `chinese_meaning`
- `example`
- `example_translation`
- `source`
- `level`
- `is_deleted`
- `created_at`
- `updated_at`

`source` is an internal field:

- `system`: built-in A1 vocabulary
- `user`: custom word created by current user

### word_progress

Designed for per-user learning progress.

Important fields:

- `_openid`
- `word_id`
- `level`
- `wrong_count`
- `correct_count`
- `last_studied_at`
- `next_review_at`
- `created_at`
- `updated_at`

Current status:

- Schema planned.
- Not yet connected to the study page.

### study_log

Designed for daily study summaries.

Important fields:

- `_openid`
- `date`
- `learned_count`
- `new_count`
- `review_count`
- `correct_count`
- `wrong_count`
- `duration_seconds`
- `created_at`
- `updated_at`

Current status:

- Schema planned.
- Not yet connected to statistics.

## 9. A1 Vocabulary

The seed vocabulary contains 87 beginner/travel-oriented Russian words and phrases.

Source documentation:

```text
docs/a1-word-sources.md
```

Seed data:

```text
cloudfunctions/importA1Words/data/a1Words.js
```

Import function:

```text
cloudfunctions/importA1Words
```

## 10. Current Git Progress

Recent development milestones:

```text
8bb66cc feat: 接入今日学习题目
fd4f7ea fix: 移除单词表单来源字段
503f104 fix: 修复自定义单词归属用户
32f41fc feat: 完成自定义单词管理
5a45004 fix: 优化 A1 词库导入超时
d00339d fix: 优化单词本空状态提示
1ec6d2c feat: 接入单词本数据
0447d2f feat: 导入 A1 初始词库
7c08d51 feat: 固化云数据库结构
341073b feat: 完成微信登录
```

Development convention:

- One feature or fix per commit.
- Commit messages use conventional-style Chinese descriptions.

## 11. Deployment and Verification Checklist

After pulling or opening this project in WeChat Developer Tools:

1. Confirm the cloud environment is selected.
2. Confirm `miniprogram/app.js` contains the correct environment ID.
3. Upload and deploy these cloud functions when changed:
   - `login`
   - `initCloud`
   - `importA1Words`
   - `listWords`
   - `manageWord`
   - `getStudySession`
4. Run `initCloud` if collections are missing.
5. Run `importA1Words` if A1 words are missing.
6. Open the mini program and complete login.
7. Verify word list shows A1 words.
8. Add a custom word and confirm it appears under user words.
9. Open study page and confirm questions load from the database.

## 12. Known Notes

- Local `node_modules` under cloud functions are not committed.
- Cloud function dependencies should be installed by WeChat cloud deployment.
- The app currently has some mock data left in home, wrong words, and statistics.
- The study page has a mock fallback to avoid a blank page when cloud functions are not deployed.
- User-created words must have `_openid`; otherwise they will not appear for the current user.
- The old `source` field is intentionally hidden from add/edit forms.

## 13. Next Recommended Step

Next step:

```text
Implement answer recording and mastery progress.
```

Scope:

- Add a cloud function or extend an existing function to record answer results.
- Create or update `word_progress` for each answered word.
- Correct answer:
  - `level + 1`, max 4
  - `correct_count + 1`
- Wrong answer:
  - `level - 1`, min 0
  - `wrong_count + 1`
  - review again after 5 minutes
- Compute `next_review_at` from the updated level.
- Connect the study page after each checked answer.

This will turn the current question flow into the first real spaced-review loop.

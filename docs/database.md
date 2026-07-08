# RusMemo Database Schema

This document is the MVP database contract for CloudBase.

## Collections

### user

Stores one document per WeChat user.

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `_openid` | string | yes | system | WeChat user openid |
| `appid` | string | yes | system | Mini program appid |
| `unionid` | string | no | `""` | WeChat unionid when available |
| `study_days` | number | yes | `0` | Continuous study days |
| `learned_count` | number | yes | `0` | Learned word count |
| `mastered_count` | number | yes | `0` | Level 4 word count |
| `created_at` | date | yes | server date | User creation time |
| `last_login_at` | date | yes | server date | Last login time |

Recommended indexes:

- `_openid`
- `last_login_at`

### word

Stores system A1 words and user-created words.

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `_openid` | string | no | system/user | Only present for user-created words |
| `russian_word` | string | yes | - | Russian word |
| `stress_word` | string | no | `""` | Word with stress mark |
| `part_of_speech` | string | no | `""` | Noun, verb, adjective, etc. |
| `chinese_meaning` | string | yes | - | Chinese meaning |
| `example` | string | no | `""` | Russian example sentence |
| `example_translation` | string | no | `""` | Chinese translation |
| `source` | string | yes | `system` | `system` or `user` |
| `level` | string | no | `A1` | Word level |
| `is_deleted` | boolean | yes | `false` | Soft delete flag |
| `created_at` | date | yes | server date | Creation time |
| `updated_at` | date | yes | server date | Update time |

Recommended indexes:

- `source`
- `_openid, source`
- `russian_word`
- `is_deleted`

### word_progress

Stores each user's learning state for each word.

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `_openid` | string | yes | system | WeChat user openid |
| `word_id` | string | yes | - | Related `word` document id |
| `level` | number | yes | `0` | Mastery level, 0-4 |
| `wrong_count` | number | yes | `0` | Wrong answer count |
| `correct_count` | number | yes | `0` | Correct answer count |
| `last_studied_at` | date | no | `null` | Last study time |
| `next_review_at` | date | yes | server date | Next review time |
| `created_at` | date | yes | server date | Creation time |
| `updated_at` | date | yes | server date | Update time |

Recommended indexes:

- `_openid, next_review_at`
- `_openid, word_id`
- `_openid, wrong_count`
- `_openid, level`

### study_log

Stores daily learning summary per user.

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `_openid` | string | yes | system | WeChat user openid |
| `date` | string | yes | `YYYY-MM-DD` | Study date |
| `learned_count` | number | yes | `0` | Studied word count |
| `new_count` | number | yes | `0` | New words studied |
| `review_count` | number | yes | `0` | Review words studied |
| `correct_count` | number | yes | `0` | Correct answer count |
| `wrong_count` | number | yes | `0` | Wrong answer count |
| `duration_seconds` | number | yes | `0` | Study duration |
| `created_at` | date | yes | server date | Creation time |
| `updated_at` | date | yes | server date | Update time |

Recommended indexes:

- `_openid, date`
- `date`

## Review Algorithm

Level intervals:

| Level | Meaning | Next review |
| --- | --- | --- |
| 0 | New | today |
| 1 | Familiar | 1 day |
| 2 | Practicing | 3 days |
| 3 | Nearly mastered | 7 days |
| 4 | Mastered | 15 days |

Rules:

- Correct: `level + 1`, max `4`.
- Wrong: `level - 1`, min `0`; `wrong_count + 1`; review again after 5 minutes.
- Level 4 is considered mastered.

## Permissions

MVP recommendation:

- `user`: users can read/write only their own documents.
- `word`: everyone can read `source = system`; users can read/write their own `source = user` words.
- `word_progress`: users can read/write only their own progress.
- `study_log`: users can read/write only their own logs.

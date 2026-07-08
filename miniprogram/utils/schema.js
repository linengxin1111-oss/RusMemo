const COLLECTIONS = {
  USER: "user",
  WORD: "word",
  WORD_PROGRESS: "word_progress",
  STUDY_LOG: "study_log",
};

const WORD_SOURCE = {
  SYSTEM: "system",
  USER: "user",
};

const WORD_LEVEL = {
  A1: "A1",
};

const MASTERY_LEVEL = {
  MIN: 0,
  MAX: 4,
  MASTERED: 4,
};

const REVIEW_INTERVAL_DAYS = {
  1: 1,
  2: 3,
  3: 7,
  4: 15,
};

const WRONG_REVIEW_DELAY_MINUTES = 5;

function normalizeWordInput(input) {
  return {
    russian_word: (input.russian_word || "").trim(),
    stress_word: (input.stress_word || "").trim(),
    part_of_speech: (input.part_of_speech || "").trim(),
    chinese_meaning: (input.chinese_meaning || "").trim(),
    example: (input.example || "").trim(),
    example_translation: (input.example_translation || "").trim(),
    source: input.source || WORD_SOURCE.USER,
    level: input.level || WORD_LEVEL.A1,
    is_deleted: Boolean(input.is_deleted),
  };
}

function createProgressDraft(wordId, now) {
  return {
    word_id: wordId,
    level: 0,
    wrong_count: 0,
    correct_count: 0,
    last_studied_at: null,
    next_review_at: now,
    created_at: now,
    updated_at: now,
  };
}

function createStudyLogDraft(date, now) {
  return {
    date,
    learned_count: 0,
    new_count: 0,
    review_count: 0,
    correct_count: 0,
    wrong_count: 0,
    duration_seconds: 0,
    created_at: now,
    updated_at: now,
  };
}

function getReviewIntervalDays(level) {
  return REVIEW_INTERVAL_DAYS[level] || 0;
}

module.exports = {
  COLLECTIONS,
  WORD_SOURCE,
  WORD_LEVEL,
  MASTERY_LEVEL,
  REVIEW_INTERVAL_DAYS,
  WRONG_REVIEW_DELAY_MINUTES,
  normalizeWordInput,
  createProgressDraft,
  createStudyLogDraft,
  getReviewIntervalDays,
};

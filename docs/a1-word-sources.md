# A1 Word Seed Sources

The first RusMemo A1 seed list contains 87 beginner-friendly words and short phrases for travel-oriented Russian learning.

The list was curated from public beginner/travel vocabulary references, then normalized for the RusMemo MVP schema.

## Sources

- Wikivoyage Russian phrasebook: basic phrases, directions, transportation, lodging, food, emergency, and travel expressions.
- GLD/ASJP Russian basic vocabulary list: common high-frequency core words that overlap with beginner vocabulary needs.

## Curation Rules

- Keep only high-frequency beginner words suitable for a first travel-focused MVP.
- Prefer single words, but allow a few essential fixed expressions such as `здравствуйте`.
- Use `source: "system"` and `level: "A1"` for every seed word.
- Do not add tags yet, because tags are outside MVP.
- Include short example sentences for learning context.
- Avoid duplicate imports by checking `russian_word + source + level`.

## Import Function

Cloud function:

```text
cloudfunctions/importA1Words
```

Expected result:

```json
{
  "success": true,
  "total": 87,
  "inserted": 87,
  "skipped": 0,
  "failed": 0,
  "errors": []
}
```

Running the function again should skip existing system A1 words instead of creating duplicates.

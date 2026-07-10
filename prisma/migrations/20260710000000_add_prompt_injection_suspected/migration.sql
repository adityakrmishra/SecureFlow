-- Adds an advisory flag surfaced to reviewers when a finding's AI explanation may have been
-- influenced by attacker-controlled content (prompt injection) in the scanned code snippet.
-- This does NOT affect the PASS/BLOCKED/REVIEW policy gate (see src/lib/armor/iq.ts), which only
-- ever consumes `severity` and is unaware of this column.
ALTER TABLE "Finding" ADD COLUMN "promptInjectionSuspected" BOOLEAN NOT NULL DEFAULT false;

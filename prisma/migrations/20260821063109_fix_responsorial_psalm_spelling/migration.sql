-- Fixes a misspelled enum value: RESPNSORIAL_PASALM -> RESPONSORIAL_PSALM.
-- Uses ALTER TYPE ... RENAME VALUE rather than Prisma's default drop/add
-- approach, so any existing Task rows using the old value are relabeled
-- in place instead of the migration failing (or silently orphaning them).
ALTER TYPE "roleType" RENAME VALUE 'RESPNSORIAL_PASALM' TO 'RESPONSORIAL_PSALM';

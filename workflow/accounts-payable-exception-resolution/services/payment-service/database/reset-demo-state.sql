-- Reset only payment instructions created by demo workflow runs.
DELETE FROM payment_instructions;
COMMIT;

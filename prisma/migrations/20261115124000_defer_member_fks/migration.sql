-- Member references are checked at the end of the transaction instead of at the
-- end of each statement. Deleting a group cascades to members, expenses, shares
-- and payments in no guaranteed order; with immediate checks the members could
-- be removed while their expenses still exist, which would fail the delete.
-- Deleting a single member who is still used by an expense or payment remains
-- forbidden. Prisma cannot express DEFERRABLE in schema.prisma, so it lives here.
ALTER TABLE "Expense" ALTER CONSTRAINT "Expense_payerId_fkey" DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "ExpenseShare" ALTER CONSTRAINT "ExpenseShare_memberId_fkey" DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "Payment" ALTER CONSTRAINT "Payment_fromMemberId_fkey" DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "Payment" ALTER CONSTRAINT "Payment_toMemberId_fkey" DEFERRABLE INITIALLY DEFERRED;

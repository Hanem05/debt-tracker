export const dynamic = 'force-dynamic';

import BorrowersPageClient from '@/components/borrowers/BorrowersPageClient';
import { createBorrower, updateBorrower } from '@/lib/actions/borrowers';
import { recordPayment } from '@/lib/actions/payments';

export default function BorrowersPage() {
  return (
    <BorrowersPageClient createBorrower={createBorrower} updateBorrower={updateBorrower} recordPayment={recordPayment} />
  );
}

import { BorrowerDetailClient } from '@/components/borrowers/BorrowerDetailClient';
import { updateBorrower } from '@/lib/actions/borrowers';
import { recordPayment } from '@/lib/actions/payments';

export default function BorrowerDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <BorrowerDetailClient id={params.id} updateBorrower={updateBorrower} recordPayment={recordPayment} />
    </div>
  );
}

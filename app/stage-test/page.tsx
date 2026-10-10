import { notFound } from 'next/navigation';
import { StageTest } from '@/components/dev/StageTest';

export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <StageTest />;
}

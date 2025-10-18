import { ExperimentDetailContainer } from '@/components/experiment/ExperimentDetailContainer';

interface ExperimentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ExperimentDetailPage({ params }: ExperimentDetailPageProps) {
  const { id } = await params;

  return <ExperimentDetailContainer experimentId={id} />;
}

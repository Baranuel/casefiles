import { PageWrapper } from "@/components/global/PageWrapper";
import { Canvas } from "@/features/case-board/components/Canvas";

type CasePageProps = {
  params: Promise<{ id: string }>;
};

export default async function CasePage({ params }: CasePageProps) {
  const { id } = await params;

  return (
    <PageWrapper>
      <Canvas/>
    </PageWrapper>
  );
}

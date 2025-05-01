import { PageWrapper } from "@/components/global/PageWrapper";
import { Canvas } from "@/components/cases-board/Canvas";
import { CaseProvider } from "@/providers/CaseStateProvider";

type CasePageProps = {
  params: Promise<{ id: string }>;
};

export default async function CasePage({ params }: CasePageProps) {
  const { id } = await params;
  console.log(id)

  return (
    <CaseProvider>
      <PageWrapper>
        <Canvas />
      </PageWrapper>
    </CaseProvider>
  );
}

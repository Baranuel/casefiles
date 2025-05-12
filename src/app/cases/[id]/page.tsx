import { PageWrapper } from "@/components/global/PageWrapper";
import { Canvas } from "@/components/cases-board/Canvas";
import { CaseProvider } from "@/providers/CaseStateProvider";
import { Toolbar } from "@/components/cases-board/Toolbar";
import { SocketProvider } from "@/providers/SocketProvider";
import { randomUUID } from "crypto";
import { Preview } from "@/components/cases-board/Preview";

type CasePageProps = {
  params: Promise<{ id: string }>;
};

export default async function CasePage({ params }: CasePageProps) {
  const { id } = await params;
  const uniqueWsId = randomUUID()

  return (
    <SocketProvider uniqueWsId={uniqueWsId} caseId={id}>
      <CaseProvider caseId={id}>
        <PageWrapper>
          <Canvas />
          <Toolbar/>
          <Preview/>
        </PageWrapper>
      </CaseProvider>
    </SocketProvider>
  );
}

import { PageWrapper } from "@/components/global/PageWrapper";
import { SectionWrapper } from "@/components/global/SectionWrapper";
import { CaseList } from "@/components/cases/CaseList";
import { SectionHeader } from "@/components/global/SectionHeader";
import { CreateCaseButton } from "@/components/cases/CreateCaseButton";

export default async function CasesPage() {

  return (
    <PageWrapper>
      <SectionWrapper className="min-h-24 md:min-h-24">
        <div className="w-full h-screen flex justify-between items-start  ">
          <SectionHeader>Active Cases</SectionHeader>
          <CreateCaseButton />
        </div>
      </SectionWrapper>
      <SectionWrapper className=" pt-0 lg:pt-0 md:min-h-fit lg:min-h-fit">
        <CaseList />
      </SectionWrapper>
    </PageWrapper>
  );
}

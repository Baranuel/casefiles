import { PageWrapper } from "@/components/global/PageWrapper";
import { SectionWrapper } from "@/components/global/SectionWrapper";
import { CaseList } from "@/components/cases/CaseList";
import { SectionHeader } from "@/components/global/SectionHeader";
import { CreateCaseButton } from "@/components/cases/CreateCaseButton";

export default async function CasesPage() {


  return (
    <PageWrapper>
      <SectionWrapper className="min-h-24 md:min-h-24">
        <div className="w-full flex justify-between items-start  ">
          <SectionHeader>Active Cases</SectionHeader>
          <CreateCaseButton baseUrl={process.env.NEXT_PUBLIC_BASE_API_URL!}/>
        </div>
      </SectionWrapper>
      <SectionWrapper className=" pt-0 lg:pt-0 lg:min-h-fit">
        <CaseList baseUrl={process.env.NEXT_PUBLIC_BASE_API_URL!} />
      </SectionWrapper>
    </PageWrapper>
  );
}

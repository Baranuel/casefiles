import { SectionHeader } from "../global/SectionHeader";
import { SectionWrapper } from "../global/SectionWrapper";

export default function Intro() {
  return (
    <SectionWrapper className="bg-primary-700/5 items-center">
        <SectionHeader><span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">Introduction </span></SectionHeader>
        <div className=" w-full min-h-[270px] lg:max-w-3/4  md:aspect-[5/3] bg-black rounded-lg shadow-xl"></div>
    </SectionWrapper>
  );
}

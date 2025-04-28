import { SectionHeader } from "../global/SectionHeader";
import { SectionWrapper } from "../global/SectionWrapper";

export default function Intro() {
  return (
    <section className="bg-primary-700/4">
      <SectionWrapper className="items-center">
        <SectionHeader>
          <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            Introduction{" "}
          </span>
        </SectionHeader>
        <div className=" w-full min-h-[320px] aspect-video  lg:max-w-4/5 bg-black rounded-lg shadow-xl">
          <iframe
            className="w-full h-full rounded-lg"
            title="Introduction Video"
            src={"https://www.youtube.com/embed/PX84W8bDCfw"}
          />
        </div>
      </SectionWrapper>
    </section>
  );
}

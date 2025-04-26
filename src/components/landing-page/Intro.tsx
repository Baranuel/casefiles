import { SectionHeader } from "../global/SectionHeader"

export default function Intro() {
  return (
    <section className="w-full min-h-[350px] bg-primary-700/5">
      <div className="w-full flex flex-col items-center gaplg:justify-center mx-auto px-4 lg:px-20 py-12 lg:py-24">
          <SectionHeader>
          <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            Introduction
          </span>
        </SectionHeader>
        <div className=" w-full min-h-[270px] lg:max-w-3/4 lg:min-h-[575px] aspect-[5/3] bg-black rounded-lg shadow-xl"></div>
      </div>
    </section>
  );
}

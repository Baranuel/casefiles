import Image from "next/image";
import { SectionWrapper } from "../global/SectionWrapper";
import { Button } from "../global/Button";

export default function Hero() {
  return (
    <SectionWrapper>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-center gap-8 lg:gap-0 ">
        <div className="flex-1 min-w-1/2 flex flex-col justify-start items-start lg:justify-center gap-4  ">
          <h1 className="text-5xl md:text-6xl lg:text-7xl  font-black">
            <span className="bg-gradient-to-r from-primary-800 to-[#594c45] bg-clip-text text-transparent">
              Your Digital
            </span>
            <span className=" block font-black bg-gradient-to-r  from-primary-600 to-primary-700 bg-clip-text text-transparent">
              Detective Board
            </span>
          </h1>
          <p className=" text-base md:text-lg xl:text-xl text-primary-800 font-medium leading-relaxed max-w-[50ch]">
            Team up with friends, family, or teammates to help Sherlock Holmes
            solve mysteries on 221B Baker Street. Our interactive detective
            boards turn every case into a collaborative adventure!
          </p>
          <Button
                variant='primary'
                className=" py-2.5 rounded-md shadow-lg hover:shadow-xl mt-auto"
              >
                Start Investigation
              </Button>
        </div>
        <div className=" relative flex-1 w-full lg:ml-4 aspect-[5/3] min-h-[250px] lg:min-h-[370px] lg:min-w-[520px] max-w-[600px] border-4 border-primary-800 bg-black/50 rounded-sm ">
          <Image
            src="/casefile.png"
            alt="Hero Image"
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 600px"
            priority
          />
        </div>
      </div>
    </SectionWrapper>
  );
}


export default function Hero() {
  return (
    <section className="w-full min-h-[700px] flex items-start lg:items-center">
    <div className="w-full mx-auto px-4 lg:px-20 py-12 lg:py-24"> 
        <div className="flex h-full flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-center gap-8 ">
            <div className="flex-1 min-w-1/2 flex flex-col justify-start items-start lg:justify-center gap-4  ">
                <h1 className="text-5xl lg:text-7xl font-black">
                <span className="bg-gradient-to-r from-primary-800 to-[#594c45] bg-clip-text text-transparent">
                    Your Digital
                </span>
                <span className=" block font-black bg-gradient-to-r  from-primary-600 to-primary-700 bg-clip-text text-transparent">
                    Detective Board
                </span>
                </h1>
                <p className=" text-base md:text-lg  text-primary-800 font-medium leading-relaxed max-w-[50ch]">
                Team up with friends, family, or teammates to help Sherlock Holmes solve
                mysteries on 221B Baker Street. Our interactive detective boards turn
                every case into a collaborative adventure!
                </p>
                <button className="bg-primary-500 p-2 min-w-[150px]">Hello</button>
            </div>
            <div className=" flex-1 w-full  aspect-[5/3] min-h-[275px] lg:min-h-[350px] lg:min-w-[520px] max-w-[550px] border-4 border-primary-800 bg-black/50 rounded-lg"></div>
          </div>
        </div>
    </section>

  );
}
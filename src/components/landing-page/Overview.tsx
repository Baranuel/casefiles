"use client";
import { useState } from "react";
import { SectionHeader } from "../global/SectionHeader";
import { SectionWrapper } from "../global/SectionWrapper";
import { Users, Layout, Search, FileText, Clock, Network } from "lucide-react";

const featureList = [
  {
    icon: <Users className="w-5 h-5" />,
    title: "Collaborative Investigation",
    description: "Unite your team to crack challenging mysteries with seamless collaboration.",
    color: "bg-[#E6F2ED] text-[#2C6E49]",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Real-time Updates",
    description: "Stay in sync with your team as evidence and theories develop.",
    color: "bg-[#FFF0E5] text-[#B4540A]",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Real-time Updates",
    description: "Stay in sync with your team as evidence and theories develop.",
    color: "bg-[#FFF0E5] text-[#B4540A]",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Real-time Updates",
    description: "Stay in sync with your team as evidence and theories develop.",
    color: "bg-[#FFF0E5] text-[#B4540A]",
  },
  // Add more features...
];

export const Overview = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const feature = featureList[activeFeature];

  return (
    <SectionWrapper className="items-center">
      <SectionHeader>Features</SectionHeader>
      
      <div className="flex flex-col md:flex-row gap-4 w-full justify-start">
        {/* Feature List */}
        <div className="md:w-1/3 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible  rounded-md">
          {featureList.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveFeature(index)}
              className={`
                flex items-center gap-4 p-4 rounded-lg transition-all
                min-w-fit flex-1 text-nowrap md:min-w-0 border  hover:bg-white/60 hover:cursor-pointer
                ${activeFeature === index 
                  ? ' shadow-md bg-white/60 border-primary-800/10'
                  : 'border-transparent bg-primary-600/5'
                }
              `}
            >
              <div className={item.color + ' p-2 rounded-md'}>
                {item.icon}
              </div>
              <span className="font-medium text-left">{item.title}</span>
            </button>
          ))}
        </div>

        {/* Feature Details */}
        <div className="md:w-2/3 p-6 rounded-lg bg-white/50 border border-primary-800/10">
          <div className={feature.color + ' p-3 rounded-md w-fit mb-4'}>
            {feature.icon}
          </div>
          <h3 className="text-2xl font-bold text-primary-900 mb-3">
            {feature.title}
          </h3>
          <p className="text-primary-800/70 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};

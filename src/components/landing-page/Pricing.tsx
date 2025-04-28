import { SectionHeader } from "../global/SectionHeader";
import { SectionWrapper } from "../global/SectionWrapper";
import { Button } from "../global/Button";
import { Check, Coffee, Fingerprint } from "lucide-react";

const pricingPlans = [
  {
    name: "Detective in Training",
    icon: <Coffee className="w-6 h-6" />,
    description: "Start solving mysteries today",
    price: "0",
    features: [
      "2 Active Case Boards",
      "Community Support"
    ],
    color: "bg-[#FFF0E5]",
    textColor: "text-[#B4540A]",
    borderColor: "border-[#B4540A]/20",
    buttonVariant: "primary" as const
  },
  {
    name: "Master Detective",
    icon: <Fingerprint className="w-6 h-6" />,
    description: "For the Sherlock Holmes in you",
    price: "15",
    features: [
      "Unlimited Case Boards",
      "Advanced Evidence Linking",
      "Priority Support",
      "Advanced Export Options",
      "Custom Case Templates",
    ],
    color: "bg-[#FFF0E5]",
    textColor: "text-[#B4540A]",
    borderColor: "border-[#B4540A]/20",
    buttonVariant: "secondary" as const,
    popular: true
  }
];

export const Pricing = () => {
  return (
    <div className="bg-gradient-to-t from-primary-700/5 to-transparent">
      <SectionWrapper>
        <div className="text-center space-y-4 mb-8">
          <SectionHeader>
            <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              Choose Your Detective Level
            </span>
          </SectionHeader>
          <p className="text-primary-800/70 max-w-2xl mx-auto text-lg">
            Start your investigation journey today
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative flex flex-col p-6 rounded-2xl 
                border-2 backdrop-blur-sm
                transition-all duration-300
                hover:shadow-xl hover:-translate-y-1
                ${plan.popular ? "border-primary-600" : "border-primary-800/10"}
                ${plan.popular ? "bg-white" : "bg-white/60"}
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    Supports the App
                  </span>
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className={`${plan.color} p-2.5 rounded-lg ${plan.borderColor}`}>
                  {plan.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-900">
                    {plan.name}
                  </h3>
                  <p className="text-primary-800/70">
                    {plan.description}
                  </p>
                </div>
              </div>

              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-primary-900">
                  ${plan.price}
                </span>
                <span className="text-primary-800/70 ml-2">
                  one-time
                </span>
              </div>

              <div className="space-y-2.5 mb-6">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className={`p-1 rounded-full ${plan.color}`}>
                      <Check className={`w-3.5 h-3.5 ${plan.textColor}`} />
                    </div>
                    <span className="text-primary-800/70 text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.buttonVariant}
                className="w-full py-2.5 rounded-md border border-amber-600 mt-auto"
              >
                {plan.price === "0" ? "Start Investigating" : "Become a Master Detective"}
              </Button>
            </div>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
};
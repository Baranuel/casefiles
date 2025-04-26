import { PageWrapper } from "@/components/global/PageWrapper";
import Hero from "@/components/landing-page/Hero";
import Intro from "@/components/landing-page/Intro";
import { Overview } from "@/components/landing-page/Overview";

export default function Home() {
  return <PageWrapper>
    <Hero />
    <Intro/>
    <Overview/>
  </PageWrapper>
}

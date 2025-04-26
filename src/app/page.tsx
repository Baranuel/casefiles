import Hero from "@/components/landing-page/Hero";
import Intro from "@/components/landing-page/Intro";

export default function Home() {
  return <main className="bg-background-500 w-screen min-h-screen max-w-[1720px] mx-auto flex flex-col items-center justify-start lg:justify-center gap-8">
    <Hero />
    <Intro/>
  </main>
}

import Hero from '@/components/Hero';
import About from '@/components/About';
import PortfolioSection from '@/components/portfolio/PortfolioSection';
import Reviews from '@/components/Reviews';
import Faq from '@/components/Faq';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <PortfolioSection />
      <Reviews />
      <Faq />
      <Contact />
    </>
  );
}

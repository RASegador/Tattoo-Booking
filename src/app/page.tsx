import Hero from '@/components/Hero';
import About from '@/components/About';
import FeaturedArtist from '@/components/FeaturedArtist';
import Artists from '@/components/Artists';
import PortfolioSection from '@/components/portfolio/PortfolioSection';
import Reviews from '@/components/Reviews';
import Faq from '@/components/Faq';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <FeaturedArtist />
      <Artists />
      <PortfolioSection />
      <Reviews />
      <Faq />
      <Contact />
    </>
  );
}

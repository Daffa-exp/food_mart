import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import PromoBanner from "@/components/home/PromoBanner";
import PromotionsSection from "@/components/home/PromotionsSection";
import CategorySection from "@/components/home/CategorySection";
import BestSellersSection from "@/components/home/BestSellersSection";
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PromoBanner />
        <PromotionsSection />
        <CategorySection />
        <BestSellersSection />
        <WhyChooseUsSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  );
}

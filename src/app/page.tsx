import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedProjectsSection } from "@/components/sections/FeaturedProjectsSection";
import { ServicesOverviewSection } from "@/components/sections/ServicesOverviewSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { TechStackSection } from "@/components/sections/TechStackSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Animated Hero Section with Headline & 3 CTAs */}
      <HeroSection />

      {/* 2. Featured Project Cards */}
      <FeaturedProjectsSection />

      {/* 3. Services Overview */}
      <ServicesOverviewSection />

      {/* 4. Development Process */}
      <ProcessSection />

      {/* 5. Skills & Technology Stack */}
      <TechStackSection />

      {/* 6. Testimonials Section (Clearly identified sample content) */}
      <TestimonialsSection />

      {/* 7. Final Contact CTA */}
      <ContactCtaSection />
    </div>
  );
}

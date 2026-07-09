import { SectionType } from "@/generated/prisma/enums";
import { HeroSection } from "./HeroSection";
import { FeaturedPackagesSection } from "./FeaturedPackagesSection";
import { DestinationsSection } from "./DestinationsSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { BlogPreviewSection } from "./BlogPreviewSection";
import { SearchSection } from "./SearchSection";
import { CTASection } from "./CTASection";
import { RichTextSection } from "./RichTextSection";
import { GallerySection } from "./GallerySection";
import { StatsSection } from "./StatsSection";
import { ContactFormSection } from "./ContactFormSection";
import { PageHeaderSection } from "./PageHeaderSection";
import { FeatureGridSection } from "./FeatureGridSection";
import { ChecklistSection } from "./ChecklistSection";
import { CredentialsSection } from "./CredentialsSection";
import { ImageBandSection } from "./ImageBandSection";
import { ItinerarySection } from "./ItinerarySection";

interface HomeSectionData {
  id: string;
  type: SectionType;
  order: number;
  data: Record<string, unknown>;
}

export async function SectionRenderer({
  section,
  immersive = false,
}: {
  section: HomeSectionData;
  /** Homepage continuous-banner mode: sit transparently over the fixed backdrop. */
  immersive?: boolean;
}) {
  const data = (section.data ?? {}) as Record<string, unknown>;

  switch (section.type) {
    case SectionType.HERO:
      return <HeroSection data={data} immersive={immersive} />;
    case SectionType.SEARCH:
      return <SearchSection data={data} />;
    case SectionType.FEATURED_PACKAGES:
      return <FeaturedPackagesSection data={data} immersive={immersive} />;
    case SectionType.DESTINATIONS:
      return <DestinationsSection data={data} immersive={immersive} />;
    case SectionType.TESTIMONIALS:
      return <TestimonialsSection data={data} immersive={immersive} />;
    case SectionType.BLOG_PREVIEW:
      return <BlogPreviewSection data={data} immersive={immersive} />;
    case SectionType.CTA:
      return <CTASection data={data} />;
    case SectionType.RICH_TEXT:
      return <RichTextSection data={data} />;
    case SectionType.GALLERY:
      return <GallerySection data={data} />;
    case SectionType.STATS:
      return <StatsSection data={data} />;
    case SectionType.CONTACT_FORM:
      return <ContactFormSection data={data} />;
    case SectionType.PAGE_HEADER:
      return <PageHeaderSection data={data} />;
    case SectionType.FEATURE_GRID:
      return <FeatureGridSection data={data} />;
    case SectionType.CHECKLIST:
      return <ChecklistSection data={data} />;
    case SectionType.CREDENTIALS:
      return <CredentialsSection data={data} />;
    case SectionType.IMAGE_BAND:
      return <ImageBandSection data={data} />;
    case SectionType.ITINERARY:
      return <ItinerarySection data={data} />;
    default:
      return null;
  }
}

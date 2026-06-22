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

interface HomeSectionData {
  id: string;
  type: SectionType;
  order: number;
  data: Record<string, unknown>;
}

export async function SectionRenderer({ section }: { section: HomeSectionData }) {
  const data = (section.data ?? {}) as Record<string, unknown>;

  switch (section.type) {
    case SectionType.HERO:
      return <HeroSection data={data} />;
    case SectionType.SEARCH:
      return <SearchSection data={data} />;
    case SectionType.FEATURED_PACKAGES:
      return <FeaturedPackagesSection data={data} />;
    case SectionType.DESTINATIONS:
      return <DestinationsSection data={data} />;
    case SectionType.TESTIMONIALS:
      return <TestimonialsSection data={data} />;
    case SectionType.BLOG_PREVIEW:
      return <BlogPreviewSection data={data} />;
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
    default:
      return null;
  }
}

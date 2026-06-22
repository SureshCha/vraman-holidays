import {
  Heart, DollarSign, Compass, ShieldCheck, CalendarCheck, Headphones, BadgeCheck, Leaf,
  Target, Eye, Gem, Mountain, Users, Globe2, Briefcase, GraduationCap, CalendarClock,
  BarChart3, Handshake, Building2, School, CalendarDays, MapPinned, Landmark, Flower2,
  PawPrint, Drama, UtensilsCrossed, PartyPopper, Camera, Sparkles, HeartHandshake, TreePine,
  BookOpen, Scale, MapPin, Phone, Mail, Clock, Check, Star, Globe, Plane,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Curated icon set for admin-entered section content. Keys are stable, lowercase,
 * hyphenated names; admins pick from these in the section editor. Unknown names
 * fall back to a sensible default rather than crashing.
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  heart: Heart,
  "dollar-sign": DollarSign,
  compass: Compass,
  "shield-check": ShieldCheck,
  "calendar-check": CalendarCheck,
  headphones: Headphones,
  "badge-check": BadgeCheck,
  leaf: Leaf,
  target: Target,
  eye: Eye,
  gem: Gem,
  mountain: Mountain,
  users: Users,
  globe: Globe2,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  "calendar-clock": CalendarClock,
  "bar-chart": BarChart3,
  handshake: Handshake,
  building: Building2,
  school: School,
  "calendar-days": CalendarDays,
  "map-pinned": MapPinned,
  landmark: Landmark,
  flower: Flower2,
  paw: PawPrint,
  drama: Drama,
  utensils: UtensilsCrossed,
  party: PartyPopper,
  camera: Camera,
  sparkles: Sparkles,
  "heart-handshake": HeartHandshake,
  tree: TreePine,
  book: BookOpen,
  scale: Scale,
  "map-pin": MapPin,
  phone: Phone,
  mail: Mail,
  clock: Clock,
  check: Check,
  star: Star,
  world: Globe,
  plane: Plane,
};

/** Sorted list of valid icon keys — shown to admins in the section editor. */
export const ICON_KEYS = Object.keys(ICON_MAP).sort();

export function resolveIcon(name: string | undefined | null): LucideIcon {
  if (name && ICON_MAP[name]) return ICON_MAP[name];
  return Sparkles;
}

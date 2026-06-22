import { useState } from "react";
import {
  ArrowRight,
  Beaker,
  Bot,
  Box,
  BrainCircuit,
  Check,
  ChevronRight,
  Cpu,
  Film,
  FlaskConical,
  Lightbulb,
  Mail,
  Menu,
  Package,
  PenTool,
  Rocket,
  Shirt,
  ShoppingBag,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type NavItem = {
  label: string;
  href: string;
};

type FeatureCard = {
  title: string;
  description: string;
  Icon: LucideIcon;
};

type ProductPreview = {
  name: string;
  price: string;
  eyebrow: string;
  Icon: LucideIcon;
  finish: string;
};

type ProjectCard = {
  title: string;
  description: string;
  Icon: LucideIcon;
  accent: string;
};

const navItems: NavItem[] = [
  { label: "Who We Are", href: "#who-we-are" },
  { label: "What We Do", href: "#what-we-do" },
  { label: "Collection", href: "#founder-collection" },
  { label: "Projects", href: "#projects" },
  { label: "Subscribe", href: "#subscribe" },
];

const whatWeDo: FeatureCard[] = [
  {
    title: "Merchandise",
    description:
      "Premium drops, everyday essentials, and brand pieces built with a clean JDZ identity.",
    Icon: Shirt,
  },
  {
    title: "AI Projects",
    description:
      "AI-assisted tools, workflows, and product experiments designed for practical use.",
    Icon: BrainCircuit,
  },
  {
    title: "Digital Experiences",
    description:
      "Websites, content systems, product launches, and interactive brand moments.",
    Icon: PenTool,
  },
  {
    title: "Innovation",
    description:
      "Future-facing ideas across software, commerce, media, food, and automation.",
    Icon: Rocket,
  },
  {
    title: "Custom Solutions",
    description:
      "Flexible builds for brands, creators, family businesses, and new product ideas.",
    Icon: WandSparkles,
  },
];

const founderProducts: ProductPreview[] = [
  {
    name: "Founder Hoodie",
    price: "$88",
    eyebrow: "Heavyweight fleece",
    Icon: Package,
    finish: "Matte black / silver mark",
  },
  {
    name: "Founder Hat",
    price: "$34",
    eyebrow: "Structured cap",
    Icon: Box,
    finish: "Black crown / electric blue detail",
  },
  {
    name: "Founder Shirt",
    price: "$38",
    eyebrow: "Premium cotton",
    Icon: Shirt,
    finish: "White ink / black base",
  },
];

const projects: ProjectCard[] = [
  {
    title: "JDZ Food Lab",
    description:
      "A family-driven food concept for experiments, taste tests, kitchen ideas, and content.",
    Icon: FlaskConical,
    accent: "from-cyan-300/25 to-white/5",
  },
  {
    title: "DraftPilot",
    description:
      "An AI-powered fantasy draft companion focused on strategy, clarity, and better picks.",
    Icon: Bot,
    accent: "from-blue-400/25 to-white/5",
  },
  {
    title: "JDZ Media",
    description:
      "Storytelling, product content, launch campaigns, and digital brand moments.",
    Icon: Film,
    accent: "from-slate-200/20 to-white/5",
  },
  {
    title: "JDZ Innovation Lab",
    description:
      "A workspace for software projects, AI prototypes, commerce ideas, and future builds.",
    Icon: Beaker,
    accent: "from-cyan-200/20 to-blue-500/10",
  },
];

const quickLinks: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Who We Are", href: "#who-we-are" },
  { label: "What We Do", href: "#what-we-do" },
  { label: "Founder Collection", href: "#founder-collection" },
  { label: "Projects", href: "#projects" },
];

const customerCare = ["Contact", "Shipping Updates", "Returns", "Order Support"];

function BrandMark() {
  return (
    <a href="#home" className="flex min-w-0 items-center gap-3" aria-label="JDZ Official home">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-cyan-200/50 bg-white text-xs font-black text-black shadow-[0_0_30px_rgba(64,225,255,0.35)]">
        JDZ
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black uppercase tracking-[0.28em] text-white">
          JDZ Official
        </span>
        <span className="block truncate text-xs uppercase tracking-[0.2em] text-slate-500">
          Family owned tech brand
        </span>
      </span>
    </a>
  );
}

function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-black uppercase leading-[0.98] tracking-normal text-white sm:text-5xl">
        {title}
      </h2>
      {copy ? <p className="mt-5 text-base leading-8 text-slate-400">{copy}</p> : null}
    </div>
  );
}

function PrimaryButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const classes =
    variant === "primary"
      ? "bg-cyan-300 text-black hover:bg-white shadow-[0_0_34px_rgba(64,225,255,0.24)]"
      : "border border-white/15 bg-white/[0.04] text-white hover:border-cyan-200/60 hover:bg-white/[0.08]";

  return (
    <a
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-6 text-sm font-black uppercase tracking-[0.14em] transition duration-300 ${classes}`}
    >
      {children}
    </a>
  );
}

function FeatureCard({ title, description, Icon }: FeatureCard) {
  return (
    <article className="group rounded-md border border-white/10 bg-white/[0.045] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-200/45 hover:bg-white/[0.075]">
      <div className="grid h-12 w-12 place-items-center rounded-md border border-white/10 bg-black text-cyan-300 transition duration-300 group-hover:bg-cyan-300 group-hover:text-black">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-8 text-xl font-black uppercase tracking-normal text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
    </article>
  );
}

function ProductCard({ name, price, eyebrow, Icon, finish }: ProductPreview) {
  return (
    <article className="group overflow-hidden rounded-md border border-white/10 bg-[#080c14] transition duration-300 hover:-translate-y-1 hover:border-cyan-200/50 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
      <div className="relative aspect-[1.05/1] overflow-hidden bg-[radial-gradient(circle_at_60%_20%,rgba(64,225,255,0.24),transparent_34%),linear-gradient(145deg,#101722,#02040a)]">
        <div className="absolute inset-4 rounded-md border border-white/10 bg-black/20" />
        <div className="absolute left-6 top-6 rounded-md border border-white/10 bg-black/55 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
          {eyebrow}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="grid h-24 w-24 place-items-center rounded-md border border-white/15 bg-white text-black shadow-[0_0_50px_rgba(64,225,255,0.28)]">
            <Icon className="h-9 w-9" />
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-normal text-white">
                {name}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{finish}</p>
            </div>
            <span className="text-xl font-black text-cyan-300">{price}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectCard({ title, description, Icon, accent }: ProjectCard) {
  return (
    <article className={`rounded-md border border-white/10 bg-gradient-to-br ${accent} p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-200/45`}>
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-md bg-white text-black">
          <Icon className="h-5 w-5" />
        </div>
        <ChevronRight className="h-5 w-5 text-cyan-300" />
      </div>
      <h3 className="mt-10 text-xl font-black uppercase tracking-normal text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
    </article>
  );
}

export default function JDZBrandStore() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.trim().length > 3) {
      setIsSubscribed(true);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#02040a] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#02040a]/86 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <BrandMark />

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-300 transition hover:bg-white/8 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="#founder-collection"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-cyan-300"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-white lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-white/10 bg-black/95 px-5 py-4 lg:hidden">
            <nav className="grid gap-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md border border-white/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-slate-200"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        ) : null}
      </header>

      <main>
        <section id="home" className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_18%,rgba(64,225,255,0.28),transparent_30%),radial-gradient(circle_at_12%_78%,rgba(255,255,255,0.09),transparent_32%),linear-gradient(140deg,#02040a_0%,#070b11_52%,#010207_100%)]" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-[#02040a] to-transparent" />
          <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-10 px-5 py-14 lg:grid-cols-[1fr_0.92fr] lg:px-8">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/8 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                <Sparkles className="h-4 w-4" />
                JDZ Official
              </div>
              <h1 className="mt-7 max-w-[320px] text-5xl font-black uppercase leading-[0.92] tracking-normal text-white sm:text-7xl lg:max-w-4xl lg:text-8xl">
                Family Built.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-cyan-300">
                  AI Powered.
                </span>
                Future Focused.
              </h1>
              <p className="mt-7 max-w-[320px] text-base leading-8 text-slate-300 lg:max-w-2xl lg:text-lg">
                Building brands, products, experiences, and technology for the
                next generation.
              </p>
              <div className="mt-9 flex max-w-[320px] flex-col gap-3 lg:max-w-full lg:flex-row">
                <PrimaryButton href="#who-we-are">
                  Explore JDZ <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
                <PrimaryButton href="#founder-collection" variant="secondary">
                  Shop Collection
                </PrimaryButton>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[320px] lg:max-w-xl">
              <div className="rounded-md border border-white/12 bg-white/[0.055] p-4 shadow-2xl backdrop-blur-xl">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-cyan-200/25 bg-[linear-gradient(145deg,#0f1722,#03050a)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_28%,rgba(64,225,255,0.25),transparent_34%)]" />
                  <div className="absolute left-0 top-1/2 h-1 w-full -rotate-[35deg] bg-gradient-to-r from-transparent via-white to-cyan-200 opacity-70 blur-[1px]" />
                  <div className="relative flex h-full flex-col justify-between p-7 sm:p-8">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-black/65 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
                        Official Brand System
                      </span>
                      <Cpu className="h-6 w-6 text-cyan-300" />
                    </div>
                    <div>
                      <div className="grid h-36 w-36 place-items-center rounded-md bg-white text-4xl font-black text-black shadow-[0_0_70px_rgba(64,225,255,0.42)] sm:h-44 sm:w-44 sm:text-5xl">
                        JDZ
                      </div>
                      <p className="mt-7 max-w-sm text-2xl font-black uppercase leading-none text-white sm:text-3xl">
                        Merchandise. Software. Media. Innovation.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-200 sm:gap-3">
                      {["AI", "Family", "Future"].map((item) => (
                        <span key={item} className="rounded-md border border-white/10 bg-black/45 p-3">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="who-we-are" className="border-y border-white/10 bg-[#050913] py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <SectionHeading
              eyebrow="Who We Are"
              title="A family-owned company driven by innovation and purpose."
              copy="JDZ Official brings together AI, merchandise, digital products, software projects, and future-facing ideas under one premium brand."
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["01", "Family-owned"],
                ["02", "AI-powered"],
                ["03", "Built for what is next"],
              ].map(([number, label]) => (
                <div key={number} className="rounded-md border border-white/10 bg-white/[0.045] p-5">
                  <span className="text-sm font-black text-cyan-300">{number}</span>
                  <p className="mt-14 text-xl font-black uppercase leading-tight tracking-normal">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="what-we-do" className="bg-[#02040a] py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading
              eyebrow="What We Do"
              title="Commerce, software, experiences, and innovation in one brand ecosystem."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {whatWeDo.map((item) => (
                <FeatureCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section id="founder-collection" className="border-y border-white/10 bg-[#070b12] py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading
                eyebrow="Founder Collection"
                title="The first official JDZ drop."
                copy="A premium preview of the hoodie, hat, and shirt that introduce the JDZ Official merch line."
              />
              <PrimaryButton href="#subscribe">
                Shop Now <ShoppingBag className="h-4 w-4" />
              </PrimaryButton>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {founderProducts.map((product) => (
                <ProductCard key={product.name} {...product} />
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="bg-[#02040a] py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading
              eyebrow="Our Projects"
              title="A growing portfolio of family-built ideas."
              copy="JDZ Official is designed to hold multiple products, brands, and experiments as the company grows."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {projects.map((project) => (
                <ProjectCard key={project.title} {...project} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="subscribe" className="border-t border-white/10 bg-black py-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[1.1fr_0.75fr_0.75fr_1.1fr] lg:px-8">
          <div>
            <BrandMark />
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-500">
              Family Built. AI Powered. Future Focused. Building brands,
              products, experiences, and technology for the next generation.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">
              Quick Links
            </h3>
            <div className="mt-5 grid gap-3">
              {quickLinks.map((item) => (
                <a key={item.href} href={item.href} className="text-sm text-slate-500 transition hover:text-cyan-300">
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">
              Customer Care
            </h3>
            <div className="mt-5 grid gap-3">
              {customerCare.map((item) => (
                <a key={item} href="#subscribe" className="text-sm text-slate-500 transition hover:text-cyan-300">
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">
              Email Subscribe
            </h3>
            <p className="mt-5 text-sm leading-7 text-slate-500">
              Get collection updates, project news, and JDZ launch notes.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setIsSubscribed(false);
                }}
                className="min-h-12 min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.045] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300"
                placeholder="Email address"
                type="email"
              />
              <button
                type="button"
                onClick={handleSubscribe}
                className="grid h-12 w-12 place-items-center rounded-md bg-cyan-300 text-black transition hover:bg-white"
                aria-label="Subscribe"
              >
                {isSubscribed ? <Check className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
              </button>
            </div>
            {isSubscribed ? (
              <p className="mt-3 text-sm font-semibold text-cyan-300">
                You are on the JDZ Official list.
              </p>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}

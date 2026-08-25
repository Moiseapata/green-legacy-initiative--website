import { useMemo, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  ExternalLink,
  Heart,
  Leaf,
  Mail,
  MapPin,
  Menu,
  Minus,
  Plus,
  Send,
  ShieldCheck,
  TreePine,
  Users,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { siteContent, type Project } from '@/content/site-content';

const money = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

type ContactForm = { name: string; email: string; subject: string; message: string };
type VolunteerForm = { name: string; email: string; location: string; availability: string; message: string };
type NewsletterForm = { email: string };

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function fieldError(errors: Record<string, { message?: string } | undefined>, key: string) {
  return errors[key]?.message ?? 'Ce champ est requis.';
}

// Chiffres d'impact publiés (dernier bilan de terrain). À mettre à jour manuellement
// après chaque saison — voir content/home.md pour le récit associé.
const impactSummary = {
  hectaresRestored: 77.8,
  schoolsEngaged: 23,
  survivalRate: 85,
  treesPlanted: 18400,
  contactEmail: siteContent.brand.email,
  donationUrl: null as string | null,
};

// Envoie une soumission à Netlify Forms (https://docs.netlify.com/forms/setup/).
// Nécessite un formulaire caché portant le même `name` quelque part dans le HTML statique
// (voir les <form> masqués tout en bas de ce fichier) pour que Netlify le détecte au build.
async function submitToNetlifyForm(formName: string, data: Record<string, string>): Promise<void> {
  const body = new URLSearchParams({ 'form-name': formName, ...data }).toString();
  const response = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) {
    throw new Error(`Netlify form submission failed: ${response.status}`);
  }
}

function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const [filter, setFilter] = useState('Tous');
  const [amount, setAmount] = useState(30);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const impactValue = impactSummary;
  const [contactPending, setContactPending] = useState(false);
  const [volunteerPending, setVolunteerPending] = useState(false);
  const [newsletterPending, setNewsletterPending] = useState(false);
  const [contactError, setContactError] = useState(false);
  const [volunteerError, setVolunteerError] = useState(false);
  const [newsletterError, setNewsletterError] = useState(false);
  const [contactSent, setContactSent] = useState<string | null>(null);
  const [volunteerSent, setVolunteerSent] = useState<string | null>(null);
  const [newsletterSent, setNewsletterSent] = useState<string | null>(null);

  const contactForm = useForm<ContactForm>({ defaultValues: { name: '', email: '', subject: '', message: '' } });
  const volunteerForm = useForm<VolunteerForm>({ defaultValues: { name: '', email: '', location: '', availability: '', message: '' } });
  const newsletterForm = useForm<NewsletterForm>({ defaultValues: { email: '' } });
  const filteredProjects = useMemo<Project[]>(() => filter === 'Tous' ? siteContent.projects : siteContent.projects.filter((project) => project.tag === filter), [filter]);
  const trees = Math.round(amount / 0.3);
  const co2 = trees * 22;
  const heroStats = [
    { value: impactValue ? decimal.format(impactValue.hectaresRestored) : '77,8', label: 'hectares restaurés' },
    { value: impactValue ? money.format(impactValue.schoolsEngaged) : '23', label: 'écoles partenaires' },
    { value: impactValue ? `${decimal.format(impactValue.survivalRate)} %` : '85 %', label: 'de survie des plants' },
  ];

  const navItems = [['Notre action', 'action'], ['Programmes', 'programmes'], ['Sur le terrain', 'terrain'], ['Agir', 'don'], ['Journal', 'journal']];
  const submitContact = async (values: ContactForm) => {
    setContactSent(null);
    setContactError(false);
    setContactPending(true);
    try {
      await submitToNetlifyForm('contact', values);
      setContactSent('Merci, votre message est bien parti. Nous revenons vers vous rapidement.');
      contactForm.reset();
    } catch {
      setContactError(true);
      setContactSent('Votre message n’a pas pu partir. Réessayez dans un instant.');
    } finally {
      setContactPending(false);
    }
  };
  const submitVolunteer = async (values: VolunteerForm) => {
    setVolunteerSent(null);
    setVolunteerError(false);
    setVolunteerPending(true);
    try {
      await submitToNetlifyForm('volunteer', { ...values, message: values.message || '' });
      setVolunteerSent('Merci ! Votre demande de bénévolat a bien été reçue.');
      volunteerForm.reset();
    } catch {
      setVolunteerError(true);
      setVolunteerSent('Votre demande n’a pas pu partir. Réessayez dans un instant.');
    } finally {
      setVolunteerPending(false);
    }
  };
  const submitNewsletter = async (values: NewsletterForm) => {
    setNewsletterSent(null);
    setNewsletterError(false);
    setNewsletterPending(true);
    try {
      await submitToNetlifyForm('newsletter', values);
      setNewsletterSent('Merci, votre inscription est enregistrée.');
      newsletterForm.reset();
    } catch {
      setNewsletterError(true);
      setNewsletterSent('L’inscription n’a pas pu être enregistrée. Réessayez dans un instant.');
    } finally {
      setNewsletterPending(false);
    }
  };

  return (
    <div className="page-shell noise">
      <header className="header-scrolled fixed top-0 z-40 w-full border-b border-[hsl(var(--border)/.65)]">
        <div className="section-wrap flex h-[72px] items-center justify-between">
          <button className="flex items-center gap-3 text-left" onClick={() => scrollToId('accueil')} data-testid="button-logo" aria-label="Revenir à l'accueil">
            <img src="/images/gli-logo.jpeg" alt="Logo officiel de Green Legacy Initiative" className="h-10 w-10 rounded-full object-cover ring-1 ring-[hsl(var(--primary)/.14)]" data-testid="img-logo" />
            <span className="leading-none"><span className="block font-bold tracking-[-.03em] text-[hsl(var(--primary))]">GREEN LEGACY</span><span className="mt-1 block text-[.58rem] font-semibold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">{siteContent.brand.strapline}</span></span>
          </button>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Navigation principale">
            {navItems.map(([label, id]) => <button key={id} className="nav-link" onClick={() => scrollToId(id)} data-testid={`link-nav-${id}`}>{label}</button>)}
          </nav>
          <div className="hidden md:block"><button className="btn-primary" onClick={() => scrollToId('don')} data-testid="button-header-donate">Soutenir un projet <ArrowUpRight size={16} /></button></div>
          <button className="rounded-full p-2 text-[hsl(var(--primary))] md:hidden" aria-label={navOpen ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={() => setNavOpen(!navOpen)} data-testid="button-mobile-menu">{navOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
        {navOpen && <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-5 md:hidden"><nav className="flex flex-col gap-4">{navItems.map(([label, id]) => <button key={id} className="nav-link text-left" onClick={() => { scrollToId(id); setNavOpen(false); }} data-testid={`link-mobile-nav-${id}`}>{label}</button>)}<button className="btn-primary mt-2 w-full" onClick={() => { scrollToId('don'); setNavOpen(false); }} data-testid="button-mobile-donate">Soutenir un projet <ArrowUpRight size={16} /></button></nav></div>}
      </header>

      <main>
        <section id="accueil" className="relative overflow-hidden bg-[hsl(var(--primary))] pt-[72px] text-[hsl(var(--primary-foreground))]">
          <div className="absolute -right-24 top-16 h-72 w-72 rounded-full border border-[hsl(var(--accent)/.25)] hero-orb" /><div className="absolute -right-8 top-28 h-44 w-44 rounded-full border border-[hsl(var(--accent)/.22)]" />
          <div className="section-wrap grid min-h-[680px] items-center gap-12 py-16 lg:grid-cols-[1.02fr_.98fr] lg:py-24">
            <div className="relative z-10"><div className="reveal mb-7 flex items-center gap-3 text-[hsl(var(--accent))]"><span className="h-px w-9 bg-[hsl(var(--accent))]" /><span className="eyebrow">{siteContent.hero.eyebrow}</span></div>
              <h1 className="display reveal max-w-[700px] text-[clamp(3.4rem,7.5vw,7.2rem)] leading-[.88] tracking-[-.065em]">{siteContent.hero.title.split(', ').map((line, index) => <span className={index === 1 ? 'block text-[hsl(var(--accent))]' : 'block'} key={line}>{index === 1 ? `${line}` : `${line},`}</span>)}</h1>
              <p className="reveal reveal-delay-2 mt-8 max-w-[540px] text-lg leading-relaxed text-[hsl(var(--primary-foreground)/.72)]">{siteContent.hero.body}</p>
              <div className="reveal reveal-delay-3 mt-9 flex flex-wrap items-center gap-4"><button className="btn-primary" onClick={() => scrollToId('don')} data-testid="button-hero-donate">Planter l’avenir <ArrowDownRight size={17} /></button><button className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground)/.75)] transition-colors hover:text-[hsl(var(--accent))]" onClick={() => scrollToId('action')} data-testid="button-hero-discover">Découvrir notre méthode <ArrowDownRight size={16} /></button></div>
              <div className="mt-16 grid max-w-[550px] grid-cols-3 gap-5">{heroStats.map((stat, index) => <div className={index > 0 ? 'hero-stat' : ''} key={stat.label}><div className="display text-3xl font-semibold" data-testid={`text-hero-stat-${index}`}>{stat.value}</div><div className="mt-1 text-xs text-[hsl(var(--primary-foreground)/.55)]">{stat.label}</div></div>)}</div>

            </div>
            <div className="relative mx-auto w-full max-w-[530px] lg:ml-auto"><div className="image-frame aspect-[.9] rotate-[2deg] border-[10px] border-[hsl(var(--primary-foreground)/.08)] shadow-2xl shadow-black/20"><img src="/images/gle-solibra-mondoukro.jpg" alt="Élèves et équipes réunis lors du reboisement de Mondoukro" data-testid="img-hero-forest" /></div><div className="absolute -bottom-5 -left-5 max-w-[220px] rounded-2xl bg-[hsl(var(--accent))] p-5 text-[hsl(var(--accent-foreground))] shadow-xl"><div className="mb-5 flex items-center justify-between"><MapPin size={18} /><span className="eyebrow !text-[hsl(var(--accent-foreground))]">Côte d’Ivoire</span></div><p className="display text-xl leading-tight">« {siteContent.hero.quote} »</p><p className="mt-3 text-xs font-semibold opacity-70">— {siteContent.hero.quoteBy}</p></div></div>
          </div>
          <div className="section-wrap flex items-center justify-between border-t border-[hsl(var(--primary-foreground)/.16)] py-5 text-xs text-[hsl(var(--primary-foreground)/.54)]"><span>{siteContent.brand.locations}</span><span className="hidden items-center gap-2 md:flex"><span className={`h-2 w-2 rounded-full ${false ? 'bg-[hsl(var(--accent)/.45)]' : 'animate-pulse bg-[hsl(var(--accent))]'}`} /> Données de suivi mises à jour chaque saison</span></div>
        </section>

        <section id="action" className="section-pad paper-grid bg-[hsl(var(--background))]"><div className="section-wrap grid items-start gap-12 lg:grid-cols-[.72fr_1.28fr]"><div className="lg:sticky lg:top-28"><p className="eyebrow mb-4">Pourquoi nous existons</p><h2 className="display max-w-[410px] text-5xl leading-[.97] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">Replanter, c’est transmettre.</h2><p className="mt-6 max-w-[380px] text-[hsl(var(--muted-foreground))] leading-relaxed">La déforestation se mesure en hectares. La réparation, elle, se construit dans les gestes quotidiens : une graine choisie, une classe qui s’engage, une communauté qui veille.</p><button className="btn-secondary mt-7" onClick={() => scrollToId('terrain')} data-testid="button-action-field-notes">Voir nos traces de terrain <ArrowDownRight size={16} /></button></div><div className="grid gap-8 md:grid-cols-2"><div className="image-frame aspect-[.9] md:mt-20"><img src="/images/gle-solibra-samoukaha.jpg" alt="Élèves et équipes lors du reboisement de Samoukaha avec SOLIBRA" data-testid="img-action-school" /></div><div className="md:pt-4"><span className="display text-7xl font-semibold text-[hsl(var(--accent))]" data-testid="text-trees-summary">{impactValue ? money.format(impactValue.treesPlanted) : '18 400'}</span><p className="mt-1 text-sm font-bold uppercase tracking-[.12em] text-[hsl(var(--primary))]">arbres plantés ensemble</p><div className="my-8 h-px bg-[hsl(var(--border))]" /><p className="text-[hsl(var(--muted-foreground))] leading-relaxed">Notre travail commence par l’écoute. Les essences sont choisies avec les habitants, les parcelles sont cartographiées et les arbres sont suivis après la photo du jour de plantation.</p><div className="mt-8 flex items-start gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" size={19} /><p className="text-sm font-semibold leading-relaxed text-[hsl(var(--primary))]">Des résultats documentés, des histoires racontées sans détour.</p></div></div></div></div></section>

        <section id="programmes" className="section-pad bg-[hsl(var(--background))]"><div className="section-wrap"><div className="mb-14 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow mb-4">Notre façon de faire</p><h2 className="display max-w-[620px] text-5xl leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">Cinq chemins vers<br /><span className="text-[hsl(var(--accent))]">une forêt vivante.</span></h2></div><p className="max-w-[290px] text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">Du premier plant au suivi de survie, chaque programme relie nature, transmission et autonomie locale.</p></div><div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-5">{siteContent.programs.map((program) => { const Icon = program.icon; return <article className="program-card" key={program.number} data-testid={`card-program-${program.number}`}><div className="mb-8 flex items-start justify-between"><span className="program-number">{program.number}</span><Icon size={25} strokeWidth={1.5} className="text-[hsl(var(--primary))]" /></div><h3 className="display text-2xl leading-tight text-[hsl(var(--primary))]">{program.title}</h3><p className="mt-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{program.text}</p></article>; })}</div></div></section>

      <section id="terrain" className="section-pad bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><div className="section-wrap"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow mb-4 !text-[hsl(var(--accent))]">Carnet de terrain</p><h2 className="display text-5xl leading-[.96] tracking-[-.05em] md:text-6xl">Les parcelles ont<br /><span className="text-[hsl(var(--accent))]">une adresse.</span></h2></div><p className="max-w-[330px] text-sm leading-relaxed text-[hsl(var(--primary-foreground)/.65)]">Des projets réels, en Côte d’Ivoire. Pas de carte vague : chaque image correspond à une équipe, une école ou un village.</p></div><div className="mt-10 flex flex-wrap gap-2">{['Tous', 'Écoles', 'Partenariats', 'Communautés', 'Forêts', 'Littoral'].map((item) => <button key={item} className={`filter-btn ${filter === item ? 'active' : ''} border-[hsl(var(--primary-foreground)/.22)] text-[hsl(var(--primary-foreground)/.68)]`} onClick={() => setFilter(item)} data-testid={`button-filter-${item.toLowerCase()}`}>{item}</button>)}</div><div className="mt-8 grid gap-5 md:grid-cols-2">{filteredProjects.map((project) => <article className="project-card border-[hsl(var(--primary-foreground)/.12)] bg-[hsl(var(--primary-foreground)/.08)]" key={project.id} data-testid={`card-project-${project.id}`}><div className="project-img"><img src={project.image} alt={project.title} data-testid={`img-project-${project.id}`} /></div><div className="p-5"><div className="flex items-center justify-between gap-3"><span className="eyebrow !text-[hsl(var(--accent))]">{project.tag}</span><span className="text-xs text-[hsl(var(--primary-foreground)/.5)]">{project.place}</span></div><h3 className="display mt-3 text-2xl">{project.title}</h3><p className="mt-2 text-sm leading-relaxed text-[hsl(var(--primary-foreground)/.64)]">{project.text}</p><button className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--accent))]" onClick={() => scrollToId('don')} data-testid={`button-project-support-${project.id}`}>Soutenir ce terrain <ArrowUpRight size={14} /></button></div></article>)}</div><div className="mt-12 flex items-center gap-3 text-sm text-[hsl(var(--primary-foreground)/.55)]"><MapPin size={16} className="text-[hsl(var(--accent))]" /> 100 % des projets présentés ici sont en Côte d’Ivoire.</div></div></section>

        <section id="don" className="section-pad paper-grid bg-[hsl(var(--background))]"><div className="section-wrap grid items-center gap-14 lg:grid-cols-[.9fr_1.1fr]"><div><p className="eyebrow mb-4">Faire grandir une forêt</p><h2 className="display text-5xl leading-[.95] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">Chaque geste<br />laisse une trace.</h2><p className="mt-6 max-w-[420px] leading-relaxed text-[hsl(var(--muted-foreground))]">Notre modèle est simple à comprendre, parce que la confiance commence par la clarté. Explorez l’impact indicatif de votre don.</p><div className="mt-9 grid max-w-[420px] gap-3 text-sm text-[hsl(var(--foreground)/.72)]">{['0,30 € par arbre planté', '22 kg de CO₂ captés par arbre / an', 'Suivi de survie après chaque saison sèche'].map((item) => <div className="flex items-center gap-3" key={item}><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--accent)/.23)] text-[hsl(var(--primary))]"><Check size={15} /></span>{item}</div>)}</div></div><div className="rounded-[1.5rem] bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] shadow-xl shadow-[hsl(var(--primary)/.16)] md:p-10" data-testid="calculator-donation"><div className="flex items-start justify-between gap-5"><div><p className="eyebrow !text-[hsl(var(--accent))]">Calculateur d’impact</p><p className="mt-3 text-sm text-[hsl(var(--primary-foreground)/.65)]">Votre contribution</p></div><span className="rounded-full border border-[hsl(var(--primary-foreground)/.2)] px-3 py-1 text-xs text-[hsl(var(--primary-foreground)/.62)]">simulation</span></div><div className="mt-5 flex items-end justify-between"><span className="display text-6xl font-semibold text-[hsl(var(--accent))]" data-testid="text-donation-amount">{money.format(amount)} €</span><div className="flex gap-1"><button onClick={() => setAmount(Math.max(5, amount - 5))} className="rounded-full border border-[hsl(var(--primary-foreground)/.25)] p-2 hover:bg-[hsl(var(--primary-foreground)/.1)]" aria-label="Diminuer le don" data-testid="button-decrease-donation"><Minus size={15} /></button><button onClick={() => setAmount(Math.min(250, amount + 5))} className="rounded-full border border-[hsl(var(--primary-foreground)/.25)] p-2 hover:bg-[hsl(var(--primary-foreground)/.1)]" aria-label="Augmenter le don" data-testid="button-increase-donation"><Plus size={15} /></button></div></div><input className="mt-7 w-full accent-[hsl(var(--accent))]" type="range" min="5" max="250" step="5" value={amount} onChange={(event) => setAmount(Number(event.target.value))} aria-label="Montant du don" data-testid="input-donation-slider" /><div className="mt-3 flex justify-between text-xs text-[hsl(var(--primary-foreground)/.48)]"><span>5 €</span><span>250 €</span></div><div className="my-8 h-px bg-[hsl(var(--primary-foreground)/.16)]" /><div className="grid grid-cols-2 gap-4"><div className="rounded-xl bg-[hsl(var(--primary-foreground)/.08)] p-4"><TreePine size={18} className="mb-4 text-[hsl(var(--accent))]" /><span className="display block text-3xl font-semibold" data-testid="text-calculated-trees">{money.format(trees)}</span><span className="text-xs text-[hsl(var(--primary-foreground)/.56)]">arbres plantés</span></div><div className="rounded-xl bg-[hsl(var(--primary-foreground)/.08)] p-4"><Leaf size={18} className="mb-4 text-[hsl(var(--accent))]" /><span className="display block text-3xl font-semibold" data-testid="text-calculated-co2">{decimal.format(co2)} kg</span><span className="text-xs text-[hsl(var(--primary-foreground)/.56)]">CO₂ / an, indicatif</span></div></div><button className="btn-primary mt-7 w-full" onClick={() => { const target = impactValue?.donationUrl; if (target) window.open(target, '_blank', 'noopener,noreferrer'); else scrollToId('contact'); }} data-testid="button-donate-now">Je veux contribuer <Heart size={16} /></button><p className="mt-3 text-center text-[.68rem] text-[hsl(var(--primary-foreground)/.46)]">Le paiement sécurisé sera proposé lors de la prochaine étape.</p></div></div></section>

      <section id="journal" className="section-pad bg-[hsl(var(--secondary))]"><div className="section-wrap"><div className="flex items-end justify-between gap-5"><div><p className="eyebrow mb-4">Le journal</p><h2 className="display text-5xl leading-[.95] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">Nouvelles du<br /><span className="text-[hsl(var(--accent))]">vivant.</span></h2></div><button className="btn-secondary hidden md:inline-flex" onClick={() => scrollToId('newsletter')} data-testid="button-journal-newsletter">Recevoir les nouvelles <Mail size={15} /></button></div><div className="mt-12 grid gap-6 md:grid-cols-[1.18fr_.82fr_.82fr]"><article className="group overflow-hidden rounded-2xl bg-[hsl(var(--background))]"><div className="image-frame aspect-[1.55]"><img src="/images/gle-solibra-plantation.jpg" alt="Plantation suivie avec les élèves lors du partenariat SOLIBRA" data-testid="img-journal-plot" /></div><div className="p-6"><div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><CalendarDays size={14} /> 18 juin 2026 · Récit</div><h3 className="display mt-4 text-3xl leading-tight text-[hsl(var(--primary))]">Le jour où la parcelle a changé de couleur</h3><p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">À Mondoukro et Samoukaha, les élèves apprennent à faire grandir les arbres et le territoire.</p><button className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]" onClick={() => scrollToId('contact')} data-testid="button-read-story">Lire le carnet <ArrowUpRight size={14} /></button></div></article><article className="rounded-2xl bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))]"><span className="eyebrow !text-[hsl(var(--accent))]">Chiffre du mois</span><span className="display mt-12 block text-7xl text-[hsl(var(--accent))]" data-testid="text-journal-survival">{impactValue ? `${decimal.format(impactValue.survivalRate)} %` : '85 %'}</span><h3 className="display mt-3 text-2xl">des plants passent leur première saison sèche.</h3><p className="mt-5 text-sm leading-relaxed text-[hsl(var(--primary-foreground)/.62)]">Nous mesurons ce qui compte pour améliorer la prochaine parcelle, pas pour embellir le bilan.</p></article><article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6"><span className="eyebrow">À lire avec une classe</span><h3 className="display mt-16 text-3xl leading-tight text-[hsl(var(--primary))]">Le petit guide des arbres de chez nous</h3><p className="mt-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">Reconnaître une essence, comprendre son rôle, raconter sa saison.</p><button className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]" onClick={() => scrollToId('contact')} data-testid="button-download-guide">Demander le guide <ExternalLink size={14} /></button></article></div></div></section>

        <section id="contact" className="section-pad bg-[hsl(var(--background))]"><div className="section-wrap grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow mb-4">Passer à l’action</p><h2 className="display text-5xl leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">Votre place<br />est ici.</h2><p className="mt-6 max-w-[380px] leading-relaxed text-[hsl(var(--muted-foreground))]">Un projet, une question, une envie de retrousser vos manches ? Écrivez-nous. Notre coordination relie Genève et Abidjan, au plus près des équipes et des territoires.</p><div className="mt-8 flex items-center gap-3 text-sm font-semibold text-[hsl(var(--primary))]"><MapPin size={18} className="text-[hsl(var(--accent))]" /> Genève · Abidjan</div></div><div className="grid gap-5 md:grid-cols-2"><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent)/.2)] text-[hsl(var(--primary))]"><Users size={19} /></span><h3 className="display text-2xl text-[hsl(var(--primary))]">Devenir bénévole</h3></div>{volunteerSent ? <StatusMessage message={volunteerSent} success={!volunteerError} testId="status-volunteer-result" onReset={() => setVolunteerSent(null)} /> : <form onSubmit={volunteerForm.handleSubmit(submitVolunteer)} noValidate><label className="form-label" htmlFor="volunteer-name">Votre prénom</label><input id="volunteer-name" className="form-field mb-1" placeholder="Aminata" {...volunteerForm.register('name', { required: true, minLength: 2 })} data-testid="input-volunteer-name" />{volunteerForm.formState.errors.name && <ErrorText>{fieldError(volunteerForm.formState.errors, 'name')}</ErrorText>}<label className="form-label mt-3" htmlFor="volunteer-email">Votre email</label><input id="volunteer-email" type="email" className="form-field mb-1" placeholder="vous@exemple.ci" {...volunteerForm.register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })} data-testid="input-volunteer-email" />{volunteerForm.formState.errors.email && <ErrorText>Entrez une adresse email valide.</ErrorText>}<label className="form-label mt-3" htmlFor="volunteer-location">Votre ville</label><input id="volunteer-location" className="form-field mb-1" placeholder="Grand-Bassam" {...volunteerForm.register('location', { required: true, minLength: 2 })} data-testid="input-volunteer-location" />{volunteerForm.formState.errors.location && <ErrorText>Indiquez votre ville.</ErrorText>}<label className="form-label mt-3" htmlFor="volunteer-availability">Disponibilités</label><input id="volunteer-availability" className="form-field mb-1" placeholder="Samedis, saison des pluies..." {...volunteerForm.register('availability', { required: true, minLength: 2 })} data-testid="input-volunteer-availability" /><label className="form-label mt-3" htmlFor="volunteer-message">Un mot pour l’équipe <span className="font-normal opacity-60">(facultatif)</span></label><textarea id="volunteer-message" className="form-field mb-4 min-h-[86px] resize-none" placeholder="Ce que vous aimeriez transmettre..." {...volunteerForm.register('message')} data-testid="input-volunteer-message" /><button className="btn-primary w-full" type="submit" disabled={volunteerPending} data-testid="button-submit-volunteer">{volunteerPending ? 'Envoi en cours…' : 'Rejoindre l’équipe'} {!volunteerPending && <ArrowUpRight size={15} />}</button></form>}</div>
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent)/.2)] text-[hsl(var(--primary))]"><Send size={18} /></span><h3 className="display text-2xl text-[hsl(var(--primary))]">Nous écrire</h3></div>{contactSent ? <StatusMessage message={contactSent} success={!contactError} testId="status-contact-result" onReset={() => setContactSent(null)} /> : <form onSubmit={contactForm.handleSubmit(submitContact)} noValidate><label className="form-label" htmlFor="contact-name">Votre nom</label><input id="contact-name" className="form-field mb-1" placeholder="Aminata Koné" {...contactForm.register('name', { required: true, minLength: 2 })} data-testid="input-contact-name" />{contactForm.formState.errors.name && <ErrorText>Indiquez votre nom.</ErrorText>}<label className="form-label mt-3" htmlFor="contact-email">Votre email</label><input id="contact-email" type="email" className="form-field mb-1" placeholder="vous@exemple.ci" {...contactForm.register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })} data-testid="input-contact-email" />{contactForm.formState.errors.email && <ErrorText>Entrez une adresse email valide.</ErrorText>}<label className="form-label mt-3" htmlFor="contact-subject">Sujet</label><input id="contact-subject" className="form-field mb-1" placeholder="Un projet à imaginer ensemble" {...contactForm.register('subject', { required: true, minLength: 2 })} data-testid="input-contact-subject" /><label className="form-label mt-3" htmlFor="contact-message">Votre message</label><textarea id="contact-message" className="form-field mb-4 min-h-[104px] resize-none" required placeholder="Je souhaite en savoir plus…" {...contactForm.register('message', { required: true, minLength: 10 })} data-testid="input-contact-message" />{contactForm.formState.errors.message && <ErrorText>Votre message doit contenir au moins 10 caractères.</ErrorText>}<button className="btn-primary w-full" type="submit" disabled={contactPending} data-testid="button-submit-contact">{contactPending ? 'Envoi en cours…' : 'Envoyer le message'} {!contactPending && <Send size={15} />}</button></form>}</div></div></div></section>

        <section id="faq" className="section-pad bg-[hsl(var(--secondary))]"><div className="section-wrap grid gap-12 lg:grid-cols-[.75fr_1.25fr]"><div><p className="eyebrow mb-4">Questions fréquentes</p><h2 className="display text-5xl leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">Parlons<br />clair.</h2><p className="mt-6 max-w-[310px] text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">La transparence n’est pas une page à part. C’est la manière dont nous travaillons.</p></div><div>{siteContent.faqs.map((faq, index) => <div className="faq-row" key={faq.q}><button className="faq-trigger" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index} data-testid={`button-faq-${index}`}><span>{faq.q}</span><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--border))] transition-transform ${openFaq === index ? 'rotate-180 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : ''}`}>{openFaq === index ? <Minus size={14} /> : <ChevronDown size={14} />}</span></button>{openFaq === index && <p className="faq-answer" data-testid={`text-faq-answer-${index}`}>{faq.a}</p>}</div>)}</div></div></section>
      </main>

      <footer id="newsletter" className="bg-[hsl(var(--primary))] py-14 text-[hsl(var(--primary-foreground))]"><div className="section-wrap"><div className="grid gap-10 border-b border-[hsl(var(--primary-foreground)/.16)] pb-12 md:grid-cols-[1fr_1fr] md:items-end"><div><div className="flex items-center gap-3"><img src="/images/gli-logo.jpeg" alt="Logo officiel de Green Legacy Initiative" className="h-10 w-10 rounded-full object-cover" /><span className="font-bold tracking-[-.03em]">GREEN LEGACY</span></div><h2 className="display mt-7 max-w-[510px] text-4xl leading-tight md:text-5xl">Une lettre, de vraies nouvelles du terrain.</h2></div><div>{newsletterSent ? <StatusMessage message={newsletterSent} success={!newsletterError} testId="status-newsletter-result" onReset={() => setNewsletterSent(null)} /> : <form className="flex flex-col gap-3 sm:flex-row" onSubmit={newsletterForm.handleSubmit(submitNewsletter)} noValidate><label className="sr-only" htmlFor="newsletter-email">Votre adresse email</label><input id="newsletter-email" className="form-field flex-1 border-[hsl(var(--primary-foreground)/.2)] bg-[hsl(var(--primary-foreground)/.08)] text-[hsl(var(--primary-foreground))] placeholder:text-[hsl(var(--primary-foreground)/.45)]" type="email" required placeholder="Votre adresse email" {...newsletterForm.register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })} data-testid="input-newsletter-email" /><button className="btn-primary" type="submit" disabled={newsletterPending} data-testid="button-submit-newsletter">{newsletterPending ? 'Inscription…' : 'S’inscrire'} {!newsletterPending && <Mail size={15} />}</button></form>}{newsletterForm.formState.errors.email && <ErrorText>Entrez une adresse email valide.</ErrorText>}<p className="mt-3 text-xs text-[hsl(var(--primary-foreground)/.45)]">Un récit par mois. Jamais de bruit, toujours du concret.</p></div></div><div className="grid gap-8 py-10 sm:grid-cols-3"><div><p className="eyebrow !text-[hsl(var(--accent))]">Explorer</p><div className="mt-4 flex flex-col gap-3"><button className="footer-link text-left" onClick={() => scrollToId('action')} data-testid="link-footer-action">Notre action</button><button className="footer-link text-left" onClick={() => scrollToId('programmes')} data-testid="link-footer-programs">Nos programmes</button><button className="footer-link text-left" onClick={() => scrollToId('terrain')} data-testid="link-footer-terrain">Carnet de terrain</button></div></div><div><p className="eyebrow !text-[hsl(var(--accent))]">Agir</p><div className="mt-4 flex flex-col gap-3"><button className="footer-link text-left" onClick={() => scrollToId('don')} data-testid="link-footer-donate">Faire un don</button><button className="footer-link text-left" onClick={() => scrollToId('contact')} data-testid="link-footer-volunteer">Devenir bénévole</button><button className="footer-link text-left" onClick={() => scrollToId('faq')} data-testid="link-footer-faq">Questions fréquentes</button></div></div><div><p className="eyebrow !text-[hsl(var(--accent))]">Nous trouver</p><div className="mt-4 flex flex-col gap-3 text-sm text-[hsl(var(--primary-foreground)/.65)]"><span>Abidjan, Côte d’Ivoire</span><span data-testid="text-contact-email">{impactValue?.contactEmail ?? siteContent.brand.email}</span><span>Instagram · LinkedIn</span></div></div></div><div className="flex flex-col justify-between gap-3 border-t border-[hsl(var(--primary-foreground)/.16)] pt-6 text-xs text-[hsl(var(--primary-foreground)/.42)] md:flex-row"><span>© 2026 Green Legacy Initiative. Une forêt se construit ensemble.</span><span>ONG basée à Genève · actions de terrain en Côte d’Ivoire.</span></div></div></footer>
    </div>
  );
}

function ErrorText({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs text-[hsl(var(--destructive))]" role="alert">{children}</p>;
}

function StatusMessage({ message, success, testId, onReset }: { message: string; success: boolean; testId: string; onReset: () => void }) {
  return <div className={`rounded-xl p-5 text-sm leading-relaxed ${success ? 'status-success' : 'status-error'}`} aria-live="polite" data-testid={testId}><div className="flex items-start gap-3">{success ? <Check size={20} /> : <X size={20} />}<span>{message}</span></div><button className="mt-4 text-xs font-bold underline underline-offset-4" onClick={onReset} data-testid={`${testId}-retry`}>{success ? 'Envoyer un autre message' : 'Réessayer'}</button></div>;
}

function Router() {
  return <Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch>;
}

function App() {
  const [location] = useLocation();
  return <TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary resetKey={location}><Router /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider>;
}

export default App;
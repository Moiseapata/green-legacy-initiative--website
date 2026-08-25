import {
  BookOpen,
  Leaf,
  Sprout,
  TreePine,
  Users,
  type LucideIcon,
} from 'lucide-react';
import homeMarkdown from './home.md?raw';

type MarkdownDocument = {
  metadata: Record<string, string>;
  body: string;
};

function parseMarkdownDocument(markdown: string): MarkdownDocument {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    return { metadata: {}, body: markdown.trim() };
  }

  const metadata = Object.fromEntries(
    match[1]
      .split('\n')
      .map((line) => {
        const separator = line.indexOf(':');
        return separator === -1
          ? [line, '']
          : [
              line.slice(0, separator).trim(),
              line.slice(separator + 1).trim(),
            ];
      })
      .filter(([key]) => key),
  );

  return { metadata, body: match[2].trim() };
}

const homeDocument = parseMarkdownDocument(homeMarkdown);
const heroBody =
  homeDocument.body.split(/\n##\s+/)[0]?.trim() ?? homeDocument.body;

const solibraFieldStory =
  'Avec le partenaire SOLIBRA, à l’occasion des 70 ans, Green Legacy Initiative a organisé un reboisement suivi d’une éducation au développement durable avec les élèves de Mondoukro à Toumodi et de Samoukaha à Dianra, pour un reboisement de 5 ha et une éducation au développement durable.';

const yamoussoukroFieldStory =
  'Lors du festival des Arts et Culture en Milieu Scolaire à Yamoussoukro, l’ONG Green Legacy Initiative a offert les plants qui ont servi au reboisement d’1 ha au groupe scolaire Résidentiel.';

export type Program = {
  number: string;
  icon: LucideIcon;
  title: string;
  text: string;
};

export type Project = {
  id: string;
  image: string;
  tag: string;
  title: string;
  place: string;
  text: string;
};

export const siteContent = {
  brand: {
    name: 'Green Legacy Initiative',
    strapline: homeDocument.metadata.eyebrow ?? 'ONG basée à Genève · terrain ivoirien',
    email: 'bonjour@greenlegacy.ci',
    locations: 'Abidjan · Agboville · Dabou · Korhogo · Grand-Bassam',
  },
  hero: {
    eyebrow: homeDocument.metadata.eyebrow ?? 'ONG basée à Genève · saison 2026',
    title: homeDocument.metadata.strapline ?? 'Un engagement local, une portée internationale.',
    body: heroBody,
    quote: 'La forêt n’est jamais loin quand on la plante ensemble.',
    quoteBy: 'Awa, animatrice terrain',
  },
  programs: [
    { number: '01', icon: TreePine, title: 'Une école, 5 ha de forêt', text: 'Chaque école partenaire transforme une parcelle dégradée en salle de classe à ciel ouvert, avec les élèves au cœur du soin.' },
    { number: '02', icon: Sprout, title: 'Pépinières communautaires', text: 'Des pépinières locales font grandir des essences natives et créent des revenus de saison pour les familles.' },
    { number: '03', icon: BookOpen, title: 'Éducation par le vivant', text: 'Des outils pédagogiques en français et en langues locales reconnectent les enfants aux cycles de leur territoire.' },
    { number: '04', icon: Users, title: 'Chantiers participatifs', text: 'Habitants, enseignants et équipes techniques décident ensemble où planter, comment suivre et quoi transmettre.' },
    { number: '05', icon: Leaf, title: 'Littoral & mangroves', text: 'À Grand-Bassam et dans les villages lagunaires, nous restaurons les berges avec les communautés riveraines.' },
  ] satisfies Program[],
  projects: [
    { id: 'solibra-groupe', image: '/images/gle-solibra-groupe.jpg', tag: 'Partenariats', title: 'Une plantation suivie', place: 'Samoukaha · Dianra', text: solibraFieldStory },
    { id: 'solibra-planting', image: '/images/gle-solibra-planting.jpg', tag: 'Partenariats', title: 'Éducation au développement durable', place: 'Toumodi & Dianra', text: solibraFieldStory },
    { id: 'festival-yamoussoukro-groupe', image: '/images/gle-festival-yamoussoukro-groupe.jpg', tag: 'Écoles', title: 'Un hectare pour apprendre', place: 'Yamoussoukro · Groupe scolaire Résidentiel', text: yamoussoukroFieldStory },
    { id: 'festival-yamoussoukro-plantation', image: '/images/gle-festival-yamoussoukro-plantation.jpg', tag: 'Écoles', title: 'La cour devient forêt', place: 'Yamoussoukro · Groupe scolaire Résidentiel', text: yamoussoukroFieldStory },
    { id: 'festival-officiels', image: '/images/gle-festival-officiels.jpg', tag: 'Écoles', title: 'Les plants du festival scolaire', place: 'Yamoussoukro · Groupe scolaire Résidentiel', text: yamoussoukroFieldStory },
    { id: 'festival-ceremonie', image: '/images/gle-festival-ceremonie.jpg', tag: 'Écoles', title: 'Un hectare pour apprendre', place: 'Yamoussoukro · Groupe scolaire Résidentiel', text: yamoussoukroFieldStory },
    { id: 'dabou', image: '/images/gli-school-forest.jpg', tag: 'Écoles', title: 'La cour devient forêt', place: 'Dabou · Sud-Comoé', text: 'Les élèves de l’école de N’Guessankro entretiennent 2 hectares de jeunes plants autour de leur classe.' },
    { id: 'korhogo', image: '/images/gli-community-nursery.jpg', tag: 'Communautés', title: 'La pépinière des mains', place: 'Korhogo · Poro', text: 'Une pépinière de 12 000 plants, portée par 34 familles, prépare la prochaine saison des pluies.' },
    { id: 'agboville', image: '/images/gli-reforestation-plot.jpg', tag: 'Forêts', title: 'Voir grandir le sol', place: 'Agboville · Agnéby-Tiassa', text: 'Sur l’ancienne parcelle agricole, les alignements d’arbres dessinent déjà un corridor vivant.' },
    { id: 'grand-bassam', image: '/images/gli-mangrove-restoration.jpg', tag: 'Littoral', title: 'Les racines de la lagune', place: 'Grand-Bassam · Sud-Comoé', text: 'Les riverains replantent des palétuviers pour ralentir l’érosion et protéger les nurseries de poissons.' },
  ] satisfies Project[],
  faqs: [
    { q: 'Où sont situés les projets de Green Legacy Initiative ?', a: 'Tous nos projets actifs sont en Côte d’Ivoire. Nous travaillons avec des écoles et des communautés de Dabou, Agboville, Korhogo, Grand-Bassam et d’autres territoires ivoiriens selon les partenariats locaux.' },
    { q: 'Que finance concrètement un don de 30 € ?', a: 'À titre indicatif, 30 € permettent de financer 100 arbres : la semence, le sac de pépinière, la mise en terre et les premiers suivis. Une part soutient aussi la formation des équipes locales et la mesure de survie.' },
    { q: 'Comment calculez-vous les arbres survivants ?', a: 'Les équipes de terrain recensent les parcelles à intervalles réguliers. Le taux de survie est calculé sur les plants suivis après leur première saison sèche, et non sur une projection.' },
    { q: 'Puis-je venir participer à un chantier ?', a: 'Oui. Nous ouvrons plusieurs journées participatives par saison des pluies. Laissez-nous vos coordonnées dans le formulaire bénévole : l’équipe vous proposera une date et un projet adaptés.' },
    { q: 'Comment suivez-vous l’utilisation des dons ?', a: 'Chaque projet possède une fiche de suivi : parcelle, essence, date de plantation et taux de survie. Nous partageons un bilan annuel et les nouvelles de terrain dans notre lettre.' },
  ],
};

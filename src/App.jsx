import { useState, useMemo, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL CSS  — palette #0f0f10 / #1a1a1d / #6c63ff
   ═══════════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f0f10 !important; -webkit-font-smoothing: antialiased; }
  #root { width:100%!important; max-width:100%!important; margin:0!important;
          text-align:left!important; border:none!important; display:block!important; }

  /* ══ Typographie : line-height généreux, overflow visible, pas de squeeze ══ */
  .th-stat-value {
    color: #f0f0f3;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 32px;
    line-height: 1.4;
    letter-spacing: normal;
    transition: color .22s;
  }
  .th-stat-value.active-val { color: #8c85ff; }

  .th-stat-label {
    color: #888892;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
    margin-top: 6px;
    transition: color .22s;
  }
  .th-stat-label.active-lbl { color: rgba(240,240,243,.85); }

  /* ══ Stat glass card ══ */
  .th-glass {
    background: rgba(108,99,255,.06);
    border: 1.5px solid rgba(108,99,255,.18);
    border-radius: 16px;
    padding: 22px 22px 20px;
    cursor: pointer;
    user-select: none;
    position: relative;
    overflow: visible;          /* ← pas de clipping du texte */
    transition: background .22s, transform .22s, border-color .22s, box-shadow .22s;
  }
  .th-glass:hover {
    background: rgba(108,99,255,.12);
    transform: translateY(-3px);
    border-color: rgba(108,99,255,.38);
  }

  /* ══ FIX 3 — KPI active state : TRÈS visible ══ */
  @keyframes th-kpi-glow {
    0%,100% { box-shadow: 0 0 0 2px rgba(108,99,255,.55), 0 8px 36px rgba(108,99,255,.28); }
    50%      { box-shadow: 0 0 0 5px rgba(108,99,255,.22), 0 16px 52px rgba(108,99,255,.38); }
  }
  .th-glass.th-active {
    background: rgba(108,99,255,.22) !important;
    border: 2px solid #6c63ff !important;
    transform: translateY(-4px);
    animation: th-kpi-glow 2.2s ease-in-out infinite;
  }
  /* Accent bar at bottom of active card */
  .th-glass.th-active::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #6c63ff, #8c85ff, #6c63ff);
    background-size: 200% 100%;
    border-radius: 0 0 15px 15px; /* ← suit la border-radius de la carte */
    animation: th-bar-slide 2s linear infinite;
  }
  @keyframes th-bar-slide { 0% { background-position: 0% 0; } 100% { background-position: 200% 0; } }

  /* Check badge */
  .th-stat-check {
    position: absolute; top: 10px; right: 10px;
    width: 22px; height: 22px; border-radius: 50%;
    background: #6c63ff; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; line-height: 1;
    opacity: 0; transform: scale(.3);
    transition: opacity .22s ease, transform .28s cubic-bezier(.34,1.56,.64,1);
    pointer-events: none;
    box-shadow: 0 2px 8px rgba(108,99,255,.5);
  }
  .th-glass.th-active .th-stat-check { opacity: 1; transform: scale(1); }

  /* ══ Candidate card ══ */
  .th-card {
    background: #1a1a1d;
    border: 1px solid #2e2e34;
    border-left: 5px solid transparent;
    border-radius: 18px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform .24s cubic-bezier(.4,0,.2,1), box-shadow .24s, border-color .24s;
  }
  .th-card:not(.th-expanded):hover {
    transform: translateY(-4px);
    box-shadow: 0 18px 52px rgba(0,0,0,.55), 0 4px 12px rgba(108,99,255,.08);
    border-color: #3e3e44 !important;
  }
  .th-card.th-expanded {
    border-color: rgba(108,99,255,.42) !important;
    box-shadow: 0 8px 40px rgba(108,99,255,.1);
  }
  .th-card.green { border-left-color: #22c98a; }
  .th-card.amber { border-left-color: #f5a623; }
  .th-card.red   { border-left-color: #e05252; }

  /* Summary row */
  .th-card-row {
    display: flex; align-items: center; gap: 22px;
    padding: 22px 28px; cursor: pointer; user-select: none; position: relative;
  }
  .th-card-row::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(105deg, rgba(108,99,255,.04) 0%, transparent 50%);
    opacity: 0; transition: opacity .24s ease;
  }
  .th-card:hover .th-card-row::before,
  .th-card.th-expanded .th-card-row::before { opacity: 1; }

  /* Detail panel */
  .th-detail {
    max-height: 0; overflow: hidden; opacity: 0;
    transition: max-height .48s cubic-bezier(.4,0,.2,1), opacity .32s ease;
  }
  .th-detail.open { max-height: 760px; opacity: 1; }
  .th-detail-body {
    border-top: 1px solid #2e2e34;
    padding: 24px 28px 28px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 30px;
  }
  .th-section-title {
    font-size: 10.5px; font-weight: 700; color: #6c63ff;
    letter-spacing: .14em; text-transform: uppercase;
    margin-bottom: 16px; line-height: 1.5;
    display: flex; align-items: center; gap: 8px;
  }
  .th-section-title::after {
    content: ''; flex: 1; height: 1px;
    background: linear-gradient(90deg, rgba(108,99,255,.38), transparent);
  }
  .th-skill-track {
    height: 5px; border-radius: 99px;
    background: #2e2e34; margin-top: 7px; overflow: hidden;
  }

  /* Chevron */
  .th-chevron {
    flex-shrink: 0; color: #888892;
    transition: transform .32s cubic-bezier(.4,0,.2,1), color .2s;
  }
  .th-card.th-expanded .th-chevron { transform: rotate(180deg); color: #6c63ff; }

  /* ══ Filter pills ══ */
  .th-pill {
    border: 1.5px solid #2e2e34;
    background: #1a1a1d; color: #888892;
    padding: 9px 14px 9px 17px;
    border-radius: 99px;
    font-size: 13px; font-weight: 600; line-height: 1.4;
    cursor: pointer; font-family: 'Inter', sans-serif;
    outline: none; white-space: nowrap;
    transition: all .18s ease;
    display: inline-flex; align-items: center; gap: 7px;
  }
  .th-pill:hover { border-color: #6c63ff; color: #f0f0f3; background: #1e1c3a; }
  .th-pill.active {
    background: linear-gradient(135deg, #6c63ff, #8c85ff);
    color: #fff; border-color: transparent;
    box-shadow: 0 4px 20px rgba(108,99,255,.42);
  }

  /* ══ FIX 2 — × bouton de suppression dans le pill ══ */
  .th-pill-del {
    display: inline-flex; align-items: center; justify-content: center;
    width: 17px; height: 17px; border-radius: 50%;
    background: rgba(255,255,255,.15); color: inherit;
    font-size: 12px; font-weight: 900; line-height: 1;
    cursor: pointer; flex-shrink: 0;
    transition: background .15s, color .15s;
  }
  .th-pill-del:hover { background: rgba(224,82,82,.55) !important; color: #fff !important; }
  .th-pill:not(.active) .th-pill-del { background: rgba(136,136,146,.2); color: #888892; }

  /* ══ Search ══ */
  .th-search {
    width: 100%; background: #0f0f10; border: 1.5px solid #2e2e34; color: #f0f0f3;
    padding: 12px 16px 12px 46px; border-radius: 12px;
    font-size: 14px; font-weight: 500; line-height: 1.5;
    font-family: 'Inter', sans-serif; outline: none;
    transition: border-color .18s, box-shadow .18s;
  }
  .th-search:focus { border-color: #6c63ff; box-shadow: 0 0 0 3px rgba(108,99,255,.15); }
  .th-search::placeholder { color: #888892; }
  .th-search-wrap { position: relative; flex: 1 1 220px; }
  .th-search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: #888892; pointer-events: none; display: flex; align-items: center;
    transition: color .18s;
  }
  .th-search-wrap:focus-within .th-search-icon { color: #6c63ff; }

  /* ══ Selects ══ */
  .th-select, .th-exp-select {
    appearance: none; -webkit-appearance: none;
    border: 1.5px solid #2e2e34; background-color: #1a1a1d; color: #f0f0f3;
    padding: 11px 42px 11px 16px; border-radius: 11px;
    font-size: 13px; font-weight: 600; line-height: 1.5;
    cursor: pointer; font-family: 'Inter', sans-serif;
    transition: border-color .18s, box-shadow .18s; outline: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M5 6 0 0h10z' fill='%23888892'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
  }
  .th-select { min-width: 228px; }
  .th-exp-select { min-width: 200px; }
  .th-select:focus, .th-exp-select:focus { border-color: #6c63ff; box-shadow: 0 0 0 3px rgba(108,99,255,.15); }
  .th-select option, .th-exp-select option { background: #1a1a1d; color: #f0f0f3; }

  /* ══ Dynamic tech input ══ */
  .th-tech-input {
    background: transparent; border: 1.5px dashed #3a3a40; color: #f0f0f3;
    padding: 8px 15px; border-radius: 99px;
    font-size: 12.5px; font-weight: 500; line-height: 1.5;
    font-family: 'Inter', sans-serif; outline: none; width: 148px;
    caret-color: #6c63ff; transition: border-color .18s, background .18s, box-shadow .18s;
  }
  .th-tech-input:focus { border-color: #6c63ff; border-style: solid; background: #1e1c3a; box-shadow: 0 0 0 3px rgba(108,99,255,.12); }
  .th-tech-input::placeholder { color: #3e3e48; }

  /* Tech chip on card */
  .th-chip {
    background: #2e2e34; color: #888892; border: 1px solid #3a3a40;
    padding: 6px 14px; border-radius: 9px;
    font-size: 12px; font-weight: 700; line-height: 1.5;
    font-family: 'Inter', sans-serif; white-space: nowrap; flex-shrink: 0;
    transition: background .18s, border-color .18s, color .18s;
  }
  .th-card:hover .th-chip, .th-card.th-expanded .th-chip
    { background: #3e3e44; border-color: #6c63ff; color: #f0f0f3; }

  /* ══ Buttons ══ */
  .th-reset {
    background: none; border: 1.5px solid #2e2e34; color: #6c63ff;
    padding: 9px 16px; border-radius: 10px;
    font-size: 12px; font-weight: 700; line-height: 1.5;
    cursor: pointer; font-family: 'Inter', sans-serif;
    white-space: nowrap; outline: none; transition: all .15s;
  }
  .th-reset:hover { background: #1e1c3a; border-color: #6c63ff; }
  .th-close-btn {
    background: none; border: 1.5px solid #2e2e34; color: #888892;
    padding: 8px 14px; border-radius: 9px;
    font-size: 12px; font-weight: 600; line-height: 1.5;
    cursor: pointer; font-family: 'Inter', sans-serif;
    margin-top: 20px; outline: none; transition: all .15s;
  }
  .th-close-btn:hover { border-color: #e05252; color: #e05252; background: rgba(224,82,82,.08); }

  /* Active indicator */
  .th-active-indicator {
    display: inline-flex; align-items: center; gap: 7px;
    background: linear-gradient(135deg, #6c63ff, #8c85ff);
    color: #fff; border-radius: 99px; padding: 5px 13px;
    font-size: 11.5px; font-weight: 700; line-height: 1.5;
    font-family: 'Inter', sans-serif; white-space: nowrap;
    animation: th-fade-in .2s ease both;
  }

  /* Dividers */
  .th-divider-h { height: 1px; background: #2e2e34; }
  .th-divider-v { width: 1px; background: #2e2e34; align-self: stretch; flex-shrink: 0; }

  /* Filter label */
  .th-flabel {
    display: block; font-size: 10.5px; font-weight: 700; color: #888892;
    letter-spacing: .14em; text-transform: uppercase;
    margin-bottom: 10px; line-height: 1.5;
  }

  /* ══ Animations ══ */
  @keyframes th-slide-up {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes th-fade-in { from { opacity: 0; } to { opacity: 1; } }
  .th-enter { animation: th-slide-up .34s cubic-bezier(.4,0,.2,1) both; }
`;

/* ═══════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════ */
const BASE_TECHS = ["Toutes", "Python", "Java", "React", "DevOps"];
const STATUTS    = ["Tous", "À recruter absolument", "À mettre en entretien", "Refuser"];
const EXPS       = [
  { value: "tous",     label: "Toutes expériences"    },
  { value: "debutant", label: "Débutant  (0 – 2 ans)"  },
  { value: "confirme", label: "Confirmé  (3 ans et +)"  },
];

const ALL_CANDIDATS = [
  { id:1,  nom:"Amine Benali",    diplome:"Master Intelligence Artificielle",  experience:3, tech:"Python",  score:85, location:"Paris, France",       email:"a.benali@email.com",   bio:"Passionné par le Machine Learning, Amine a développé des modèles prédictifs pour plusieurs startups françaises. Il maîtrise l'ensemble de la pipeline ML, du preprocessing à la mise en production via des APIs REST.",          skills:[{name:"Python / NumPy",score:92},{name:"Machine Learning",score:88},{name:"SQL & NoSQL",score:75},{name:"Communication",score:72},{name:"Leadership",score:65}] },
  { id:2,  nom:"Lina Cherif",     diplome:"Licence Informatique",               experience:1, tech:"Java",    score:62, location:"Lyon, France",         email:"l.cherif@email.com",    bio:"Jeune développeuse Java motivée, Lina a réalisé des projets académiques ambitieux et un stage en ESN lyonnaise. Elle cherche à monter en compétences sur les architectures d'entreprise Java EE.",                             skills:[{name:"Java / Spring",score:70},{name:"Architecture MVC",score:60},{name:"Tests unitaires",score:55},{name:"Travail en équipe",score:82},{name:"Adaptabilité",score:78}] },
  { id:3,  nom:"Karim Mansouri",  diplome:"Ingénieur Logiciel",                 experience:5, tech:"React",   score:92, location:"Marseille, France",    email:"k.mansouri@email.com",  bio:"Expert front-end avec 5 ans d'expérience, Karim a dirigé des équipes chez deux scale-ups. Référent technique sur React et les architectures micro-frontends en production.",                                                   skills:[{name:"React / Next.js",score:95},{name:"TypeScript",score:90},{name:"Architecture",score:88},{name:"Leadership tech",score:85},{name:"Méthodes Agile",score:80}] },
  { id:4,  nom:"Sarah Dupont",    diplome:"Master Développement Web",           experience:0, tech:"Python",  score:44, location:"Bordeaux, France",     email:"s.dupont@email.com",    bio:"Fraîchement diplômée, Sarah est enthousiaste mais encore en acquisition de compétences professionnelles. Ses projets académiques montrent de la créativité, mais un manque de rigueur technique est noté.",                     skills:[{name:"Python / Flask",score:50},{name:"HTML / CSS",score:65},{name:"Git / GitHub",score:45},{name:"Autonomie",score:40},{name:"Potentiel",score:75}] },
  { id:5,  nom:"Thomas Reyes",    diplome:"Licence",                            experience:2, tech:"React",   score:77, location:"Nantes, France",       email:"t.reyes@email.com",     bio:"Développeur autodidacte reconverti, Thomas s'est spécialisé en React après une formation intensive. Ses deux années en agence lui ont permis de livrer une dizaine de projets clients avec succès.",                           skills:[{name:"React / Redux",score:82},{name:"CSS / Tailwind",score:80},{name:"Node.js",score:65},{name:"Gestion projet",score:70},{name:"Créativité UI",score:85}] },
  { id:6,  nom:"Nadia Okafor",    diplome:"Ingénieure Réseaux & Systèmes",     experience:4, tech:"Java",    score:88, location:"Lille, France",         email:"n.okafor@email.com",    bio:"Ingénieure confirmée spécialisée Java EE, Nadia a piloté la migration vers microservices d'un système bancaire legacy. Elle combine compétences techniques profondes et leadership naturel.",                                  skills:[{name:"Java EE / Quarkus",score:92},{name:"Microservices",score:88},{name:"Kubernetes",score:80},{name:"Architecture",score:85},{name:"Mentorat",score:78}] },
  { id:7,  nom:"Hugo Petit",      diplome:"Bachelor Technologique",             experience:0, tech:"Python",  score:38, location:"Toulouse, France",     email:"h.petit@email.com",     bio:"Hugo est un profil junior avec un bachelor récent et aucune expérience professionnelle. Ses compétences techniques restent limitées. Un accompagnement soutenu serait indispensable pour ce profil.",                            skills:[{name:"Python basique",score:42},{name:"Algorithmique",score:38},{name:"HTML / CSS",score:50},{name:"Motivation",score:80},{name:"Apprentissage",score:65}] },
  { id:8,  nom:"Yasmine Hadj",    diplome:"Master Cybersécurité",               experience:6, tech:"DevOps",  score:95, location:"Strasbourg, France",   email:"y.hadj@email.com",      bio:"Profil d'excellence rare : Yasmine combine expertise DevOps de pointe et culture cybersécurité. Elle a conçu des pipelines CI/CD pour des infrastructures critiques nationales. Recrutement vivement recommandé.",             skills:[{name:"DevOps / CI-CD",score:98},{name:"Cybersécurité",score:94},{name:"Cloud AWS/GCP",score:92},{name:"Infra as Code",score:90},{name:"Leadership",score:88}] },
  { id:9,  nom:"Lucas Martin",    diplome:"Licence Informatique",               experience:1, tech:"React",   score:55, location:"Rennes, France",       email:"l.martin@email.com",    bio:"Développeur junior React ayant complété une formation intensive et un premier CDD. Profil prometteur mais nécessitant encore une montée en compétences sur les bonnes pratiques et les tests automatisés.",                     skills:[{name:"React",score:60},{name:"JavaScript ES6+",score:65},{name:"REST API",score:55},{name:"Tests (Jest)",score:40},{name:"Curiosité tech.",score:85}] },
  { id:10, nom:"Inès Ferreira",   diplome:"Ingénieure DevOps & Cloud",          experience:3, tech:"DevOps",  score:71, location:"Nice, France",         email:"i.ferreira@email.com",  bio:"Ingénieure DevOps spécialisée Cloud, Inès a géré l'infrastructure d'une plateforme SaaS B2B. Elle apporte rigueur opérationnelle et maîtrise des outils d'observabilité modernes (Datadog, Grafana).",                       skills:[{name:"Terraform/Ansible",score:78},{name:"Kubernetes",score:74},{name:"Monitoring",score:70},{name:"Cloud Azure",score:68},{name:"Documentation",score:80}] },
  { id:11, nom:"Rami Bouzid",     diplome:"Master Full-Stack",                  experience:2, tech:"React",   score:83, location:"Montpellier, France",  email:"r.bouzid@email.com",    bio:"Développeur full-stack polyvalent, Rami excelle en front React et gère le back avec Node.js. Il a co-fondé un side project SaaS comptant plus de 500 utilisateurs actifs en production.",                                    skills:[{name:"React / Vue.js",score:88},{name:"Node.js / Express",score:82},{name:"PostgreSQL",score:76},{name:"Entrepreneuriat",score:90},{name:"Design thinking",score:80}] },
  { id:12, nom:"Camille Nguyen",  diplome:"Doctorat Machine Learning",          experience:7, tech:"Python",  score:97, location:"Paris, France",        email:"c.nguyen@email.com",    bio:"Docteure ML avec publications dans NeurIPS et ICML, Camille est une chercheuse-ingénieure d'exception. Elle a transitionné vers l'industrie pour industrialiser des modèles IA à très grande échelle.",                      skills:[{name:"Deep Learning",score:98},{name:"Python / PyTorch",score:97},{name:"Recherche appli.",score:95},{name:"MLOps",score:88},{name:"Vulgarisation",score:85}] },
];

/* ── Stat card → filterStatut mapping ── */
const STAT_FILTER_MAP = {
  all:       "Tous",
  recruit:   "À recruter absolument",
  interview: "À mettre en entretien",
  refused:   "Refuser",
};

const AVATAR_GRADIENTS = [
  ["#3b1f5e","#6c63ff"],["#1a3560","#6c63ff"],["#1f3d2e","#22c98a"],
  ["#3d1f1a","#f5a623"],["#1a2e3d","#8c85ff"],["#2e1a3d","#e05252"],
  ["#1f2e3d","#6c63ff"],["#3d2e1a","#f5a623"],["#1a3d2e","#22c98a"],
  ["#3d1a2e","#e05252"],["#2e3d1a","#22c98a"],["#1a2e3d","#8c85ff"],
];

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */
function getStatus(score) {
  if (score > 80)  return { label:"À recruter absolument",  color:"#22c98a", bg:"#0d2f20", border:"rgba(34,201,138,.28)",  dot:"#22c98a", cls:"green" };
  if (score >= 50) return { label:"À mettre en entretien", color:"#f5a623", bg:"#2e2010", border:"rgba(245,166,35,.28)", dot:"#f5a623", cls:"amber" };
  return               { label:"Refuser",                  color:"#e05252", bg:"#2e1212", border:"rgba(224,82,82,.28)", dot:"#e05252", cls:"red"   };
}
function initials(nom) { return nom.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(); }

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function ScoreRing({ score, dotColor }) {
  const r = 26, size = 66, circ = 2 * Math.PI * r;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#2e2e34" strokeWidth="5.5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={dotColor} strokeWidth="5.5"
          strokeLinecap="round" strokeDasharray={`${(score/100)*circ} ${circ}`}
          style={{ transition:'stroke-dasharray .6s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        {/* FIX 1 — lineHeight explicite sur le score */}
        <span style={{ fontSize:'15px', fontWeight:800, color:'#f0f0f3', lineHeight:'1.4', fontFamily:"'Inter',sans-serif" }}>{score}</span>
        <span style={{ fontSize:'8px', color:'#888892', fontWeight:700, letterSpacing:'0.07em', lineHeight:'1.5', marginTop:2 }}>ORAD</span>
      </div>
    </div>
  );
}

function Avatar({ nom, id }) {
  const [c1, c2] = AVATAR_GRADIENTS[(id - 1) % AVATAR_GRADIENTS.length];
  return (
    <div style={{ width:48, height:48, borderRadius:14, flexShrink:0, userSelect:'none',
      background:`linear-gradient(135deg,${c1},${c2})`,
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'#fff', fontSize:'15px', fontWeight:700, lineHeight:'1.2',
      fontFamily:"'Inter',sans-serif", boxShadow:`0 6px 20px ${c1}88` }}>
      {initials(nom)}
    </div>
  );
}

function SkillBar({ name, score, isExpanded, index }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:12.5, fontWeight:600, color:'#f0f0f3', lineHeight:'1.5' }}>{name}</span>
        <span style={{ fontSize:12,   fontWeight:700, color:'#6c63ff', lineHeight:'1.5' }}>{score}%</span>
      </div>
      <div className="th-skill-track">
        <div style={{ height:'100%', borderRadius:99,
          background:'linear-gradient(90deg,#6c63ff,#8c85ff)',
          width: isExpanded ? `${score}%` : '0%',
          transition:`width .65s cubic-bezier(.4,0,.2,1) ${0.15 + index * 0.09}s` }} />
      </div>
    </div>
  );
}

/* ══ FIX 3 — StatCard avec active state fort ══ */
function StatCard({ icon, value, label, statKey, filterStatut, onStatClick }) {
  const targetFilter = STAT_FILTER_MAP[statKey];
  const isActive = filterStatut === targetFilter;

  return (
    <div
      className={`th-glass${isActive ? ' th-active' : ''}`}
      onClick={() => onStatClick(statKey)}
      title={isActive ? `Désactiver le filtre "${label}"` : `Filtrer : ${label}`}
    >
      <div className="th-stat-check">✓</div>
      <div style={{ fontSize:22, marginBottom:10, lineHeight:1 }}>{icon}</div>
      <div className={`th-stat-value${isActive ? ' active-val' : ''}`}>{value}</div>
      <div className={`th-stat-label${isActive ? ' active-lbl' : ''}`}>{label}</div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg className="th-chevron" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [filterTech,   setFilterTech]   = useState("Toutes");
  const [filterStatut, setFilterStatut] = useState("Tous");      // ← source of truth for KPI + select
  const [filterExp,    setFilterExp]    = useState("tous");
  const [search,       setSearch]       = useState("");
  const [expandedId,   setExpandedId]   = useState(null);
  const [customTechs,  setCustomTechs]  = useState([]);           // FIX 2 — custom techs séparés
  const [newTech,      setNewTech]      = useState("");

  /* Inject / refresh CSS on mount */
  useEffect(() => {
    let el = document.getElementById('th-styles');
    if (!el) { el = document.createElement('style'); el.id = 'th-styles'; document.head.prepend(el); }
    el.textContent = GLOBAL_CSS;
  }, []);

  /* ── All visible techs ── */
  const allTechs = useMemo(() => [...BASE_TECHS, ...customTechs], [customTechs]);

  /* ── Combined filter ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_CANDIDATS.filter(c => {
      if (filterTech   !== "Toutes" && c.tech !== filterTech) return false;
      if (filterStatut !== "Tous"   && getStatus(c.score).label !== filterStatut) return false;
      if (filterExp === "debutant"  && c.experience > 2) return false;
      if (filterExp === "confirme"  && c.experience < 3) return false;
      if (q && !c.nom.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filterTech, filterStatut, filterExp, search]);

  const stats = useMemo(() => ({
    total:     ALL_CANDIDATS.length,
    toRecruit: ALL_CANDIDATS.filter(c => c.score > 80).length,
    interview: ALL_CANDIDATS.filter(c => c.score >= 50 && c.score <= 80).length,
    refused:   ALL_CANDIDATS.filter(c => c.score < 50).length,
    avgScore:  Math.round(ALL_CANDIDATS.reduce((s, c) => s + c.score, 0) / ALL_CANDIDATS.length),
  }), []);

  /* ══ FIX 3 — KPI click handler ══ */
  function handleStatClick(key) {
    const target = STAT_FILTER_MAP[key];          // e.g. "À recruter absolument"
    setFilterStatut(prev => prev === target ? "Tous" : target);
  }

  /* ══ FIX 2 — Add / Remove custom tech ══ */
  function handleAddTech(e) {
    if (e.key !== 'Enter') return;
    const t = newTech.trim();
    if (t && !allTechs.includes(t)) setCustomTechs(prev => [...prev, t]);
    setNewTech("");
  }
  function handleRemoveTech(t) {
    setCustomTechs(prev => prev.filter(x => x !== t));
    if (filterTech === t) setFilterTech("Toutes");
  }

  function toggleCard(id)  { setExpandedId(prev => prev === id ? null : id); }
  function resetAll() {
    setFilterTech("Toutes"); setFilterStatut("Tous");
    setFilterExp("tous"); setSearch(""); setExpandedId(null);
  }

  const hasFilters = filterTech !== "Toutes" || filterStatut !== "Tous" || filterExp !== "tous" || search.trim() !== "";
  const animKey    = `${filterTech}|${filterStatut}|${filterExp}`;

  const KPI_CARDS = [
    { icon:"", value:stats.total,        label:"Candidats total",       key:"all" },
    { icon:"", value:stats.toRecruit,    label:"À recruter absolument", key:"recruit" },
    { icon:"", value:stats.interview,    label:"En entretien",          key:"interview" },
    { icon:"", value:stats.refused,      label:"Refusés",               key:"refused" },
  ];

  return (
    <div style={{ minHeight:'120vh', background:'#0f0f10', fontFamily:"'Inter',sans-serif" }}>

      {/* ══════════ HEADER ══════════ */}
      <header style={{ background:'linear-gradient(160deg,#09090e 0%,#0f0f10 45%,#11101a 75%,#09090e 100%)', borderBottom:'1px solid #2e2e34', position:'relative', overflow:'hidden' }}>
        {[
          { top:-100, right:-80,  w:300, h:300, c:'rgba(108,99,255,.09)' },
          { bottom:-80, left:'22%', w:250, h:250, c:'rgba(108,99,255,.06)' },
          { top:10, left:'62%',    w:180, h:180, c:'rgba(140,133,255,.07)' },
        ].map((o, i) => (
          <div key={i} style={{ position:'absolute', borderRadius:'50%', pointerEvents:'none',
            width:o.w, height:o.h, background:o.c,
            top:o.top, bottom:o.bottom, left:o.left, right:o.right, filter:'blur(40px)' }} />
        ))}

        <div style={{ maxWidth:1400, margin:'0 auto', padding:'40px 40px 36px', position:'relative' }}>

          {/* Brand */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:50, height:50, borderRadius:14,
                background:'linear-gradient(135deg,rgba(108,99,255,.35),rgba(108,99,255,.12))',
                border:'1px solid rgba(108,99,255,.45)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:24, userSelect:'none', boxShadow:'0 6px 28px rgba(108,99,255,.28)' }}></div>
              <div>
                {/* FIX 1 — lineHeight sur le titre */}
                <div style={{ color:'#888892', fontSize:11, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', lineHeight:'1.5', marginBottom:4 }}>
                  TechHire · Module RH
                </div>
                <div style={{ color:'#f0f0f3', fontSize:26, fontWeight:800, fontFamily:"'Inter',sans-serif", lineHeight:'1.4', letterSpacing:'-0.3px' }}>
                  Tableau de Bord Candidats
                </div>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
              <div style={{ background:'rgba(108,99,255,.1)', border:'1px solid rgba(108,99,255,.25)', borderRadius:99, padding:'7px 18px', color:'rgba(240,240,243,.82)', fontSize:12, fontWeight:600, lineHeight:'1.5', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c98a', boxShadow:'0 0 8px #22c98a', display:'inline-block' }} />
                Système actif
              </div>
              <div style={{ color:'#888892', fontSize:11, lineHeight:'1.5' }}>
                Cliquez une carte KPI pour filtrer · une fiche candidat pour l'ouvrir
              </div>
            </div>
          </div>

          {/* ══ KPI Cards (FIX 3) ══ */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(168px,1fr))', gap:14 }}>
            {KPI_CARDS.map(s => (
              <StatCard
                key={s.key}
                icon={s.icon} value={s.value} label={s.label} statKey={s.key}
                filterStatut={filterStatut}
                onStatClick={handleStatClick}
              />
            ))}
            {/* Avg score — non-clickable */}
            <div className="th-glass" style={{ cursor:'default' }}>
              <div style={{ fontSize:22, marginBottom:10, lineHeight:1 }}></div>
              <div className="th-stat-value">{stats.avgScore}%</div>
              <div className="th-stat-label">Score moyen ORAD</div>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════ MAIN ══════════ */}
      <main style={{ maxWidth:1400, margin:'0 auto', padding:'48px 40px 80px', display:'flex', flexDirection:'column', gap:48 }}>

        {/* ── FILTER BAR ── */}
        <div style={{ background:'#1a1a1d', border:'1px solid #2e2e34', borderRadius:20, padding:'24px 28px', boxShadow:'0 4px 28px rgba(0,0,0,.45)', display:'flex', flexDirection:'column', gap:0 }}>

          {/* Row 1 : search + experience */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:16, alignItems:'flex-end', paddingBottom:20 }}>
            <div style={{ flex:'1 1 240px' }}>
              <span className="th-flabel">Recherche</span>
              <div className="th-search-wrap">
                <span className="th-search-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </span>
                <input className="th-search" type="text"
                  placeholder="Rechercher un candidat..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  autoComplete="off" spellCheck="false" />
              </div>
            </div>
            <div>
              <span className="th-flabel">Expérience</span>
              <select className="th-exp-select" value={filterExp} onChange={e => setFilterExp(e.target.value)}>
                {EXPS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
          </div>

          <div className="th-divider-h" />

          {/* Row 2 : tech pills + add-input + status + reset */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:16, alignItems:'flex-end', paddingTop:20 }}>
            <div style={{ flex:'1 1 260px' }}>
              <span className="th-flabel">Technologie</span>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, alignItems:'center' }}>

                {/* Base techs — no delete */}
                {BASE_TECHS.map(t => (
                  <button key={t}
                    className={`th-pill${filterTech === t ? ' active' : ''}`}
                    onClick={() => setFilterTech(t)}>
                    {t}
                  </button>
                ))}

                {/* ══ FIX 2 — Custom techs avec bouton × ══ */}
                {customTechs.map(t => (
                  <button key={t}
                    className={`th-pill${filterTech === t ? ' active' : ''}`}
                    onClick={() => setFilterTech(t)}>
                    {t}
                    <span
                      className="th-pill-del"
                      onClick={e => { e.stopPropagation(); handleRemoveTech(t); }}
                      title={`Supprimer "${t}"`}
                    >
                      ×
                    </span>
                  </button>
                ))}

                {/* Add tech input */}
                <input className="th-tech-input" type="text"
                  placeholder="+ Ajouter (Entrée)"
                  value={newTech}
                  onChange={e => setNewTech(e.target.value)}
                  onKeyDown={handleAddTech}
                  autoComplete="off" spellCheck="false" />
              </div>
            </div>

            <div className="th-divider-v" />

            <div>
              <span className="th-flabel">Décision ORAD</span>
              <select className="th-select" value={filterStatut}
                onChange={e => setFilterStatut(e.target.value)}>
                {STATUTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {hasFilters && (
              <div style={{ display:'flex', flexDirection:'column', gap:8, alignSelf:'flex-end' }}>
                {filterStatut !== "Tous" && (
                  <div className="th-active-indicator">
                    <span style={{ width:7, height:7, borderRadius:'50%', background:'rgba(255,255,255,.75)', display:'inline-block', flexShrink:0 }} />
                    {filterStatut}
                  </div>
                )}
                <button className="th-reset" onClick={resetAll}>✕ Réinitialiser tout</button>
              </div>
            )}
          </div>
        </div>

        {/* ── RESULTS SECTION ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

          {/* Results header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:17, fontWeight:700, color:'#f0f0f3', fontFamily:"'Inter',sans-serif", lineHeight:'1.4' }}>
                Candidats
              </span>
              <span style={{ background:'linear-gradient(135deg,#6c63ff,#8c85ff)', color:'#fff', fontSize:12, fontWeight:700, lineHeight:'1.5', borderRadius:99, padding:'3px 12px', boxShadow:'0 2px 12px rgba(108,99,255,.45)' }}>
                {filtered.length}
              </span>
              {hasFilters && (
                <span style={{ fontSize:12, color:'#888892', fontStyle:'italic', lineHeight:'1.5' }}>
                  sur {ALL_CANDIDATS.length} au total
                </span>
              )}
            </div>
            {search.trim() && (
              <span style={{ fontSize:12, color:'#888892', lineHeight:'1.5' }}>
                Résultats pour{' '}
                <span style={{ color:'#8c85ff', fontWeight:700 }}>"{search.trim()}"</span>
              </span>
            )}
          </div>

          {/* Candidate list */}
          {filtered.length === 0 ? (
            <div style={{ background:'#1a1a1d', border:'1px solid #2e2e34', borderRadius:20, padding:'72px 32px', textAlign:'center', boxShadow:'0 4px 24px rgba(0,0,0,.4)' }}>
              <div style={{ fontSize:48, marginBottom:16, lineHeight:1 }}>🔍</div>
              <div style={{ fontSize:18, fontWeight:700, color:'#f0f0f3', lineHeight:'1.4', marginBottom:8, fontFamily:"'Inter',sans-serif" }}>
                Aucun candidat trouvé
              </div>
              <div style={{ fontSize:14, color:'#888892', lineHeight:'1.6' }}>
                Modifiez vos critères ou réinitialisez les filtres.
              </div>
            </div>
          ) : (
            <div key={animKey} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {filtered.map((c, i) => {
                const status     = getStatus(c.score);
                const isExpanded = expandedId === c.id;
                return (
                  <div key={c.id}
                    className={`th-card ${status.cls} th-enter${isExpanded ? ' th-expanded' : ''}`}
                    style={{ animationDelay:`${i * 48}ms` }}>

                    {/* ── Summary row ── */}
                    <div className="th-card-row" onClick={() => toggleCard(c.id)}>
                      <ScoreRing score={c.score} dotColor={status.dot} />
                      <Avatar nom={c.nom} id={c.id} />

                      <div style={{ flex:1, minWidth:0 }}>
                        {/* FIX 1 — lineHeight sur le nom */}
                        <div style={{ fontSize:16, fontWeight:700, color:'#f0f0f3', fontFamily:"'Inter',sans-serif", lineHeight:'1.45', marginBottom:6, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {c.nom}
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 18px', fontSize:13, color:'#888892', lineHeight:'1.5' }}>
                          <span>🎓 {c.diplome}</span>
                          <span>💼 {c.experience} an{c.experience !== 1 ? 's' : ''} d'exp.</span>
                          <span>📍 {c.location}</span>
                        </div>
                      </div>

                      <div className="th-chip">{c.tech}</div>

                      <div style={{ background:status.bg, color:status.color, border:`1px solid ${status.border}`, padding:'8px 16px', borderRadius:99, fontSize:12.5, fontWeight:700, lineHeight:'1.4', display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap', flexShrink:0, boxShadow:`0 2px 12px ${status.dot}20` }}>
                        <span style={{ width:8, height:8, borderRadius:'50%', background:status.dot, display:'inline-block', flexShrink:0 }} />
                        {status.label}
                      </div>
                      <ChevronIcon />
                    </div>

                    {/* ── Detail panel ── */}
                    <div className={`th-detail${isExpanded ? ' open' : ''}`}>
                      <div className="th-detail-body">

                        {/* Left — bio + contact */}
                        <div>
                          <div className="th-section-title">Profil</div>
                          <p style={{ fontSize:13.5, color:'#888892', lineHeight:'1.78', marginBottom:20 }}>
                            {c.bio}
                          </p>
                          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                            {[
                              { icon:'📍', text: c.location },
                              { icon:'📧', text: c.email },
                              { icon:'🎓', text: c.diplome },
                              { icon:'💼', text: `${c.experience} an${c.experience !== 1 ? 's' : ''} d'expérience en ${c.tech}` },
                            ].map(item => (
                              <div key={item.text} style={{ display:'flex', alignItems:'flex-start', gap:10, fontSize:13 }}>
                                <span style={{ fontSize:15, flexShrink:0, lineHeight:'1.5' }}>{item.icon}</span>
                                <span style={{ color:'#888892', lineHeight:'1.5' }}>{item.text}</span>
                              </div>
                            ))}
                          </div>
                          <button className="th-close-btn"
                            onClick={e => { e.stopPropagation(); toggleCard(c.id); }}>
                            Fermer les détails ✕
                          </button>
                        </div>

                        {/* Right — skill bars + ORAD box */}
                        <div>
                          <div className="th-section-title">Évaluation des compétences</div>
                          {c.skills.map((s, idx) => (
                            <SkillBar key={s.name} name={s.name} score={s.score}
                              isExpanded={isExpanded} index={idx} />
                          ))}
                          <div style={{ marginTop:20, padding:'14px 18px', background:'rgba(108,99,255,.08)', border:'1px solid rgba(108,99,255,.2)', borderRadius:12 }}>
                            <div style={{ fontSize:10.5, fontWeight:700, color:'#6c63ff', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6, lineHeight:'1.5' }}>
                              Score ORAD Global
                            </div>
                            <div style={{ fontSize:24, fontWeight:800, color:'#f0f0f3', fontFamily:"'Inter',sans-serif", lineHeight:'1.4' }}>
                              {c.score}
                              <span style={{ fontSize:13, color:'#888892', fontWeight:500 }}> / 100</span>
                            </div>
                            <div style={{ fontSize:11.5, color:'#888892', marginTop:4, lineHeight:'1.5' }}>
                              Basé sur {c.skills.length} critères d'évaluation
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign:'center', fontSize:12, color:'#888892', fontWeight:500, letterSpacing:'0.05em', lineHeight:'1.6', borderTop:'1px solid #2e2e34', paddingTop:24 }}>
          TechHire · Algorithme ORAD — Score de compatibilité calculé sur 100 points
        </div>
      </main>
    </div>
  );
}

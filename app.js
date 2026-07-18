const STORAGE_KEY = "conseil-syndical-v1";
const SHARED_STORAGE_KEY = "conseil-syndical-shared-v2";
const SESSION_KEY = "conseil-syndical-session";
const PROFILE_KEY = "conseil-syndical-profile";
const AUTHOR_KEY = "conseil-syndical-author";
const PROFILE_META_KEY = "conseil-syndical-profile-meta";
const PASSWORD_KEY = "conseil-syndical-password";
const LOGIN_USER = "cs";
const DEFAULT_PASSWORD = "copro";
// Profil disposant des droits Administrateur (gestion des membres, réinitialisation des
// données, import). Les autres profils ont les droits "Membre Conseil Syndical" du cahier
// des charges : consultation, commentaires, téléchargements, création de demandes.
const ADMIN_PROFILES = new Set(["Beïja"]);
const BUILDINGS = ["Tous les batiments", "Batiment A", "Batiment B", "Batiment C", "Batiment D", "Batiment E"];
const PROFILES = ["Conseil syndical", "Céline", "Edna", "Cécile", "Beïja", "Christina", "Justine", "Pierrick", "Alex"];
const DEFAULT_ACTIVE_PROFILE = "Beïja";
const BEIJA_AUTHOR_FIX_KEY = "conseil-syndical-beija-author-fix-v1";
const MAX_FILE_SIZE = 3.5 * 1024 * 1024;
const FILE_ACCEPT = "image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv";
const ATTACHMENT_COLLECTIONS = new Set([
  "meetings",
  "tasks",
  "incidents",
  "syndicRequests",
  "budget",
  "invoices",
  "contracts",
  "procedures",
  "contacts",
  "members",
  "quotes",
  "arrears"
]);
const ACTION_BY_COLLECTIONS = new Set([
  "meetings",
  "tasks",
  "incidents",
  "syndicRequests",
  "budget",
  "invoices",
  "contracts",
  "procedures",
  "quotes",
  "arrears",
  "fundCalls",
  "worksFundMovements"
]);
const DEFAULT_TABS = [
  { id: "dashboard", label: "Tableau de bord", icon: "dashboard", visible: true, locked: true },
  { id: "meetings", label: "Réunions", icon: "calendar", visible: true },
  { id: "tasks", label: "Actions", icon: "check", visible: true },
  { id: "urgencies", label: "Urgences", icon: "alert", visible: true },
  { id: "members", label: "Membres CS", icon: "users", visible: true },
  { id: "incidents", label: "Signalements", icon: "alert", visible: true },
  { id: "syndicRequests", label: "Demandes syndic", icon: "calendar", visible: true },
  { id: "contracts", label: "Contrats", icon: "wallet", visible: true },
  { id: "procedures", label: "Marches à suivre", icon: "check", visible: true },
  { id: "budget", label: "Budget", icon: "wallet", visible: true },
  { id: "invoices", label: "Factures", icon: "wallet", visible: true },
  { id: "documents", label: "Documents", icon: "upload", visible: true },
  { id: "accounting", label: "Comptabilité", icon: "wallet", visible: true },
  { id: "contacts", label: "Contacts", icon: "users", visible: true },
  { id: "settings", label: "Réglages", icon: "users", visible: true, locked: true }
];

// Plan comptable de la copropriété (cahier des charges "Module Comptabilité").
const PLAN_COMPTABLE = {
  Administration: ["Honoraires syndic", "Frais administratifs", "Frais bancaires", "Assurances"],
  Entretien: ["Espaces verts", "Nettoyage", "Éclairage", "Ascenseurs", "Portails", "Interphones", "Caméras"],
  Travaux: ["Travaux votés", "Travaux exceptionnels", "Travaux urgents", "Fonds travaux"],
  Juridique: ["Avocats", "Huissiers", "Expertises"],
  Divers: ["Fournitures", "Prestataires", "Dépenses exceptionnelles"]
};
const CATEGORY_OPTIONS = Object.entries(PLAN_COMPTABLE).flatMap(([group, subs]) => subs.map((sub) => `${group} / ${sub}`));

// Code d'imputation comptable court, dérivé automatiquement de la catégorie choisie
// (ex. "Entretien / Ascenseurs" -> "ENT-ASC"). Evite d'ajouter un champ de saisie manuel.
function imputationCode(category) {
  if (!category || !category.includes(" / ")) return "-";
  const [group, sub] = category.split(" / ");
  const short = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z]/g, "")
      .toUpperCase()
      .slice(0, 3);
  return `${short(group)}-${short(sub)}`;
}

// Domaines de responsabilité que peut couvrir un membre du conseil syndical, en plus de son
// bâtiment référent - aide à répartir clairement "qui suit quoi" au sein du conseil.
const RESPONSIBILITY_DOMAINS = [
  "Ascenseurs",
  "Espaces verts",
  "Nettoyage",
  "Sécurité / Caméras",
  "Éclairage",
  "Travaux",
  "Contrats & Assurances",
  "Comptabilité",
  "Juridique",
  "Assemblées Générales",
  "Communication"
];

const icons = {
  dashboard: "M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7v-9h-7v9Zm0-16v5h7V4h-7Z",
  calendar: "M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm13 8H4v10h16V10Z",
  check: "m9.2 16.6-4.1-4.1L3.7 14l5.5 5.5L21 7.7 19.6 6.3 9.2 16.6Z",
  alert: "M12 2 1 21h22L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V8h2v5Z",
  wallet: "M3 6h18v12H3V6Zm2 2v8h14V8H5Zm10 3h3v2h-3v-2Z",
  users: "M8 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm8.5 1a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7ZM2 21a6 6 0 0 1 12 0H2Zm12.5-1.5c-.2-1.4-.8-2.7-1.8-3.7A5 5 0 0 1 22 18.5V21h-7.3c0-.5-.1-1-.2-1.5Z",
  download: "M11 3h2v10l3.5-3.5 1.4 1.4L12 16.8l-5.9-5.9 1.4-1.4L11 13V3ZM5 19h14v2H5v-2Z",
  upload: "M11 21V11L7.5 14.5 6.1 13.1 12 7.2l5.9 5.9-1.4 1.4L13 11v10h-2ZM5 3h14v2H5V3Z",
  trash: "M7 21c-1.1 0-2-.9-2-2V7h14v12c0 1.1-.9 2-2 2H7ZM9 4h6l1 1h4v2H4V5h4l1-1Z",
  plus: "M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4Z",
  print: "M6 9V3h12v6h2a2 2 0 0 1 2 2v6h-4v4H6v-4H2v-6a2 2 0 0 1 2-2h2Zm2-4v4h8V5H8Zm0 11v3h8v-3H8Z",
  close: "m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z",
  edit: "M4 17.3V20h2.7L17.8 8.9l-2.7-2.7L4 17.3ZM19.7 7c.4-.4.4-1 0-1.4l-1.3-1.3a1 1 0 0 0-1.4 0l-1 1L18.7 8l1-1Z",
  delete: "M7 21c-1.1 0-2-.9-2-2V7h14v12c0 1.1-.9 2-2 2H7ZM9 4h6l1 1h4v2H4V5h4l1-1Z",
  done: "M9.2 16.2 4.8 11.8 3.4 13.2l5.8 5.8L21 7.2 19.6 5.8 9.2 16.2Z"
};

const seedData = {
  members: [
    {
      id: crypto.randomUUID(),
      name: "Céline",
      role: "Référente bâtiment B",
      building: "Batiment B",
      email: "",
      phone: "",
      notes: "Membre du conseil syndical pour le bâtiment B."
    },
    {
      id: crypto.randomUUID(),
      name: "Edna",
      role: "Référente bâtiment C",
      building: "Batiment C",
      email: "",
      phone: "",
      notes: "Membre du conseil syndical pour le bâtiment C."
    },
    {
      id: crypto.randomUUID(),
      name: "Cécile",
      role: "Référente bâtiment C",
      building: "Batiment C",
      email: "",
      phone: "",
      notes: "Membre du conseil syndical pour le bâtiment C."
    },
    {
      id: crypto.randomUUID(),
      name: "Beïja",
      role: "Référente bâtiment D",
      building: "Batiment D",
      email: "",
      phone: "",
      notes: "Membre du conseil syndical pour le bâtiment D."
    },
    {
      id: crypto.randomUUID(),
      name: "Christina",
      role: "Référente bâtiment D",
      building: "Batiment D",
      email: "",
      phone: "",
      notes: "Membre du conseil syndical pour le bâtiment D."
    },
    {
      id: crypto.randomUUID(),
      name: "Justine",
      role: "Référente bâtiment D",
      building: "Batiment D",
      email: "",
      phone: "",
      notes: "Membre du conseil syndical pour le bâtiment D."
    },
    {
      id: crypto.randomUUID(),
      name: "Pierrick",
      role: "Référent bâtiment C",
      building: "Batiment C",
      email: "",
      phone: "",
      notes: "Membre du conseil syndical pour le bâtiment C."
    },
    {
      id: crypto.randomUUID(),
      name: "Alex",
      role: "Référent bâtiment C",
      building: "Batiment C",
      email: "",
      phone: "",
      notes: "Membre du conseil syndical pour le bâtiment C."
    }
  ],
  meetings: [
    {
      id: crypto.randomUUID(),
      date: "2026-07-02",
      title: "Préparation assemblée générale",
      place: "Local du conseil",
      building: "Tous les batiments",
      agenda: "Validation des devis ascenseur\nQuestions sur les charges\nPlanning travaux hall"
    }
  ],
  tasks: [
    {
      id: crypto.randomUUID(),
      title: "Comparer les devis d'entretien ascenseur",
      owner: "Céline",
      due: "2026-07-01",
      status: "open",
      priority: "Haute",
      building: "Tous les batiments",
      createdBy: "Céline",
      notes: "Vérifier garanties, délais et pénalités d'intervention."
    },
    {
      id: crypto.randomUUID(),
      title: "Relancer le syndic sur les infiltrations du bâtiment B",
      owner: "Céline",
      due: "2026-06-28",
      status: "open",
      priority: "Haute",
      building: "Batiment B",
      createdBy: "Céline",
      notes: "Inclure photos et dates des précédents signalements."
    },
    {
      id: crypto.randomUUID(),
      title: "Publier le compte rendu de la dernière réunion",
      owner: "Cécile",
      due: "2026-06-24",
      status: "done",
      priority: "Normale",
      building: "Tous les batiments",
      createdBy: "Cécile",
      notes: "Version courte pour affichage."
    }
  ],
  incidents: [
    {
      id: crypto.randomUUID(),
      title: "Porte parking mal verrouillée",
      location: "Sous-sol - niveau -1",
      building: "Tous les batiments",
      severity: "Urgent",
      status: "En cours",
      description: "Ouverture aléatoire après 22h. Demander passage de maintenance."
    },
    {
      id: crypto.randomUUID(),
      title: "Éclairage faible",
      location: "Escalier C",
      building: "Batiment C",
      severity: "Normal",
      status: "A qualifier",
      description: "Plusieurs ampoules fatiguées entre les étages 3 et 5."
    }
  ],
  syndicRequests: [
    {
      id: crypto.randomUUID(),
      title: "Demande de diagnostic infiltrations",
      sentDate: "2026-06-20",
      completedDate: "",
      building: "Batiment B",
      status: "En attente",
      relances: "1",
      notes: "Envoyée au gestionnaire avec photos et historique."
    },
    {
      id: crypto.randomUUID(),
      title: "Intervention éclairage escalier C",
      sentDate: "2026-06-10",
      completedDate: "2026-06-18",
      building: "Batiment C",
      status: "Accomplie",
      relances: "0",
      notes: "Remplacement des ampoules confirmé."
    }
  ],
  budget: [
    {
      id: crypto.randomUUID(),
      label: "Ascenseur",
      category: "Maintenance",
      amount: 4200,
      building: "Tous les batiments",
      status: "Devis"
    },
    {
      id: crypto.randomUUID(),
      label: "Peinture du hall",
      category: "Travaux",
      amount: 7800,
      building: "Tous les batiments",
      status: "A voter"
    },
    {
      id: crypto.randomUUID(),
      label: "Espaces verts",
      category: "Entretien",
      amount: 1600,
      building: "Tous les batiments",
      status: "Valide"
    }
  ],
  invoices: [
    {
      id: crypto.randomUUID(),
      number: "FAC-2026-001",
      provider: "Ascenseurs Delta",
      label: "Maintenance ascenseur",
      category: "Maintenance",
      building: "Tous les batiments",
      invoiceDate: "2026-06-12",
      dueDate: "2026-07-12",
      amount: 1850,
      status: "A payer",
      notes: "À rapprocher du contrat de maintenance."
    },
    {
      id: crypto.randomUUID(),
      number: "FAC-2026-002",
      provider: "Nettoyage Horizon",
      label: "Entretien parties communes",
      category: "Entretien",
      building: "Tous les batiments",
      invoiceDate: "2026-06-18",
      dueDate: "2026-07-01",
      amount: 920,
      status: "Payee",
      notes: "Paiement validé par le syndic."
    }
  ],
  documents: [],
  contracts: [
    {
      id: crypto.randomUUID(),
      provider: "Ascenseurs Delta",
      service: "Maintenance ascenseur",
      building: "Tous les batiments",
      endDate: "2026-12-31",
      noticeMonths: "3",
      status: "Actif",
      notes: "Vérifier les conditions de renouvellement tacite."
    },
    {
      id: crypto.randomUUID(),
      provider: "Nettoyage Horizon",
      service: "Entretien parties communes",
      building: "Tous les batiments",
      endDate: "2026-09-30",
      noticeMonths: "2",
      status: "A surveiller",
      notes: "Préavis à anticiper avant consultation concurrente."
    }
  ],
  procedures: [
    {
      id: crypto.randomUUID(),
      title: "Remise en route du chauffage",
      period: "Début octobre",
      targetDate: "2026-10-01",
      owner: "Céline",
      building: "Tous les batiments",
      status: "A planifier",
      steps: "Vérifier la date souhaitée avec le conseil syndical\nAdresser la demande au syndic\nDemander confirmation au chauffagiste ou au prestataire\nInformer les résidents de la date prévisionnelle\nContrôler la remise en route et noter les anomalies"
    },
    {
      id: crypto.randomUUID(),
      title: "Coupure du chauffage",
      period: "Fin mars",
      targetDate: "2027-03-31",
      owner: "Céline",
      building: "Tous les batiments",
      status: "A planifier",
      steps: "Vérifier la météo et les consignes de la copropriété\nAdresser la demande de coupure au syndic\nObtenir la date d'intervention ou de bascule\nInformer les résidents\nConfirmer que la coupure est effective"
    }
  ],
  contacts: [
    {
      id: crypto.randomUUID(),
      name: "Cabinet Martin",
      role: "Syndic",
      email: "contact@cabinet-martin.example",
      phone: "01 23 45 67 89",
      building: "Tous les batiments",
      notes: "Gestionnaire: Mme Laurent"
    },
    {
      id: crypto.randomUUID(),
      name: "Équipe conseil",
      role: "Membres du conseil syndical",
      email: "conseil@example.org",
      phone: "",
      building: "Tous les batiments",
      notes: "Liste de diffusion interne"
    }
  ],
  quotes: [
    {
      id: crypto.randomUUID(),
      provider: "Ravalement Pro",
      label: "Ravalement façade bâtiment D",
      comparisonGroup: "Ravalement façade 2026",
      building: "Batiment D",
      receivedDate: "2026-05-10",
      validatedDate: "",
      amount: 18500,
      status: "En attente",
      notes: ""
    },
    {
      id: crypto.randomUUID(),
      provider: "Façades Nova",
      label: "Ravalement façade bâtiment D",
      comparisonGroup: "Ravalement façade 2026",
      building: "Batiment D",
      receivedDate: "2026-05-14",
      validatedDate: "",
      amount: 21200,
      status: "En attente",
      notes: ""
    }
  ],
  arrears: [
    {
      id: crypto.randomUUID(),
      lotNumber: "D12",
      building: "Batiment D",
      ownerLabel: "Lot D12",
      amountDue: 1450,
      sinceDate: "2026-03-01",
      remindersCount: "2",
      formalNotice: "Non envoyée",
      legalProcedure: "Aucune",
      notes: ""
    }
  ],
  fundCalls: [
    {
      id: crypto.randomUUID(),
      exercise: "2026",
      building: "Tous les batiments",
      budgetVoted: 45000,
      amountCalled: 33750,
      amountCollected: 31200,
      notes: "Appels trimestriels, T3 en cours."
    }
  ],
  worksFundMovements: [
    {
      id: crypto.randomUUID(),
      date: "2026-01-15",
      type: "Versement",
      amount: 5000,
      notes: "Cotisation annuelle fonds travaux (loi ALUR)."
    }
  ],
  auditLog: []
};

const schemas = {
  meetings: [
    ["date", "Date", "date"],
    ["title", "Titre", "text"],
    ["place", "Lieu", "text"],
    ["building", "Périmètre", "select", "", BUILDINGS],
    ["agenda", "Ordre du jour", "textarea", "full"]
  ],
  tasks: [
    ["title", "Action", "text", "full"],
    ["owner", "Attribuée à", "select", "", "members"],
    ["createdBy", "Créée par", "select", "", "profiles"],
    ["due", "Échéance", "date"],
    ["building", "Bâtiment", "select", "", BUILDINGS],
    ["priority", "Priorité", "select", "", ["Haute", "Normale", "Basse"]],
    ["status", "Statut", "select", "", ["open", "done"]],
    ["notes", "Commentaires", "textarea", "full"]
  ],
  incidents: [
    ["title", "Signalement", "text", "full"],
    ["location", "Lieu", "text"],
    ["building", "Bâtiment", "select", "", BUILDINGS],
    ["severity", "Niveau", "select", "", ["Urgent", "Normal", "Faible"]],
    ["status", "Statut", "select", "", ["A qualifier", "En cours", "Clos"]],
    ["description", "Description", "textarea", "full"]
  ],
  syndicRequests: [
    ["title", "Demande", "text", "full"],
    ["sentDate", "Date d'envoi", "date"],
    ["completedDate", "Date accomplie", "date"],
    ["building", "Bâtiment", "select", "", BUILDINGS],
    ["status", "Statut", "select", "", ["En attente", "En cours", "Accomplie"]],
    ["relances", "Relances", "select", "", ["0", "1", "2", "3", "4", "5+"]],
    ["notes", "Notes", "textarea", "full"]
  ],
  budget: [
    ["label", "Poste", "text", "full"],
    ["category", "Catégorie comptable", "select", "full", CATEGORY_OPTIONS],
    ["building", "Bâtiment", "select", "", BUILDINGS],
    ["amount", "Montant EUR", "number"],
    ["status", "Statut", "select", "", ["Devis", "A voter", "Valide", "Paye"]]
  ],
  invoices: [
    ["number", "Numéro", "text"],
    ["provider", "Prestataire", "text"],
    ["label", "Objet", "text", "full"],
    ["category", "Catégorie comptable", "select", "full", CATEGORY_OPTIONS],
    ["building", "Bâtiment", "select", "", BUILDINGS],
    ["invoiceDate", "Date facture", "date"],
    ["dueDate", "Échéance", "date"],
    ["paymentDate", "Date paiement", "date"],
    ["amountHT", "Montant HT (EUR)", "number"],
    ["tvaRate", "TVA (%)", "number"],
    ["amount", "Montant TTC (EUR)", "number"],
    ["paymentMethod", "Mode de règlement", "select", "", ["Virement", "Chèque", "Prélèvement", "Espèces", "Carte"]],
    ["quoteAmount", "Montant du devis lié (EUR, si existant)", "number"],
    ["status", "Statut", "select", "", ["A payer", "En verification", "Payee", "Contestee"]],
    ["notes", "Notes", "textarea", "full"]
  ],
  documents: [
    ["title", "Intitulé", "text", "full"],
    ["category", "Type", "select", "", ["Photo", "Vidéo", "Facture", "Devis", "Contrat", "Courrier", "Fichier", "Autre"]],
    ["building", "Bâtiment", "select", "", BUILDINGS],
    ["documentDate", "Date", "date"],
    ["notes", "Notes", "textarea", "full"]
  ],
  contracts: [
    ["provider", "Prestataire", "text"],
    ["siret", "SIRET", "text"],
    ["contactName", "Contact", "text"],
    ["phone", "Téléphone", "text"],
    ["email", "Email", "text"],
    ["service", "Service", "text", "full"],
    ["building", "Bâtiment", "select", "", BUILDINGS],
    ["amountAnnual", "Montant annuel EUR", "number"],
    ["endDate", "Fin du contrat", "date"],
    ["tacitRenewal", "Reconduction tacite", "select", "", ["Oui", "Non"]],
    ["noticeMonths", "Préavis (mois)", "select", "", ["1", "2", "3", "4", "5", "6"]],
    ["status", "Statut", "select", "", ["Actif", "A surveiller", "Preavis envoye", "Termine"]],
    ["notes", "Notes", "textarea", "full"]
  ],
  procedures: [
    ["title", "Marche à suivre", "text", "full"],
    ["period", "Période conseillée", "text"],
    ["targetDate", "Date cible", "date"],
    ["owner", "Responsable", "select", "", "members"],
    ["building", "Bâtiment", "select", "", BUILDINGS],
    ["status", "Statut", "select", "", ["A planifier", "En cours", "Demande envoyee", "Terminee"]],
    ["steps", "Étapes", "textarea", "full"]
  ],
  contacts: [
    ["name", "Nom", "text"],
    ["role", "Rôle", "text"],
    ["building", "Bâtiment", "select", "", BUILDINGS],
    ["email", "Email", "email"],
    ["phone", "Téléphone", "tel"],
    ["notes", "Notes", "textarea", "full"]
  ],
  members: [
    ["name", "Nom", "text"],
    ["role", "Rôle", "text"],
    ["building", "Référent bâtiment", "select", "", BUILDINGS],
    ["domain", "Domaine de responsabilité", "select", "", RESPONSIBILITY_DOMAINS],
    ["email", "Email", "email"],
    ["phone", "Téléphone", "tel"],
    ["notes", "Notes", "textarea", "full"]
  ],
  quotes: [
    ["provider", "Entreprise", "text"],
    ["label", "Objet", "text", "full"],
    ["comparisonGroup", "Groupe de comparaison", "text"],
    ["building", "Bâtiment", "select", "", BUILDINGS],
    ["receivedDate", "Date réception", "date"],
    ["validatedDate", "Date validation", "date"],
    ["amount", "Montant EUR", "number"],
    ["status", "Statut", "select", "", ["En attente", "Refusé", "Accepté", "Réalisé"]],
    ["notes", "Notes", "textarea", "full"]
  ],
  arrears: [
    ["lotNumber", "N° de lot", "text"],
    ["building", "Bâtiment", "select", "", BUILDINGS],
    ["ownerLabel", "Référence propriétaire", "text", "full"],
    ["amountDue", "Somme due EUR", "number"],
    ["sinceDate", "Impayé depuis le", "date"],
    ["remindersCount", "Relances effectuées", "select", "", ["0", "1", "2", "3", "4", "5+"]],
    ["formalNotice", "Mise en demeure", "select", "", ["Non envoyée", "Envoyée"]],
    ["legalProcedure", "Procédure contentieuse", "select", "", ["Aucune", "En cours", "Engagée"]],
    ["notes", "Notes", "textarea", "full"]
  ],
  fundCalls: [
    ["exercise", "Exercice", "text"],
    ["building", "Bâtiment", "select", "", BUILDINGS],
    ["budgetVoted", "Budget voté EUR", "number"],
    ["amountCalled", "Montant appelé EUR", "number"],
    ["amountCollected", "Montant encaissé EUR", "number"],
    ["notes", "Notes", "textarea", "full"]
  ],
  worksFundMovements: [
    ["date", "Date", "date"],
    ["type", "Type", "select", "", ["Versement", "Utilisation"]],
    ["amount", "Montant EUR", "number"],
    ["notes", "Notes", "textarea", "full"]
  ]
};

const labels = {
  dashboard: "Tableau de bord",
  meetings: "Réunions",
  tasks: "Actions",
  urgencies: "Urgences",
  members: "Membres CS",
  incidents: "Signalements",
  syndicRequests: "Demandes syndic",
  contracts: "Contrats",
  procedures: "Marches à suivre",
  budget: "Budget",
  invoices: "Factures",
  documents: "Documents",
  accounting: "Comptabilité",
  contacts: "Contacts",
  quotes: "Devis",
  arrears: "Impayés",
  fundCalls: "Appels de fonds",
  worksFundMovements: "Fonds travaux (ALUR)"
};

function formSchema(collection) {
  const base = schemas[collection] || [];
  const withActionBy = ACTION_BY_COLLECTIONS.has(collection)
    ? [...base, ["actionBy", "Actionnée par", "select", "", "profiles"]]
    : base;
  if (!ATTACHMENT_COLLECTIONS.has(collection)) return withActionBy;
  return [...withActionBy, ["attachment", "Pièce jointe", "file", "full"]];
}

// Onglets personnalisés : un membre peut créer un onglet libre (titre/bâtiment/statut/description
// + pièce jointe), au-delà des onglets prédéfinis. On réutilise le moteur générique de
// formulaires/listes déjà en place pour les factures, devis, etc.
const CUSTOM_TAB_SCHEMA = [
  ["title", "Titre", "text", "full"],
  ["building", "Bâtiment", "select", "", BUILDINGS],
  ["status", "Statut", "select", "", ["Nouveau", "En cours", "Traité"]],
  ["notes", "Description", "textarea", "full"]
];

function registerCustomTab(tab) {
  if (!tab || !tab.id) return;
  schemas[tab.id] = schemas[tab.id] || CUSTOM_TAB_SCHEMA;
  labels[tab.id] = tab.label;
  ATTACHMENT_COLLECTIONS.add(tab.id);
  ACTION_BY_COLLECTIONS.add(tab.id);
}

function createCustomTab(label) {
  const name = (label || "").trim();
  if (!name) return;
  const id = `custom-${Date.now().toString(36)}`;
  const tab = { id, label: name, icon: "check", visible: true, locked: false, custom: true };
  registerCustomTab(tab);
  state[id] = state[id] || [];
  const tabs = [...tabSettings(), { ...tab, order: tabSettings().length }];
  saveTabs(tabs);
  setView(id);
}

function removeTab(id) {
  const tab = tabSettings().find((item) => item.id === id);
  if (!tab || tab.locked) return;
  if (tab.custom) {
    if (!confirm(`Supprimer définitivement l'onglet "${tab.label}" et toutes ses données ? Cette action est irréversible.`)) return;
    delete state[id];
    const tabs = tabSettings().filter((item) => item.id !== id);
    saveTabs(tabs);
  } else {
    // Onglet prédéfini : on le masque du menu sans supprimer les données déjà saisies
    // (identique à décocher "Afficher" - il peut être rétabli à tout moment).
    if (!confirm(`Retirer l'onglet "${tab.label}" du menu ? Les données existantes seront conservées et vous pourrez le rétablir en cochant "Afficher".`)) return;
    updateTabVisibility(id, false);
  }
}

function defaultTabSettings() {
  return DEFAULT_TABS.map((tab, index) => ({ ...tab, order: index }));
}

function normalizeTabs(tabs = []) {
  const byId = new Map((tabs || []).map((tab) => [tab.id, tab]));
  const builtIns = DEFAULT_TABS.map((base, index) => ({
    ...base,
    ...(byId.get(base.id) || {}),
    icon: base.icon,
    locked: base.locked || false,
    label: accentFrenchText(byId.get(base.id)?.label || base.label),
    order: Number.isFinite(byId.get(base.id)?.order) ? byId.get(base.id).order : index
  }));
  const customTabs = (tabs || [])
    .filter((tab) => tab.custom && !DEFAULT_TABS.some((base) => base.id === tab.id))
    .map((tab, index) => ({ ...tab, order: Number.isFinite(tab.order) ? tab.order : builtIns.length + index }));
  customTabs.forEach(registerCustomTab);
  return [...builtIns, ...customTabs].sort((a, b) => a.order - b.order);
}

function tabSettings() {
  return normalizeTabs(state.settings?.tabs);
}

function tabLabel(id) {
  const tab = tabSettings().find((item) => item.id === id);
  return displayOption(tab?.label || labels[id] || id);
}

function displayOption(option) {
  const map = {
    "Tous les batiments": "Tous les bâtiments",
    "Batiment A": "Bâtiment A",
    "Batiment B": "Bâtiment B",
    "Batiment C": "Bâtiment C",
    "Batiment D": "Bâtiment D",
    "Batiment E": "Bâtiment E",
    Reunions: "Réunions",
    "Marches a suivre": "Marches à suivre",
    Comptabilite: "Comptabilité",
    Reglages: "Réglages",
    Echeance: "Échéance",
    Preavis: "Préavis",
    "Preavis envoye": "Préavis envoyé",
    Termine: "Terminé",
    Terminee: "Terminée",
    Payee: "Payée",
    Paye: "Payé",
    "A payer": "À payer",
    "A qualifier": "À qualifier",
    "A voter": "À voter",
    "A surveiller": "À surveiller",
    "A planifier": "À planifier",
    "En verification": "En vérification",
    Contestee: "Contestée",
    Valide: "Validé",
    Categorie: "Catégorie",
    Perimetre: "Périmètre",
    Priorite: "Priorité",
    "A faire": "À faire",
    "A suivre": "À suivre",
    "Aucune donnee": "Aucune donnée",
    "Demande envoyee": "Demande envoyée",
    "Piece jointe": "Pièce jointe",
    "Piece jointe actuelle": "Pièce jointe actuelle",
    "Marche à suivre": "Marche à suivre",
    "Marche a suivre": "Marche à suivre",
    "Etapes": "Étapes",
    Numero: "Numéro",
    Intitule: "Intitulé",
    Role: "Rôle",
    "Conseil syndical": "Conseil syndical",
    ouverte: "ouverte",
    terminee: "terminée",
    open: "ouverte",
    done: "terminée"
  };
  return map[option] || String(option || "").replaceAll("Batiment", "Bâtiment");
}

function accentFrenchText(value) {
  if (typeof value !== "string") return value;
  return value
    .replaceAll("Referente", "Référente")
    .replaceAll("Referent", "Référent")
    .replaceAll("batiment", "bâtiment")
    .replaceAll("Batiment", "Bâtiment")
    .replaceAll("Preparation", "Préparation")
    .replaceAll("assemblee generale", "assemblée générale")
    .replaceAll("preavis", "préavis")
    .replaceAll("Preavis", "Préavis")
    .replaceAll("precedents", "précédents")
    .replaceAll("delais", "délais")
    .replaceAll("penalites", "pénalités")
    .replaceAll("Verifier", "Vérifier")
    .replaceAll("verifier", "vérifier")
    .replaceAll("souhaitee", "souhaitée")
    .replaceAll("meteo", "météo")
    .replaceAll("copropriete", "copropriété")
    .replaceAll("residents", "résidents")
    .replaceAll("previsionnelle", "prévisionnelle")
    .replaceAll("Controler", "Contrôler")
    .replaceAll("controle", "contrôle")
    .replaceAll("controles", "contrôles")
    .replaceAll("aleatoire", "aléatoire")
    .replaceAll("apres", "après")
    .replaceAll("verrouillee", "verrouillée")
    .replaceAll("Eclairage", "Éclairage")
    .replaceAll("eclairage", "éclairage")
    .replaceAll("fatiguees", "fatiguées")
    .replaceAll("etages", "étages")
    .replaceAll("Envoyee", "Envoyée")
    .replaceAll("envoyee", "envoyée")
    .replaceAll("confirme", "confirmé")
    .replaceAll("valide", "validé")
    .replaceAll("modifie", "modifié")
    .replaceAll("comptabilite", "comptabilité")
    .replaceAll("marche a suivre", "marche à suivre")
    .replaceAll("Marche a suivre", "Marche à suivre");
}

function accentEntryText(entry) {
  const technicalFields = new Set(["id", "building", "status", "priority", "severity", "dataUrl", "mimeType", "attachment"]);
  return Object.fromEntries(
    Object.entries(entry || {}).map(([key, value]) => [key, technicalFields.has(key) ? value : accentFrenchText(value)])
  );
}

let currentProfile = PROFILES.includes(sessionStorage.getItem(PROFILE_KEY))
  ? sessionStorage.getItem(PROFILE_KEY)
  : DEFAULT_ACTIVE_PROFILE;
let currentAuthor = PROFILES.includes(sessionStorage.getItem(AUTHOR_KEY))
  ? sessionStorage.getItem(AUTHOR_KEY)
  : currentProfile;
if (currentProfile === DEFAULT_ACTIVE_PROFILE) {
  currentAuthor = DEFAULT_ACTIVE_PROFILE;
  sessionStorage.setItem(AUTHOR_KEY, currentAuthor);
}
if (!localStorage.getItem(BEIJA_AUTHOR_FIX_KEY) && (currentProfile === "Céline" || currentAuthor === "Céline" || currentProfile === PROFILES[0])) {
  currentProfile = DEFAULT_ACTIVE_PROFILE;
  currentAuthor = DEFAULT_ACTIVE_PROFILE;
  sessionStorage.setItem(PROFILE_KEY, currentProfile);
  sessionStorage.setItem(AUTHOR_KEY, currentAuthor);
  localStorage.setItem(BEIJA_AUTHOR_FIX_KEY, "done");
}
let state = loadState();
let lastKnownSave = localStorage.getItem(SHARED_STORAGE_KEY) || localStorage.getItem(storageKeyForProfile());
let activeView = "dashboard";
let activeBuilding = "all";
let activeMember = "all";
let searchTerm = "";
let editing = null;
let isAuthenticated = sessionStorage.getItem(SESSION_KEY) === "active";

function profileSlug(profile) {
  return profile
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function storageKeyForProfile(profile = currentProfile) {
  return profile === PROFILES[0] ? STORAGE_KEY : `${STORAGE_KEY}-${profileSlug(profile)}`;
}

function profileMeta() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_META_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProfileMeta() {
  const meta = profileMeta();
  const lastSaved = new Date().toISOString();
  // On ne note que le profil courant : la sauvegarde est désormais unique et partagée
  // (voir saveState), donc "lastSaved" doit refléter qui a réellement déclenché la sauvegarde.
  meta[currentProfile] = {
    lastSaved,
    storageKey: SHARED_STORAGE_KEY
  };
  localStorage.setItem(PROFILE_META_KEY, JSON.stringify(meta));
}

function readableDateTime(value) {
  if (!value) return "Aucune sauvegarde";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function currentPassword() {
  return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
}

function setPassword(password) {
  localStorage.setItem(PASSWORD_KEY, password);
}

function populateProfileSelect() {
  const select = document.getElementById("loginProfile");
  select.innerHTML = PROFILES.map(
    (profile) => `<option value="${escapeHtml(profile)}" ${profile === currentProfile ? "selected" : ""}>${escapeHtml(profile)}</option>`
  ).join("");
}

function populateAuthorSelect() {
  const select = document.getElementById("activeAuthor");
  if (!select) return;
  if (currentProfile === DEFAULT_ACTIVE_PROFILE && currentAuthor !== DEFAULT_ACTIVE_PROFILE) {
    currentAuthor = DEFAULT_ACTIVE_PROFILE;
    sessionStorage.setItem(AUTHOR_KEY, currentAuthor);
  }
  select.innerHTML = PROFILES.map(
    (profile) => `<option value="${escapeHtml(profile)}" ${profile === currentAuthor ? "selected" : ""}>${escapeHtml(profile)}</option>`
  ).join("");
}

function renderProfileSaves() {
  const countTarget = document.getElementById("profileSaveCount");
  const listTarget = document.getElementById("profileSaveList");
  if (!countTarget || !listTarget) return;
  const meta = profileMeta();
  const sharedSaveExists = Boolean(localStorage.getItem(SHARED_STORAGE_KEY));
  // La sauvegarde est désormais unique et partagée entre tous les profils : dès qu'elle
  // existe, tous les profils y ont accès (on garde meta[] uniquement pour l'horodatage "vu par").
  const savedProfiles = sharedSaveExists ? PROFILES : PROFILES.filter((profile) => meta[profile]);
  countTarget.textContent = savedProfiles.length;
  listTarget.innerHTML = PROFILES.map((profile) => {
    const hasSave = savedProfiles.includes(profile);
    const lastSaved = meta[profile]?.lastSaved;
    return `
      <button class="profile-save ${profile === currentProfile ? "active" : ""}" type="button" data-login-profile="${escapeHtml(profile)}">
        <strong>${escapeHtml(profile)}</strong>
        <span>${hasSave ? readableDateTime(lastSaved) : "Pas encore de sauvegarde"}</span>
      </button>`;
  }).join("");
}

function showLogin() {
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("appShell").classList.add("locked");
  populateProfileSelect();
  renderProfileSaves();
}

function applyRoleVisibility() {
  const admin = isAdmin();
  document.querySelectorAll("[data-admin-only]").forEach((element) => {
    element.style.display = admin ? "" : "none";
  });
}

function showApp() {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("appShell").classList.remove("locked");
  if (currentProfile === DEFAULT_ACTIVE_PROFILE) {
    currentAuthor = DEFAULT_ACTIVE_PROFILE;
    sessionStorage.setItem(AUTHOR_KEY, currentAuthor);
  }
  document.getElementById("activeProfileLabel").textContent = `Profil : ${currentProfile}`;
  populateAuthorSelect();
  applyRoleVisibility();
  showLastSaveStatus();
  setView(viewFromLocation(), false);
}

function handleLogin(event) {
  event.preventDefault();
  const user = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPassword").value;
  if (user === LOGIN_USER && password === currentPassword()) {
    isAuthenticated = true;
    currentProfile = document.getElementById("loginProfile").value || PROFILES[0];
    currentAuthor = currentProfile === DEFAULT_ACTIVE_PROFILE ? DEFAULT_ACTIVE_PROFILE : currentProfile;
    sessionStorage.setItem(PROFILE_KEY, currentProfile);
    sessionStorage.setItem(AUTHOR_KEY, currentAuthor);
    sessionStorage.setItem(SESSION_KEY, "active");
    state = loadState();
    lastKnownSave = localStorage.getItem(SHARED_STORAGE_KEY);
    saveState();
    document.getElementById("loginError").textContent = "";
    showApp();
    return;
  }
  document.getElementById("loginError").textContent = "Identifiant ou mot de passe incorrect.";
}

function logout() {
  isAuthenticated = false;
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(PROFILE_KEY);
  sessionStorage.removeItem(AUTHOR_KEY);
  document.getElementById("loginPassword").value = "";
  showLogin();
}

function loadState() {
  const shared = localStorage.getItem(SHARED_STORAGE_KEY);
  if (shared) {
    try {
      return normalizeState(JSON.parse(shared));
    } catch {
      // Fall back to profile storage below if the shared save is unreadable.
    }
  }
  const saved = localStorage.getItem(storageKeyForProfile());
  if (!saved) return normalizeState(structuredClone(seedData));
  try {
    return normalizeState(JSON.parse(saved));
  } catch {
    return normalizeState(structuredClone(seedData));
  }
}

function normalizeState(data) {
  const normalized = { ...structuredClone(seedData), ...data };
  normalized.settings = {
    ...(normalized.settings || {}),
    tabs: normalizeTabs(normalized.settings?.tabs || defaultTabSettings())
  };
  ["members", "meetings", "tasks", "incidents", "syndicRequests", "budget", "invoices", "documents", "contracts", "procedures", "contacts", "quotes", "arrears", "fundCalls", "worksFundMovements"].forEach((collection) => {
    normalized[collection] = (normalized[collection] || []).map((entry) => ({
      ...accentEntryText(entry),
      building: entry.building || guessBuilding(entry) || "Tous les batiments"
    }));
  });
  if (!normalized.members.length) {
    normalized.members = structuredClone(seedData.members);
  }
  normalized.auditLog = normalized.auditLog || [];
  normalized.tasks = normalized.tasks.map((task) => ({
    ...task,
    createdBy: task.createdBy || task.owner || "Conseil syndical",
    actionBy: task.actionBy || task.owner || task.createdBy || DEFAULT_ACTIVE_PROFILE
  }));
  ACTION_BY_COLLECTIONS.forEach((collection) => {
    if (collection === "tasks") return;
    normalized[collection] = (normalized[collection] || []).map((entry) => ({
      ...entry,
      actionBy: entry.actionBy || entry.owner || entry.createdBy || DEFAULT_ACTIVE_PROFILE
    }));
  });
  migrateLegacyMembers(normalized);
  ensureCurrentMembers(normalized);
  correctKnownData(normalized);
  return normalized;
}

function ensureCurrentMembers(normalized) {
  const existingNames = new Set((normalized.members || []).map((member) => member.name));
  seedData.members.forEach((member) => {
    if (!existingNames.has(member.name)) {
      normalized.members.push(structuredClone(member));
    }
  });
}

function correctKnownData(normalized) {
  // Correction ponctuelle : Pierrick est référent du bâtiment C, pas E (erreur initiale).
  // Edna est également référente du bâtiment C, pas B. On ne touche qu'aux installations
  // qui ont encore la valeur par défaut d'origine, pour ne jamais écraser une modification
  // volontaire faite depuis l'application.
  normalized.members = (normalized.members || []).map((member) => {
    if (member.name === "Pierrick" && member.building === "Batiment E") {
      return {
        ...member,
        building: "Batiment C",
        role: member.role === "Référent bâtiment E" ? "Référent bâtiment C" : member.role,
        notes:
          member.notes === "Membre du conseil syndical pour le bâtiment E."
            ? "Membre du conseil syndical pour le bâtiment C."
            : member.notes
      };
    }
    if (member.name === "Edna" && member.building === "Batiment B") {
      return {
        ...member,
        building: "Batiment C",
        role: member.role === "Référente bâtiment B" ? "Référente bâtiment C" : member.role,
        notes:
          member.notes === "Membre du conseil syndical pour le bâtiment B."
            ? "Membre du conseil syndical pour le bâtiment C."
            : member.notes
      };
    }
    return member;
  });
}

function migrateLegacyMembers(normalized) {
  const legacyNames = ["Sarah", "Mehdi", "Claire", "Membre 4", "Membre 5", "Membre 6", "Membre 7"];
  const currentNames = new Set((normalized.members || []).map((member) => member.name));
  const hasLegacyOnly = legacyNames.some((name) => currentNames.has(name)) && !seedData.members.some((member) => currentNames.has(member.name));
  if (!hasLegacyOnly) return;

  const ownerMap = {
    Sarah: "Céline",
    Mehdi: "Céline",
    Claire: "Cécile",
    "Membre 4": "Beïja",
    "Membre 5": "Christina",
    "Membre 6": "Justine",
    "Membre 7": "Pierrick"
  };
  normalized.members = structuredClone(seedData.members);
  ["tasks", "procedures"].forEach((collection) => {
    normalized[collection] = (normalized[collection] || []).map((entry) => ({
      ...entry,
      owner: ownerMap[entry.owner] || entry.owner
    }));
  });
}

function guessBuilding(entry) {
  const source = `${entry.title || ""} ${entry.location || ""} ${entry.label || ""} ${entry.notes || ""}`;
  const match = source.match(/batiment\s+([A-E])/i);
  return match ? `Batiment ${match[1].toUpperCase()}` : "";
}

function saveState() {
  const serialized = JSON.stringify(state);
  try {
    // On n'écrit qu'UNE seule copie partagée. loadState() lit toujours SHARED_STORAGE_KEY
    // en priorité, donc dupliquer l'état complet sous chaque profil (comme avant) ne servait
    // à rien et remplissait le quota du navigateur jusqu'à 9x plus vite - ce qui bloquait
    // les sauvegardes dès que quelques factures/documents avec pièces jointes étaient ajoutés.
    localStorage.setItem(SHARED_STORAGE_KEY, serialized);
    lastKnownSave = serialized;
    saveProfileMeta();
    updateSaveStatus(`Sauvegardé à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`, true);
    return true;
  } catch {
    updateSaveStatus("Sauvegarde impossible");
    alert("La sauvegarde locale est pleine. Supprimez quelques documents lourds ou ajoutez un fichier plus léger.");
    return false;
  }
}

function handleExternalSave(event) {
  const watchedKeys = new Set([SHARED_STORAGE_KEY, storageKeyForProfile()]);
  if (!isAuthenticated || !watchedKeys.has(event.key) || !event.newValue || event.newValue === lastKnownSave) {
    return;
  }
  try {
    state = normalizeState(JSON.parse(event.newValue));
    lastKnownSave = event.newValue;
    render();
  } catch {
    // Ignore an incomplete external write rather than interrupting the session.
  }
}

function inActiveBuilding(entry) {
  return (
    activeBuilding === "all" ||
    entry.building === activeBuilding ||
    entry.building === "Tous les batiments"
  );
}

function inActiveMember(entry, collection) {
  if (activeMember === "all") return true;
  if (collection === "members") return entry.name === activeMember;
  return entry.owner === activeMember || entry.name === activeMember || entry.notes?.includes(activeMember);
}

function matchesSearch(entry) {
  if (!searchTerm) return true;
  return JSON.stringify(entry).toLowerCase().includes(searchTerm);
}

function filtered(collection) {
  return state[collection].filter((entry) => inActiveBuilding(entry) && inActiveMember(entry, collection) && matchesSearch(entry));
}

function memberNames() {
  return state.members.map((member) => member.name).filter(Boolean);
}

function populateMemberFilter() {
  const select = document.getElementById("memberFilter");
  const current = select.value || "all";
  select.innerHTML = `<option value="all">Tous</option>${memberNames()
    .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join("")}`;
  select.value = memberNames().includes(current) ? current : "all";
  activeMember = select.value;
}

function euro(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function sumAmount(rows) {
  return rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
}

function groupAmounts(rows, key) {
  return rows.reduce((groups, row) => {
    const label = row[key] || "Non renseigne";
    groups[label] = (groups[label] || 0) + Number(row.amount || 0);
    return groups;
  }, {});
}

function readableDate(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${date}T12:00:00`));
}

function fileSizeLabel(bytes) {
  if (!bytes) return "Taille inconnue";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function attachmentFromFile(file) {
  if (!file || !file.size) return null;
  if (file.size > MAX_FILE_SIZE) {
    alert("Ce fichier est trop lourd pour la sauvegarde locale. Choisissez un fichier de moins de 3,5 Mo.");
    return null;
  }
  return {
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    dataUrl: await readFileAsDataUrl(file),
    addedAt: new Date().toISOString()
  };
}

function renderAttachment(entry, extraClass = "") {
  const attachment = entry?.attachment;
  if (!attachment?.dataUrl) return "";
  return `
    <a class="attachment-link ${extraClass}" href="${attachment.dataUrl}" target="_blank" rel="noopener">
      <span class="icon" data-icon="upload"></span>
      <span>${escapeHtml(attachment.fileName || "Pièce jointe")}</span>
      <small>${fileSizeLabel(attachment.size)}</small>
    </a>`;
}

function actionByLine(entry) {
  return entry?.actionBy ? `<span class="meta">Actionnée par ${escapeHtml(entry.actionBy)}</span>` : "";
}

function actionByText(entry) {
  return `actionnée par ${entry?.actionBy || DEFAULT_ACTIVE_PROFILE}`;
}

function daysBetween(start, end) {
  if (!start) return null;
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = end ? new Date(`${end}T12:00:00`) : new Date();
  return Math.max(0, Math.round((endDate - startDate) / 86400000));
}

function requestDelayLabel(request) {
  const days = daysBetween(request.sentDate, request.completedDate);
  if (days === null) return "Délai non renseigné";
  if (request.status === "Accomplie" || request.completedDate) {
    return `Accomplie en ${days} jour${days > 1 ? "s" : ""}`;
  }
  return `Ouverte depuis ${days} jour${days > 1 ? "s" : ""}`;
}

function addMonths(date, months) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function noticeLimitDate(contract) {
  if (!contract.endDate) return "";
  const endDate = new Date(`${contract.endDate}T12:00:00`);
  const months = Number(contract.noticeMonths || 0);
  const noticeDate = addMonths(endDate, -months);
  return noticeDate.toISOString().slice(0, 10);
}

function daysUntil(date) {
  if (!date) return null;
  return Math.ceil((new Date(`${date}T12:00:00`) - new Date()) / 86400000);
}

function contractNoticeLabel(contract) {
  const noticeDate = noticeLimitDate(contract);
  const remaining = daysUntil(noticeDate);
  if (!noticeDate || remaining === null) return "Préavis non renseigné";
  if (contract.status === "Preavis envoye") return `Préavis envoyé avant le ${readableDate(noticeDate)}`;
  if (remaining < 0) return `Préavis dépassé depuis ${Math.abs(remaining)} jour${Math.abs(remaining) > 1 ? "s" : ""}`;
  return `Préavis avant le ${readableDate(noticeDate)} (${remaining} jour${remaining > 1 ? "s" : ""})`;
}

function contractNoticeDisplay(contract) {
  return contractNoticeLabel(contract).toLocaleUpperCase("fr-FR");
}

function contractStatusClass(contract) {
  const remaining = daysUntil(noticeLimitDate(contract));
  if (contract.status === "Termine" || contract.status === "Preavis envoye") return "state-done";
  if (remaining !== null && remaining <= 45) return "state-warn";
  if (contract.status === "A surveiller") return "state-progress";
  return "";
}

function procedureStatusClass(procedure) {
  if (procedure.status === "Terminee") return "state-done";
  if (procedure.status === "En cours" || procedure.status === "Demande envoyee") return "state-progress";
  const remaining = daysUntil(procedure.targetDate);
  if (remaining !== null && remaining <= 30) return "state-warn";
  return "";
}

function contractsToWatch(limitDays = 90) {
  return filtered("contracts")
    .filter((contract) => !["Termine", "Preavis envoye"].includes(contract.status))
    .filter((contract) => {
      const remaining = daysUntil(noticeLimitDate(contract));
      return remaining !== null && remaining <= limitDays;
    })
    .sort((a, b) => String(noticeLimitDate(a)).localeCompare(String(noticeLimitDate(b))));
}

function openTaskItems() {
  return filtered("tasks")
    .filter((task) => task.status !== "done")
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || String(a.due).localeCompare(String(b.due)));
}

function inProgressItems() {
  return [
    ...openTaskItems().map((task) => ({
      collection: "tasks",
      id: task.id,
      title: task.title,
      badge: task.priority,
      meta: `${buildingShort(task.building)} - attribuée à ${task.owner || "personne à choisir"} - ${actionByText(task)} - créée par ${task.createdBy || "Conseil syndical"} - ${readableDate(task.due)}`,
      className: task.priority === "Haute" ? "state-warn" : "state-progress"
    })),
    ...filtered("incidents").filter((incident) => incident.status !== "Clos").map((incident) => ({
      collection: "incidents",
      id: incident.id,
      title: incident.title,
      badge: incident.status,
      meta: `${buildingShort(incident.building)} - ${incident.location} - ${actionByText(incident)}`,
      className: incident.severity === "Urgent" ? "state-warn" : "state-progress"
    })),
    ...filtered("syndicRequests").filter((request) => request.status !== "Accomplie").map((request) => ({
      collection: "syndicRequests",
      id: request.id,
      title: request.title,
      badge: request.status,
      meta: `${buildingShort(request.building)} - ${actionByText(request)} - ${requestDelayLabel(request)}`,
      className: statusClass(request.status)
    })),
    ...filtered("procedures").filter((procedure) => procedure.status !== "Terminee").map((procedure) => ({
      collection: "procedures",
      id: procedure.id,
      title: procedure.title,
      badge: procedure.status,
      meta: `${procedure.period} - ${buildingShort(procedure.building)}`,
      className: procedureStatusClass(procedure)
    }))
  ];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderIcons() {
  document.querySelectorAll("[data-icon]").forEach((target) => {
    const name = target.dataset.icon;
    target.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name]}"></path></svg>`;
  });
}

function renderNavigation() {
  document.getElementById("navList").innerHTML = tabSettings()
    .filter((tab) => tab.visible || tab.locked)
    .map(
      (tab) => `
      <button class="nav-item ${activeView === tab.id ? "active" : ""}" data-view="${tab.id}" type="button">
        <span class="icon" data-icon="${tab.icon}"></span>
        <span class="nav-label">${escapeHtml(displayOption(tab.label))}</span>
      </button>`
    )
    .join("");
}

function updateSaveStatus(message = "Sauvegarde commune prête", isSuccess = false) {
  const target = document.getElementById("saveStatus");
  if (target) {
    target.textContent = message;
    target.classList.toggle("success", isSuccess);
  }
}

function markSaveButtonsSaved() {
  const buttons = [document.getElementById("saveNowButton"), document.getElementById("pageSaveButton")].filter(Boolean);
  buttons.forEach((button) => {
    const label = button.dataset.defaultLabel || button.textContent.trim();
    button.dataset.defaultLabel = label;
    button.classList.add("saved");
    button.innerHTML = `<span class="icon" data-icon="done"></span> Sauvegardé`;
  });
  window.clearTimeout(markSaveButtonsSaved.timer);
  markSaveButtonsSaved.timer = window.setTimeout(() => {
    buttons.forEach((button) => {
      button.classList.remove("saved");
      button.innerHTML = `<span class="icon" data-icon="download"></span> ${button.dataset.defaultLabel || "Sauvegarder"}`;
    });
    renderIcons();
  }, 1800);
  renderIcons();
}

function showLastSaveStatus() {
  const lastSaved = profileMeta()[currentProfile]?.lastSaved;
  updateSaveStatus(lastSaved ? `Dernière sauvegarde ${readableDateTime(lastSaved)}` : "Sauvegarde commune prête");
}

function toggleSidebar() {
  const shell = document.getElementById("appShell");
  shell.classList.toggle("sidebar-collapsed");
  document.getElementById("sidebarToggle").title = shell.classList.contains("sidebar-collapsed")
    ? "Dérouler le menu"
    : "Replier le menu";
}

function moveInMenu(direction) {
  const tabs = tabSettings().filter((tab) => tab.visible || tab.locked);
  const index = Math.max(0, tabs.findIndex((tab) => tab.id === activeView));
  const next = tabs[Math.min(tabs.length - 1, Math.max(0, index + direction))];
  if (!next) return;
  setView(next.id);
  document.querySelector(`.nav-item[data-view="${next.id}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function viewFromLocation() {
  const view = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  return view || "dashboard";
}

function syncHistory(view) {
  const hash = `#${encodeURIComponent(view)}`;
  if (window.location.hash !== hash) {
    history.pushState({ view }, "", hash);
  }
}

function setView(view, updateHistory = true) {
  const targetTab = tabSettings().find((tab) => tab.id === view);
  if (!targetTab || (!targetTab.visible && !targetTab.locked)) view = "dashboard";
  const isCustom = Boolean(tabSettings().find((tab) => tab.id === view)?.custom);
  activeView = view;
  if (updateHistory) syncHistory(view);
  document.querySelectorAll(".view").forEach((section) => {
    if (section.id === "customTabView") {
      section.classList.toggle("active", isCustom);
    } else {
      section.classList.toggle("active", section.id === view && !isCustom);
    }
  });
  renderNavigation();
  document.getElementById("viewTitle").textContent = tabLabel(view);
  document.getElementById("pageSaveTitle").textContent = `Sauvegarder : ${tabLabel(view)}`;
  document.getElementById("quickAdd").style.display =
    isCustom || ["dashboard", "urgencies", "documents", "accounting", "settings"].includes(view) ? "none" : "inline-flex";
  render();
}

function empty(message) {
  return `<div class="empty">${message}</div>`;
}

function buildingShort(building) {
  return building === "Tous les batiments" ? "Tous" : displayOption(building || "Tous");
}

function buildingClass(building) {
  const letter = String(building || "").match(/[A-E]$/)?.[0]?.toLowerCase();
  return letter ? `building-${letter}` : "building-all";
}

function statusClass(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("urgent") || text.includes("haute") || text.includes("attente")) return "state-warn";
  if (text.includes("accomplie") || text.includes("terminee") || text.includes("valide") || text.includes("paye")) return "state-done";
  if (text.includes("cours")) return "state-progress";
  return "";
}

function urgencyLevel(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("accomplie") || text.includes("terminee") || text.includes("clos") || text.includes("paye")) return "done";
  if (text.includes("urgent") || text.includes("haute") || text.includes("attente") || text.includes("contestee")) return "critical";
  if (text.includes("basse") || text.includes("faible")) return "low";
  if (text.includes("cours") || text.includes("normal") || text.includes("verification")) return "medium";
  return "medium";
}

function urgencyClass(value) {
  return `urgency-${urgencyLevel(value)}`;
}

function urgencyBadgeClass(value) {
  return `urgency-${urgencyLevel(value)}-badge`;
}

function priorityLetter(priority) {
  return { Haute: "H", Normale: "N", Basse: "B" }[priority] || "N";
}

function cyclePriority(id) {
  const order = ["Haute", "Normale", "Basse"];
  state.tasks = state.tasks.map((task) => {
    if (task.id !== id) return task;
    const next = order[(order.indexOf(task.priority) + 1) % order.length];
    return { ...task, priority: next };
  });
  saveState();
  render();
}

function renderBuildingSummary() {
  document.getElementById("buildingSummary").innerHTML = BUILDINGS.slice(1)
    .map((building) => {
      const tasks = state.tasks.filter((task) => task.building === building && task.status !== "done").length;
      const incidents = state.incidents.filter(
        (incident) => incident.building === building && incident.status !== "Clos"
      ).length;
      const budget = state.budget
        .filter((row) => row.building === building)
        .reduce((sum, row) => sum + Number(row.amount || 0), 0);

      return `
        <button class="building-card ${buildingClass(building)} ${activeBuilding === building ? "active" : ""}" type="button" data-building="${building}">
          <strong>${escapeHtml(building.replace("Batiment ", ""))}</strong>
          <span>${tasks} actions</span>
          <span>${incidents} signalements</span>
          <span>${euro(budget)}</span>
        </button>`;
    })
    .join("");
}

function tasksForBuilding(building, includeShared = true) {
  return filtered("tasks")
    .filter((task) => {
      const buildingMatch = task.building === building || (includeShared && task.building === "Tous les batiments");
      return buildingMatch && task.status !== "done";
    })
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || String(a.due).localeCompare(String(b.due)));
}

function priorityRank(priority) {
  return { Haute: 0, Normale: 1, Basse: 2 }[priority] ?? 1;
}

function urgentItems() {
  const urgentTasks = filtered("tasks")
    .filter((task) => task.status !== "done" && task.priority === "Haute")
    .map((task) => ({
      collection: "tasks",
      id: task.id,
      title: task.title,
      building: task.building,
      owner: task.owner || "Personne à choisir",
      meta: `${buildingShort(task.building)} - attribuée à ${task.owner || "personne à choisir"} - ${actionByText(task)} - créée par ${task.createdBy || "Conseil syndical"} - ${readableDate(task.due)}`,
      type: "Action haute",
      status: task.status,
      due: task.due || ""
    }));

  const urgentIncidents = filtered("incidents")
    .filter((incident) => incident.status !== "Clos" && incident.severity === "Urgent")
    .map((incident) => ({
      collection: "incidents",
      id: incident.id,
      title: incident.title,
      building: incident.building,
      owner: incident.location || "Lieu à préciser",
      meta: `${buildingShort(incident.building)} - ${incident.location} - ${actionByText(incident)} - ${displayOption(incident.status)}`,
      type: "Signalement urgent",
      status: incident.status,
      due: ""
    }));

  return [...urgentTasks, ...urgentIncidents].sort(
    (a, b) => buildingShort(a.building).localeCompare(buildingShort(b.building)) || a.due.localeCompare(b.due)
  );
}

function renderUrgentPreview(items) {
  const preview = items.slice(0, 5);
  document.getElementById("urgentPreviewCount").textContent = items.length;
  document.getElementById("urgentPreviewList").innerHTML = preview.length
    ? preview
        .map(
          (item) => `
          <button class="list-item interactive-row urgent-row ${urgencyClass(item.type)}" type="button" data-edit="${item.collection}:${item.id}">
            <div class="list-title">
              <strong>${escapeHtml(item.title)}</strong>
              <span class="badge ${urgencyBadgeClass(item.type)}">${escapeHtml(item.type)}</span>
            </div>
            <span class="meta">${escapeHtml(item.meta)}</span>
          </button>`
        )
        .join("")
    : empty("Aucune urgence avec ces filtres.");
}

function renderUrgencies() {
  const items = urgentItems();
  const groups = BUILDINGS.map((building) => [building, buildingShort(building)]);
  document.getElementById("urgencyBoard").innerHTML = groups
    .map(([building, title]) => {
      const groupItems = items.filter((item) => item.building === building);
      return `
        <section class="urgency-column ${buildingClass(building)}">
          <div class="column-title">
            <span>${escapeHtml(title)}</span>
            <span>${groupItems.length}</span>
          </div>
          ${
            groupItems.length
              ? groupItems
                  .map(
                    (item) => `
              <article class="card urgent-card ${buildingClass(item.building)} ${urgencyClass(item.type)}">
                <div class="list-title">
                  <strong>${escapeHtml(item.title)}</strong>
                  <span class="badge ${urgencyBadgeClass(item.type)}">${escapeHtml(item.type)}</span>
                </div>
                <span class="meta">${escapeHtml(item.meta)}</span>
                <div class="card-footer">
                  <button class="ghost-button" type="button" data-edit="${item.collection}:${item.id}">Ouvrir</button>
                  ${
                    item.collection === "tasks"
                      ? `<button class="ghost-button" type="button" data-complete="${item.id}">
                          <span class="icon" data-icon="done"></span>
                          Terminer
                        </button>`
                      : `<button class="ghost-button" type="button" data-close-incident="${item.id}">Clore</button>`
                  }
                </div>
              </article>`
                  )
                  .join("")
              : empty("Aucune urgence.")
          }
        </section>`;
    })
    .join("");
}

function renderBuildingTaskSummary() {
  const buildings = BUILDINGS.slice(1);
  const allOpenTasks = filtered("tasks").filter((task) => task.status !== "done");
  document.getElementById("buildingTasksCount").textContent = allOpenTasks.length;
  document.getElementById("buildingTaskSummary").innerHTML = buildings
    .map((building) => {
      const allTasks = tasksForBuilding(building);
      const tasks = allTasks.slice(0, 4);
      return `
        <section class="building-task-column ${buildingClass(building)}">
          <button class="building-task-head" type="button" data-building="${building}">
            <strong>${escapeHtml(displayOption(building))}</strong>
            <span>${allTasks.length} à faire</span>
          </button>
          <div class="building-task-list">
            ${
              tasks.length
                ? tasks
                    .map(
                      (task) => `
                        <button class="task-chip" type="button" data-edit="tasks:${task.id}">
                          <span class="task-chip-title">${escapeHtml(task.title)}</span>
                          <span class="meta">Attribuée à ${escapeHtml(task.owner || "personne à choisir")} - créée par ${escapeHtml(task.createdBy || "Conseil syndical")} - ${readableDate(task.due)}</span>
                        </button>`
                    )
                    .join("")
                : `<span class="empty compact">Rien d'ouvert</span>`
            }
          </div>
        </section>`;
    })
    .join("");
}

function renderTeamSummary() {
  const members = filtered("members");
  document.getElementById("teamCount").textContent = state.members.length;
  document.getElementById("teamSummary").innerHTML = members.length
    ? members
        .map((member) => {
          const openTasks = state.tasks.filter(
            (task) => task.owner === member.name && task.status !== "done" && inActiveBuilding(task)
          ).length;
          return `
            <article class="team-card ${buildingClass(member.building)}">
              <strong>${escapeHtml(member.name)}</strong>
              <span class="meta">${escapeHtml(member.role)}</span>
              <span class="badge">${escapeHtml(buildingShort(member.building))}</span>
              <span>${openTasks} action${openTasks > 1 ? "s" : ""} ouverte${openTasks > 1 ? "s" : ""}</span>
              <button class="mini-link" type="button" data-member="${escapeHtml(member.name)}">Voir ses sujets</button>
            </article>`;
        })
        .join("")
    : empty("Aucun membre pour ce bâtiment.");
}

function tasksForMember(memberName, includeDone = false) {
  return filtered("tasks")
    .filter((task) => task.owner === memberName && (includeDone || task.status !== "done"))
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || String(a.due).localeCompare(String(b.due)));
}

function renderMemberTaskSummary() {
  const members = filtered("members");
  const assignedTasks = filtered("tasks").filter((task) => task.owner && task.status !== "done");
  document.getElementById("assignedTasksCount").textContent = assignedTasks.length;
  document.getElementById("memberTaskSummary").innerHTML = members.length
    ? members
        .map((member) => {
          const tasks = tasksForMember(member.name).slice(0, 4);
          return `
            <section class="member-task-column ${buildingClass(member.building)}">
              <button class="member-task-head" type="button" data-member="${escapeHtml(member.name)}">
                <strong>${escapeHtml(member.name)}</strong>
                <span>${tasksForMember(member.name).length} à faire</span>
              </button>
              <div class="building-task-list">
                ${
                  tasks.length
                    ? tasks
                        .map(
                          (task) => `
                            <button class="task-chip" type="button" data-edit="tasks:${task.id}">
                              <span class="task-chip-title">${escapeHtml(task.title)}</span>
                              <span class="meta">${escapeHtml(buildingShort(task.building))} - ${escapeHtml(task.priority)} - attribuée à ${escapeHtml(task.owner || "personne à choisir")} - créée par ${escapeHtml(task.createdBy || "Conseil syndical")} - ${readableDate(task.due)}</span>
                            </button>`
                        )
                        .join("")
                    : `<span class="empty compact">Rien d'attitré</span>`
                }
              </div>
            </section>`;
        })
        .join("")
    : empty("Aucun membre avec ces filtres.");
}

function renderSyndicRequestSummary() {
  const requests = filtered("syndicRequests")
    .filter((request) => request.status !== "Accomplie")
    .sort((a, b) => String(a.sentDate).localeCompare(String(b.sentDate)));
  document.getElementById("syndicSummaryCount").textContent = requests.length;
  document.getElementById("syndicRequestSummary").innerHTML = requests.length
    ? requests.slice(0, 6)
        .map(
          (request) => `
          <button class="request-card ${buildingClass(request.building)} ${statusClass(request.status)}" type="button" data-edit="syndicRequests:${request.id}">
            <div class="list-title">
              <strong>${escapeHtml(request.title)}</strong>
              <span class="badge ${Number.parseInt(request.relances, 10) > 0 ? "warn" : ""}">${escapeHtml(request.relances)} relance${request.relances === "1" ? "" : "s"}</span>
            </div>
            <span class="meta">${escapeHtml(buildingShort(request.building))} - ${requestDelayLabel(request)}</span>
          </button>`
        )
        .join("")
    : empty("Aucune demande ouverte au syndic.");
}

function renderContractSummary() {
  const contracts = filtered("contracts").sort((a, b) =>
    String(noticeLimitDate(a)).localeCompare(String(noticeLimitDate(b)))
  );
  const watchedContracts = contractsToWatch();
  document.getElementById("contractSummaryCount").textContent = watchedContracts.length;
  document.getElementById("contractSummary").innerHTML = contracts.length
    ? contracts.slice(0, 6)
        .map(
          (contract) => `
          <button class="request-card ${buildingClass(contract.building)} ${contractStatusClass(contract)}" type="button" data-edit="contracts:${contract.id}">
            <div class="list-title">
              <strong>${escapeHtml(contract.provider)}</strong>
              <span class="badge ${contractStatusClass(contract) === "state-warn" ? "warn" : ""}">${escapeHtml(displayOption(contract.status))}</span>
            </div>
            <span class="meta">${escapeHtml(contract.service)} - ${escapeHtml(buildingShort(contract.building))}</span>
            <span class="meta">Fin le ${readableDate(contract.endDate)} - <strong class="notice-alert-text">${escapeHtml(contractNoticeDisplay(contract))}</strong></span>
          </button>`
        )
        .join("")
    : empty("Aucun contrat prestataire.");
}

function renderCurrentTaskStrip() {
  const tasks = openTaskItems().slice(0, 6);
  document.getElementById("currentTaskStrip").innerHTML = tasks.length
    ? tasks
        .map(
          (task) => `
          <button class="task-pill ${buildingClass(task.building)} ${statusClass(task.priority)} ${urgencyClass(task.priority)}" type="button" data-edit="tasks:${task.id}">
            <strong>${escapeHtml(task.title)}</strong>
            <span>Attribuée à ${escapeHtml(task.owner || "personne à choisir")} - créée par ${escapeHtml(task.createdBy || "Conseil syndical")} - ${escapeHtml(buildingShort(task.building))} - ${readableDate(task.due)}</span>
          </button>`
        )
        .join("")
    : empty("Aucune tâche ouverte avec ces filtres.");
}

function renderInProgressSummary() {
  const items = inProgressItems();
  document.getElementById("inProgressCount").textContent = items.length;
  document.getElementById("inProgressList").innerHTML = items.length
    ? items.slice(0, 8)
        .map(
          (item) => `
          <button class="progress-card ${item.className || ""} ${urgencyClass(item.badge)}" type="button" data-edit="${item.collection}:${item.id}">
            <div class="list-title">
              <strong>${escapeHtml(item.title)}</strong>
              <span class="badge ${urgencyBadgeClass(item.badge)}">${escapeHtml(displayOption(item.badge))}</span>
            </div>
            <span class="meta">${escapeHtml(item.meta)}</span>
          </button>`
        )
        .join("")
    : empty("Rien en cours avec ces filtres.");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function focusItems() {
  const today = todayIso();
  const taskItems = filtered("tasks")
    .filter((task) => task.status !== "done")
    .map((task) => {
      const late = task.due && task.due < today;
      const assignedToAuthor = task.owner === currentAuthor;
      const urgent = task.priority === "Haute";
      if (!late && !assignedToAuthor && !urgent) return null;
      return {
        collection: "tasks",
        id: task.id,
        title: task.title,
        label: late ? "RETARD" : urgent ? "URGENT" : "ATTRIBUÉE",
        className: late || urgent ? "urgency-critical" : "urgency-medium",
        rank: late ? 0 : urgent ? 1 : 4,
        meta: `${buildingShort(task.building)} - attribuée à ${task.owner || "personne à choisir"} - échéance ${readableDate(task.due)}`
      };
    })
    .filter(Boolean);

  const requestItems = filtered("syndicRequests")
    .filter((request) => request.status !== "Accomplie")
    .map((request) => {
      const daysOpen = daysBetween(request.sentDate, today);
      const relances = Number.parseInt(request.relances, 10) || 0;
      const mustRelance = relances > 0 || (daysOpen !== null && daysOpen >= 14);
      if (!mustRelance && request.actionBy !== currentAuthor) return null;
      return {
        collection: "syndicRequests",
        id: request.id,
        title: request.title,
        label: mustRelance ? "À RELANCER" : "À SUIVRE",
        className: mustRelance ? "urgency-critical" : "urgency-medium",
        rank: mustRelance ? 0 : 3,
        meta: `${buildingShort(request.building)} - ${actionByText(request)} - ${requestDelayLabel(request)} - ${request.relances} relance${request.relances === "1" ? "" : "s"}`
      };
    })
    .filter(Boolean);

  const contractItems = contractsToWatch().map((contract) => ({
    collection: "contracts",
    id: contract.id,
    title: contract.provider,
    label: "PRÉAVIS",
    className: "urgency-critical",
    rank: 1,
    meta: `${buildingShort(contract.building)} - ${contractNoticeDisplay(contract)}`
  }));

  const invoiceItems = filtered("invoices")
    .filter((invoice) => invoice.status !== "Payee")
    .map((invoice) => {
      const late = invoice.dueDate && invoice.dueDate <= today;
      if (!late && invoice.actionBy !== currentAuthor && invoice.status !== "A payer") return null;
      return {
        collection: "invoices",
        id: invoice.id,
        title: invoice.label,
        label: late ? "À PAYER" : "FACTURE",
        className: late ? "urgency-critical" : "urgency-medium",
        rank: late ? 1 : 4,
        meta: `${invoice.provider || "Prestataire"} - ${euro(invoice.amount)} - échéance ${readableDate(invoice.dueDate)}`
      };
    })
    .filter(Boolean);

  return [...taskItems, ...requestItems, ...contractItems, ...invoiceItems]
    .sort((a, b) => a.rank - b.rank || a.title.localeCompare(b.title))
    .slice(0, 8);
}

function renderFocusSummary() {
  const items = focusItems();
  document.getElementById("nowCount").textContent = items.length;
  document.getElementById("nowList").innerHTML = items.length
    ? items
        .map(
          (item) => `
          <button class="focus-item ${item.className}" type="button" data-edit="${item.collection}:${item.id}">
            <div class="list-title">
              <strong>${escapeHtml(item.title)}</strong>
              <span class="badge urgency-critical-badge">${escapeHtml(item.label)}</span>
            </div>
            <span class="meta">${escapeHtml(item.meta)}</span>
          </button>`
        )
        .join("")
    : empty("Rien d'urgent avec les filtres actuels.");
}

function decisionItems() {
  const today = todayIso();
  const unassignedTasks = filtered("tasks")
    .filter((task) => task.status !== "done" && (!task.owner || task.owner === "Conseil syndical"))
    .map((task) => ({
      collection: "tasks",
      id: task.id,
      title: task.title,
      badge: "À ATTRIBUER",
      tone: "warning",
      meta: `${buildingShort(task.building)} - échéance ${readableDate(task.due)}`
    }));

  const relanceRequests = filtered("syndicRequests")
    .filter((request) => {
      const daysOpen = daysBetween(request.sentDate, today);
      return request.status !== "Accomplie" && ((Number.parseInt(request.relances, 10) || 0) > 0 || (daysOpen !== null && daysOpen >= 14));
    })
    .map((request) => ({
      collection: "syndicRequests",
      id: request.id,
      title: request.title,
      badge: "RELANCE SYNDIC",
      tone: "critical",
      meta: `${buildingShort(request.building)} - ${requestDelayLabel(request)} - ${request.relances} relance${request.relances === "1" ? "" : "s"}`
    }));

  const invoiceDecisions = filtered("invoices")
    .filter((invoice) => invoice.status === "A payer" || invoice.status === "Contestee")
    .map((invoice) => ({
      collection: "invoices",
      id: invoice.id,
      title: invoice.label,
      badge: invoice.status === "Contestee" ? "À ARBITRER" : "À VALIDER",
      tone: invoice.status === "Contestee" ? "critical" : "warning",
      meta: `${invoice.provider || "Prestataire"} - ${euro(invoice.amount)} - ${displayOption(invoice.status)}`
    }));

  const contractDecisions = contractsToWatch().map((contract) => ({
    collection: "contracts",
    id: contract.id,
    title: contract.provider,
    badge: "PRÉAVIS",
    tone: "critical",
    meta: `${buildingShort(contract.building)} - ${contractNoticeDisplay(contract)}`
  }));

  const emergencyDecisions = urgentItems().slice(0, 4).map((item) => ({
    collection: item.collection,
    id: item.id,
    title: item.title,
    badge: "URGENCE",
    tone: "critical",
    meta: item.meta
  }));

  return [...relanceRequests, ...contractDecisions, ...invoiceDecisions, ...unassignedTasks, ...emergencyDecisions].slice(0, 8);
}

function renderDecisionCenter() {
  const items = decisionItems();
  document.getElementById("decisionCount").textContent = items.length;
  document.getElementById("decisionList").innerHTML = items.length
    ? items
        .map(
          (item) => `
          <button class="decision-item ${item.tone}" type="button" data-edit="${item.collection}:${item.id}">
            <span class="decision-badge">${escapeHtml(item.badge)}</span>
            <strong>${escapeHtml(item.title)}</strong>
            <span class="meta">${escapeHtml(item.meta)}</span>
          </button>`
        )
        .join("")
    : empty("Aucune décision sensible à prendre pour le moment.");
}

function renderRiskMatrix() {
  const buildings = BUILDINGS.slice(1);
  document.getElementById("riskMatrix").innerHTML = buildings
    .map((building) => {
      const openTasks = filtered("tasks").filter((task) => task.building === building && task.status !== "done").length;
      const urgentTasks = filtered("tasks").filter((task) => task.building === building && task.status !== "done" && task.priority === "Haute").length;
      const incidents = filtered("incidents").filter((incident) => incident.building === building && incident.status !== "Clos").length;
      const requests = filtered("syndicRequests").filter((request) => request.building === building && request.status !== "Accomplie").length;
      const score = urgentTasks * 3 + incidents * 2 + requests * 2 + openTasks;
      const level = score >= 7 ? "critical" : score >= 3 ? "warning" : "calm";
      const label = level === "critical" ? "Vigilance forte" : level === "warning" ? "À surveiller" : "Stable";
      return `
        <button class="risk-card ${buildingClass(building)} ${level}" type="button" data-building="${building}">
          <span>${escapeHtml(displayOption(building))}</span>
          <strong>${escapeHtml(label)}</strong>
          <small>${openTasks} tâche${openTasks > 1 ? "s" : ""} - ${incidents} signalement${incidents > 1 ? "s" : ""} - ${requests} demande${requests > 1 ? "s" : ""}</small>
        </button>`;
    })
    .join("");
}

function strategicDeadlineItem() {
  const candidates = [
    ...filtered("tasks")
      .filter((task) => task.status !== "done" && task.due)
      .map((task) => ({
        collection: "tasks",
        id: task.id,
        date: task.due,
        title: task.title,
        meta: `${buildingShort(task.building)} - tâche attribuée à ${task.owner || "personne à choisir"}`
      })),
    ...filtered("invoices")
      .filter((invoice) => invoice.status !== "Payee" && invoice.dueDate)
      .map((invoice) => ({
        collection: "invoices",
        id: invoice.id,
        date: invoice.dueDate,
        title: invoice.label,
        meta: `${invoice.provider || "Prestataire"} - ${euro(invoice.amount)}`
      })),
    ...contractsToWatch().map((contract) => ({
      collection: "contracts",
      id: contract.id,
      date: noticeLimitDate(contract),
      title: contract.provider,
      meta: contractNoticeDisplay(contract)
    }))
  ].filter((item) => item.date);

  return candidates.sort((a, b) => String(a.date).localeCompare(String(b.date)))[0] || null;
}

function renderStrategicStrip(openTasks, openIncidents, openSyndicRequests, urgencies) {
  const decisions = decisionItems();
  const priority = decisions[0] || urgencies[0] || null;
  const priorityCard = document.getElementById("strategicPriorityCard");
  if (priority) {
    priorityCard.dataset.edit = `${priority.collection}:${priority.id}`;
    document.getElementById("strategicPriorityTitle").textContent = priority.title;
    document.getElementById("strategicPriorityMeta").textContent = priority.meta;
  } else {
    delete priorityCard.dataset.edit;
    document.getElementById("strategicPriorityTitle").textContent = "Situation maîtrisée";
    document.getElementById("strategicPriorityMeta").textContent = "Aucun point critique immédiat";
  }

  const deadline = strategicDeadlineItem();
  const deadlineCard = document.getElementById("strategicDeadlineCard");
  if (deadline) {
    deadlineCard.dataset.edit = `${deadline.collection}:${deadline.id}`;
    document.getElementById("strategicDeadlineTitle").textContent = readableDate(deadline.date);
    document.getElementById("strategicDeadlineMeta").textContent = `${deadline.title} - ${deadline.meta}`;
  } else {
    delete deadlineCard.dataset.edit;
    document.getElementById("strategicDeadlineTitle").textContent = "Aucune échéance";
    document.getElementById("strategicDeadlineMeta").textContent = "Rien d'ouvert à court terme";
  }

  const pendingInvoices = filtered("invoices").filter((invoice) => invoice.status !== "Payee");
  const pendingTotal = sumAmount(pendingInvoices);
  document.getElementById("strategicBudgetTitle").textContent = euro(pendingTotal);
  document.getElementById("strategicBudgetMeta").textContent = pendingInvoices.length
    ? `${pendingInvoices.length} facture${pendingInvoices.length > 1 ? "s" : ""} à suivre`
    : "Aucune facture en attente";

  const riskLoad = urgencies.length * 12 + openIncidents.length * 7 + openSyndicRequests.length * 5 + openTasks.length * 3 + contractsToWatch().length * 10 + decisions.length * 6;
  const score = Math.max(0, Math.min(100, 100 - riskLoad));
  document.getElementById("masteryScore").textContent = `${score}%`;
}

function renderDashboard() {
  const visibleTasks = filtered("tasks");
  const visibleIncidents = filtered("incidents");
  const visibleSyndicRequests = filtered("syndicRequests");
  const visibleBudget = filtered("budget");
  const visibleInvoices = filtered("invoices");
  const visibleMeetings = filtered("meetings");
  const openTasks = visibleTasks.filter((task) => task.status !== "done");
  const openIncidents = visibleIncidents.filter((incident) => incident.status !== "Clos");
  const openSyndicRequests = visibleSyndicRequests.filter((request) => request.status !== "Accomplie");
  const total = visibleInvoices.length ? sumAmount(visibleInvoices) : sumAmount(visibleBudget);
  const nextMeeting = [...visibleMeetings].sort((a, b) => a.date.localeCompare(b.date))[0];

  document.getElementById("openTasksCount").textContent = openTasks.length;
  document.getElementById("openIncidentsCount").textContent = openIncidents.length;
  document.getElementById("openSyndicRequestsCount").textContent = openSyndicRequests.length;
  document.getElementById("budgetTotal").textContent = euro(total);
  document.getElementById("nextMeetingDate").textContent = nextMeeting ? readableDate(nextMeeting.date) : "-";
  document.getElementById("membersCount").textContent = state.members.length;

  const realBuildingsForOrg = BUILDINGS.filter((b) => b !== "Tous les batiments");
  const buildingsWithoutMember = realBuildingsForOrg.filter(
    (building) => !state.members.some((member) => member.building === building)
  );
  const domainsCoveredOrg = new Set(state.members.map((member) => member.domain).filter(Boolean));
  const domainsUncoveredOrg = RESPONSIBILITY_DOMAINS.filter((domain) => !domainsCoveredOrg.has(domain));
  const councilOrgSummary = document.getElementById("councilOrgSummary");
  if (councilOrgSummary) {
    councilOrgSummary.innerHTML = `
      <article class="metric ${buildingsWithoutMember.length ? "urgent-metric" : ""}">
        <span>Bâtiments sans référent</span>
        <strong>${buildingsWithoutMember.length ? buildingsWithoutMember.map(buildingShort).join(", ") : "Aucun - tous couverts"}</strong>
      </article>
      <article class="metric">
        <span>Domaines sans responsable</span>
        <strong>${domainsUncoveredOrg.length ? domainsUncoveredOrg.length : "Aucun - tous couverts"}</strong>
      </article>`;
  }

  const urgencies = urgentItems();
  document.getElementById("urgenciesCount").textContent = urgencies.length;
  document.getElementById("contractNoticeCount").textContent = contractsToWatch().length;
  document.getElementById("executiveUrgenciesCount").textContent = urgencies.length;
  document.getElementById("executiveNoticeCount").textContent = contractsToWatch().length;
  document.getElementById("executiveSyndicCount").textContent = openSyndicRequests.length;
  renderStrategicStrip(openTasks, openIncidents, openSyndicRequests, urgencies);
  renderUrgentPreview(urgencies);

  const priorities = [
    ...openTasks.filter((task) => task.priority === "Haute").map((task) => ({
      collection: "tasks",
      id: task.id,
      title: task.title,
      meta: `${buildingShort(task.building)} - attribuée à ${task.owner || "personne à choisir"} - ${actionByText(task)} - créée par ${task.createdBy || "Conseil syndical"} - ${readableDate(task.due)}`,
      tag: "Action"
    })),
    ...openIncidents.filter((incident) => incident.severity === "Urgent").map((incident) => ({
      collection: "incidents",
      id: incident.id,
      title: incident.title,
      meta: `${buildingShort(incident.building)} - ${incident.location}`,
      tag: "Urgent"
    }))
  ];

  document.getElementById("priorityCount").textContent = priorities.length;
  document.getElementById("priorityList").innerHTML = priorities.length
    ? priorities
        .map(
          (item) => `
          <button class="list-item interactive-row" type="button" data-edit="${item.collection}:${item.id}">
            <div class="list-title">
              <strong>${escapeHtml(item.title)}</strong>
              <span class="badge warn">${escapeHtml(item.tag)}</span>
            </div>
            <span class="meta">${escapeHtml(item.meta)}</span>
          </button>`
        )
        .join("")
    : empty("Aucune priorité haute pour le moment.");

  document.getElementById("agendaPreview").innerHTML = nextMeeting
    ? `<div>
        <h3>${escapeHtml(nextMeeting.title)}</h3>
        <p class="meta">${readableDate(nextMeeting.date)} - ${escapeHtml(buildingShort(nextMeeting.building))} - ${escapeHtml(nextMeeting.place)}</p>
      </div>
      <ol>${nextMeeting.agenda
        .split("\n")
        .filter(Boolean)
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}</ol>`
    : empty("Ajoutez une réunion pour construire un ordre du jour.");

  renderBuildingSummary();
  renderBuildingTaskSummary();
  renderTeamSummary();
  renderMemberTaskSummary();
  renderSyndicRequestSummary();
  renderContractSummary();
  renderInProgressSummary();
  renderFocusSummary();
  renderDecisionCenter();
  renderRiskMatrix();
  renderActivity();
}

function renderActivity() {
  const activity = [
    ...filtered("tasks").map((task) => ({
      collection: "tasks",
      id: task.id,
      title: task.title,
      meta: `Action - ${buildingShort(task.building)} - attribuée à ${task.owner || "personne à choisir"} - ${actionByText(task)} - créée par ${task.createdBy || "Conseil syndical"}`
    })),
    ...filtered("incidents").map((incident) => ({
      collection: "incidents",
      id: incident.id,
      title: incident.title,
      meta: `Signalement - ${buildingShort(incident.building)} - ${actionByText(incident)} - ${displayOption(incident.status)}`
    })),
    ...filtered("syndicRequests").map((request) => ({
      collection: "syndicRequests",
      id: request.id,
      title: request.title,
      meta: `Syndic - ${buildingShort(request.building)} - ${actionByText(request)} - ${requestDelayLabel(request)}`
    })),
    ...filtered("contracts").map((contract) => ({
      collection: "contracts",
      id: contract.id,
      title: contract.provider,
      meta: `Contrat - ${buildingShort(contract.building)} - ${actionByText(contract)} - ${contractNoticeDisplay(contract)}`
    })),
    ...filtered("invoices").map((invoice) => ({
      collection: "invoices",
      id: invoice.id,
      title: invoice.label,
      meta: `Facture - ${invoice.provider || "Prestataire"} - ${actionByText(invoice)} - ${euro(invoice.amount)} - ${displayOption(invoice.status)}`
    })),
    ...filtered("documents").map((document) => ({
      collection: "documents",
      id: document.id,
      title: document.title,
      meta: `Document - ${displayOption(document.category)} - ${buildingShort(document.building)}`
    })),
    ...filtered("procedures").map((procedure) => ({
      collection: "procedures",
      id: procedure.id,
      title: procedure.title,
      meta: `Marche à suivre - ${procedure.period} - ${actionByText(procedure)} - ${displayOption(procedure.status)}`
    })),
    ...filtered("meetings").map((meeting) => ({
      collection: "meetings",
      id: meeting.id,
      title: meeting.title,
      meta: `Réunion - ${readableDate(meeting.date)} - ${actionByText(meeting)}`
    }))
  ].slice(0, 6);

  document.getElementById("activityCount").textContent = activity.length;
  document.getElementById("activityList").innerHTML = activity.length
    ? activity
        .map(
          (item) => `
          <button class="list-item interactive-row" type="button" data-edit="${item.collection}:${item.id}">
            <strong>${escapeHtml(item.title)}</strong>
            <span class="meta">${escapeHtml(item.meta)}</span>
          </button>`
        )
        .join("")
    : empty("Aucune activité avec ces filtres.");
}

function renderMeetings() {
  const query = document.getElementById("meetingSearch").value.toLowerCase();
  const rows = filtered("meetings")
    .filter((meeting) => JSON.stringify(meeting).toLowerCase().includes(query))
    .sort((a, b) => a.date.localeCompare(b.date));

  document.getElementById("meetingsTable").innerHTML = rows.length
    ? rows
        .map(
          (meeting) => `
        <tr>
          <td>${readableDate(meeting.date)}</td>
          <td><strong>${escapeHtml(meeting.title)}</strong></td>
          <td>${escapeHtml(buildingShort(meeting.building))}<br><span class="meta">${escapeHtml(meeting.place)}</span></td>
          <td>${escapeHtml(meeting.agenda).replaceAll("\n", "<br>")}${actionByLine(meeting)}${renderAttachment(meeting)}</td>
          <td>${rowActions("meetings", meeting.id)}</td>
        </tr>`
        )
        .join("")
    : `<tr><td colspan="5">${empty("Aucune réunion trouvée.")}</td></tr>`;
}

function renderTasks() {
  const filter = document.getElementById("taskFilter").value;
  const groups = BUILDINGS.map((building) => [building, buildingShort(building)]);

  document.getElementById("taskBoard").innerHTML = groups
    .map(([building, title]) => {
      const tasks = filtered("tasks").filter((task) => {
        const statusMatch =
          filter === "all" ||
          (filter === "open" && task.status !== "done") ||
          (filter === "done" && task.status === "done");
        return task.building === building && statusMatch;
      }).sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || String(a.due).localeCompare(String(b.due)));
      return `
        <section class="column">
          <div class="column-title">
            <span>${escapeHtml(title)}</span>
            <span>${tasks.length}</span>
          </div>
          ${
            tasks.length
              ? tasks
                  .map(
                    (task) => `
            <article class="card ${buildingClass(task.building)} ${statusClass(task.priority)} ${urgencyClass(task.status === "done" ? "Terminee" : task.priority)}">
              <div class="list-title">
                <strong>${escapeHtml(task.title)}</strong>
                <span class="badge ${urgencyBadgeClass(task.status === "done" ? "Terminee" : task.priority)}">${task.status === "done" ? "Terminée" : task.priority}</span>
              </div>
              <span class="meta">${escapeHtml(buildingShort(task.building))} - ${readableDate(task.due)}</span>
              <span class="meta">Attribuée à ${escapeHtml(task.owner || "personne à choisir")}</span>
              <span class="meta">Créée par ${escapeHtml(task.createdBy || "Conseil syndical")}</span>
              ${actionByLine(task)}
              <div class="task-comment-box">
                <span>Commentaires</span>
                <p>${escapeHtml(task.notes || "Aucun commentaire.")}</p>
              </div>
              ${renderAttachment(task)}
              <div class="card-footer">
                <button class="ghost-button" type="button" data-complete="${task.id}">
                  <span class="icon" data-icon="done"></span>
                  ${task.status === "done" ? "Rouvrir" : "Terminer"}
                </button>
                <button class="small-action" type="button" title="Changer la priorité" data-cycle-priority="${task.id}">
                  <span>${priorityLetter(task.priority)}</span>
                </button>
                <div class="row-actions">${rowActions("tasks", task.id)}</div>
              </div>
            </article>`
                  )
                  .join("")
              : empty("Aucune action.")
          }
        </section>`;
    })
    .join("");
}

function renderMembers() {
  const members = filtered("members");

  // Organisation du conseil : repère les bâtiments sans référent et les domaines de
  // responsabilité non couverts, pour aider à répartir le travail du conseil syndical.
  const coverageContainer = document.getElementById("memberCoverage");
  if (coverageContainer) {
    const realBuildings = BUILDINGS.filter((b) => b !== "Tous les batiments");
    const buildingsWithoutMember = realBuildings.filter(
      (building) => !state.members.some((member) => member.building === building)
    );
    const domainsCovered = new Set(state.members.map((member) => member.domain).filter(Boolean));
    const domainsUncovered = RESPONSIBILITY_DOMAINS.filter((domain) => !domainsCovered.has(domain));

    coverageContainer.innerHTML = `
      <article class="metric">
        <span>Membres du conseil</span>
        <strong>${state.members.length}</strong>
      </article>
      <article class="metric ${buildingsWithoutMember.length ? "urgent-metric" : ""}">
        <span>Bâtiment(s) sans référent</span>
        <strong>${buildingsWithoutMember.length ? buildingsWithoutMember.map(buildingShort).join(", ") : "Aucun"}</strong>
      </article>
      <article class="metric">
        <span>Domaines sans responsable</span>
        <strong>${domainsUncovered.length}</strong>
      </article>`;
  }

  if (!members.length) {
    document.getElementById("memberCards").innerHTML = empty("Aucun membre du conseil syndical.");
    return;
  }

  const realBuildings = BUILDINGS.filter((b) => b !== "Tous les batiments");
  const grouped = realBuildings
    .map((building) => ({ building, list: members.filter((member) => member.building === building) }))
    .filter((group) => group.list.length);
  const others = members.filter((member) => !realBuildings.includes(member.building));
  if (others.length) grouped.push({ building: null, list: others });

  const memberCard = (member) => {
    const memberTasks = tasksForMember(member.name);
    const openTasks = memberTasks.length;
    const doneTasks = state.tasks.filter((task) => task.owner === member.name && task.status === "done").length;
    return `
      <article class="card ${buildingClass(member.building)}">
        <div class="list-title">
          <strong>${escapeHtml(member.name)}</strong>
          <span class="badge blue">${escapeHtml(buildingShort(member.building))}</span>
        </div>
        <span class="meta">${escapeHtml(member.role)}</span>
        ${member.domain ? `<span class="badge">${escapeHtml(member.domain)}</span>` : `<span class="meta">Aucun domaine de responsabilité renseigné</span>`}
        <span class="meta">${escapeHtml(member.email || "Email non renseigné")}</span>
        <span class="meta">${escapeHtml(member.phone || "Téléphone non renseigné")}</span>
        <p>${escapeHtml(member.notes)}</p>
        ${renderAttachment(member)}
        <div class="assigned-list">
          ${
            memberTasks.length
              ? memberTasks
                  .slice(0, 5)
                  .map(
                    (task) => `
                      <button class="assigned-task" type="button" data-edit="tasks:${task.id}">
                        <span>${escapeHtml(task.title)}</span>
                        <small>${escapeHtml(buildingShort(task.building))} - ${escapeHtml(task.priority)} - créée par ${escapeHtml(task.createdBy || "Conseil syndical")} - ${readableDate(task.due)}</small>
                      </button>`
                  )
                  .join("")
              : `<span class="empty compact">Aucune tâche ouverte</span>`
          }
        </div>
        <div class="card-footer">
          <span class="meta">${openTasks} ouverte${openTasks > 1 ? "s" : ""} - ${doneTasks} terminée${doneTasks > 1 ? "s" : ""}</span>
          <button class="ghost-button" type="button" data-member="${escapeHtml(member.name)}">Filtrer</button>
          <div class="row-actions">${rowActions("members", member.id)}</div>
        </div>
      </article>`;
  };

  document.getElementById("memberCards").innerHTML = grouped
    .map(
      (group) => `
      <div class="member-building-group">
        <h3 class="member-building-title">${group.building ? escapeHtml(displayOption(group.building)) : "Autre"}</h3>
        <div class="cards-grid">${group.list.map(memberCard).join("")}</div>
      </div>`
    )
    .join("");
}

function renderIncidents() {
  const incidents = filtered("incidents");
  document.getElementById("incidentCards").innerHTML = incidents.length
    ? incidents
        .map(
          (incident) => `
      <article class="card ${buildingClass(incident.building)} ${statusClass(incident.severity)} ${urgencyClass(incident.status === "Clos" ? "Clos" : incident.severity)}">
        <div class="list-title">
          <strong>${escapeHtml(incident.title)}</strong>
          <span class="badge ${urgencyBadgeClass(incident.status === "Clos" ? "Clos" : incident.severity)}">${escapeHtml(incident.severity)}</span>
        </div>
        <span class="meta">${escapeHtml(buildingShort(incident.building))} - ${escapeHtml(incident.location)} - ${escapeHtml(displayOption(incident.status))}</span>
        ${actionByLine(incident)}
        <p>${escapeHtml(incident.description)}</p>
        ${renderAttachment(incident)}
        <div class="row-actions">${rowActions("incidents", incident.id)}</div>
      </article>`
        )
        .join("")
    : empty("Aucun signalement.");
}

function renderSyndicRequests() {
  const requests = filtered("syndicRequests").sort(
    (a, b) =>
      (a.status === "Accomplie") - (b.status === "Accomplie") ||
      String(a.sentDate).localeCompare(String(b.sentDate))
  );
  document.getElementById("syndicRequestCards").innerHTML = requests.length
    ? requests
        .map((request) => {
          const relanceCount = Number.parseInt(request.relances, 10) || 0;
          return `
      <article class="card request-detail-card ${buildingClass(request.building)} ${statusClass(request.status)} ${urgencyClass(request.status === "Accomplie" ? "Accomplie" : relanceCount > 0 ? "Attente" : request.status)}">
        <div class="list-title">
          <strong>${escapeHtml(request.title)}</strong>
          <span class="badge ${urgencyBadgeClass(request.status === "Accomplie" ? "Accomplie" : relanceCount > 0 ? "Attente" : request.status)}">${escapeHtml(displayOption(request.status))}</span>
        </div>
        <span class="meta">${escapeHtml(buildingShort(request.building))} - Envoyée le ${readableDate(request.sentDate)}</span>
        <span class="meta">${requestDelayLabel(request)}</span>
        <span class="meta">${escapeHtml(request.relances)} relance${request.relances === "1" ? "" : "s"}</span>
        ${actionByLine(request)}
        <p>${escapeHtml(request.notes)}</p>
        ${renderAttachment(request)}
        <div class="card-footer">
          ${
            request.status !== "Accomplie"
              ? `<button class="ghost-button" type="button" data-complete-request="${request.id}">
                  <span class="icon" data-icon="done"></span>
                  Accomplie
                </button>`
              : `<span class="meta">Terminée le ${readableDate(request.completedDate)}</span>`
          }
          <div class="row-actions">${rowActions("syndicRequests", request.id)}</div>
        </div>
      </article>`;
        })
        .join("")
    : empty("Aucune demande au syndic.");
}

function renderContracts() {
  const contracts = filtered("contracts").sort((a, b) =>
    String(noticeLimitDate(a)).localeCompare(String(noticeLimitDate(b)))
  );
  document.getElementById("contractCards").innerHTML = contracts.length
    ? contracts
        .map((contract) => {
          const noticeDate = noticeLimitDate(contract);
          return `
      <article class="card request-detail-card ${buildingClass(contract.building)} ${contractStatusClass(contract)}">
        <div class="list-title">
          <strong>${escapeHtml(contract.provider)}</strong>
          <span class="badge ${contractStatusClass(contract) === "state-warn" ? "warn" : ""}">${escapeHtml(displayOption(contract.status))}</span>
        </div>
        <span class="meta">${escapeHtml(contract.service)} - ${escapeHtml(buildingShort(contract.building))}</span>
        <span class="meta">Fin du contrat : ${readableDate(contract.endDate)}</span>
        <span class="meta notice-alert-text">PRÉAVIS : ${escapeHtml(contract.noticeMonths)} MOIS - LIMITE ${readableDate(noticeDate).toLocaleUpperCase("fr-FR")}</span>
        <span class="meta notice-alert-text">${escapeHtml(contractNoticeDisplay(contract))}</span>
        ${actionByLine(contract)}
        <p>${escapeHtml(contract.notes)}</p>
        ${renderAttachment(contract)}
        <div class="card-footer">
          ${
            !["Termine", "Preavis envoye"].includes(contract.status)
              ? `<button class="ghost-button" type="button" data-notice-sent="${contract.id}">
                  <span class="icon" data-icon="done"></span>
                  Préavis envoyé
                </button>`
              : `<span class="meta">${escapeHtml(displayOption(contract.status))}</span>`
          }
          <div class="row-actions">${rowActions("contracts", contract.id)}</div>
        </div>
      </article>`;
        })
        .join("")
    : empty("Aucun contrat prestataire.");
}

function renderProcedures() {
  const procedures = filtered("procedures").sort((a, b) =>
    String(a.targetDate || "").localeCompare(String(b.targetDate || ""))
  );
  document.getElementById("procedureCards").innerHTML = procedures.length
    ? procedures
        .map((procedure) => {
          const steps = String(procedure.steps || "")
            .split("\n")
            .filter(Boolean);
          return `
      <article class="card request-detail-card ${buildingClass(procedure.building)} ${procedureStatusClass(procedure)}">
        <div class="list-title">
          <strong>${escapeHtml(procedure.title)}</strong>
          <span class="badge ${procedureStatusClass(procedure) === "state-warn" ? "warn" : ""}">${escapeHtml(displayOption(procedure.status))}</span>
        </div>
        <span class="meta">${escapeHtml(procedure.period)} - ${escapeHtml(buildingShort(procedure.building))}</span>
        <span class="meta">Date cible : ${readableDate(procedure.targetDate)} - Responsable : ${escapeHtml(procedure.owner || "A definir")}</span>
        ${actionByLine(procedure)}
        <ol class="step-list">
          ${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
        </ol>
        ${renderAttachment(procedure)}
        <div class="card-footer">
          <button class="ghost-button" type="button" data-create-request-from-procedure="${procedure.id}">
            <span class="icon" data-icon="plus"></span>
            Créer demande syndic
          </button>
          <div class="row-actions">${rowActions("procedures", procedure.id)}</div>
        </div>
      </article>`;
        })
        .join("")
    : empty("Aucune marche à suivre.");
}

function renderBudget() {
  const budgetRows = filtered("budget");
  const total = sumAmount(budgetRows);
  document.getElementById("budgetCount").textContent = budgetRows.length;
  document.getElementById("budgetRows").innerHTML = budgetRows.length
    ? budgetRows
        .map(
          (row) => `
      <article class="budget-row ${buildingClass(row.building)} ${statusClass(row.status)}">
        <div class="list-title">
          <strong>${escapeHtml(row.label)}</strong>
          <span>${euro(row.amount)}</span>
        </div>
        <span class="meta">${escapeHtml(buildingShort(row.building))} - ${escapeHtml(row.category)} - ${escapeHtml(displayOption(row.status))}</span>
        ${actionByLine(row)}
        ${renderAttachment(row)}
        <div class="row-actions">${rowActions("budget", row.id)}</div>
      </article>`
        )
        .join("")
    : empty("Aucun poste budgetaire.");

  document.getElementById("budgetBars").innerHTML = budgetRows.length
    ? budgetRows
        .map((row) => {
          const percent = total ? Math.round((Number(row.amount || 0) / total) * 100) : 0;
          return `
          <div class="bar-row">
            <div class="bar-head">
              <strong>${escapeHtml(row.label)}</strong>
              <span class="meta">${percent}%</span>
            </div>
            <div class="progress"><span style="--value: ${percent}%"></span></div>
          </div>`;
        })
        .join("")
    : empty("Ajoutez des montants pour voir la répartition.");
}

function renderInvoices() {
  const invoices = filtered("invoices").sort(
    (a, b) =>
      (a.status === "Payee") - (b.status === "Payee") ||
      String(a.dueDate || a.invoiceDate).localeCompare(String(b.dueDate || b.invoiceDate))
  );
  document.getElementById("invoiceCards").innerHTML = invoices.length
    ? invoices
        .map(
          (invoice) => `
      <article class="card request-detail-card ${buildingClass(invoice.building)} ${statusClass(invoice.status)}">
        <div class="list-title">
          <strong>${escapeHtml(invoice.label)}</strong>
          <span class="badge ${invoice.status === "A payer" ? "warn" : invoice.status === "Payee" ? "blue" : ""}">${escapeHtml(displayOption(invoice.status))}</span>
        </div>
        <span class="meta">${escapeHtml(invoice.number || "Sans numéro")} - ${escapeHtml(invoice.provider || "Prestataire non renseigné")}</span>
        <span class="meta">${escapeHtml(buildingShort(invoice.building))} - ${escapeHtml(invoice.category || "Catégorie")} - ${euro(invoice.amount)}</span>
        <span class="meta">Facture du ${readableDate(invoice.invoiceDate)} - Échéance ${readableDate(invoice.dueDate)}</span>
        ${actionByLine(invoice)}
        <p>${escapeHtml(invoice.notes)}</p>
        ${renderAttachment(invoice)}
        <div class="row-actions">${rowActions("invoices", invoice.id)}</div>
      </article>`
        )
        .join("")
    : empty("Aucune facture saisie.");
}

function renderDocuments() {
  const documents = filtered("documents").sort((a, b) =>
    String(b.createdAt || b.documentDate || "").localeCompare(String(a.createdAt || a.documentDate || ""))
  );
  document.getElementById("documentCards").innerHTML = documents.length
    ? documents
        .map((document) => {
          const isImage = String(document.mimeType || "").startsWith("image/");
          const isVideo = String(document.mimeType || "").startsWith("video/");
          const preview = isImage
            ? `<img src="${document.dataUrl}" alt="${escapeHtml(document.title)}" />`
            : isVideo
              ? `<video src="${document.dataUrl}" controls></video>`
            : `<div class="document-file-preview"><span class="icon" data-icon="upload"></span><strong>${escapeHtml(document.fileName || "Document")}</strong></div>`;
          return `
      <article class="card document-card ${buildingClass(document.building)}">
        <a class="document-preview" href="${document.dataUrl || "#"}" target="_blank" rel="noopener">
          ${preview}
        </a>
        <div class="list-title">
          <strong>${escapeHtml(document.title)}</strong>
          <span class="badge">${escapeHtml(displayOption(document.category))}</span>
        </div>
        <span class="meta">${escapeHtml(buildingShort(document.building))} - ${readableDate(document.documentDate)} - ${fileSizeLabel(document.size)}</span>
        <span class="meta">${escapeHtml(document.fileName || "Fichier integre")}</span>
        <p>${escapeHtml(document.notes)}</p>
        <div class="row-actions">${rowActions("documents", document.id)}</div>
      </article>`;
        })
        .join("")
    : empty("Aucun document depose.");
}

function documentMatchesCategories(document, categories) {
  return categories.includes("Tous") || categories.includes(document.category);
}

function renderDocumentPreview(targetId, categories) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const docs = filtered("documents")
    .filter((document) => documentMatchesCategories(document, categories))
    .sort((a, b) => String(b.createdAt || b.documentDate || "").localeCompare(String(a.createdAt || a.documentDate || "")))
    .slice(0, 4);
  target.innerHTML = docs.length
    ? docs
        .map(
          (document) => `
          <button class="document-mini-card ${buildingClass(document.building)}" type="button" data-edit="documents:${document.id}">
            <strong>${escapeHtml(document.title)}</strong>
            <span class="meta">${escapeHtml(displayOption(document.category))} - ${escapeHtml(buildingShort(document.building))} - ${fileSizeLabel(document.size)}</span>
          </button>`
        )
        .join("")
    : empty("Aucun document déposé.");
}

function renderDocumentHubs() {
  renderDocumentPreview("taskDocumentPreview", ["Photo", "Vidéo", "Devis", "Courrier", "Fichier", "Autre"]);
  renderDocumentPreview("incidentDocumentPreview", ["Photo", "Vidéo", "Courrier", "Fichier"]);
  renderDocumentPreview("syndicDocumentPreview", ["Courrier", "Photo", "Vidéo", "Fichier"]);
  renderDocumentPreview("budgetDocumentPreview", ["Devis", "Facture", "Fichier"]);
  renderDocumentPreview("invoiceDocumentPreview", ["Facture"]);
  renderDocumentPreview("contractDocumentPreview", ["Contrat", "Devis", "Courrier", "Fichier"]);
  renderDocumentPreview("procedureDocumentPreview", ["Courrier", "Fichier", "Photo"]);
}

function renderAmountBars(targetId, groups, total) {
  const entries = Object.entries(groups).sort((a, b) => b[1] - a[1]);
  document.getElementById(targetId).innerHTML = entries.length
    ? entries
        .map(([label, amount]) => {
          const percent = total ? Math.round((amount / total) * 100) : 0;
          return `
          <div class="bar-row">
            <div class="bar-head">
              <strong>${escapeHtml(label)}</strong>
              <span class="meta">${euro(amount)} - ${percent}%</span>
            </div>
            <div class="progress"><span style="--value: ${percent}%"></span></div>
          </div>`;
        })
        .join("")
    : empty("Aucune donnée à consolider.");
}

function renderAccounting() {
  const budgetRows = filtered("budget");
  const invoices = filtered("invoices");
  const accountingSettings = state.settings?.accounting || {};
  const treasuryDeclared = Number(accountingSettings.treasuryDeclared || 0);
  const budgetTotal = sumAmount(budgetRows);
  const invoiceTotal = sumAmount(invoices);
  const paidTotal = sumAmount(invoices.filter((invoice) => invoice.status === "Payee"));
  const pendingInvoices = invoices.filter((invoice) => invoice.status !== "Payee");
  const pendingTotal = sumAmount(pendingInvoices);
  const today = todayIso();
  const lateInvoices = invoices.filter((invoice) => invoice.status !== "Payee" && invoice.dueDate && invoice.dueDate < today);
  const disputedInvoices = invoices.filter((invoice) => invoice.status === "Contestee");
  const verificationInvoices = invoices.filter((invoice) => invoice.status === "En verification");
  const lateTotal = sumAmount(lateInvoices);
  const disputedTotal = sumAmount(disputedInvoices);
  const remaining = budgetTotal - invoiceTotal;
  const projectedTreasury = treasuryDeclared - pendingTotal;
  const executionRate = budgetTotal ? Math.round((invoiceTotal / budgetTotal) * 100) : 0;
  const availableForChart = Math.max(remaining, 0);
  const chartTotal = paidTotal + pendingTotal + availableForChart || 1;
  const paidEnd = (paidTotal / chartTotal) * 100;
  const pendingEnd = paidEnd + ((pendingTotal - disputedTotal) / chartTotal) * 100;
  const disputedEnd = pendingEnd + (disputedTotal / chartTotal) * 100;

  document.getElementById("accountBudgetTotal").textContent = euro(budgetTotal);
  document.getElementById("accountInvoiceTotal").textContent = euro(invoiceTotal);
  document.getElementById("accountPaidTotal").textContent = euro(paidTotal);
  document.getElementById("accountPendingTotal").textContent = euro(pendingTotal);
  document.getElementById("accountRemainingTotal").textContent = euro(remaining);
  document.getElementById("accountExecutionRate").textContent = `${executionRate}%`;
  document.getElementById("accountAvailableTotal").textContent = euro(remaining);
  document.getElementById("accountLateTotal").textContent = euro(lateTotal);
  document.getElementById("accountDisputedTotal").textContent = euro(disputedTotal);
  document.getElementById("accountTreasuryDeclared").textContent = euro(treasuryDeclared);
  document.getElementById("accountProjectedTreasury").textContent = euro(projectedTreasury);
  document.getElementById("treasuryDeclaredInput").value = treasuryDeclared || "";
  document.getElementById("treasuryDateInput").value = accountingSettings.treasuryDate || "";
  document.getElementById("accountInvoiceCount").textContent = pendingInvoices.length;
  document.getElementById("accountInvoiceListTotal").textContent = euro(invoiceTotal);
  document.getElementById("accountGraphRate").textContent = `${executionRate}%`;
  document.getElementById("accountDonutTotal").textContent = euro(invoiceTotal);
  document.getElementById("accountDonut").style.background = `conic-gradient(
    var(--state-done) 0 ${paidEnd}%,
    var(--warn) ${paidEnd}% ${pendingEnd}%,
    var(--danger) ${pendingEnd}% ${disputedEnd}%,
    color-mix(in srgb, var(--accent-soft) 58%, white) ${disputedEnd}% 100%
  )`;
  document.getElementById("accountLegend").innerHTML = [
    ["Payé", paidTotal, "var(--state-done)"],
    ["À payer", Math.max(pendingTotal - disputedTotal, 0), "var(--warn)"],
    ["Contesté", disputedTotal, "var(--danger)"],
    ["Disponible", availableForChart, "color-mix(in srgb, var(--accent-soft) 58%, white)"]
  ]
    .map(
      ([label, amount, color]) => `
        <article class="account-legend-item">
          <span class="legend-swatch" style="--swatch: ${color}"></span>
          <span>${escapeHtml(label)}</span>
          <strong>${euro(amount)}</strong>
        </article>`
    )
    .join("");

  renderAmountBars("accountCategoryBars", groupAmounts(invoices, "category"), invoiceTotal);
  renderAmountBars("accountBuildingBars", groupAmounts(invoices, "building"), invoiceTotal);

  const controls = [
    {
      label: "Dépassement budgétaire",
      value: remaining < 0 ? euro(Math.abs(remaining)) : "Aucun",
      tone: remaining < 0 ? "critical" : "calm",
      detail: remaining < 0 ? "Les factures saisies dépassent le budget prévu." : "Le budget reste dans l'enveloppe prévue."
    },
    {
      label: "Factures échues",
      value: `${lateInvoices.length}`,
      tone: lateInvoices.length ? "critical" : "calm",
      detail: lateInvoices.length ? `${euro(lateTotal)} à régulariser.` : "Aucune facture en retard."
    },
    {
      label: "Factures contestées",
      value: `${disputedInvoices.length}`,
      tone: disputedInvoices.length ? "warning" : "calm",
      detail: disputedInvoices.length ? `${euro(disputedTotal)} à arbitrer avec le syndic.` : "Aucune contestation ouverte."
    },
    {
      label: "En vérification",
      value: `${verificationInvoices.length}`,
      tone: verificationInvoices.length ? "warning" : "calm",
      detail: verificationInvoices.length ? "Contrôle de conformité ou pièce justificative à vérifier." : "Aucune facture en contrôle."
    },
    {
      label: "Trésorerie projetée",
      value: euro(projectedTreasury),
      tone: projectedTreasury < 0 ? "critical" : projectedTreasury < pendingTotal * 0.25 ? "warning" : "calm",
      detail: treasuryDeclared
        ? `Solde après paiement des factures restantes, à partir du solde syndic${accountingSettings.treasuryDate ? ` du ${readableDate(accountingSettings.treasuryDate)}` : ""}.`
        : "Renseignez le solde déclaré par le syndic pour suivre la trésorerie."
    }
  ];
  document.getElementById("accountControlCount").textContent = controls.filter((control) => control.tone !== "calm").length;
  document.getElementById("accountControlList").innerHTML = controls
    .map(
      (control) => `
      <article class="account-control-item ${control.tone}">
        <span>${escapeHtml(control.label)}</span>
        <strong>${escapeHtml(control.value)}</strong>
        <small>${escapeHtml(control.detail)}</small>
      </article>`
    )
    .join("");

  document.getElementById("accountInvoiceList").innerHTML = pendingInvoices.length
    ? pendingInvoices
        .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
        .map(
          (invoice) => `
          <article class="list-item accounting-invoice-row">
            <div class="list-title">
              <strong>${escapeHtml(invoice.label)}</strong>
              <span class="badge warn">${euro(invoice.amount)}</span>
            </div>
            <span class="meta">${escapeHtml(invoice.provider || "Prestataire")} - échéance ${readableDate(invoice.dueDate)} - ${escapeHtml(displayOption(invoice.status))}</span>
            ${renderAttachment(invoice)}
            <div class="accounting-row-actions">
              <button class="ghost-button compact-action" type="button" data-edit="invoices:${invoice.id}">Modifier</button>
              <button class="ghost-button compact-action" type="button" data-invoice-file="${invoice.id}">
                <span class="icon" data-icon="upload"></span>
                Ajouter le fichier
              </button>
            </div>
          </article>`
        )
        .join("")
    : empty("Aucune facture en attente de paiement.");
}

function renderInvoiceAudit() {
  const container = document.getElementById("invoiceAuditList");
  if (!container) return;
  const invoices = state.invoices || [];
  const referencedProviders = new Set((state.contracts || []).map((contract) => (contract.provider || "").trim().toLowerCase()));
  const budgetByCategory = groupAmounts(state.budget || [], "category");
  const invoiceByCategory = {};
  invoices.forEach((invoice) => {
    const cat = invoice.category || "Non renseigne";
    invoiceByCategory[cat] = (invoiceByCategory[cat] || 0) + Number(invoice.amount || 0);
  });

  const rows = invoices.map((invoice) => {
    const flags = [];
    const duplicate = invoices.some(
      (other) =>
        other.id !== invoice.id &&
        (other.number && other.number === invoice.number
          ? true
          : other.provider === invoice.provider && Number(other.amount) === Number(invoice.amount) && other.invoiceDate === invoice.invoiceDate)
    );
    if (duplicate) flags.push({ level: "critical", text: "Facture en doublon" });
    if (invoice.status === "Payee" && invoice.quoteAmount && Number(invoice.amount) > Number(invoice.quoteAmount)) {
      flags.push({ level: "warning", text: "Payée alors que le montant dépasse le devis" });
    } else if (invoice.quoteAmount && Number(invoice.amount) > Number(invoice.quoteAmount)) {
      flags.push({ level: "critical", text: `Dépasse le devis de ${euro(Number(invoice.amount) - Number(invoice.quoteAmount))}` });
    }
    if (!invoice.quoteAmount) flags.push({ level: "warning", text: "Facture sans devis associé" });
    if (!invoice.attachment?.dataUrl) flags.push({ level: "warning", text: "Pièce justificative manquante" });
    if (invoice.provider && !referencedProviders.has(invoice.provider.trim().toLowerCase())) {
      flags.push({ level: "warning", text: "Prestataire non référencé dans les contrats" });
    }
    const cat = invoice.category || "Non renseigne";
    if (budgetByCategory[cat] && invoiceByCategory[cat] > budgetByCategory[cat]) {
      flags.push({ level: "critical", text: `Dépassement budgétaire sur "${cat}"` });
    }
    const level = flags.some((f) => f.level === "critical") ? "critical" : flags.length ? "warning" : "calm";
    return { invoice, flags, level };
  });

  const order = { critical: 0, warning: 1, calm: 2 };
  rows.sort((a, b) => order[a.level] - order[b.level]);

  container.innerHTML = rows.length
    ? rows
        .map(
          ({ invoice, flags, level }) => `
      <article class="audit-row ${level}">
        <div>
          <strong>${escapeHtml(invoice.label || invoice.provider || "Facture")}</strong>
          <div class="meta">${escapeHtml(invoice.provider || "")} - ${euro(invoice.amount)} - ${escapeHtml(displayOption(invoice.status))}</div>
          ${flags.length ? `<ul class="audit-flags">${flags.map((f) => `<li>${escapeHtml(f.text)}</li>`).join("")}</ul>` : `<div class="meta">Aucune anomalie détectée.</div>`}
        </div>
        <span class="audit-badge ${level}">${level === "critical" ? "Critique" : level === "warning" ? "À vérifier" : "Conforme"}</span>
      </article>`
        )
        .join("")
    : empty("Aucune facture à contrôler.");
}

function renderContractAlerts() {
  const container = document.getElementById("contractAlertList");
  if (!container) return;
  const today = new Date(todayIso());
  const rows = (state.contracts || [])
    .filter((contract) => contract.endDate)
    .map((contract) => {
      const end = new Date(contract.endDate);
      const days = Math.round((end - today) / (1000 * 60 * 60 * 24));
      let level = "calm";
      if (days <= 30) level = "critical";
      else if (days <= 60) level = "warning";
      else if (days <= 90) level = "warning";
      return { contract, days, level };
    })
    .filter((row) => row.days <= 90)
    .sort((a, b) => a.days - b.days);

  container.innerHTML = rows.length
    ? rows
        .map(
          ({ contract, days, level }) => `
      <article class="audit-row ${level}">
        <div>
          <strong>${escapeHtml(contract.provider)}</strong>
          <div class="meta">${escapeHtml(contract.service || "")} - échéance le ${readableDate(contract.endDate)}</div>
        </div>
        <span class="audit-badge ${level}">${days < 0 ? "Échu" : `${days} j restants`}</span>
      </article>`
        )
        .join("")
    : empty("Aucun contrat n'arrive à échéance dans les 90 prochains jours.");
}

function renderQuotesModule() {
  const listContainer = document.getElementById("quotesList");
  const comparisonContainer = document.getElementById("quotesComparisonList");
  if (!listContainer || !comparisonContainer) return;
  const quotes = filtered("quotes");

  listContainer.innerHTML = quotes.length
    ? quotes
        .map(
          (quote) => `
      <article class="card ${buildingClass(quote.building)}">
        <div class="list-title">
          <strong>${escapeHtml(quote.provider)}</strong>
          <span class="badge">${euro(quote.amount)}</span>
        </div>
        <span class="meta">${escapeHtml(quote.label)} - ${escapeHtml(displayOption(quote.status))}</span>
        ${quote.comparisonGroup ? `<span class="meta">Groupe : ${escapeHtml(quote.comparisonGroup)}</span>` : ""}
        ${renderAttachment(quote)}
        <div class="row-actions">${rowActions("quotes", quote.id)}</div>
      </article>`
        )
        .join("")
    : empty("Aucun devis enregistré.");

  const groups = {};
  quotes.forEach((quote) => {
    const key = quote.comparisonGroup?.trim();
    if (!key) return;
    groups[key] = groups[key] || [];
    groups[key].push(quote);
  });
  const comparableGroups = Object.entries(groups).filter(([, list]) => list.length > 1);

  comparisonContainer.innerHTML = comparableGroups.length
    ? comparableGroups
        .map(([group, list]) => {
          const sorted = [...list].sort((a, b) => Number(a.amount) - Number(b.amount));
          const cheapest = sorted[0];
          return `
        <article class="quote-comparison-card">
          <h3>${escapeHtml(group)}</h3>
          ${sorted
            .map((quote) => {
              const diff = Number(quote.amount) - Number(cheapest.amount);
              const diffPercent = cheapest.amount ? Math.round((diff / Number(cheapest.amount)) * 100) : 0;
              const isBest = quote.id === cheapest.id;
              return `
              <div class="quote-comparison-row">
                <span>${escapeHtml(quote.provider)}</span>
                <span class="${isBest ? "best" : ""}">${euro(quote.amount)}${isBest ? " - le moins cher" : ` (+${euro(diff)} soit +${diffPercent}%)`}</span>
              </div>`;
            })
            .join("")}
        </article>`;
        })
        .join("")
    : empty("Ajoutez le même \"Groupe de comparaison\" à plusieurs devis pour obtenir un comparatif automatique.");
}

function arrearsBucket(sinceDate) {
  if (!sinceDate) return { level: "calm", label: "Moins de 30 jours" };
  const days = Math.round((new Date(todayIso()) - new Date(sinceDate)) / (1000 * 60 * 60 * 24));
  if (days > 90) return { level: "critical", label: "Plus de 90 jours" };
  if (days >= 30) return { level: "warning", label: "Entre 30 et 90 jours" };
  return { level: "calm", label: "Moins de 30 jours" };
}

function renderArrears() {
  const container = document.getElementById("arrearsList");
  const summaryContainer = document.getElementById("arrearsSummary");
  if (!container || !summaryContainer) return;
  const arrears = filtered("arrears");
  const total = sumAmount(arrears);
  const critical = arrears.filter((entry) => arrearsBucket(entry.sinceDate).level === "critical");
  const warning = arrears.filter((entry) => arrearsBucket(entry.sinceDate).level === "warning");

  summaryContainer.innerHTML = `
    <article class="metric urgent-metric">
      <span>Total impayé</span>
      <strong>${euro(total)}</strong>
    </article>
    <article class="metric">
      <span>Plus de 90 jours</span>
      <strong>${critical.length}</strong>
    </article>
    <article class="metric">
      <span>Entre 30 et 90 jours</span>
      <strong>${warning.length}</strong>
    </article>
    <article class="metric">
      <span>Lots concernés</span>
      <strong>${arrears.length}</strong>
    </article>`;

  container.innerHTML = arrears.length
    ? arrears
        .map((entry) => {
          const bucket = arrearsBucket(entry.sinceDate);
          return `
      <article class="card ${buildingClass(entry.building)}">
        <div class="list-title">
          <strong>Lot ${escapeHtml(entry.lotNumber || "?")}</strong>
          <span class="audit-badge ${bucket.level}">${bucket.label}</span>
        </div>
        <span class="meta">${escapeHtml(entry.ownerLabel || "")} - ${euro(entry.amountDue)} - ${escapeHtml(entry.remindersCount || "0")} relance(s)</span>
        <span class="meta">Mise en demeure : ${escapeHtml(entry.formalNotice || "Non envoyée")} - Procédure : ${escapeHtml(entry.legalProcedure || "Aucune")}</span>
        ${renderAttachment(entry)}
        <div class="row-actions">${rowActions("arrears", entry.id)}</div>
      </article>`;
        })
        .join("")
    : empty("Aucun impayé enregistré.");
}

function renderFundCalls() {
  const container = document.getElementById("fundCallsList");
  if (!container) return;
  const calls = filtered("fundCalls");
  container.innerHTML = calls.length
    ? calls
        .map((call) => {
          const remaining = Number(call.amountCalled || 0) - Number(call.amountCollected || 0);
          return `
      <article class="card ${buildingClass(call.building)}">
        <div class="list-title">
          <strong>Exercice ${escapeHtml(call.exercise || "")}</strong>
          <span class="badge">${euro(call.budgetVoted)}</span>
        </div>
        <span class="meta">Appelé : ${euro(call.amountCalled)} - Encaissé : ${euro(call.amountCollected)}</span>
        <span class="meta">Solde restant à encaisser : ${euro(remaining)}</span>
        ${call.notes ? `<span class="meta">${escapeHtml(call.notes)}</span>` : ""}
        <div class="row-actions">${rowActions("fundCalls", call.id)}</div>
      </article>`;
        })
        .join("")
    : empty("Aucun appel de fonds enregistré.");
}

function renderWorksFund() {
  const container = document.getElementById("worksFundList");
  const summaryContainer = document.getElementById("worksFundSummary");
  if (!container || !summaryContainer) return;
  const movements = state.worksFundMovements || [];
  const versements = sumAmount(movements.filter((m) => m.type === "Versement"));
  const utilisations = sumAmount(movements.filter((m) => m.type === "Utilisation"));
  const solde = versements - utilisations;

  summaryContainer.innerHTML = `
    <article class="metric">
      <span>Versements cumulés</span>
      <strong>${euro(versements)}</strong>
    </article>
    <article class="metric">
      <span>Utilisations cumulées</span>
      <strong>${euro(utilisations)}</strong>
    </article>
    <article class="metric ${solde < 0 ? "urgent-metric" : ""}">
      <span>Solde disponible</span>
      <strong>${euro(solde)}</strong>
    </article>`;

  container.innerHTML = movements.length
    ? [...movements]
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .map(
          (movement) => `
      <article class="list-item">
        <div class="list-title">
          <strong>${escapeHtml(movement.type)}</strong>
          <span class="badge ${movement.type === "Versement" ? "" : "warn"}">${euro(movement.amount)}</span>
        </div>
        <span class="meta">${readableDate(movement.date)}${movement.notes ? ` - ${escapeHtml(movement.notes)}` : ""}</span>
        <div class="row-actions">${rowActions("worksFundMovements", movement.id)}</div>
      </article>`
        )
        .join("")
    : empty("Aucun mouvement enregistré sur le fonds travaux.");
}

function renderChargeAnalysisAndAudit() {
  const barsContainer = document.getElementById("chargeAnalysisBars");
  const summaryContainer = document.getElementById("syndicAuditSummary");
  if (!barsContainer || !summaryContainer) return;

  // Analyse des charges par année (N, N-1, N-2) à partir des dates de facture disponibles.
  const invoices = state.invoices || [];
  const byYear = {};
  invoices.forEach((invoice) => {
    const year = (invoice.invoiceDate || "").slice(0, 4);
    if (!year) return;
    byYear[year] = (byYear[year] || 0) + Number(invoice.amount || 0);
  });
  const years = Object.keys(byYear).sort().slice(-3);
  const maxYearTotal = Math.max(...years.map((year) => byYear[year]), 1);

  barsContainer.innerHTML = years.length
    ? years
        .map((year, index) => {
          const amount = byYear[year];
          const previous = index > 0 ? byYear[years[index - 1]] : null;
          const evolution = previous ? Math.round(((amount - previous) / previous) * 100) : null;
          const percent = Math.round((amount / maxYearTotal) * 100);
          let tag = "";
          if (evolution !== null && evolution >= 30) tag = ` - <span class="audit-badge critical">Hausse anormale +${evolution}%</span>`;
          else if (evolution !== null && evolution <= -30) tag = ` - <span class="audit-badge warning">Baisse importante ${evolution}%</span>`;
          else if (evolution !== null) tag = ` - ${evolution > 0 ? "+" : ""}${evolution}% vs ${years[index - 1]}`;
          return `
        <div class="bar-row">
          <div class="bar-head"><strong>${year}</strong><span class="meta">${euro(amount)}${tag}</span></div>
          <div class="progress"><span style="--value: ${percent}%"></span></div>
        </div>`;
        })
        .join("")
    : empty("Pas assez de factures datées pour comparer les exercices.");

  // Score de conformité du syndic : pénalités cumulées à partir d'anomalies factuelles.
  const totalInvoices = invoices.length || 1;
  const withoutQuote = invoices.filter((invoice) => !invoice.quoteAmount).length;
  const overBudgetCategories = Object.entries(groupAmounts(invoices, "category")).filter(
    ([category, amount]) => (groupAmounts(state.budget || [], "category")[category] || Infinity) < amount
  ).length;
  const expiredContracts = (state.contracts || []).filter((contract) => contract.endDate && contract.endDate < todayIso()).length;
  const missingAttachments = invoices.filter((invoice) => !invoice.attachment?.dataUrl).length;

  let score = 100;
  score -= Math.round((withoutQuote / totalInvoices) * 25);
  score -= overBudgetCategories * 10;
  score -= expiredContracts * 8;
  score -= Math.round((missingAttachments / totalInvoices) * 20);
  score = Math.max(0, Math.min(100, score));
  const scoreLevel = score >= 80 ? "calm" : score >= 50 ? "warning" : "critical";
  const scoreLabel = score >= 80 ? "Conforme" : score >= 50 ? "Vigilance" : "Audit nécessaire";

  summaryContainer.innerHTML = `
    <div class="conformity-score">
      <strong class="audit-badge ${scoreLevel}" style="font-size:2rem; padding:10px 18px;">${score}%</strong>
      <div>
        <div><strong>${scoreLabel}</strong></div>
        <div class="meta">${withoutQuote} facture(s) sans devis - ${overBudgetCategories} catégorie(s) hors budget - ${expiredContracts} contrat(s) échu(s) - ${missingAttachments} pièce(s) justificative(s) manquante(s)</div>
      </div>
    </div>`;
}

function renderTreasuryForecast() {
  const container = document.getElementById("treasuryForecastSummary");
  if (!container) return;
  const accountingSettings = state.settings?.accounting || {};
  const treasuryDeclared = Number(accountingSettings.treasuryDeclared || 0);
  const pendingInvoices = (state.invoices || []).filter((invoice) => invoice.status !== "Payee");
  const pendingTotal = sumAmount(pendingInvoices);
  const recurringMonthly = sumAmount(state.contracts || []) === 0
    ? 0
    : (state.contracts || []).reduce((sum, contract) => sum + Number(contract.amountAnnual || 0) / 12, 0);
  const fundCallsInflow = (state.fundCalls || []).reduce(
    (sum, call) => sum + Math.max(Number(call.amountCalled || 0) - Number(call.amountCollected || 0), 0),
    0
  );

  const horizons = [3, 6, 12];
  container.innerHTML = `
    <div class="task-help">Solde déclaré : ${euro(treasuryDeclared)} - Factures en attente : ${euro(pendingTotal)} - Charges récurrentes estimées : ${euro(
    recurringMonthly
  )}/mois - Encaissements attendus (appels de fonds) : ${euro(fundCallsInflow)}</div>
    ${horizons
      .map((months) => {
        const projected = treasuryDeclared - pendingTotal - recurringMonthly * months + fundCallsInflow;
        const level = projected < 0 ? "critical" : projected < recurringMonthly * 2 ? "warning" : "calm";
        return `
        <article class="audit-row ${level}">
          <div><strong>À ${months} mois</strong></div>
          <span class="audit-badge ${level}">${euro(projected)}</span>
        </article>`;
      })
      .join("")}`;
}

function renderAuditLog() {
  const container = document.getElementById("auditLogList");
  if (!container) return;
  const log = (state.auditLog || []).slice(0, 100);
  container.innerHTML = log.length
    ? log
        .map(
          (entry) => `
      <article class="list-item">
        <div class="list-title">
          <strong>${escapeHtml(entry.action)} - ${escapeHtml(labels[entry.collection] || entry.collection)}</strong>
        </div>
        <span class="meta">${readableDateTime(entry.date)} - ${escapeHtml(entry.user || "")}${entry.detail ? ` - ${escapeHtml(entry.detail)}` : ""}</span>
      </article>`
        )
        .join("")
    : empty("Aucune action enregistrée pour le moment.");
}

function toCsv(rows) {
  const escapeCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return rows.map((row) => row.map(escapeCell).join(";")).join("\r\n");
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportInvoicesCsv() {
  const rows = [
    ["Numéro", "Prestataire", "Objet", "Catégorie", "Imputation", "Montant HT", "TVA %", "Montant TTC", "Statut", "Échéance"],
    ...(state.invoices || []).map((invoice) => [
      invoice.number,
      invoice.provider,
      invoice.label,
      invoice.category,
      imputationCode(invoice.category),
      invoice.amountHT || "",
      invoice.tvaRate || "",
      invoice.amount,
      invoice.status,
      invoice.dueDate
    ])
  ];
  downloadFile("factures-belles-rives.csv", toCsv(rows), "text/csv;charset=utf-8");
}

function exportLedgerCsv() {
  const entries = [];
  (state.invoices || [])
    .filter((invoice) => invoice.status === "Payee")
    .forEach((invoice) => {
      entries.push({
        date: invoice.paymentDate || invoice.dueDate || invoice.invoiceDate || "",
        label: `${invoice.provider || "Prestataire"} - ${invoice.label || "Facture"}`,
        category: invoice.category || "Non renseigné",
        amount: -Math.abs(Number(invoice.amount || 0))
      });
    });
  (state.worksFundMovements || []).forEach((movement) => {
    entries.push({
      date: movement.date || "",
      label: `Fonds travaux - ${movement.type}`,
      category: "Fonds travaux",
      amount: movement.type === "Versement" ? Math.abs(Number(movement.amount || 0)) : -Math.abs(Number(movement.amount || 0))
    });
  });
  entries.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  let running = 0;
  const rows = [
    ["Date", "Libellé", "Catégorie", "Montant", "Solde cumulé"],
    ...entries.map((entry) => {
      running += entry.amount;
      return [entry.date, entry.label, entry.category, entry.amount, running];
    })
  ];
  downloadFile("grand-livre-belles-rives.csv", toCsv(rows), "text/csv;charset=utf-8");
}

function exportArrearsCsv() {
  const rows = [
    ["Lot", "Bâtiment", "Référence", "Somme due", "Depuis le", "Relances", "Mise en demeure", "Procédure"],
    ...(state.arrears || []).map((entry) => [
      entry.lotNumber,
      entry.building,
      entry.ownerLabel,
      entry.amountDue,
      entry.sinceDate,
      entry.remindersCount,
      entry.formalNotice,
      entry.legalProcedure
    ])
  ];
  downloadFile("impayes-belles-rives.csv", toCsv(rows), "text/csv;charset=utf-8");
}

function exportBudgetCsv() {
  const rows = [
    ["Poste", "Catégorie", "Bâtiment", "Montant", "Statut"],
    ...(state.budget || []).map((row) => [row.label, row.category, row.building, row.amount, row.status])
  ];
  downloadFile("budget-belles-rives.csv", toCsv(rows), "text/csv;charset=utf-8");
}

function exportAuditLogCsv() {
  const rows = [
    ["Date", "Utilisateur", "Action", "Module", "Détail"],
    ...(state.auditLog || []).map((entry) => [entry.date, entry.user, entry.action, labels[entry.collection] || entry.collection, entry.detail])
  ];
  downloadFile("journal-audit-belles-rives.csv", toCsv(rows), "text/csv;charset=utf-8");
}

function generateAgReport() {
  const invoices = state.invoices || [];
  const budgetTotal = sumAmount(state.budget || []);
  const invoiceTotal = sumAmount(invoices);
  const arrearsTotal = sumAmount(state.arrears || []);
  const versements = sumAmount((state.worksFundMovements || []).filter((m) => m.type === "Versement"));
  const utilisations = sumAmount((state.worksFundMovements || []).filter((m) => m.type === "Utilisation"));

  const container = document.getElementById("agReportPrint");
  container.innerHTML = `
    <h1>Rapport financier annuel - Résidence Belles Rives</h1>
    <p>Généré le ${readableDateTime(new Date().toISOString())}</p>

    <h2>Bilan des dépenses</h2>
    <table>
      <tr><th>Budget voté</th><td>${euro(budgetTotal)}</td></tr>
      <tr><th>Factures saisies</th><td>${euro(invoiceTotal)}</td></tr>
      <tr><th>Écart</th><td>${euro(budgetTotal - invoiceTotal)}</td></tr>
    </table>

    <h2>Tableau des contrats</h2>
    <table>
      <tr><th>Prestataire</th><th>Service</th><th>Échéance</th><th>Statut</th></tr>
      ${(state.contracts || [])
        .map((c) => `<tr><td>${escapeHtml(c.provider)}</td><td>${escapeHtml(c.service || "")}</td><td>${readableDate(c.endDate)}</td><td>${escapeHtml(displayOption(c.status))}</td></tr>`)
        .join("")}
    </table>

    <h2>Situation des impayés</h2>
    <table>
      <tr><th>Lot</th><th>Somme due</th><th>Depuis le</th><th>Relances</th></tr>
      ${(state.arrears || [])
        .map((a) => `<tr><td>${escapeHtml(a.lotNumber || "")}</td><td>${euro(a.amountDue)}</td><td>${readableDate(a.sinceDate)}</td><td>${escapeHtml(a.remindersCount || "0")}</td></tr>`)
        .join("")}
      <tr><th>Total</th><td colspan="3">${euro(arrearsTotal)}</td></tr>
    </table>

    <h2>État du fonds travaux (ALUR)</h2>
    <table>
      <tr><th>Versements cumulés</th><td>${euro(versements)}</td></tr>
      <tr><th>Utilisations cumulées</th><td>${euro(utilisations)}</td></tr>
      <tr><th>Solde disponible</th><td>${euro(versements - utilisations)}</td></tr>
    </table>

    <h2>Prévisions budgétaires (postes en cours)</h2>
    <table>
      <tr><th>Poste</th><th>Catégorie</th><th>Montant</th><th>Statut</th></tr>
      ${(state.budget || [])
        .map((b) => `<tr><td>${escapeHtml(b.label)}</td><td>${escapeHtml(b.category || "")}</td><td>${euro(b.amount)}</td><td>${escapeHtml(displayOption(b.status))}</td></tr>`)
        .join("")}
    </table>`;
}

function renderCustomTabView() {
  const container = document.getElementById("customTabList");
  const titleEl = document.getElementById("customTabViewLabel");
  if (!container) return;
  const tab = tabSettings().find((item) => item.id === activeView && item.custom);
  if (!tab) {
    container.innerHTML = "";
    if (titleEl) titleEl.textContent = "";
    return;
  }
  if (titleEl) titleEl.textContent = tab.label;
  const items = filtered(tab.id);
  container.innerHTML = items.length
    ? items
        .map(
          (item) => `
      <article class="card ${buildingClass(item.building)}">
        <div class="list-title">
          <strong>${escapeHtml(item.title || "Sans titre")}</strong>
          ${item.status ? `<span class="badge">${escapeHtml(displayOption(item.status))}</span>` : ""}
        </div>
        ${item.notes ? `<span class="meta">${escapeHtml(item.notes)}</span>` : ""}
        ${renderAttachment(item)}
        <div class="row-actions">${rowActions(tab.id, item.id)}</div>
      </article>`
        )
        .join("")
    : empty("Aucun élément pour le moment. Utilisez le bouton \"Ajouter\" ci-dessus.");
}

function renderLedger() {
  const summaryContainer = document.getElementById("ledgerSummary");
  const listContainer = document.getElementById("ledgerList");
  if (!summaryContainer || !listContainer) return;

  const entries = [];
  (state.invoices || [])
    .filter((invoice) => invoice.status === "Payee")
    .forEach((invoice) => {
      entries.push({
        date: invoice.paymentDate || invoice.dueDate || invoice.invoiceDate || "",
        label: `${invoice.provider || "Prestataire"} - ${invoice.label || "Facture"}`,
        category: invoice.category || "Non renseigné",
        amount: -Math.abs(Number(invoice.amount || 0)),
        source: "Facture payée"
      });
    });
  (state.worksFundMovements || []).forEach((movement) => {
    entries.push({
      date: movement.date || "",
      label: `Fonds travaux - ${movement.type}${movement.notes ? ` (${movement.notes})` : ""}`,
      category: "Fonds travaux",
      amount: movement.type === "Versement" ? Math.abs(Number(movement.amount || 0)) : -Math.abs(Number(movement.amount || 0)),
      source: movement.type
    });
  });

  entries.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  let running = 0;
  const rows = entries.map((entry) => {
    running += entry.amount;
    return { ...entry, running };
  });

  const totalDebit = entries.filter((e) => e.amount < 0).reduce((sum, e) => sum + e.amount, 0);
  const totalCredit = entries.filter((e) => e.amount > 0).reduce((sum, e) => sum + e.amount, 0);

  summaryContainer.innerHTML = `
    <article class="metric">
      <span>Total débits (sorties)</span>
      <strong>${euro(totalDebit)}</strong>
    </article>
    <article class="metric">
      <span>Total crédits (entrées)</span>
      <strong>${euro(totalCredit)}</strong>
    </article>
    <article class="metric">
      <span>Solde net des mouvements tracés</span>
      <strong>${euro(totalDebit + totalCredit)}</strong>
    </article>`;

  listContainer.innerHTML = rows.length
    ? rows
        .map(
          (row) => `
      <article class="ledger-row">
        <span class="ledger-date">${row.date ? readableDate(row.date) : "Date non renseignée"}</span>
        <span class="ledger-label">${escapeHtml(row.label)}<br /><span class="meta">${escapeHtml(row.category)}</span></span>
        <span class="ledger-amount ${row.amount < 0 ? "debit" : "credit"}">${row.amount < 0 ? "" : "+"}${euro(row.amount)}</span>
        <span class="ledger-running">${euro(row.running)}</span>
      </article>`
        )
        .join("")
    : empty("Aucun mouvement enregistré pour le moment (factures marquées « Payée » ou mouvements du fonds travaux).");
}

function renderReconciliation() {
  const container = document.getElementById("reconciliationDetail");
  if (!container) return;

  const totalCollected = (state.fundCalls || []).reduce((sum, call) => sum + Number(call.amountCollected || 0), 0);
  const totalPaidInvoices = (state.invoices || [])
    .filter((invoice) => invoice.status === "Payee")
    .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
  const theoreticalBalance = totalCollected - totalPaidInvoices;
  const declaredBalance = Number(state.settings?.accounting?.treasuryDeclared || 0);
  const gap = theoreticalBalance - declaredBalance;
  const versements = (state.worksFundMovements || []).filter((m) => m.type === "Versement").reduce((s, m) => s + Number(m.amount || 0), 0);
  const utilisations = (state.worksFundMovements || []).filter((m) => m.type === "Utilisation").reduce((s, m) => s + Number(m.amount || 0), 0);

  const gapLevel = Math.abs(gap) > Math.max(500, Math.abs(declaredBalance) * 0.05) ? "critical" : Math.abs(gap) > 100 ? "warning" : "calm";
  const gapLabel = gapLevel === "critical" ? "Écart important à faire justifier par le syndic" : gapLevel === "warning" ? "Écart à surveiller" : "Écart faible";

  container.innerHTML = `
    <table class="reconciliation-table">
      <tr><td>Total encaissé (appels de fonds - "montant encaissé")</td><td>${euro(totalCollected)}</td></tr>
      <tr><td>Total des factures marquées "Payée"</td><td>- ${euro(totalPaidInvoices)}</td></tr>
      <tr class="total-row"><td>= Solde théorique du conseil (encaissé − payé)</td><td>${euro(theoreticalBalance)}</td></tr>
      <tr><td>Solde déclaré par le syndic (saisi dans "Vue d'ensemble")</td><td>${euro(declaredBalance)}</td></tr>
    </table>
    <div class="audit-row ${gapLevel}" style="margin-top:12px;">
      <div><strong>Écart solde théorique vs solde déclaré par le syndic</strong><div class="meta">${gapLabel}</div></div>
      <span class="audit-badge ${gapLevel}">${gap >= 0 ? "+" : ""}${euro(gap)}</span>
    </div>
    <div class="task-help" style="margin-top:16px;">
      Pour information - fonds travaux (loi ALUR), généralement un compte séparé et donc
      <strong>non inclus</strong> dans l'écart ci-dessus :
    </div>
    <table class="reconciliation-table">
      <tr><td>Versements cumulés</td><td>${euro(versements)}</td></tr>
      <tr><td>Utilisations cumulées</td><td>- ${euro(utilisations)}</td></tr>
      <tr class="total-row"><td>= Solde fonds travaux</td><td>${euro(versements - utilisations)}</td></tr>
    </table>
    <div class="task-help">
      Ce calcul suppose que les appels de fonds et les factures saisies couvrent l'ensemble des
      mouvements du compte courant de la copropriété. S'il manque des encaissements ou des
      factures dans l'application, l'écart affiché ne reflète pas fidèlement la réalité - pensez
      à tenir ces deux modules à jour pour que la réconciliation reste fiable.
    </div>`;
}

function renderContacts() {
  const contacts = filtered("contacts");
  document.getElementById("contactCards").innerHTML = contacts.length
    ? contacts
        .map(
          (contact) => `
      <article class="card ${buildingClass(contact.building)}">
        <div class="list-title">
          <strong>${escapeHtml(contact.name)}</strong>
          <span class="badge blue">${escapeHtml(contact.role)}</span>
        </div>
        <span class="meta">${escapeHtml(buildingShort(contact.building))}</span>
        <span class="meta">${escapeHtml(contact.email || "Email non renseigné")}</span>
        <span class="meta">${escapeHtml(contact.phone || "Téléphone non renseigné")}</span>
        <p>${escapeHtml(contact.notes)}</p>
        ${renderAttachment(contact)}
        <div class="row-actions">${rowActions("contacts", contact.id)}</div>
      </article>`
        )
        .join("")
    : empty("Aucun contact.");
}

function saveTabs(tabs) {
  state.settings.tabs = normalizeTabs(tabs).map((tab, index) => ({ ...tab, order: index }));
  saveState();
  renderNavigation();
  renderSettings();
  renderIcons();
  if (!tabSettings().some((tab) => tab.id === activeView && (tab.visible || tab.locked))) {
    setView("dashboard");
  }
}

function renderSettings() {
  const tabs = tabSettings();
  document.getElementById("tabSettingsList").innerHTML = tabs
    .map(
      (tab, index) => `
      <article class="tab-setting-row">
        <span class="icon tab-setting-icon" data-icon="${tab.icon}"></span>
        <label class="tab-name-field">
          <span>Nom</span>
          <input type="text" value="${escapeHtml(tab.label)}" data-tab-label="${tab.id}" ${tab.locked ? "" : ""} />
        </label>
        <label class="tab-toggle">
          <input type="checkbox" data-tab-visible="${tab.id}" ${tab.visible ? "checked" : ""} ${tab.locked ? "disabled" : ""} />
          <span>Afficher</span>
        </label>
        <div class="tab-order-actions">
          <button class="small-action" type="button" title="Monter" data-tab-up="${tab.id}" ${index === 0 ? "disabled" : ""}>H</button>
          <button class="small-action" type="button" title="Descendre" data-tab-down="${tab.id}" ${index === tabs.length - 1 ? "disabled" : ""}>B</button>
          ${
            tab.locked
              ? ""
              : `<button class="small-action danger" type="button" title="Retirer cet onglet" data-tab-remove="${tab.id}">
                  <span class="icon" data-icon="delete"></span>
                </button>`
          }
        </div>
      </article>`
    )
    .join("");

  document.getElementById("tabPreviewList").innerHTML = tabs
    .filter((tab) => tab.visible || tab.locked)
    .map(
      (tab) => `
      <div class="list-item">
        <div class="list-title">
          <strong>${escapeHtml(tab.label)}</strong>
          <span class="badge">${tab.locked ? "Fixe" : "Visible"}</span>
        </div>
        <span class="meta">${escapeHtml(tab.id)}</span>
      </div>`
    )
    .join("");
}

function updateTabLabel(id, label) {
  const tabs = tabSettings().map((tab) => (tab.id === id ? { ...tab, label: label.trim() || tab.label } : tab));
  saveTabs(tabs);
}

function updateTabVisibility(id, visible) {
  const tabs = tabSettings().map((tab) => (tab.id === id ? { ...tab, visible: tab.locked ? true : visible } : tab));
  saveTabs(tabs);
}

function moveTab(id, direction) {
  const tabs = tabSettings();
  const index = tabs.findIndex((tab) => tab.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= tabs.length) return;
  [tabs[index], tabs[target]] = [tabs[target], tabs[index]];
  saveTabs(tabs);
}

function isAdmin() {
  return ADMIN_PROFILES.has(currentProfile);
}

// Collections comptables : conformément au module "Comptabilité", seul l'Administrateur
// peut modifier une écriture, supprimer une pièce ou valider une dépense. La création
// (saisie) reste ouverte à tous les membres pour ne pas bloquer le travail collaboratif.
const FINANCIAL_COLLECTIONS = new Set(["budget", "invoices", "quotes", "arrears", "fundCalls", "worksFundMovements", "contracts"]);

function logAction(action, collection, detail) {
  state.auditLog = state.auditLog || [];
  state.auditLog.unshift({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    user: currentAuthor || currentProfile,
    action,
    collection,
    detail: String(detail || "").slice(0, 200)
  });
  // On garde un historique large mais borné pour ne pas alourdir le stockage.
  if (state.auditLog.length > 500) state.auditLog.length = 500;
}

function rowActions(collection, id) {
  // Seul l'Administrateur peut modifier/supprimer la fiche d'un membre du Conseil Syndical,
  // conformément au cahier des charges (rôle "Administrateur" vs "Membre Conseil Syndical").
  if (collection === "members" && !isAdmin()) return "";
  // Module comptabilité : modification/suppression des écritures réservées à l'Administrateur.
  if (FINANCIAL_COLLECTIONS.has(collection) && !isAdmin()) return "";
  return `
    <button class="small-action" type="button" title="Modifier" data-edit="${collection}:${id}">
      <span class="icon" data-icon="edit"></span>
      <span class="small-action-label">Modifier</span>
    </button>
    <button class="small-action danger" type="button" title="Supprimer" data-delete="${collection}:${id}">
      <span class="icon" data-icon="delete"></span>
      <span class="small-action-label">Supprimer</span>
    </button>`;
}

function render() {
  populateMemberFilter();
  renderNavigation();
  renderCurrentTaskStrip();
  renderDashboard();
  renderMeetings();
  renderTasks();
  renderUrgencies();
  renderMembers();
  renderIncidents();
  renderSyndicRequests();
  renderContracts();
  renderProcedures();
  renderBudget();
  renderInvoices();
  renderDocuments();
  renderDocumentHubs();
  renderAccounting();
  renderLedger();
  renderReconciliation();
  renderInvoiceAudit();
  renderContractAlerts();
  renderQuotesModule();
  renderArrears();
  renderFundCalls();
  renderWorksFund();
  renderChargeAnalysisAndAudit();
  renderTreasuryForecast();
  renderAuditLog();
  renderCustomTabView();
  renderContacts();
  renderSettings();
  renderIcons();
}

function openDialog(collection, id = null) {
  editing = { collection, id };
  const item = id
    ? state[collection].find((entry) => entry.id === id)
    : {
        building: activeBuilding === "all" ? "Tous les batiments" : activeBuilding,
        ...(ACTION_BY_COLLECTIONS.has(collection) ? { actionBy: currentAuthor } : {}),
        ...(collection === "tasks" ? { owner: currentAuthor, createdBy: currentAuthor } : {})
      };
  const deleteButton = document.getElementById("deleteCurrentItem");
  deleteButton.classList.toggle("hidden", !id);
  deleteButton.dataset.deleteCurrent = id ? `${collection}:${id}` : "";
  document.getElementById("dialogEyebrow").textContent = labels[collection];
  document.getElementById("dialogTitle").textContent = id ? "Modifier" : "Ajouter";
  document.getElementById("formFields").innerHTML = formSchema(collection)
    .map(([name, label, type, width, options]) => {
      const value = item?.[name] ?? "";
      const fieldClass = width === "full" ? "field full" : "field";
      if (type === "file") {
        return `
          <div class="${fieldClass}">
            <label for="${name}">${label}</label>
            <input id="${name}" name="${name}" type="file" accept="${FILE_ACCEPT}" />
            <small class="field-hint">Image, vidéo courte, PDF, Word, Excel ou texte - 3,5 Mo maximum.</small>
            ${renderAttachment({ attachment: value }, "attachment-current")}
            ${
              value?.dataUrl
                ? `<label class="remove-attachment"><input type="checkbox" name="removeAttachment" value="yes" /> Retirer la pièce jointe</label>`
                : ""
            }
          </div>`;
      }
      if (type === "textarea") {
        return `<div class="${fieldClass}"><label for="${name}">${label}</label><textarea id="${name}" name="${name}" required>${escapeHtml(value)}</textarea></div>`;
      }
      if (type === "select") {
        const choices = options === "members" ? memberNames() : options === "profiles" ? PROFILES : options;
        return `<div class="${fieldClass}"><label for="${name}">${label}</label><select id="${name}" name="${name}">${choices
          .map((option) => `<option value="${escapeHtml(option)}" ${value === option ? "selected" : ""}>${escapeHtml(displayOption(option))}</option>`)
          .join("")}</select></div>`;
      }
      return `<div class="${fieldClass}"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${escapeHtml(value)}" required /></div>`;
    })
    .join("");
  renderIcons();
  document.getElementById("itemDialog").showModal();
}

function openUrgentDialog(collection) {
  editing = { collection, id: null };
  const deleteButton = document.getElementById("deleteCurrentItem");
  deleteButton.classList.add("hidden");
  deleteButton.dataset.deleteCurrent = "";
  const item = {
    building: activeBuilding === "all" ? "Tous les batiments" : activeBuilding,
    severity: "Urgent",
    priority: "Haute",
    status: collection === "incidents" ? "En cours" : "open",
    ...(ACTION_BY_COLLECTIONS.has(collection) ? { actionBy: currentAuthor } : {}),
    ...(collection === "tasks" ? { owner: currentAuthor, createdBy: currentAuthor } : {})
  };
  document.getElementById("dialogEyebrow").textContent = "Urgence";
  document.getElementById("dialogTitle").textContent = collection === "incidents" ? "Déclarer une urgence" : "Ajouter une action urgente";
  document.getElementById("formFields").innerHTML = formSchema(collection)
    .map(([name, label, type, width, options]) => {
      const value = item?.[name] ?? "";
      const fieldClass = width === "full" ? "field full" : "field";
      if (type === "file") {
        return `
          <div class="${fieldClass}">
            <label for="${name}">${label}</label>
            <input id="${name}" name="${name}" type="file" accept="${FILE_ACCEPT}" />
            <small class="field-hint">Image, vidéo courte, PDF, Word, Excel ou texte - 3,5 Mo maximum.</small>
          </div>`;
      }
      if (type === "textarea") {
        return `<div class="${fieldClass}"><label for="${name}">${label}</label><textarea id="${name}" name="${name}" required>${escapeHtml(value)}</textarea></div>`;
      }
      if (type === "select") {
        const choices = options === "members" ? memberNames() : options === "profiles" ? PROFILES : options;
        return `<div class="${fieldClass}"><label for="${name}">${label}</label><select id="${name}" name="${name}">${choices
          .map((option) => `<option value="${escapeHtml(option)}" ${value === option ? "selected" : ""}>${escapeHtml(displayOption(option))}</option>`)
          .join("")}</select></div>`;
      }
      return `<div class="${fieldClass}"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${escapeHtml(value)}" required /></div>`;
    })
    .join("");
  renderIcons();
  document.getElementById("itemDialog").showModal();
}

async function saveForm(event) {
  event.preventDefault();
  // On capture la cible AVANT le "await" ci-dessous : si un autre formulaire est ouvert
  // pendant que ce await est en attente, `editing` (variable globale) changerait de valeur
  // et l'enregistrement partirait sur la mauvaise collection.
  const { collection, id } = editing;
  const formData = new FormData(event.currentTarget);
  const attachmentFile = formData.get("attachment");
  const removeAttachment = formData.get("removeAttachment") === "yes";
  formData.delete("attachment");
  formData.delete("removeAttachment");
  const data = Object.fromEntries(formData);
  const attachment = await attachmentFromFile(attachmentFile);
  if (attachmentFile?.size && !attachment) return;
  // Tous les champs numériques du module comptabilité (montants HT/TTC, TVA, soldes...)
  // doivent être convertis en nombre, pas seulement "amount".
  const NUMERIC_FIELDS = new Set([
    "amount",
    "amountHT",
    "tvaRate",
    "quoteAmount",
    "amountDue",
    "budgetVoted",
    "amountCalled",
    "amountCollected",
    "amountAnnual"
  ]);
  Object.keys(data).forEach((key) => {
    if (NUMERIC_FIELDS.has(key)) data[key] = Number(data[key]) || 0;
  });
  if (id) {
    if (collection === "members") {
      const previous = state.members.find((member) => member.id === id);
      if (previous && previous.name !== data.name) {
        state.tasks = state.tasks.map((task) =>
          task.owner === previous.name ? { ...task, owner: data.name } : task
        );
      }
    }
    state[collection] = state[collection].map((entry) => {
      if (entry.id !== id) return entry;
      const updated = { ...entry, ...data };
      if (attachment) updated.attachment = attachment;
      if (removeAttachment) delete updated.attachment;
      return updated;
    });
    logAction("Modification", collection, data.label || data.title || data.provider || data.name || id);
  } else {
    const createdMeta = collection === "tasks" ? { createdBy: data.createdBy || currentAuthor } : {};
    const actionMeta = ACTION_BY_COLLECTIONS.has(collection) ? { actionBy: data.actionBy || currentAuthor } : {};
    state[collection].push({ id: crypto.randomUUID(), ...createdMeta, ...actionMeta, ...data, ...(attachment ? { attachment } : {}) });
    logAction("Création", collection, data.label || data.title || data.provider || data.name || "");
  }
  saveState();
  document.getElementById("itemDialog").close();
  render();
}

function closeDialog() {
  document.getElementById("itemDialog").close();
  editing = null;
}

function openDocumentUpload(category = "Autre") {
  setView("documents");
  const categorySelect = document.getElementById("documentCategory");
  const buildingSelect = document.getElementById("documentBuilding");
  if (categorySelect) categorySelect.value = category;
  if (buildingSelect) buildingSelect.value = activeBuilding === "all" ? "Tous les batiments" : activeBuilding;
  document.getElementById("documentTitle")?.focus();
}

function deleteItem(collection, id) {
  const label = labels[collection] || "element";
  if (!confirm(`Supprimer cet element de "${label}" ?`)) return;
  const entry = state[collection].find((item) => item.id === id);
  state[collection] = state[collection].filter((entry) => entry.id !== id);
  if (editing?.collection === collection && editing?.id === id) {
    closeDialog();
  }
  logAction("Suppression", collection, entry?.label || entry?.title || entry?.provider || entry?.name || id);
  saveState();
  render();
}

function closeIncident(id) {
  state.incidents = state.incidents.map((incident) =>
    incident.id === id ? { ...incident, status: "Clos" } : incident
  );
  saveState();
  render();
}

function completeSyndicRequest(id) {
  const today = new Date().toISOString().slice(0, 10);
  state.syndicRequests = state.syndicRequests.map((request) =>
    request.id === id ? { ...request, status: "Accomplie", completedDate: request.completedDate || today } : request
  );
  saveState();
  render();
}

function markNoticeSent(id) {
  state.contracts = state.contracts.map((contract) =>
    contract.id === id ? { ...contract, status: "Preavis envoye" } : contract
  );
  saveState();
  render();
}

function createRequestFromProcedure(id) {
  const procedure = state.procedures.find((entry) => entry.id === id);
  if (!procedure) return;
  const today = new Date().toISOString().slice(0, 10);
  state.syndicRequests.push({
    id: crypto.randomUUID(),
    title: procedure.title,
    sentDate: today,
    completedDate: "",
    building: procedure.building,
    status: "En attente",
    relances: "0",
    notes: `Issue de la marche à suivre: ${procedure.period}\n\n${procedure.steps || ""}`
  });
  state.procedures = state.procedures.map((entry) =>
    entry.id === id ? { ...entry, status: "Demande envoyee" } : entry
  );
  saveState();
  setView("syndicRequests");
}

function changePassword(event) {
  event.preventDefault();
  const current = document.getElementById("currentPassword").value;
  const next = document.getElementById("newPassword").value;
  const confirmation = document.getElementById("confirmPassword").value;
  const message = document.getElementById("passwordMessage");
  message.classList.remove("success");

  if (current !== currentPassword()) {
    message.textContent = "Le mot de passe actuel est incorrect.";
    return;
  }
  if (next.length < 4) {
    message.textContent = "Le nouveau mot de passe doit contenir au moins 4 caracteres.";
    return;
  }
  if (next !== confirmation) {
    message.textContent = "La confirmation ne correspond pas au nouveau mot de passe.";
    return;
  }

  setPassword(next);
  event.currentTarget.reset();
  message.classList.add("success");
  message.textContent = "Mot de passe modifié. Il sera demandé à la prochaine connexion.";
}

function addAccountingInvoice(event) {
  event.preventDefault();
  const label = document.getElementById("accountingInvoiceLabel").value.trim();
  const amount = Number(document.getElementById("accountingInvoiceAmount").value || 0);
  const status = document.getElementById("accountingInvoiceStatus").value;
  if (!label || amount <= 0) return;
  const today = new Date().toISOString().slice(0, 10);
  state.invoices.push({
    id: crypto.randomUUID(),
    number: "",
    provider: "",
    label,
    category: "General",
    building: activeBuilding === "all" ? "Tous les batiments" : activeBuilding,
    invoiceDate: today,
    dueDate: today,
    amount,
    status,
    notes: "Ajouté depuis la comptabilité."
  });
  saveState();
  event.currentTarget.reset();
  render();
}

function saveTreasury(event) {
  event.preventDefault();
  state.settings = {
    ...(state.settings || {}),
    accounting: {
      ...(state.settings?.accounting || {}),
      treasuryDeclared: Number(document.getElementById("treasuryDeclaredInput").value || 0),
      treasuryDate: document.getElementById("treasuryDateInput").value || todayIso()
    }
  };
  saveState();
  renderAccounting();
}

function addDocument(event) {
  event.preventDefault();
  const fileInput = document.getElementById("documentFile");
  const [file] = fileInput.files;
  if (!file) return;
  if (file.size > MAX_FILE_SIZE) {
    alert("Ce fichier est trop lourd pour la sauvegarde locale. Choisissez un fichier de moins de 3,5 Mo.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const today = new Date().toISOString().slice(0, 10);
    const title = document.getElementById("documentTitle").value.trim() || file.name;
    state.documents.push({
      id: crypto.randomUUID(),
      title,
      category: document.getElementById("documentCategory").value,
      building: document.getElementById("documentBuilding").value,
      documentDate: today,
      notes: document.getElementById("documentNotes").value.trim(),
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      dataUrl: reader.result,
      createdAt: new Date().toISOString()
    });
    saveState();
    event.currentTarget.reset();
    render();
  };
  reader.readAsDataURL(file);
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `conseil-syndical-${profileSlug(currentProfile)}-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      state = normalizeState(parsed);
      saveState();
      render();
    } catch {
      alert("Le fichier importe n'est pas lisible.");
    }
  };
  reader.readAsText(file);
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.getElementById("loginForm").addEventListener("submit", handleLogin);
document.getElementById("passwordForm").addEventListener("submit", changePassword);
document.getElementById("loginProfile").addEventListener("change", (event) => {
  currentProfile = event.target.value;
  currentAuthor = currentProfile === DEFAULT_ACTIVE_PROFILE ? DEFAULT_ACTIVE_PROFILE : currentProfile;
  sessionStorage.setItem(AUTHOR_KEY, currentAuthor);
  renderProfileSaves();
});
document.getElementById("logoutButton").addEventListener("click", logout);
document.getElementById("logoutMenuButton").addEventListener("click", logout);
function saveNow() {
  if (saveState()) {
    markSaveButtonsSaved();
    renderProfileSaves();
  }
}
document.getElementById("saveNowButton").addEventListener("click", saveNow);
document.getElementById("pageSaveButton").addEventListener("click", saveNow);
document.getElementById("activeAuthor").addEventListener("change", (event) => {
  currentAuthor = event.target.value;
  if (currentProfile === DEFAULT_ACTIVE_PROFILE) {
    currentAuthor = DEFAULT_ACTIVE_PROFILE;
    event.target.value = currentAuthor;
  }
  sessionStorage.setItem(AUTHOR_KEY, currentAuthor);
  saveState();
});
document.getElementById("sidebarToggle").addEventListener("click", toggleSidebar);
document.getElementById("navScrollUp").addEventListener("click", () => moveInMenu(-1));
document.getElementById("navScrollDown").addEventListener("click", () => moveInMenu(1));
document.getElementById("quickAdd").addEventListener("click", () => openDialog(activeView));
document.getElementById("itemForm").addEventListener("submit", saveForm);
document.getElementById("accountingInvoiceForm").addEventListener("submit", addAccountingInvoice);
document.getElementById("treasuryForm").addEventListener("submit", saveTreasury);
document.getElementById("documentUploadForm").addEventListener("submit", addDocument);
document.getElementById("globalSearch").addEventListener("input", (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  render();
});
document.getElementById("meetingSearch").addEventListener("input", renderMeetings);
document.getElementById("taskFilter").addEventListener("change", renderTasks);
document.getElementById("buildingFilter").addEventListener("change", (event) => {
  activeBuilding = event.target.value;
  render();
});
document.getElementById("memberFilter").addEventListener("change", (event) => {
  activeMember = event.target.value;
  render();
});
document.getElementById("exportData").addEventListener("click", exportData);
document.getElementById("importData").addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (!file) return;
  if (!isAdmin()) {
    alert("Seul l'Administrateur peut importer des données (cela remplace les données de toute la copropriété).");
    event.target.value = "";
    return;
  }
  importData(file);
});
document.getElementById("resetData").addEventListener("click", () => {
  if (!isAdmin()) {
    alert("Seul l'Administrateur peut réinitialiser les données.");
    return;
  }
  // Important : les données sont partagées entre tous les membres (une seule sauvegarde
  // commune), donc cette action efface les données de TOUTE la copropriété, pas seulement
  // celles du profil actuellement connecté.
  if (confirm("Réinitialiser les données de TOUTE la copropriété Belles Rives (tous les profils) ? Cette action est irréversible.")) {
    state = normalizeState(structuredClone(seedData));
    saveState();
    render();
  }
});
document.getElementById("printAgenda").addEventListener("click", () => window.print());
document.getElementById("exportInvoicesCsv")?.addEventListener("click", exportInvoicesCsv);
document.getElementById("exportArrearsCsv")?.addEventListener("click", exportArrearsCsv);
document.getElementById("exportBudgetCsv")?.addEventListener("click", exportBudgetCsv);
document.getElementById("exportAuditLogCsv")?.addEventListener("click", exportAuditLogCsv);
document.getElementById("printAgReport")?.addEventListener("click", () => {
  generateAgReport();
  document.body.classList.add("print-ag-report");
  window.print();
});
window.addEventListener("afterprint", () => document.body.classList.remove("print-ag-report"));
document.getElementById("createTabForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("newTabLabel");
  createCustomTab(input.value);
  input.value = "";
});
document.getElementById("customTabAddButton")?.addEventListener("click", () => {
  if (tabSettings().find((tab) => tab.id === activeView)?.custom) openDialog(activeView);
});
document.getElementById("resetTabs").addEventListener("click", () => {
  if (confirm("Rétablir les onglets par défaut ? Les onglets retirés seront restaurés, et les onglets personnalisés seront supprimés du menu (leurs données resteront en mémoire).")) {
    saveTabs(defaultTabSettings());
    setView("settings");
  }
});
window.addEventListener("storage", handleExternalSave);
window.addEventListener("popstate", () => setView(viewFromLocation(), false));

document.addEventListener("change", (event) => {
  const labelInput = event.target.closest("[data-tab-label]");
  const visibleInput = event.target.closest("[data-tab-visible]");

  if (labelInput) {
    updateTabLabel(labelInput.dataset.tabLabel, labelInput.value);
  }
  if (visibleInput) {
    updateTabVisibility(visibleInput.dataset.tabVisible, visibleInput.checked);
  }
});

document.addEventListener("keydown", (event) => {
  const viewLink = event.target.closest?.("[data-view-link]");
  if (!viewLink || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  setView(viewLink.dataset.viewLink);
});

document.addEventListener("click", (event) => {
  const navButton = event.target.closest(".nav-item[data-view]");
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  const completeButton = event.target.closest("[data-complete]");
  const buildingButton = event.target.closest("[data-building]");
  const memberButton = event.target.closest("[data-member]");
  const newButton = event.target.closest("[data-open-new]");
  const urgentButton = event.target.closest("[data-open-urgent]");
  const priorityButton = event.target.closest("[data-cycle-priority]");
  const closeIncidentButton = event.target.closest("[data-close-incident]");
  const completeRequestButton = event.target.closest("[data-complete-request]");
  const noticeSentButton = event.target.closest("[data-notice-sent]");
  const procedureRequestButton = event.target.closest("[data-create-request-from-procedure]");
  const viewLinkButton = event.target.closest("[data-view-link]");
  const documentPresetButton = event.target.closest("[data-document-preset]");
  const invoiceFileButton = event.target.closest("[data-invoice-file]");
  const closeDialogButton = event.target.closest("[data-close-dialog]");
  const deleteCurrentButton = event.target.closest("[data-delete-current]");
  const loginProfileButton = event.target.closest("[data-login-profile]");
  const tabUpButton = event.target.closest("[data-tab-up]");
  const tabDownButton = event.target.closest("[data-tab-down]");
  const tabRemoveButton = event.target.closest("[data-tab-remove]");
  const accTabButton = event.target.closest("[data-acc-tab]");

  if (tabRemoveButton) {
    removeTab(tabRemoveButton.dataset.tabRemove);
    return;
  }

  if (accTabButton) {
    document.querySelectorAll(".acc-subnav-btn").forEach((btn) => btn.classList.toggle("active", btn === accTabButton));
    document
      .querySelectorAll(".acc-panel")
      .forEach((panel) => panel.classList.toggle("active", panel.dataset.accPanel === accTabButton.dataset.accTab));
    return;
  }

  if (navButton) {
    setView(navButton.dataset.view);
    return;
  }

  if (viewLinkButton) {
    setView(viewLinkButton.dataset.viewLink);
    return;
  }

  if (documentPresetButton) {
    openDocumentUpload(documentPresetButton.dataset.documentPreset);
    return;
  }

  if (invoiceFileButton) {
    openDialog("invoices", invoiceFileButton.dataset.invoiceFile);
    return;
  }

  if (closeDialogButton) {
    closeDialog();
    return;
  }

  if (deleteCurrentButton && deleteCurrentButton.dataset.deleteCurrent) {
    const [collection, id] = deleteCurrentButton.dataset.deleteCurrent.split(":");
    deleteItem(collection, id);
    return;
  }

  if (loginProfileButton) {
    currentProfile = loginProfileButton.dataset.loginProfile;
    document.getElementById("loginProfile").value = currentProfile;
    renderProfileSaves();
    return;
  }

  if (tabUpButton) {
    moveTab(tabUpButton.dataset.tabUp, -1);
    return;
  }
  if (tabDownButton) {
    moveTab(tabDownButton.dataset.tabDown, 1);
    return;
  }

  if (newButton) {
    const collection = newButton.dataset.openNew;
    if (collection === "members" && !isAdmin()) {
      alert("Seul l'Administrateur peut ajouter un membre du Conseil Syndical.");
      return;
    }
    // Certaines collections comptables (devis, impayés, appels de fonds, fonds travaux) n'ont
    // pas leur propre onglet de menu : elles vivent dans les sous-modules de "Comptabilité".
    // On ne change donc de vue que si un onglet correspondant existe réellement.
    const targetView = document.getElementById(collection);
    if (targetView && targetView.classList.contains("view")) setView(collection);
    openDialog(collection);
  }
  if (urgentButton) {
    const collection = urgentButton.dataset.openUrgent;
    setView("urgencies");
    openUrgentDialog(collection);
  }

  if (editButton) {
    const [collection, id] = editButton.dataset.edit.split(":");
    if (collection === "members" && !isAdmin()) {
      alert("Seul l'Administrateur peut modifier la fiche d'un membre.");
      return;
    }
    if (FINANCIAL_COLLECTIONS.has(collection) && !isAdmin()) {
      alert("Seul l'Administrateur peut modifier une écriture comptable.");
      return;
    }
    openDialog(collection, id);
  }
  if (deleteButton) {
    const [collection, id] = deleteButton.dataset.delete.split(":");
    if (collection === "members" && !isAdmin()) {
      alert("Seul l'Administrateur peut supprimer un membre.");
      return;
    }
    if (FINANCIAL_COLLECTIONS.has(collection) && !isAdmin()) {
      alert("Seul l'Administrateur peut supprimer une pièce comptable.");
      return;
    }
    deleteItem(collection, id);
  }
  if (completeButton) {
    const id = completeButton.dataset.complete;
    state.tasks = state.tasks.map((task) =>
      task.id === id ? { ...task, status: task.status === "done" ? "open" : "done" } : task
    );
    saveState();
    render();
  }
  if (priorityButton) {
    cyclePriority(priorityButton.dataset.cyclePriority);
  }
  if (closeIncidentButton) {
    closeIncident(closeIncidentButton.dataset.closeIncident);
  }
  if (completeRequestButton) {
    completeSyndicRequest(completeRequestButton.dataset.completeRequest);
  }
  if (noticeSentButton) {
    markNoticeSent(noticeSentButton.dataset.noticeSent);
  }
  if (procedureRequestButton) {
    createRequestFromProcedure(procedureRequestButton.dataset.createRequestFromProcedure);
  }
  if (buildingButton) {
    activeBuilding = buildingButton.dataset.building;
    document.getElementById("buildingFilter").value = activeBuilding;
    render();
  }
  if (memberButton) {
    activeMember = memberButton.dataset.member;
    document.getElementById("memberFilter").value = activeMember;
    render();
  }
});

if (isAuthenticated) {
  showApp();
} else {
  showLogin();
  renderIcons();
}

// Enregistrement du service worker : permet l'installation sur iPhone/Android
// et le fonctionnement hors connexion (voir service-worker.js).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // L'appli continue de fonctionner normalement même si l'enregistrement échoue
      // (par ex. ouverture locale via file:// où les service workers sont désactivés).
    });
  });
}

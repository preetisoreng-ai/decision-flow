export interface Person {
  id: string;
  name: string;
  tone: number;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  url?: string;
}

export interface Reply {
  id: string;
  authorId: string;
  text: string;
  mentions: string[];
  createdAt: number;
  attachments: Attachment[];
}

export interface Thread extends Reply {
  replies: Reply[];
  resolved: boolean;
  bookmarked: boolean;
  deleted: boolean;
  /** Thread-level notification subscription (bell). */
  subscribed?: boolean;
}

export type ScopeId =
  | "screen:size-opportunity"
  | "screen:demand-sizing"
  | "widget:availability-overview"
  | "widget:availability-products"
  | "widget:availability-regions"
  | "widget:quarterly-compliance"
  | "widget:quarterly-impact";

export const scopeLabels: Record<ScopeId, string> = {
  "screen:size-opportunity": "Size & Opportunity",
  "screen:demand-sizing": "Demand Sizing",
  "widget:availability-overview": "Availability — Overview",
  "widget:availability-products": "Availability — Products",
  "widget:availability-regions": "Availability — Regions",
  "widget:quarterly-compliance": "Quarterly Compliance vs Benchmark",
  "widget:quarterly-impact": "Quarterly Impact Contribution",
};

// Avatar colours are taken from the Figma people list.
export const people: Person[] = [
  { id: "ashish", name: "Ashish Rai", tone: 8 },
  { id: "deepak", name: "Deepak Sahu", tone: 9 },
  { id: "john", name: "John Maddar", tone: 4 },
  { id: "sakshi", name: "Sakshi Singh", tone: 6 },
  { id: "shantanu", name: "Shantanu Tiwari", tone: 5 },
  { id: "ashishs", name: "Ashish Shrivastava", tone: 7 },
  { id: "jayant", name: "Jayant Driwedi", tone: 8 },
];

export const currentUser: Person = { id: "jerremey", name: "Jerremey", tone: 1 };

export const allPeople = [currentUser, ...people];
export const personById = (id: string) => allPeople.find((p) => p.id === id) ?? currentUser;

const day = (d: string, t: string) => new Date(`${d}T${t}:00`).getTime();

export const seedThreads: Record<ScopeId, Thread[]> = {
  "screen:size-opportunity": [
    {
      id: "t-3",
      authorId: "jayant",
      text: "Jerremey can you validate the Q3 KPI targets before the review?",
      mentions: ["Jerremey"],
      createdAt: Date.now() - 2 * 3600_000,
      attachments: [],
      replies: [],
      resolved: false,
      bookmarked: false,
      deleted: false,
    },
  ],
  "widget:availability-overview": [],
  "widget:availability-products": [],
  "widget:availability-regions": [],
  "widget:quarterly-impact": [],
  "widget:quarterly-compliance": [
    {
      id: "t-4",
      authorId: "ashishs",
      text: "Jerremey compliance dipped below the 90% threshold in Q2 2020 — can you check the drivers?",
      mentions: ["Jerremey"],
      createdAt: Date.now() - 26 * 3600_000,
      attachments: [],
      replies: [],
      resolved: false,
      bookmarked: false,
      deleted: false,
    },
  ],
  "screen:demand-sizing": [
    {
      id: "t-1",
      authorId: "jerremey",
      text: "John Maddar can you explain what is the use of this screen?",
      mentions: ["John Maddar"],
      createdAt: day("2024-05-02", "09:15"),
      attachments: [
        { id: "f-1", name: "File Name", size: "50Kb" },
        { id: "f-2", name: "File Name", size: "50Kb" },
        { id: "f-3", name: "File Name", size: "50Kb" },
      ],
      replies: [
        {
          id: "r-1",
          authorId: "john",
          text: "Lorem ipsum dolor sit amet, ccas za aa a consectetur adipiscing elit",
          mentions: [],
          createdAt: day("2024-05-02", "09:15"),
          attachments: [],
        },
        {
          id: "r-2",
          authorId: "john",
          text: "Lorem ipsum dolor sit amet, ccas za aa a consectetur adipiscing elit",
          mentions: [],
          createdAt: day("2024-05-02", "09:15"),
          attachments: [],
        },
      ],
      resolved: false,
      bookmarked: false,
      deleted: false,
      subscribed: true,
    },
    {
      id: "t-2",
      authorId: "ashishs",
      text: "Jerremey Lorem Ipsum dolor sit amet, please review the regressor preview before Friday.",
      mentions: ["Jerremey"],
      createdAt: day("2024-05-02", "10:40"),
      attachments: [],
      replies: [],
      resolved: false,
      bookmarked: false,
      deleted: false,
    },
  ],
};

/* ---------------- Dashboard data (values read off the Figma charts) ---------------- */

const forecast = [
  87, 91, 89.6, 90.6, 89.1, 94.2, 92.1, 90.5, 93.1, 91.9, 95.4, 94, 94.9, 96.6, 92, 94.5, 91.8,
  92.8, 90.6,
];
export const weeklyAvailability = forecast.map((v, i) => ({
  week: `WK ${i + 1}`,
  forecast: v,
  actual: 91 - i * 0.02,
}));

export const quarters = [
  "Q1 2018",
  "Q2 2018",
  "Q3 2018",
  "Q4 2018",
  "Q1 2019",
  "Q2 2019",
  "Q3 2019",
  "Q4 2019",
  "Q1 2020",
  "Q2 2020",
];

const compliance = [91, 95, 93.1, 92.5, 95, 95, 90.5, 94.2, 93.8, 88.3];
export const quarterlyCompliance = quarters.map((q, i) => ({
  quarter: q,
  compliance: compliance[i],
  threshold: 90,
}));

const impact = [
  [3, 2, 1.4, 0, 0],
  [3, 1.6, 1.2, 0, 0],
  [3, 3, 2.6, 2, 0],
  [3, 0.6, 2.4, 3.4, 0],
  [4, 3.4, 4.4, 0, 0.6],
  [0.8, 2, 1.8, 2.6, 3],
  [3.4, 2, 4.4, 1.4, 3],
  [3, 0.5, 1.6, 1.4, 3.4],
  [2.8, 3, 0.8, 1.6, 7],
  [3.4, 1, 1.4, 2.6, 3],
];
export const quarterlyImpact = quarters.map((q, i) => {
  const [noImpact, concession, minor, major, rejected] = impact[i];
  return { quarter: q, noImpact, concession, minor, major, rejected };
});

export const previewColumns = [
  "Date",
  "SKU",
  "Sales",
  "Price",
  "CPI",
  "Unemployment Rate",
  "Item ID",
  "Dept ID",
  "Cat ID",
  "Store ID",
  "State",
];
export const previewRows = Array.from({ length: 5 }, () => [
  "29/01/2011",
  "Food_1_116_TX_3",
  "0",
  "2.18",
  "2.1078653222222217",
  "9",
  "Food_1_116",
  "Food_1",
  "Foods",
  "TX_3",
  "TX",
]);

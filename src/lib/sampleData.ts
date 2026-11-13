import type { User } from "@supabase/supabase-js";
import type { Account } from "@/lib/useAccount";

// Sample data used by the preview pages. Real data replaces it later.

export const SAMPLE_ACCOUNT: Account = {
  ready: true,
  user: { id: "preview-user" } as unknown as User,
  name: "Ravi Kumar",
  email: "ravi@example.com",
  avatarUrl: null,
  isAdmin: false,
  isPartner: true,
  verification: "pending",
};

export type DashboardData = {
  totalBookings: number;
  completedJobs: number;
  monthEarnings: number;
  rating: number;
  reviewCount: number;
  verification: "pending" | "verified" | "rejected";
  steps: { label: string; done: boolean }[];
  recent: {
    id: string;
    customer: string;
    service: string;
    status: "requested" | "accepted" | "completed" | "declined" | "cancelled";
    price: number;
  }[];
};

export const SAMPLE_DASHBOARD: DashboardData = {
  totalBookings: 24,
  completedJobs: 19,
  monthEarnings: 14250,
  rating: 4.8,
  reviewCount: 12,
  verification: "pending",
  steps: [
    { label: "Basic info", done: true },
    { label: "Services", done: true },
    { label: "Documents", done: true },
    { label: "Bank details", done: false },
    { label: "Verified", done: false },
  ],
  recent: [
    { id: "1", customer: "Amit Sharma", service: "AC repair", status: "requested", price: 600 },
    { id: "2", customer: "Neha Verma", service: "Fan repair", status: "accepted", price: 350 },
    { id: "3", customer: "Rohit Singh", service: "Wiring and fittings", status: "completed", price: 1200 },
    { id: "4", customer: "Pooja Jain", service: "Inverter repair", status: "declined", price: 800 },
  ],
};
export type ReviewsData = {
  average: number;
  count: number;
  counts: { 5: number; 4: number; 3: number; 2: number; 1: number };
  items: {
    id: string;
    customer: string;
    service: string;
    date: string;
    rating: number;
    comment: string;
  }[];
};

export const SAMPLE_REVIEWS: ReviewsData = {
  average: 4.8,
  count: 12,
  counts: { 5: 10, 4: 1, 3: 1, 2: 0, 1: 0 },
  items: [
    {
      id: "1",
      customer: "Neha Verma",
      service: "Fan repair",
      date: "10 Nov 2026",
      rating: 5,
      comment: "Arrived on time and fixed the fan in 20 minutes. Very polite.",
    },
    {
      id: "2",
      customer: "Rohit Singh",
      service: "Wiring and fittings",
      date: "7 Nov 2026",
      rating: 5,
      comment: "Neat work and fair price. Cleaned up after the job too.",
    },
    {
      id: "3",
      customer: "Amit Sharma",
      service: "AC repair",
      date: "2 Nov 2026",
      rating: 4,
      comment: "Good work. Came a little late but called to tell me.",
    },
    {
      id: "4",
      customer: "Pooja Jain",
      service: "Inverter repair",
      date: "28 Oct 2026",
      rating: 3,
      comment: "Problem was fixed but it took longer than expected.",
    },
  ],
};
export type ChatMessage = {
  id: string;
  from: "customer" | "partner";
  text: string;
  time: string;
};

export type ConnectedData = {
  booking: {
    id: string;
    service: string;
    price: number;
    when: string;
    locationUrl: string;
  };
  customer: { name: string; phone: string };
  partner: { name: string; phone: string; role: string };
  messages: ChatMessage[];
};

export const SAMPLE_CONNECTED: ConnectedData = {
  booking: {
    id: "B-1042",
    service: "AC repair",
    price: 600,
    when: "Today, 4:30 pm",
    locationUrl: "https://www.google.com/maps?q=28.6129,77.2295",
  },
  customer: { name: "Amit Sharma", phone: "+919000000001" },
  partner: { name: "Ravi Kumar", phone: "+919000000002", role: "Electrician" },
  messages: [
    { id: "1", from: "partner", text: "Hello, I accepted your request.", time: "4:02 pm" },
    { id: "2", from: "customer", text: "Great, thank you. I am at home.", time: "4:03 pm" },
    { id: "3", from: "partner", text: "On my way, I will reach in 20 minutes.", time: "4:05 pm" },
  ],
};
export type SampleBooking = {
  id: string;
  customer: string;
  phone: string;
  service: string;
  note: string;
  price: number;
  when: string;
  address: string;
  mapsUrl: string;
  status: "requested" | "accepted" | "completed" | "declined" | "cancelled";
};

export const SAMPLE_PARTNER = {
  name: "Ravi Kumar",
  phone: "+919000000002",
  role: "Electrician",
};

export const SAMPLE_BOOKINGS: SampleBooking[] = [
  {
    id: "B-1051",
    customer: "Sunita Rao",
    phone: "+919000000003",
    service: "Fan repair",
    note: "Ceiling fan in the bedroom makes a loud noise.",
    price: 350,
    when: "Today, 6:00 pm",
    address: "Sector 14, Dwarka, New Delhi",
    mapsUrl: "https://www.google.com/maps?q=28.5921,77.0460",
    status: "requested",
  },
  {
    id: "B-1050",
    customer: "Karan Mehta",
    phone: "+919000000004",
    service: "Wiring and fittings",
    note: "Need two new switch boards in the hall.",
    price: 1200,
    when: "Tomorrow, 10:00 am",
    address: "Lajpat Nagar, New Delhi",
    mapsUrl: "https://www.google.com/maps?q=28.5677,77.2433",
    status: "requested",
  },
  {
    id: "B-1042",
    customer: "Amit Sharma",
    phone: "+919000000001",
    service: "AC repair",
    note: "AC is not cooling.",
    price: 600,
    when: "Today, 4:30 pm",
    address: "Saket, New Delhi",
    mapsUrl: "https://www.google.com/maps?q=28.5245,77.2066",
    status: "accepted",
  },
  {
    id: "B-1031",
    customer: "Rohit Singh",
    phone: "+919000000005",
    service: "Inverter repair",
    note: "Inverter beeps and shuts down.",
    price: 800,
    when: "9 Nov, 2:00 pm",
    address: "Rohini, New Delhi",
    mapsUrl: "https://www.google.com/maps?q=28.7495,77.0565",
    status: "completed",
  },
  {
    id: "B-1024",
    customer: "Pooja Jain",
    phone: "+919000000006",
    service: "Wiring and fittings",
    note: "Rewiring for one room.",
    price: 2500,
    when: "6 Nov, 11:00 am",
    address: "Karol Bagh, New Delhi",
    mapsUrl: "https://www.google.com/maps?q=28.6519,77.1909",
    status: "declined",
  },
];
export type MyBooking = {
  id: string;
  partner: string;
  phone: string;
  role: string;
  service: string;
  price: number;
  when: string;
  status: "requested" | "accepted" | "completed" | "declined" | "cancelled";
  reviewed?: { rating: number; comment: string };
};

export const SAMPLE_ME = { name: "Amit Sharma", phone: "+919000000001" };

export const SAMPLE_MY_BOOKINGS: MyBooking[] = [
  {
    id: "B-1060",
    partner: "Ravi Kumar",
    phone: "+919000000002",
    role: "Electrician",
    service: "AC repair",
    price: 600,
    when: "Today, 6:00 pm",
    status: "requested",
  },
  {
    id: "B-1058",
    partner: "Suresh Yadav",
    phone: "+919000000007",
    role: "Plumber",
    service: "Leakage repair",
    price: 450,
    when: "Today, 4:30 pm",
    status: "accepted",
  },
  {
    id: "B-1049",
    partner: "Meena Devi",
    phone: "+919000000008",
    role: "Cleaner",
    service: "Home cleaning",
    price: 900,
    when: "9 Nov, 10:00 am",
    status: "completed",
  },
  {
    id: "B-1033",
    partner: "Ankit Gupta",
    phone: "+919000000009",
    role: "Tutor",
    service: "School tuition",
    price: 500,
    when: "4 Nov, 5:00 pm",
    status: "completed",
    reviewed: { rating: 5, comment: "Explains very well. My son enjoyed it." },
  },
  {
    id: "B-1027",
    partner: "Vikram Rao",
    phone: "+919000000010",
    role: "Painter",
    service: "Interior painting",
    price: 4200,
    when: "1 Nov, 9:00 am",
    status: "cancelled",
  },
];

// Accounts used by the "Preview as" switch
export const SAMPLE_ACCOUNTS: Record<
  "customer" | "partner" | "admin",
  Account
> = {
  customer: {
    ...SAMPLE_ACCOUNT,
    name: "Amit Sharma",
    email: "amit@example.com",
    isPartner: false,
    verification: null,
  },
  partner: SAMPLE_ACCOUNT,
  admin: {
    ...SAMPLE_ACCOUNT,
    name: "Admin",
    email: "admin@example.com",
    isAdmin: true,
    isPartner: false,
    verification: null,
  },
};
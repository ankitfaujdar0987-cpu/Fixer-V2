// All categories and their sub-services live here.
// To add a service later, add one line to the "subs" list of its category.

export type Category = {
  slug: string;
  name: string;
  icon: string[];
  subs: string[];
};

export const categories: Category[] = [
  {
    slug: "electrician",
    name: "Electrician",
    icon: ["M13 2 4 14h7l-1 8 9-12h-7z"],
    subs: [
      "AC Repair",
      "TV Repair",
      "Fridge Repair",
      "Washing Machine Repair",
      "RO Repair",
      "Fan Repair",
      "Inverter Repair",
      "CCTV Installation",
      "Wiring & Fittings",
      "Short Circuit / MCB Trip",
      "Other Electrical Problem",
    ],
  },
  {
    slug: "plumber",
    name: "Plumber",
    icon: ["M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"],
    subs: [
      "Leakage Repair",
      "Drain Blockage",
      "Bathroom Fittings",
      "Water Tank & Motor",
      "Pipe Burst",
      "Low Water Pressure",
      "Other Plumbing Problem",
    ],
  },
  {
    slug: "mechanic",
    name: "Mechanic",
    icon: ["M14.5 5.5a4.5 4.5 0 0 0 5.5 5.5L10.5 20.5a2 2 0 0 1-3-3z"],
    subs: [
      "Bike Repair at Home",
      "Car Servicing",
      "Car Wash at Home",
      "Battery Jump Start",
      "Tyre Repair & Replacement",
      "Oil Change",
      "Brake Issue",
      "Other Vehicle Problem",
    ],
  },
  {
    slug: "painter",
    name: "Painter",
    icon: [
      "M5 3h12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z",
      "M18 6h2v5h-8v3",
      "M10 14h4v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z",
    ],
    subs: [
      "Interior Painting",
      "Exterior Painting",
      "Putty & Texture Work",
      "Wall Cracks",
      "Dampness / Seepage Marks",
      "Paint Peeling",
      "Color Consultation",
      "Other Painting Issue",
    ],
  },
  {
    slug: "carpenter",
    name: "Carpenter",
    icon: ["m14 4 6 6-3 3-6-6z", "m12 9-8 8 3 3 8-8"],
    subs: [
      "Furniture Repair",
      "Door & Window Repair",
      "Furniture Assembly / Installation",
      "Broken Lock",
      "Drawer / Hinge Issue",
      "Shelf Installation",
      "Termite Damage",
      "Other Carpentry Issue",
    ],
  },
  {
    slug: "cleaner",
    name: "Cleaner",
    icon: ["m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"],
    subs: [
      "Home Cleaning",
      "Deep Cleaning",
      "Bathroom Cleaning",
      "Sofa & Carpet Cleaning",
      "Water Tank Cleaning",
      "Kitchen Cleaning",
      "Window Cleaning",
      "Other Cleaning Need",
    ],
  },
  {
    slug: "computer",
    name: "Computer",
    icon: [
      "M5 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
      "M8 20h8M12 16v4",
    ],
    subs: [
      "Computer Repair",
      "Laptop Repair",
      "Printer Repair",
      "Wi-Fi / Network Setup",
      "Virus Removal",
      "Data Recovery",
      "Software Support",
      "Other IT Problem",
    ],
  },
  {
    slug: "tutor",
    name: "Tutor",
    icon: ["M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z", "M8 7h7"],
    subs: [
      "School Tuition",
      "Competitive Exam Preparation",
      "Language Learning",
      "Computer & Coding Classes",
      "Music / Dance / Drawing",
      "Skill Development",
      "Other Learning Need",
    ],
  },
];
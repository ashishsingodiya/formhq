import { createHmac, randomBytes } from "crypto";
import "dotenv/config";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import slugify from "slugify";

import { env } from "./env";

import { formsTable } from "./models/form";
import { formFieldsTable } from "./models/form-field";
import { formSubmissionTable } from "./models/form-submissions";
import { usersTable } from "./models/user";

const db = drizzle(env.DATABASE_URL);

function hashPassword(plain: string): {
  salt: string;
  password: string;
} {
  const salt = randomBytes(16).toString("hex");

  const hash = createHmac("sha256", salt).update(plain).digest("hex");

  return {
    salt,
    password: hash,
  };
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function pickMultiple<T>(arr: T[], min = 1, max = 3): T[] {
  const count = randomInt(min, Math.min(max, arr.length));

  const shuffled = [...arr].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count);
}

function randomTimestampInLastMonth(): Date {
  const now = Date.now();

  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const offset = Math.random() * thirtyDaysMs;

  const d = new Date(now - offset);

  d.setHours(randomInt(8, 22), randomInt(0, 59), randomInt(0, 59));

  return d;
}

const SEED_EMAIL = "demo@email.com";
const SEED_PASSWORD = "Pass@123";

const PRESET_IDS = [
  "defaultPreset",
  "ocean",
  "mono",
  "midnight",
  "rose",
  "amber",
  "slate",
  "crimson",
  "aurora",
  "lavender",
  "mountain",
  "forest",
  "cosmos",
  "blossom",
  "winter",
  "beach",
  "desert",
] as const;

const FORM_TEMPLATES = [
  {
    slug: "product-feedback",
    title: "Product Feedback Survey",
    description: "Help us improve our product experience.",
  },
  {
    slug: "frontend-job-application",
    title: "Frontend Developer Application",
    description: "Apply for our frontend engineering role.",
  },
  {
    slug: "conference-registration",
    title: "Tech Conference Registration",
    description: "Register for the annual developer conference.",
  },
  {
    slug: "customer-satisfaction",
    title: "Customer Satisfaction Survey",
    description: "Tell us about your recent experience.",
  },
  {
    slug: "restaurant-feedback",
    title: "Restaurant Feedback Form",
    description: "Share your dining experience with us.",
  },
  {
    slug: "startup-waitlist",
    title: "AI Startup Waitlist",
    description: "Join the waitlist for early access.",
  },
  {
    slug: "fitness-consultation",
    title: "Fitness Consultation Form",
    description: "Help us understand your fitness goals.",
  },
  {
    slug: "travel-planning",
    title: "Travel Planning Questionnaire",
    description: "Tell us about your dream vacation.",
  },
  {
    slug: "freelancer-intake",
    title: "Freelancer Project Intake",
    description: "Tell us about your project requirements.",
  },
  {
    slug: "course-enrollment",
    title: "Online Course Enrollment",
    description: "Enroll in our premium online course.",
  },
  {
    slug: "design-audit",
    title: "Website Design Audit",
    description: "Get a quick review of your website UI.",
  },
  {
    slug: "beta-feedback",
    title: "Beta Tester Feedback",
    description: "Share your experience with our beta build.",
  },
];

const NAMES = [
  "Aarav Sharma",
  "Emma Wilson",
  "Liam Johnson",
  "Sophia Brown",
  "Noah Davis",
  "Olivia Taylor",
  "Ethan Martinez",
  "Mia Anderson",
  "James Thomas",
  "Isabella Moore",
  "Benjamin Jackson",
  "Charlotte White",
  "Lucas Harris",
  "Amelia Martin",
  "Henry Thompson",
  "Harper Garcia",
  "Alexander Clark",
  "Evelyn Lewis",
  "Daniel Walker",
  "Abigail Hall",
  "Michael Young",
  "Emily King",
  "William Scott",
  "Ava Green",
  "David Adams",
  "Ella Baker",
  "Logan Nelson",
  "Sofia Carter",
  "Sebastian Mitchell",
  "Grace Perez",
];

const BIOS = [
  "Frontend engineer focused on React and TypeScript.",
  "Building SaaS products for startups.",
  "Freelance UI designer working remotely.",
  "Product manager passionate about user experience.",
  "Computer science student learning full stack development.",
  "Running a digital marketing agency.",
  "Helping businesses automate workflows.",
  "Love creating beautiful user interfaces.",
  "Working on AI-powered productivity tools.",
  "Experienced backend engineer exploring frontend technologies.",
  "Startup founder validating product ideas.",
  "Creating no-code tools for creators.",
  "Building modern e-commerce experiences.",
  "Interested in design systems and accessibility.",
  "Leading engineering teams in fast-paced startups.",
];

const CITIES = [
  "New York",
  "London",
  "Berlin",
  "Tokyo",
  "Mumbai",
  "Bangalore",
  "Singapore",
  "Toronto",
  "Sydney",
  "Amsterdam",
  "Paris",
  "Dubai",
];

const COMPANIES = [
  "Google",
  "Microsoft",
  "Stripe",
  "Figma",
  "Linear",
  "Notion",
  "OpenAI",
  "Vercel",
  "Shopify",
  "Razorpay",
  "Swiggy",
  "Zomato",
  "Atlassian",
];

const TOOLS = ["Figma", "VS Code", "Notion", "Slack", "GitHub", "Linear", "Postman", "Framer"];

function createFields() {
  return [
    {
      title: "What is your full name?",
      type: "SHORT_TEXT" as const,
      isRequired: true,
      order: "1.00",
      config: {
        type: "SHORT_TEXT",
        maxLength: 100,
      },
    },

    {
      title: "Your email address",
      type: "EMAIL" as const,
      isRequired: true,
      order: "2.00",
      config: {
        type: "EMAIL",
      },
    },

    {
      title: "Phone number",
      type: "SHORT_TEXT" as const,
      isRequired: false,
      order: "3.00",
      config: {
        type: "SHORT_TEXT",
        maxLength: 20,
      },
    },

    {
      title: "Which city are you based in?",
      type: "SINGLE_SELECT" as const,
      isRequired: true,
      order: "4.00",
      config: {
        type: "SINGLE_SELECT",
        display: "dropdown",
        options: CITIES.map((city, i) => ({
          value: `city-${i}`,
          label: city,
        })),
      },
    },

    {
      title: "Tell us about yourself",
      type: "LONG_TEXT" as const,
      isRequired: false,
      order: "5.00",
      config: {
        type: "LONG_TEXT",
        maxLength: 500,
      },
    },

    {
      title: "How many years of experience do you have?",
      type: "NUMBER" as const,
      isRequired: true,
      order: "6.00",
      config: {
        type: "NUMBER",
        min: 0,
        max: 40,
        integer: true,
      },
    },

    {
      title: "Current company",
      type: "SHORT_TEXT" as const,
      isRequired: false,
      order: "7.00",
      config: {
        type: "SHORT_TEXT",
        maxLength: 100,
      },
    },

    {
      title: "Which tools do you use regularly?",
      type: "MULTI_SELECT" as const,
      isRequired: false,
      order: "8.00",
      config: {
        type: "MULTI_SELECT",
        display: "checkbox",
        options: TOOLS.map((tool, i) => ({
          value: `tool-${i}`,
          label: tool,
        })),
      },
    },

    {
      title: "Rate your overall experience",
      type: "RATING" as const,
      isRequired: true,
      order: "9.00",
      config: {
        type: "RATING",
        max: 5,
        icon: "star",
      },
    },

    {
      title: "When did you start using our product?",
      type: "DATE" as const,
      isRequired: false,
      order: "10.00",
      config: {
        type: "DATE",
      },
    },

    {
      title: "Would you recommend us to a friend?",
      type: "YES_NO" as const,
      isRequired: true,
      order: "11.00",
      config: {
        type: "YES_NO",
        yesLabel: "Yes",
        noLabel: "No",
      },
    },

    {
      title: "Portfolio website",
      type: "SHORT_TEXT" as const,
      isRequired: false,
      order: "12.00",
      config: {
        type: "SHORT_TEXT",
        maxLength: 200,
      },
    },
  ];
}

function generateAnswer(type: string) {
  switch (type) {
    case "SHORT_TEXT":
      return pick([...NAMES, ...COMPANIES]);

    case "LONG_TEXT":
      return pick(BIOS);

    case "EMAIL": {
      const name = slugify(pick(NAMES), {
        lower: true,
        strict: true,
      });

      return `${name}${randomInt(1, 999)}@gmail.com`;
    }

    case "NUMBER":
      return String(randomInt(0, 25));

    case "SINGLE_SELECT":
      return pick(CITIES);

    case "MULTI_SELECT":
      return pickMultiple(TOOLS, 1, 4);

    case "RATING":
      return pick(["3", "4", "4", "5", "5", "5"]);

    case "DATE": {
      const d = new Date();

      d.setDate(d.getDate() - randomInt(30, 700));

      return d.toISOString().slice(0, 10);
    }

    case "YES_NO":
      return Math.random() > 0.2 ? "true" : "false";

    default:
      return "Sample answer";
  }
}

async function seed() {
  console.log("\n🌱 Starting database seed...\n");

  const existingUser = await db
    .select({
      id: usersTable.id,
    })
    .from(usersTable)
    .where(eq(usersTable.email, SEED_EMAIL))
    .limit(1);

  let userId: string;

  if (existingUser.length > 0) {
    userId = existingUser[0]!.id;

    console.log(`✅ Existing user found: ${userId}`);
  } else {
    const { salt, password } = hashPassword(SEED_PASSWORD);

    const [user] = await db
      .insert(usersTable)
      .values({
        fullName: "Ashish",
        email: SEED_EMAIL,
        emailVerified: true,
        salt,
        password,
      })
      .returning({
        id: usersTable.id,
      });

    userId = user!.id;

    console.log(`✅ Created user: ${userId}`);
  }

  for (let i = 0; i < FORM_TEMPLATES.length; i++) {
    const template = FORM_TEMPLATES[i]!;

    const existingForm = await db
      .select({
        id: formsTable.id,
      })
      .from(formsTable)
      .where(eq(formsTable.slug, template.slug))
      .limit(1);

    if (existingForm.length > 0) {
      console.log(`⏭ Skipping existing form: ${template.slug}`);

      continue;
    }

    const presetId = PRESET_IDS[i % PRESET_IDS.length];

    const [form] = await db
      .insert(formsTable)
      .values({
        slug: template.slug,
        title: template.title,
        description: template.description,
        isPublished: true,
        publishedAt: randomTimestampInLastMonth(),
        visibility: "PUBLIC",
        themeConfig: {
          presetId,
        },
        createdBy: userId,
      })
      .returning({
        id: formsTable.id,
        slug: formsTable.slug,
      });

    const formId = form!.id;

    console.log(`\n📝 Created form: ${template.title}`);

    const fields = createFields();

    const insertedFields = await db
      .insert(formFieldsTable)
      .values(
        fields.map((field) => ({
          formId,
          title: field.title,
          type: field.type,
          isRequired: field.isRequired,
          order: field.order,
          config: field.config,
        })),
      )
      .returning({
        id: formFieldsTable.id,
      });

    const fieldIds = insertedFields.map((field) => field.id);

    const submissionCount = randomInt(100, 150);

    const submissions = Array.from({
      length: submissionCount,
    }).map(() => {
      const values = fields
        .map((field, index) => {
          if (!field.isRequired && Math.random() < 0.12) {
            return null;
          }

          return {
            formFieldId: fieldIds[index]!,
            value: generateAnswer(field.type),
          };
        })
        .filter(Boolean);

      return {
        formId,
        values,
        createdAt: randomTimestampInLastMonth(),
      };
    });

    await db.insert(formSubmissionTable).values(submissions);

    console.log(`   → ${fields.length} fields`);

    console.log(`   → ${submissionCount} submissions`);

    console.log(`   → Theme: ${presetId}`);
  }

  console.log("\n🎉 Database seeding completed!\n");

  console.log(`Login email: ${SEED_EMAIL}`);

  console.log(`Login password: ${SEED_PASSWORD}`);
}

seed().catch((err) => {
  console.error(err);

  process.exit(1);
});

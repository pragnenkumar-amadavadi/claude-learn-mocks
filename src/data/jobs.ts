export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salary: string;
  description: string;
  requirements: string[];
  postedAt: string;
}

const titles = [
  'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer', 'Senior Software Engineer',
  'Site Reliability Engineer', 'DevOps Engineer', 'Cloud Infrastructure Engineer',
  'Product Designer', 'UI/UX Designer', 'Product Manager', 'Senior Product Manager',
  'Data Scientist', 'Data Analyst', 'Data Engineer', 'Machine Learning Engineer',
  'Platform Engineer', 'Mobile Engineer (iOS)', 'Mobile Engineer (Android)',
  'QA Automation Engineer', 'Engineering Manager', 'Growth Product Manager',
  'Analytics Engineer', 'Design Systems Lead', 'ML Ops Engineer', 'Security Engineer',
  'Technical Program Manager', 'UX Researcher', 'Business Intelligence Analyst',
  'Release Engineer', 'Staff Software Engineer',
];

const companies = [
  'Nimbus Cloud', 'Vertex Labs', 'Bright Path Analytics', 'Northwind Systems',
  'Cobalt Studio', 'Lattice Works', 'Harbor Digital', 'Pinecone Software',
  'Ridgeline Data', 'Solace Technologies', 'Fernwood Design Co.', 'Quartz Robotics',
  'Bluestone Payments', 'Meridian AI', 'Copperfield Health',
];

const locations = [
  'New York, NY', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA',
  'Chicago, IL', 'Boston, MA', 'Denver, CO', 'Atlanta, GA',
  'Remote', 'London, UK', 'Toronto, ON', 'Berlin, Germany',
];

const types: Job['type'][] = ['full-time', 'part-time', 'contract', 'remote'];

const requirementsPool = [
  '3+ years of professional experience in a similar role',
  'Strong proficiency in TypeScript/JavaScript',
  'Experience with React or similar frontend frameworks',
  'Solid understanding of RESTful API design',
  'Familiarity with cloud platforms (AWS, GCP, or Azure)',
  'Experience with CI/CD pipelines',
  'Strong communication and collaboration skills',
  'Bachelor\'s degree in Computer Science or equivalent experience',
  'Experience with SQL and relational databases',
  'Proficiency in Python for data analysis or automation',
  'Experience with containerization (Docker, Kubernetes)',
  'Track record of shipping user-facing products',
  'Experience with design tools such as Figma',
  'Familiarity with Agile/Scrum methodologies',
  'Excellent problem-solving and analytical skills',
];

const salaryRanges = [
  '$70,000 - $90,000 / yr',
  '$80,000 - $100,000 / yr',
  '$90,000 - $120,000 / yr',
  '$100,000 - $130,000 / yr',
  '$110,000 - $140,000 / yr',
  '$120,000 - $150,000 / yr',
  '$130,000 - $160,000 / yr',
  '$140,000 - $180,000 / yr',
  '$45 - $65 / hr',
  '$60 - $85 / hr',
];

function seedRand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length)] as T;
}

export const jobs: Job[] = Array.from({ length: 30 }, (_, i) => {
  const id = i + 1;
  const r = (offset: number) => seedRand(id * 11 + offset);

  const title = pick(titles, r(1));
  const company = pick(companies, r(2));
  const location = pick(locations, r(3));
  const type = pick(types, r(4));
  const salary = pick(salaryRanges, r(5));

  const reqCount = 3 + Math.floor(r(6) * 3);
  const requirements: string[] = [];
  const usedIndices = new Set<number>();
  let attempt = 7;
  while (requirements.length < reqCount) {
    const idx = Math.floor(r(attempt) * requirementsPool.length);
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      requirements.push(requirementsPool[idx] as string);
    }
    attempt += 1;
  }

  const daysAgo = Math.floor(r(20) * 60);
  const postedDate = new Date(Date.now() - daysAgo * 86400000);

  return {
    id,
    title,
    company,
    location,
    type,
    salary,
    description: `${company} is looking for a talented ${title} to join our team. You'll work closely with cross-functional stakeholders to design, build, and ship impactful features. This is a great opportunity to grow your career in a fast-paced, collaborative environment.`,
    requirements,
    postedAt: postedDate.toISOString(),
  };
});

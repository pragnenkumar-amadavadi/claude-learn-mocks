export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  experience: number;
  location: string;
  avatarUrl: string;
  appliedAt: string;
}

const names = [
  'Alice Johnson', 'Bob Martinez', 'Carol White', 'David Brown', 'Eva Davis',
  'Frank Wilson', 'Grace Lee', 'Henry Taylor', 'Iris Anderson', 'Jack Thomas',
  'Karen Jackson', 'Liam Harris', 'Mia Clark', 'Noah Lewis', 'Olivia Robinson',
  'Paul Walker', 'Quinn Hall', 'Rachel Young', 'Sam King', 'Tina Wright',
];

const positions = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'DevOps Engineer', 'QA Engineer', 'Product Manager', 'UI/UX Designer',
  'Data Scientist', 'Machine Learning Engineer', 'Mobile Developer',
];

const locations = [
  'New York, NY', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA',
  'Chicago, IL', 'Boston, MA', 'Denver, CO', 'Atlanta, GA',
  'Remote', 'London, UK',
];

const statuses: Candidate['status'][] = [
  'applied', 'screening', 'interview', 'offer', 'hired', 'rejected',
];

function seedRand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const candidates: Candidate[] = Array.from({ length: 100 }, (_, i) => {
  const id = i + 1;
  const r = (offset: number) => seedRand(id * 7 + offset);
  const nameBase = names[Math.floor(r(1) * names.length)];
  const name = i < names.length ? nameBase : `${nameBase.split(' ')[0]} ${id}`;
  const slug = name.toLowerCase().replace(/\s+/g, '.');
  const daysAgo = Math.floor(r(5) * 180);
  const appliedDate = new Date(Date.now() - daysAgo * 86400000);

  return {
    id,
    name,
    email: `${slug}@example.com`,
    phone: `+1-${String(Math.floor(r(2) * 900 + 100))}-${String(Math.floor(r(3) * 900 + 100))}-${String(Math.floor(r(4) * 9000 + 1000))}`,
    position: positions[Math.floor(r(6) * positions.length)],
    status: statuses[Math.floor(r(7) * statuses.length)],
    experience: Math.floor(r(8) * 15),
    location: locations[Math.floor(r(9) * locations.length)],
    avatarUrl: `https://i.pravatar.cc/150?img=${(id % 70) + 1}`,
    appliedAt: appliedDate.toISOString(),
  };
});

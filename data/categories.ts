import { 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Users, 
  Baby, 
  Laptop 
} from 'lucide-react-native';

export interface Subcategory {
  id: string;
  name: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  image_url: string;
  subcategories: Subcategory[];
}

export const categories: Category[] = [
  {
    id: 'career',
    name: 'Career',
    description: 'Get guidance on your professional journey',
    icon: 'Briefcase',
    image_url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=80',
    subcategories: [
      { id: 'career-transition', name: 'Career Transition', description: 'Guidance for switching careers or industries' },
      { id: 'job-search', name: 'Job Search Strategy', description: 'Optimize your job search and application process' },
      { id: 'resume-optimization', name: 'Resume & Portfolio', description: 'Craft compelling resumes and portfolios' },
      { id: 'interview-prep', name: 'Interview Preparation', description: 'Master interview techniques and negotiation' },
      { id: 'personal-branding', name: 'Personal Branding', description: 'Build your professional online presence' },
      { id: 'networking', name: 'Professional Networking', description: 'Expand your professional network effectively' },
      { id: 'leadership', name: 'Leadership Development', description: 'Develop essential leadership skills' },
      { id: 'remote-work', name: 'Remote Work Success', description: 'Excel in remote work environments' },
      { id: 'entrepreneurship', name: 'Entrepreneurship', description: 'Start and grow your own business' },
      { id: 'work-life-balance', name: 'Work-Life Balance', description: 'Maintain healthy professional boundaries' },
      { id: 'career-advancement', name: 'Career Advancement', description: 'Strategies for promotions and growth' },
      { id: 'salary-negotiation', name: 'Salary Negotiation', description: 'Negotiate better compensation packages' }
    ]
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Academic and learning guidance',
    icon: 'GraduationCap',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80',
    subcategories: [
      { id: 'college-prep', name: 'College Preparation', description: 'Get ready for higher education' },
      { id: 'grad-school', name: 'Graduate School', description: 'Navigate advanced education decisions' },
      { id: 'study-techniques', name: 'Study Techniques', description: 'Improve learning efficiency and retention' },
      { id: 'test-prep', name: 'Test Preparation', description: 'Strategies for standardized tests' },
      { id: 'research-skills', name: 'Research Skills', description: 'Develop academic research abilities' },
      { id: 'academic-writing', name: 'Academic Writing', description: 'Enhance scholarly writing skills' },
      { id: 'stem-subjects', name: 'STEM Education', description: 'Support in science and mathematics' },
      { id: 'language-learning', name: 'Language Learning', description: 'Master new languages effectively' },
      { id: 'online-learning', name: 'Online Learning', description: 'Succeed in digital education' },
      { id: 'continuing-education', name: 'Continuing Education', description: 'Lifelong learning strategies' },
      { id: 'scholarship-guidance', name: 'Scholarship Guidance', description: 'Find and secure educational funding' },
      { id: 'dissertation-support', name: 'Dissertation Support', description: 'Navigate thesis and dissertation work' }
    ]
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    description: 'Support for physical and mental wellbeing',
    icon: 'Heart',
    image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1600&q=80',
    subcategories: [
      { id: 'mental-health', name: 'Mental Health', description: 'Support for emotional wellbeing' },
      { id: 'stress-management', name: 'Stress Management', description: 'Cope with life\'s pressures' },
      { id: 'mindfulness', name: 'Mindfulness & Meditation', description: 'Develop mindfulness practices' },
      { id: 'anxiety-management', name: 'Anxiety Management', description: 'Tools for managing anxiety' },
      { id: 'work-burnout', name: 'Burnout Prevention', description: 'Prevent and recover from burnout' },
      { id: 'fitness-goals', name: 'Fitness Goals', description: 'Achieve physical fitness objectives' },
      { id: 'nutrition', name: 'Nutrition Planning', description: 'Develop healthy eating habits' },
      { id: 'sleep-improvement', name: 'Sleep Improvement', description: 'Enhance sleep quality' },
      { id: 'holistic-wellness', name: 'Holistic Wellness', description: 'Balance mind, body, and spirit' },
      { id: 'addiction-recovery', name: 'Addiction Recovery', description: 'Support for overcoming addiction' },
      { id: 'chronic-illness', name: 'Chronic Illness Management', description: 'Living well with chronic conditions' },
      { id: 'preventive-health', name: 'Preventive Health', description: 'Maintain long-term wellness' }
    ]
  },
  {
    id: 'relationships',
    name: 'Relationships',
    description: 'Navigate personal relationships',
    icon: 'Users',
    image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',
    subcategories: [
      { id: 'communication', name: 'Communication Skills', description: 'Improve interpersonal communication' },
      { id: 'conflict-resolution', name: 'Conflict Resolution', description: 'Handle disagreements effectively' },
      { id: 'boundary-setting', name: 'Boundary Setting', description: 'Establish healthy boundaries' },
      { id: 'dating-guidance', name: 'Dating Guidance', description: 'Navigate modern dating landscape' },
      { id: 'marriage-counseling', name: 'Marriage Enhancement', description: 'Strengthen marital relationships' },
      { id: 'family-dynamics', name: 'Family Dynamics', description: 'Improve family relationships' },
      { id: 'workplace-relationships', name: 'Workplace Relationships', description: 'Navigate professional relationships' },
      { id: 'social-skills', name: 'Social Skills Development', description: 'Build better social connections' },
      { id: 'trust-building', name: 'Trust Building', description: 'Develop and maintain trust' },
      { id: 'emotional-intelligence', name: 'Emotional Intelligence', description: 'Enhance emotional awareness' },
      { id: 'cultural-relationships', name: 'Cross-Cultural Relations', description: 'Navigate cultural differences' },
      { id: 'relationship-trauma', name: 'Relationship Healing', description: 'Heal from past relationship issues' }
    ]
  },
  {
    id: 'parenting',
    name: 'Parenting',
    description: 'Support for raising children',
    icon: 'Baby',
    image_url: 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&w=1600&q=80',
    subcategories: [
      { id: 'new-parents', name: 'New Parents', description: 'Support for first-time parents' },
      { id: 'child-development', name: 'Child Development', description: 'Understanding growth stages' },
      { id: 'positive-discipline', name: 'Positive Discipline', description: 'Effective disciplining strategies' },
      { id: 'teen-parenting', name: 'Teen Parenting', description: 'Navigate teenage years' },
      { id: 'special-needs', name: 'Special Needs', description: 'Support for special needs children' },
      { id: 'education-planning', name: 'Education Planning', description: 'Guide children\'s education' },
      { id: 'digital-parenting', name: 'Digital Parenting', description: 'Navigate technology and social media' },
      { id: 'co-parenting', name: 'Co-Parenting', description: 'Effective shared parenting strategies' },
      { id: 'behavioral-issues', name: 'Behavioral Management', description: 'Address challenging behaviors' },
      { id: 'emotional-support', name: 'Emotional Support', description: 'Nurture emotional intelligence' },
      { id: 'work-life-parent', name: 'Working Parent Balance', description: 'Balance career and parenting' },
      { id: 'child-safety', name: 'Child Safety & Wellbeing', description: 'Ensure children\'s safety and health' }
    ]
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Navigate the digital landscape',
    icon: 'Laptop',
    image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80',
    subcategories: [
      { id: 'coding-dev', name: 'Coding & Development', description: 'Learn programming and software development' },
      { id: 'data-science', name: 'Data Science', description: 'Master data analysis and machine learning' },
      { id: 'cybersecurity', name: 'Cybersecurity', description: 'Protect digital assets and privacy' },
      { id: 'cloud-computing', name: 'Cloud Computing', description: 'Navigate cloud platforms and services' },
      { id: 'digital-marketing', name: 'Digital Marketing', description: 'Master online marketing strategies' },
      { id: 'ui-ux-design', name: 'UI/UX Design', description: 'Create user-centered digital experiences' },
      { id: 'blockchain', name: 'Blockchain & Web3', description: 'Understand decentralized technologies' },
      { id: 'ai-ml', name: 'AI & Machine Learning', description: 'Explore artificial intelligence applications' },
      { id: 'devops', name: 'DevOps Practices', description: 'Implement efficient development operations' },
      { id: 'tech-leadership', name: 'Tech Leadership', description: 'Lead technical teams effectively' },
      { id: 'product-management', name: 'Product Management', description: 'Guide technical product development' },
      { id: 'tech-entrepreneurship', name: 'Tech Entrepreneurship', description: 'Build technology startups' }
    ]
  }
];

// Helper function to get icon component by name
export function getCategoryIcon(iconName: string) {
  const icons = {
    Briefcase,
    GraduationCap,
    Heart,
    Users,
    Baby,
    Laptop
  };
  return icons[iconName as keyof typeof icons];
}
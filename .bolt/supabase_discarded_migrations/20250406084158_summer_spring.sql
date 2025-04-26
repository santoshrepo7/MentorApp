/*
  # Add mentors with proper user creation

  1. New Data
    - Creates auth.users entries first
    - Adds corresponding profile records
    - Creates professional profiles for mentors
    - Ensures proper foreign key relationships

  2. Changes
    - Creates users in auth schema
    - Links profiles to auth users
    - Sets up professional profiles
*/

-- First, create the users in auth.users
DO $$
BEGIN
  -- Create users in auth schema
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES
    ('d1c7b3e4-5f6a-7b8c-9d0e-1f2a3b4c5d6e', 'sarah.chen@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('a2b8c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d', 'michael.rodriguez@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('b3c9d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e', 'emily.thompson@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('c4d0e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f', 'david.kim@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('e5f1a7b8-b9c0-4d1e-2f3a-4b5c6d7e8f9a', 'rachel.patel@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW());

  -- Create corresponding profiles
  INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at)
  VALUES
    ('d1c7b3e4-5f6a-7b8c-9d0e-1f2a3b4c5d6e', 'Sarah Chen', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80', NOW(), NOW()),
    ('a2b8c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d', 'Michael Rodriguez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80', NOW(), NOW()),
    ('b3c9d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e', 'Emily Thompson', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&h=256&q=80', NOW(), NOW()),
    ('c4d0e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f', 'David Kim', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80', NOW(), NOW()),
    ('e5f1a7b8-b9c0-4d1e-2f3a-4b5c6d7e8f9a', 'Rachel Patel', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80', NOW(), NOW());

  -- Create professional profiles
  INSERT INTO public.professionals (
    id,
    bio,
    years_of_experience,
    hourly_rate,
    categories,
    subcategories,
    expertise,
    education,
    certifications,
    languages,
    achievements,
    teaching_style,
    session_format,
    time_zone,
    linkedin_url,
    website_url,
    company,
    position,
    industry,
    skills,
    work_experience,
    rating,
    is_verified,
    total_sessions,
    total_students,
    online_status,
    created_at,
    updated_at
  )
  VALUES
    (
      'd1c7b3e4-5f6a-7b8c-9d0e-1f2a3b4c5d6e',
      'Tech leader with 12+ years of experience in software development and machine learning. Passionate about mentoring the next generation of tech professionals.',
      12,
      150.00,
      ARRAY['technology'],
      ARRAY['coding-dev', 'ai-ml', 'tech-leadership'],
      ARRAY['Machine Learning', 'Python', 'Leadership', 'System Design'],
      ARRAY['PhD in Computer Science, Stanford University', 'MS in AI, MIT'],
      ARRAY['AWS Solutions Architect', 'Google Cloud Professional ML Engineer'],
      ARRAY['English (Native)', 'Mandarin (Fluent)'],
      ARRAY['Led 100+ person engineering team', 'Published in top ML conferences', '15+ patents'],
      'I believe in hands-on learning and real-world problem solving. My approach combines theoretical foundations with practical implementation.',
      ARRAY['video', 'chat', 'call'],
      'America/Los_Angeles',
      'https://linkedin.com/in/sarahchen',
      'https://sarahchen.dev',
      'TechCorp AI',
      'Director of Engineering',
      'Technology',
      ARRAY['Python', 'TensorFlow', 'System Design', 'Team Leadership', 'Machine Learning'],
      ARRAY['Senior ML Engineer at Google', 'Tech Lead at Amazon'],
      4.9,
      true,
      156,
      89,
      true,
      NOW(),
      NOW()
    ),
    (
      'a2b8c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d',
      'Career development expert with experience in Fortune 500 companies. Specialized in helping professionals navigate career transitions and leadership roles.',
      15,
      120.00,
      ARRAY['career'],
      ARRAY['career-transition', 'leadership', 'personal-branding'],
      ARRAY['Career Coaching', 'Leadership Development', 'Executive Presence'],
      ARRAY['MBA, Harvard Business School', 'BS in Business, NYU Stern'],
      ARRAY['Certified Professional Coach (ICF)', 'SHRM Senior Certified Professional'],
      ARRAY['English (Native)', 'Spanish (Fluent)'],
      ARRAY['Career Coach of the Year 2024', 'Featured in Forbes'],
      'I focus on actionable strategies and personalized guidance to help you achieve your career goals.',
      ARRAY['video', 'chat', 'call'],
      'America/New_York',
      'https://linkedin.com/in/mrodriguez',
      'https://careerswithmike.com',
      'Career Elevate',
      'Executive Career Coach',
      'Professional Services',
      ARRAY['Career Planning', 'Interview Preparation', 'Resume Writing', 'Networking'],
      ARRAY['HR Director at Microsoft', 'Career Coach at LinkedIn'],
      4.8,
      true,
      234,
      167,
      true,
      NOW(),
      NOW()
    ),
    (
      'b3c9d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e',
      'Health and wellness expert specializing in stress management and work-life balance for busy professionals.',
      10,
      90.00,
      ARRAY['health'],
      ARRAY['stress-management', 'mindfulness', 'work-burnout'],
      ARRAY['Stress Management', 'Mindfulness', 'Corporate Wellness'],
      ARRAY['MS in Psychology, Columbia University', 'Certified Health Coach'],
      ARRAY['Mindfulness-Based Stress Reduction Teacher', 'National Board Certified Health Coach'],
      ARRAY['English (Native)', 'French (Conversational)'],
      ARRAY['Published Author: "Mindful Success"', 'TEDx Speaker'],
      'My holistic approach combines scientific research with practical techniques for sustainable wellness.',
      ARRAY['video', 'chat', 'call'],
      'America/Chicago',
      'https://linkedin.com/in/ethompson',
      'https://mindfulwithemily.com',
      'Wellness Works',
      'Senior Wellness Consultant',
      'Health & Wellness',
      ARRAY['Stress Management', 'Meditation', 'Work-Life Balance', 'Corporate Wellness'],
      ARRAY['Corporate Wellness Director', 'Mindfulness Teacher'],
      4.9,
      true,
      189,
      145,
      true,
      NOW(),
      NOW()
    ),
    (
      'c4d0e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f',
      'Full-stack developer and UI/UX expert with a passion for creating beautiful, user-friendly applications.',
      8,
      100.00,
      ARRAY['technology'],
      ARRAY['ui-ux-design', 'coding-dev', 'product-management'],
      ARRAY['React', 'UI/UX Design', 'Product Development'],
      ARRAY['BS in Computer Science, UC Berkeley'],
      ARRAY['AWS Certified Developer', 'Google UX Design Certificate'],
      ARRAY['English (Native)', 'Korean (Native)'],
      ARRAY['Best Design Award 2023', '10+ Successfully Launched Products'],
      'I emphasize practical, project-based learning that helps you build a strong portfolio.',
      ARRAY['video', 'chat', 'call'],
      'America/Los_Angeles',
      'https://linkedin.com/in/davidkim',
      'https://davidkim.dev',
      'DesignTech Solutions',
      'Lead Product Designer',
      'Technology',
      ARRAY['React', 'Node.js', 'UI/UX Design', 'Figma', 'Product Management'],
      ARRAY['Senior Developer at Apple', 'UX Designer at Facebook'],
      4.7,
      true,
      143,
      98,
      true,
      NOW(),
      NOW()
    ),
    (
      'e5f1a7b8-b9c0-4d1e-2f3a-4b5c6d7e8f9a',
      'Data science and analytics professional helping individuals and organizations make data-driven decisions.',
      9,
      110.00,
      ARRAY['technology'],
      ARRAY['data-science', 'ai-ml', 'tech-leadership'],
      ARRAY['Data Science', 'Analytics', 'Python', 'SQL'],
      ARRAY['MS in Data Science, Georgia Tech', 'BS in Statistics, UCLA'],
      ARRAY['Microsoft Certified: Azure Data Scientist', 'IBM Data Science Professional'],
      ARRAY['English (Native)', 'Hindi (Native)', 'Python (Expert)'],
      ARRAY['Data Science Excellence Award', 'Published Research in Big Data'],
      'I break down complex concepts into digestible pieces and focus on practical applications.',
      ARRAY['video', 'chat', 'call'],
      'America/New_York',
      'https://linkedin.com/in/rpatel',
      'https://rachelpatel.io',
      'DataMind Analytics',
      'Lead Data Scientist',
      'Technology',
      ARRAY['Python', 'SQL', 'Machine Learning', 'Data Visualization', 'Statistics'],
      ARRAY['Senior Data Scientist at Netflix', 'Analytics Lead at Twitter'],
      4.8,
      true,
      167,
      112,
      true,
      NOW(),
      NOW()
    );
END $$;

-- Update search text for the new professionals
SELECT update_professional_search_text_trigger();
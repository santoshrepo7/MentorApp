/*
  # Add regular users and additional mentors

  1. New Data
    - Creates regular user accounts in auth schema
    - Adds corresponding profile records
    - Creates additional professional profiles for mentors
    - Ensures proper UUID formatting

  2. Changes
    - Creates users in auth schema first
    - Links profiles to auth users
    - Sets up professional profiles for mentors
*/

-- Create users and profiles within a transaction
DO $$
BEGIN
  -- Create regular users in auth schema
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES
    ('f6c2d8e9-a0b1-4c2d-8e3f-5a6b7c8d9e0f', 'alex.turner@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('g7d3e9f0-b1c2-4d3e-9f4g-6a7b8c9d0e1f', 'sofia.martinez@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('h8e4f0g1-c2d3-4e4f-5g6h-7a8b9c0d1e2f', 'james.wilson@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('i9f5g1h2-d3e4-4f5g-6h7i-8a9b0c1d2e3f', 'emma.davis@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('j0g6h2i3-e4f5-4g6h-7i8j-9a0b1c2d3e4f', 'lucas.brown@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW());

  -- Insert regular user profiles
  INSERT INTO profiles (id, full_name, avatar_url, created_at, updated_at)
  VALUES
    ('f6c2d8e9-a0b1-4c2d-8e3f-5a6b7c8d9e0f', 'Alex Turner', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80', NOW(), NOW()),
    ('g7d3e9f0-b1c2-4d3e-9f4g-6a7b8c9d0e1f', 'Sofia Martinez', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=256&h=256&q=80', NOW(), NOW()),
    ('h8e4f0g1-c2d3-4e4f-5g6h-7a8b9c0d1e2f', 'James Wilson', 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=256&h=256&q=80', NOW(), NOW()),
    ('i9f5g1h2-d3e4-4f5g-6h7i-8a9b0c1d2e3f', 'Emma Davis', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80', NOW(), NOW()),
    ('j0g6h2i3-e4f5-4g6h-7i8j-9a0b1c2d3e4f', 'Lucas Brown', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80', NOW(), NOW());

  -- Insert additional professional mentors
  INSERT INTO professionals (
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
      'f6c2d8e9-a0b1-4c2d-8e3f-5a6b7c8d9e0f',
      'Education specialist with expertise in academic counseling and career guidance for students.',
      14,
      95.00,
      ARRAY['education'],
      ARRAY['college-prep', 'grad-school', 'academic-writing'],
      ARRAY['Academic Counseling', 'Career Planning', 'Research Methods'],
      ARRAY['PhD in Education, Columbia University', 'MEd in Counseling, NYU'],
      ARRAY['Licensed Educational Psychologist', 'Career Development Facilitator'],
      ARRAY['English (Native)', 'German (Fluent)'],
      ARRAY['Educational Excellence Award 2023', 'Published Author: "Success in Academia"'],
      'I focus on personalized learning strategies and long-term academic success planning.',
      ARRAY['video', 'chat', 'call'],
      'America/New_York',
      'https://linkedin.com/in/alexturner',
      'https://alexturner.edu',
      'Academic Success Partners',
      'Senior Academic Counselor',
      'Education',
      ARRAY['Academic Counseling', 'Research Methods', 'Career Planning', 'Study Skills'],
      ARRAY['Head of Graduate Admissions at Yale', 'Academic Advisor at Princeton'],
      4.9,
      true,
      178,
      134,
      true,
      NOW(),
      NOW()
    ),
    (
      'g7d3e9f0-b1c2-4d3e-9f4g-6a7b8c9d0e1f',
      'Relationship and communication expert specializing in workplace dynamics and team building.',
      11,
      115.00,
      ARRAY['relationships'],
      ARRAY['communication', 'workplace-relationships', 'emotional-intelligence'],
      ARRAY['Communication Skills', 'Team Building', 'Conflict Resolution'],
      ARRAY['MS in Organizational Psychology, Stanford', 'BA in Communications, Berkeley'],
      ARRAY['Certified Professional Coach', 'Emotional Intelligence Practitioner'],
      ARRAY['English (Native)', 'Portuguese (Fluent)', 'Spanish (Conversational)'],
      ARRAY['Top Communication Coach 2024', 'TEDx Speaker: "The Art of Connection"'],
      'My approach combines psychological insights with practical communication strategies.',
      ARRAY['video', 'chat', 'call'],
      'America/Chicago',
      'https://linkedin.com/in/sofiamartinez',
      'https://communicatewithsofia.com',
      'Dynamic Communications',
      'Principal Communication Strategist',
      'Professional Development',
      ARRAY['Communication', 'Leadership', 'Team Building', 'Conflict Resolution'],
      ARRAY['Communication Director at Google', 'Team Lead at McKinsey'],
      4.8,
      true,
      203,
      156,
      true,
      NOW(),
      NOW()
    ),
    (
      'h8e4f0g1-c2d3-4e4f-5g6h-7a8b9c0d1e2f',
      'Parenting specialist focusing on work-life balance and modern parenting challenges.',
      13,
      105.00,
      ARRAY['parenting'],
      ARRAY['work-life-parent', 'teen-parenting', 'digital-parenting'],
      ARRAY['Work-Life Balance', 'Digital Parenting', 'Child Development'],
      ARRAY['PhD in Child Psychology, Harvard', 'MS in Family Studies, Cornell'],
      ARRAY['Licensed Family Therapist', 'Positive Discipline Educator'],
      ARRAY['English (Native)', 'French (Conversational)'],
      ARRAY['Author: "Digital Age Parenting"', 'Family Therapy Excellence Award'],
      'I help parents navigate modern challenges while maintaining healthy family dynamics.',
      ARRAY['video', 'chat', 'call'],
      'America/Los_Angeles',
      'https://linkedin.com/in/jameswilson',
      'https://modernparentingguide.com',
      'Family Balance Institute',
      'Senior Family Counselor',
      'Family Services',
      ARRAY['Parenting Skills', 'Digital Safety', 'Work-Life Balance', 'Child Development'],
      ARRAY['Family Therapy Director', 'Parenting Workshop Leader'],
      4.9,
      true,
      167,
      123,
      true,
      NOW(),
      NOW()
    ),
    (
      'i9f5g1h2-d3e4-4f5g-6h7i-8a9b0c1d2e3f',
      'Career transition specialist with expertise in emerging industries and future of work.',
      16,
      125.00,
      ARRAY['career'],
      ARRAY['career-transition', 'remote-work', 'personal-branding'],
      ARRAY['Career Change', 'Future of Work', 'Personal Branding'],
      ARRAY['MBA, London Business School', 'BS in Psychology, Duke'],
      ARRAY['Certified Career Strategist', 'Future of Work Specialist'],
      ARRAY['English (Native)', 'Italian (Fluent)'],
      ARRAY['Career Innovation Award 2024', 'Featured in Forbes: "Future of Work"'],
      'I guide professionals through successful career transitions in the evolving job market.',
      ARRAY['video', 'chat', 'call'],
      'America/New_York',
      'https://linkedin.com/in/emmadavis',
      'https://futurecareerpath.com',
      'Future Work Solutions',
      'Career Strategy Director',
      'Career Development',
      ARRAY['Career Planning', 'Future of Work', 'Personal Branding', 'Remote Work'],
      ARRAY['Senior Career Advisor', 'Workforce Innovation Lead'],
      4.8,
      true,
      189,
      145,
      true,
      NOW(),
      NOW()
    ),
    (
      'j0g6h2i3-e4f5-4g6h-7i8j-9a0b1c2d3e4f',
      'Technology education specialist focusing on emerging technologies and coding education.',
      9,
      135.00,
      ARRAY['technology', 'education'],
      ARRAY['coding-dev', 'tech-leadership', 'stem-subjects'],
      ARRAY['Programming Education', 'STEM Teaching', 'EdTech'],
      ARRAY['MS in Computer Science, MIT', 'BS in Education, Carnegie Mellon'],
      ARRAY['Google Certified Educator', 'AWS Certified Instructor'],
      ARRAY['English (Native)', 'Japanese (Conversational)'],
      ARRAY['EdTech Innovator Award', 'Best Coding Bootcamp Instructor'],
      'I make complex technical concepts accessible and enjoyable for learners of all levels.',
      ARRAY['video', 'chat', 'call'],
      'America/Los_Angeles',
      'https://linkedin.com/in/lucasbrown',
      'https://techteachwithlucas.dev',
      'CodeEd Academy',
      'Lead Technical Instructor',
      'Education Technology',
      ARRAY['Programming', 'EdTech', 'STEM Education', 'Technical Training'],
      ARRAY['Senior Developer at EdTech Startup', 'University Programming Instructor'],
      4.7,
      true,
      156,
      98,
      true,
      NOW(),
      NOW()
    );
END $$;

-- Update search text for the new professionals
SELECT update_professional_search_text_trigger();
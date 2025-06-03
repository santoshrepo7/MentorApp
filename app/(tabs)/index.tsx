// Update the fetchMentors function in the home screen
async function fetchMentors() {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('professionals')
      .select(`
        id,
        bio,
        position,
        expertise,
        rating,
        position,
        company,
        hourly_rate,
        profiles!professionals_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('is_verified', true)
      .eq('approval_status', 'approved');

    if (error) throw error;

    if (!data) {
      throw new Error('No data returned from the query');
    }

    const formattedMentors = data.map(mentor => ({
      id: mentor.id,
      full_name: mentor.profiles.full_name,
      title: mentor.position || 'Professional Mentor',
      bio: mentor.bio || '',
      avatar_url: mentor.profiles.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      rating: mentor.rating || 0,
      expertise: mentor.expertise || [],
      position: mentor.position || '',
      company: mentor.company || '',
      hourly_rate: mentor.hourly_rate || 0
    }));

    setMentors(formattedMentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
  } finally {
    setLoading(false);
  }
}
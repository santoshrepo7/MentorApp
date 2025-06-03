// Update the handleSubmit function in BecomeMentorScreen
const handleSubmit = async () => {
  try {
    setLoading(true);
    setError(null);

    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    if (!formData.bio || !formData.years_of_experience || !formData.hourly_rate) {
      throw new Error('Please fill in all required fields');
    }

    let avatarUrl = null;
    if (profileImage) {
      avatarUrl = await uploadImage(profileImage);
      if (!avatarUrl) {
        throw new Error('Failed to upload profile image');
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', session.user.id);

      if (profileError) throw profileError;
    }

    // Create professional profile with initial unverified status
    const { error: insertError } = await supabase
      .from('professionals')
      .insert({
        id: session.user.id,
        ...formData,
        years_of_experience: parseInt(formData.years_of_experience),
        hourly_rate: parseFloat(formData.hourly_rate),
        is_verified: false,
        approval_status: 'pending',
        online_status: false,
      });

    if (insertError) throw insertError;

    // Get user's email and name
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', session.user.id)
      .single();

    if (userError) throw userError;

    // Send approval request
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/mentor-approval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        mentorId: session.user.id,
        mentorName: userData.full_name,
        mentorEmail: userData.email,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send approval request');
    }

    Alert.alert(
      'Application Submitted',
      'Your mentor application has been submitted and is pending approval. You will be notified once it is approved.',
      [{ text: 'OK', onPress: () => router.replace('/profile') }]
    );
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
};
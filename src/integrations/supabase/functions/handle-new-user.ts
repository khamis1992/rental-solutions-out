
export const handleNewUser = async (userId: string, userMetadata: any) => {
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error("Error checking existing profile:", fetchError);
    throw fetchError;
  }

  // Only create profile if it doesn't exist
  if (!existingProfile) {
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email: userMetadata?.email,
          full_name: userMetadata?.full_name || userMetadata?.name,
          role: 'customer',
          status: 'pending_review',
          creation_status: 'pending'
        }
      ]);

    if (insertError) {
      console.error("Error creating profile:", insertError);
      throw insertError;
    }
  }
};

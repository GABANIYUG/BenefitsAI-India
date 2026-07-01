import { supabase } from '../lib/supabase';

export interface ProfileData {
  id?: string;
  userId?: string;
  relation?: string;
  age?: number;
  gender?: string;
  state?: string;
  district?: string;
  income?: number;
  casteCategory?: string;
  occupation?: string;
  isStudent?: boolean;
  isFarmer?: boolean;
  hasDisability?: boolean;
  maritalStatus?: string;
}

export const getProfiles = async (token: string | null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data, error } = await supabase
    .from('Profile')
    .select('*')
    .eq('userId', user.id);
    
  if (error) throw error;
  return { success: true, data };
};

export const createProfile = async (profileData: ProfileData, token: string | null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Ensure user exists in DB first
  await supabase.from('User').upsert({ id: user.id, email: user.email });

  const { data, error } = await supabase
    .from('Profile')
    .insert({ ...profileData, userId: user.id })
    .select()
    .single();
    
  if (error) throw error;
  return { success: true, data };
};

export const updateProfile = async (id: string, profileData: ProfileData, token: string | null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('Profile')
    .update(profileData)
    .eq('id', id)
    .eq('userId', user.id)
    .select()
    .single();
    
  if (error) throw error;
  return { success: true, data };
};

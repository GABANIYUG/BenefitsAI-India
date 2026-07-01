import { supabase } from '../lib/supabase';

export interface ProfileData {
  id?: string;
  full_name?: string;
  age?: number;
  state?: string;
  income?: number;
  is_student?: boolean;
  is_farmer?: boolean;
  gender?: string;
  category?: string;
  caste?: string;
  district?: string;
  has_disability?: boolean;
  occupation?: string;
}

export const getProfiles = async (token: string | null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id);
    
  if (error) throw error;
  return { success: true, data };
};

export const createProfile = async (profileData: ProfileData, token: string | null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('profiles')
    .insert({ ...profileData, id: user.id })
    .select()
    .single();
    
  if (error) throw error;
  return { success: true, data };
};

export const updateProfile = async (id: string, profileData: ProfileData, token: string | null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  return { success: true, data };
};

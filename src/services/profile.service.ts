import { fetchWithAuth } from '../lib/api';

export interface ProfileData {
  id?: string;
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
  return fetchWithAuth('/profiles', {
    method: 'GET'
  }, token);
};

export const createProfile = async (profileData: ProfileData, token: string | null) => {
  return fetchWithAuth('/profiles', {
    method: 'POST',
    body: JSON.stringify(profileData)
  }, token);
};

export const updateProfile = async (id: string, profileData: ProfileData, token: string | null) => {
  return fetchWithAuth(`/profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }, token);
};

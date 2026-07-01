import { fetchWithAuth } from '../lib/api';

export const getSchemes = async (token: string | null, lang: string = 'EN') => {
  return fetchWithAuth(`/schemes?lang=${lang}`, {
    method: 'GET'
  }, token);
};

export const getEligibleSchemes = async (profileId: string, token: string | null, lang: string = 'EN') => {
  return fetchWithAuth(`/schemes/eligible?profileId=${profileId}&lang=${lang}`, {
    method: 'GET'
  }, token);
};

export const getSchemeById = async (id: string, token: string | null) => {
  return fetchWithAuth(`/schemes/${id}`, {
    method: 'GET'
  }, token);
};

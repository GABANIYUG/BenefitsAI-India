import { fetchWithAuth } from '../lib/api';

export const getSchemes = async (token: string | null) => {
  return fetchWithAuth('/schemes', {
    method: 'GET'
  }, token);
};

export const getEligibleSchemes = async (profileId: string, token: string | null) => {
  return fetchWithAuth(`/schemes/eligible?profileId=${profileId}`, {
    method: 'GET'
  }, token);
};

export const getSchemeById = async (id: string, token: string | null) => {
  return fetchWithAuth(`/schemes/${id}`, {
    method: 'GET'
  }, token);
};

const API_BASE_URL = 'http://localhost:8000';

export const API_CLIENT = {
  fetch: async (url: string, options: RequestInit) => {
    return fetch(`${API_BASE_URL}${url}`, options).then((res) => res.json());
  },
};

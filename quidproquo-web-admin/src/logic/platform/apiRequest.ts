import axios from 'axios';

const getHeaders = (accessToken?: string) => ({
  'Content-Type': 'application/json',
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
});

const getAxiosInstance = (apiBaseUrl: string, accessToken?: string) => {
  const instance = axios.create({
    baseURL: apiBaseUrl,
    headers: getHeaders(accessToken),
  });

  return instance;
};

export const apiRequestPost = async <T = any>(path: string, body: object, apiBaseUrl: string, accessToken?: string): Promise<T> => {
  const res = await getAxiosInstance(apiBaseUrl, accessToken).post(path, body);

  return res.data;
};

export const apiRequestGet = async <T = any>(path: string, apiBaseUrl: string, accessToken?: string): Promise<T> => {
  const res = await getAxiosInstance(apiBaseUrl, accessToken).get(path);

  return res.data as T;
};

export const externalRequestGet = async <T = any>(path: string): Promise<T> => {
  const res = await axios
    .create({
      headers: getHeaders(),
    })
    .get(path);

  return res.data as T;
};

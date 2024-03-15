import axios from 'axios';

const getHeaders = (accessToken?: string) => ({
  'Content-Type': 'application/json',
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
});

const getAxiosInstance = (accessToken?: string) => {
  const instance = axios.create({
    // baseURL: `https://api.log.joecoady.development.YOURDOMAIN.app`,
    baseURL: `${window.location.protocol}//${window.location.host.replace(/^[^\.]+/, 'api')}`,
    headers: getHeaders(accessToken),
  });

  return instance;
};

export const apiRequestPost = async <T = any>(
  path: string,
  body: object,
  accessToken?: string,
): Promise<T> => {
  const res = await getAxiosInstance(accessToken).post(path, body);

  return res.data;
};

export const apiRequestGet = async <T = any>(path: string, accessToken?: string): Promise<T> => {
  const res = await getAxiosInstance(accessToken).get(path);

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

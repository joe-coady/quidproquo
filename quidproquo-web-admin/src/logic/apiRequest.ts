import axios from 'axios';

const getHeaders = (accessToken?: string) => ({
  'Content-Type': 'application/json',
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
});

const getAxiosInstance = (accessToken?: string) => {
  // TODO: Get this somehow, we dont know if they are using api or not..
  // Think we should be able to bootstrap an admin domain to the service now.
  const [service, ...domain] = window.location.host.split('.').slice(1);
  const baseURL =
    window.location.hostname !== 'localhost'
      ? `${window.location.protocol}//api.${domain.join('.')}/${service}`
      : `http://localhost:8080/api/admin`;

  const instance = axios.create({
    baseURL,
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

import axios from 'axios';

const getAxiosInstance = () => {
  const instance = axios.create({
    baseURL: `http://localhost:8080`,
  });

  return instance;
};

export const apiRequestPost = async (path: string, body: object) => {
  const res = await getAxiosInstance().post(path, body, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res.data;
};

export const apiRequestGet = async <T = any>(path: string): Promise<T> => {
  const res = await getAxiosInstance().get(path, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res.data as T;
};

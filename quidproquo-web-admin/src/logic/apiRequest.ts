import axios from 'axios';

const getAxiosInstance = () => {
  const instance = axios.create({
    baseURL: document.location.origin.replace('www.', 'api.'),
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

export const apiRequestGet = async (path: string) => {
  const res = await getAxiosInstance().get(path, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res.data;
};

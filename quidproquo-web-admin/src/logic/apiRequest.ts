import axios from 'axios';

const getAxiosInstance = () => {
  const instance = axios.create({
    baseURL: document.location.origin.replace('www.', 'api.'),
  });

  return instance;
};

export const apiRequestGet = async (path: string) => {
  const res = await getAxiosInstance().get(path);
  return res.data;
};

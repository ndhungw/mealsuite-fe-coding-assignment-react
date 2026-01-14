import { User } from '@acme/shared-models';
import { HttpClient } from './http-client';

import { RequestConfigs } from './shared/types';

const userApi = new HttpClient({ baseURL: '/api/users' });

export const getUsers = async (options?: RequestConfigs) => {
  return await userApi.get<User[]>('/', options);
};

export const getUserById = async (id: string, options?: RequestConfigs) => {
  return await userApi.get<User>(`/${id}`, {
    signal: options?.signal,
  });
};

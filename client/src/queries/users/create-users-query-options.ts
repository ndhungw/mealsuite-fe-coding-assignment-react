import { getUsers } from '@/apis/users';
import { queryOptions } from '@tanstack/react-query';
import { USERS_QUERY_KEY_PREFIX } from './constants';

export const createUsersQueryOptions = () =>
  queryOptions({
    queryKey: [USERS_QUERY_KEY_PREFIX, 'user-list'],
    queryFn: async ({ signal }) => {
      const response = await getUsers({ signal });
      return response;
    },
  });

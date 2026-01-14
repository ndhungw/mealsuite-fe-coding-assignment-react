import { getUsers } from '@/apis/users';
import { User } from '@acme/shared-models';
import { queryOptions } from '@tanstack/react-query';
import { USERS_QUERY_KEY_PREFIX } from './constants';

export const createUserQueryOptions = (id: User['id']) =>
  queryOptions({
    queryKey: [USERS_QUERY_KEY_PREFIX, 'user-details', { id }],
    queryFn: ({ signal }) => {
      return getUsers({ signal });
    },
  });

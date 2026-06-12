import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';

export const useExampleQuery = () => {
  return useQuery({
    queryKey: ['example'],
    queryFn: async () => {
      const response = await apiClient.get('/example');
      return response.data;
    },
  });
};

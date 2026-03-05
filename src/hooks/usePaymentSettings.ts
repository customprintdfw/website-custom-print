import { useQuery } from '@animaapp/playground-react-sdk';
import type { PaymentSettings } from '@animaapp/playground-react-sdk';

export const usePaymentSettings = () => {
  const { data, isPending, error } = useQuery('PaymentSettings', {
    where: { label: 'main' },
    limit: 1,
  });

  const settings = data?.[0] as PaymentSettings | undefined;
  const isEnabled =
    !isPending &&
    settings?.enabled === 'true' &&
    !!settings?.provider &&
    settings.provider !== 'none';

  return { settings, isEnabled, isPending, error };
};

import { useTheme } from 'next-themes';

const INITIAL_THEME = 'dark';

export const useCurrentTheme = () => {
  const { resolvedTheme } = useTheme();
  return resolvedTheme ?? INITIAL_THEME;
};

import { inject } from 'vue';
import { iMsal } from './types';

export const msalPluginSymbol = Symbol();

export function useMsal(): iMsal {
  const vueMSAL = inject(msalPluginSymbol);
  if (!vueMSAL) throw new Error('No msalPlugin provided!');

  return vueMSAL as iMsal;
}

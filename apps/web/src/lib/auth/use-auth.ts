'use client';

import { use } from 'react';
import { AuthContext } from './auth-provider';

export function useAuth() {
  return use(AuthContext);
}

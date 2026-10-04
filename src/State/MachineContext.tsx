'use client';

import type { MachineServices } from '@/Types/Simulator';

import { createContext, useContext } from 'react';
export const MachineContext = createContext<MachineServices>({ showToast: () => {}, getMaxValueForRegister: () => 1023 });
export const useMachineServices = () => useContext(MachineContext);

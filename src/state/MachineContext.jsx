'use client';
import { createContext, useContext } from 'react';
export const MachineContext = createContext({ showToast: () => {}, getMaxValueForRegister: () => 1023 });
export const useMachineServices = () => useContext(MachineContext);

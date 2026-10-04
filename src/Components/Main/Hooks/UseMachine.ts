import { createMachineStore } from '@/Machine/CreateMachineStore';
import type { MachineServices } from '@/Machine/Types/Machine';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

/** Owns one simulator store, subscribes React to changes, and releases runtime resources on unmount. */
export const useMachine = () => {
  const [store] = useState(createMachineStore);
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useEffect(() => {
    store.start();
    return () => store.dispose();
  }, [store]);

  const machine = store.machine;
  const services = useMemo<MachineServices>(
    () => ({
      showToast: machine.showToast,
      getMaxValueForRegister: machine.getMaxValueForRegister,
    }),
    [machine]
  );

  return { machine, services };
};

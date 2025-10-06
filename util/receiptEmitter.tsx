type Listener = () => void;
const listeners: Listener[] = [];

export const receiptEmitter = {
  emit: () => listeners.forEach(l => l()),
  addListener: (l: Listener) => listeners.push(l),
  removeListener: (l: Listener) => {
    const index = listeners.indexOf(l);
    if (index > -1) listeners.splice(index, 1);
  },
};

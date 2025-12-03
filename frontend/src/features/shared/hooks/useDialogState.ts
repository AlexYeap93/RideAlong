import { useState } from "react";

export function useDialogState<T = any>() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const show = (value: T) => { setData(value); setOpen(true);};

  const hide = () => { setOpen(false); setData(null); };

  return { open, data, show, hide };
}

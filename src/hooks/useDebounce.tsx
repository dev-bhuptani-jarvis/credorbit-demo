import { DependencyList, EffectCallback, useEffect } from "react";

const useDebouncedEffect = (
  effect: EffectCallback,
  delay: number,
  deps?: DependencyList
) => {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);

    return () => clearTimeout(handler);
  }, [...(deps || []), delay]);
};

export default useDebouncedEffect;

import { useEffect, useState } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export default function LoadingBar() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching > 0 || isMutating > 0;
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(20);
      const t1 = setTimeout(() => setProgress(60), 200);
      const t2 = setTimeout(() => setProgress(85), 600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else if (visible) {
      setProgress(100);
      const t = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isLoading, visible]);

  if (!visible) return null;

  return (
    <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-transparent">
      <div
        className="h-full bg-uiu-orange transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
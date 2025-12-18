import { useEffect, useRef, useState } from "react";

export default function useIntersectionObserver({
  onIntersect,
  enabled = true,
  rootMargin = "0px",
  threshold = 0.1,
}: {
  onIntersect: () => void;
  enabled?: boolean;
  rootMargin?: string;
  threshold?: number;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const onIntersectRef = useRef(onIntersect);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    if (!enabled || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onIntersectRef.current();
          }
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [enabled, target, rootMargin, threshold]);

  return setTarget;
}

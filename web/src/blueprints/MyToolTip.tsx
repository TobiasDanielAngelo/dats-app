import { type PropsWithChildren, useEffect, useRef, useState } from "react";

export const MyToolTip = (
  props: PropsWithChildren<{
    hidden?: boolean;
    parentRef: React.RefObject<HTMLDivElement | null>;
  }>
) => {
  const { children, hidden, parentRef } = props;

  const [loc, setLoc] = useState({
    x: 0,
    y: 0,
  });

  const [ov, setOv] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    let x = 0,
      y = 0;
    if (ref.current) {
      x = ref.current.getBoundingClientRect().width;
      y = ref.current.getBoundingClientRect().height;
    }

    setLoc({
      x:
        e.clientX < window.innerWidth - x
          ? e.clientX + 20
          : e.clientX - (x - 20) / 2,
      y:
        e.clientY < window.innerHeight - y
          ? e.clientY + 20
          : e.clientY - (y - 20) / 2,
    });
  };
  useEffect(() => {
    if (!parentRef.current) return;
    parentRef.current.addEventListener("mousemove", handleMouseMove);
    parentRef.current.addEventListener("mouseenter", () => setOv(true));
    parentRef.current.addEventListener("mouseleave", () => setOv(false));

    return () => {
      parentRef?.current?.removeEventListener("mousemove", handleMouseMove);
      parentRef?.current?.removeEventListener("mouseenter", () => setOv(true));
      parentRef?.current?.removeEventListener("mouseleave", () => setOv(false));
    };
  }, []);

  return !children || hidden || !ov ? (
    <></>
  ) : (
    <div
      ref={ref}
      className="fixed text-sm bg-white text-gray-900 dark:text-white dark:bg-gray-900 min-h-[30px] px-10 py-2 shadow-xl ring-1 rounded-md ring-gray-900/5 dark:ring-white "
      style={{
        left: loc.x,
        top: loc.y,
        zIndex: 10000,
      }}
    >
      {children}
    </div>
  );
};

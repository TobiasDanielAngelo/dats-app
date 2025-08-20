import { useRef } from "react";
import { useMotionValue, useAnimationFrame } from "motion/react";
export default function SunArc() {
  const pathRef = useRef<SVGPathElement>(null);
  const progress = useMotionValue(0);
  const circleRef = useRef<SVGCircleElement>(null);

  useAnimationFrame((t) => {
    if (!pathRef.current) return;
    const path = pathRef.current;
    const len = path.getTotalLength();
    const pt = path.getPointAtLength((progress.get() % 1) * len);
    progress.set((t / 5000) % 1); // loop every 5s
    circleRef.current?.setAttribute("cx", pt.x.toString());
    circleRef.current?.setAttribute("cy", pt.y.toString());
  });
  return (
    <div className="w-screen h-screen bg-sky-200 items-center justify-center flex flex-1">
      <svg
        fill="blue"
        width="500px"
        height="500px"
        viewBox="0 0 505.736 505.736"
      >
        <g>
          <path
            d="M396.007,191.19c-0.478,0-1.075,0-1.554,0c-6.693-54.147-52.833-96.103-108.773-96.103
		c-48.171,0-89.051,31.078-103.753,74.349c-16.734-8.128-35.381-12.67-55.224-12.67C56.658,156.765,0,213.542,0,283.707
		c0,67.416,52.594,122.64,118.934,126.703v0.239h277.91c60.244-0.358,108.893-49.366,108.893-109.729
		C505.617,240.317,456.609,191.19,396.007,191.19z"
            ref={pathRef}
          />
        </g>
        <circle ref={circleRef} r="10" fill="red" />
      </svg>
    </div>
  );
}

export const LandingView = () => {
  return <SunArc />;
};

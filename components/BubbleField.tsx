'use client';

import { useEffect, useState } from 'react';

type Bubble = {
  id: number;
  left: number;
  size: number;
  riseDuration: number;
  wobbleDuration: number;
  riseDelay: number;
  wobbleDelay: number;
  opacity: number;
  driftLeft: boolean;
};

function generateBubbles(count: number): Bubble[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 98,
    size: Math.random() < 0.72 ? 2 + Math.random() * 3 : 5 + Math.random() * 5,
    riseDuration: 11 + Math.random() * 13,
    wobbleDuration: 3 + Math.random() * 4,
    riseDelay: -Math.random() * 18,
    wobbleDelay: -Math.random() * 5,
    opacity: 0.20 + Math.random() * 0.18,
    driftLeft: Math.random() < 0.5,
  }));
}

export default function BubbleField() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    setBubbles(generateBubbles(60));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          style={{ position: 'absolute', left: `${bubble.left}%`, bottom: '-10px', opacity: bubble.opacity }}
        >
          <div
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              backgroundColor: '#85A16A',
              animation: [
                `${bubble.driftLeft ? 'bubble-rise-l' : 'bubble-rise'} ${bubble.riseDuration}s ${bubble.riseDelay}s infinite ease-in-out`,
                `bubble-wobble ${bubble.wobbleDuration}s ${bubble.wobbleDelay}s infinite ease-in-out`,
              ].join(', '),
            }}
          />
        </div>
      ))}
    </div>
  );
}

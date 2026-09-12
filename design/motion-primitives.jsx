/* TextEffect adapted from Motion Primitives, ibelick, MIT.
 * https://github.com/ibelick/motion-primitives/blob/main/components/core/text-effect.tsx
 * Local adaptation: viewport triggering, semantic heading preservation, reduced motion.
 */
import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export function TextEffect({ children, variant=1 }) {
  const reduced = useReducedMotion();
  const presets = {
    1: { opacity:0, y:22 },
    2: { opacity:0, filter:'blur(9px)' },
    3: { opacity:0, x:-25 },
    4: { opacity:0, rotate:3, y:12 },
    5: { opacity:0, scale:.84, y:10 }
  };
  if (reduced) return children;
  return <motion.span initial="hidden" whileInView="visible" viewport={{once:true, amount:.15}} variants={{hidden:{},visible:{transition:{staggerChildren:.035}}}}>
    <span className="ds-sr-only">{children}</span>
    {children.split(/(\s+)/).map((word,i)=> /^\s+$/.test(word) ? word : <motion.span aria-hidden="true" className="ds-motion-word" key={i} variants={{hidden:presets[variant],visible:{opacity:1,x:0,y:0,scale:1,rotate:0,filter:'blur(0px)',transition:{duration:.58,ease:[.22,1,.36,1]}}}}>{word}</motion.span>)}
  </motion.span>;
}

/* AnimatedBackground follows Motion Primitives' shared layoutId pattern. */
export function AnimatedBackground({active,children}) {
  const reduced = useReducedMotion();
  return <>{active && <motion.span className="ds-choice-highlight" layoutId="component-choice" transition={{type:'spring',stiffness:350,damping:32,duration:reduced?0:undefined}}/>}<span className="ds-choice-content">{children}</span></>;
}

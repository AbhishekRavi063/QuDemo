import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "../lib/utils";

const FadeInSection = ({ children, delay = 0, className = "", disableAnimation = false }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.05,
    rootMargin: "0px 0px -20px 0px",
  });

  // If animation is disabled, just render a simple div (no Framer Motion)
  if (disableAnimation) {
    return (
      <div className={cn("min-h-[80vh] relative", className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={cn("min-h-[80vh] relative", className)}
    >
      {children}
    </motion.div>
  );
};

export default FadeInSection;

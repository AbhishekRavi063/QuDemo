import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const FadeInSection = ({ children, delay = 0, className = "" }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.05,
    rootMargin: "0px 0px -20px 0px",
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
      style={{ minHeight: "80vh" }}
    >
      {children}
    </motion.div>
  );
};

export default FadeInSection;

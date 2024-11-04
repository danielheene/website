export const container = {
  hidden: {
    opacity: 1,
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.25,
    },
  },
};

export const item = {
  hidden: {
    y: 35,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
  },
};

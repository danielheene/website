export const speed = 350;
export const transition = {
  show: {
    opacity: 1,
    transition: {
      duration: speed / 1000,
      delay: 0.2,
      ease: 'linear',
      when: 'beforeChildren',
    },
  },
  hide: {
    opacity: 0,
    transition: {
      duration: speed / 1000,
      ease: 'linear',
      when: 'beforeChildren',
    },
  },
};

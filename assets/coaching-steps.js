const coachingSteps = document.querySelector('.coaching-steps');
if (coachingSteps && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      coachingSteps.classList.add('steps-entered');
      observer.disconnect();
    }
  }, {threshold: 0.7});
  observer.observe(coachingSteps.querySelector('.step-icon'));
}

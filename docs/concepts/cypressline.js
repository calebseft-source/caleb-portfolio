const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');

if (menuButton && navigation) {
  const closeMenu = () => {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    navigation.classList.toggle('is-open', !isOpen);
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  });

  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (navigation.classList.contains('is-open') && !navigation.contains(event.target) && !menuButton.contains(event.target)) {
      closeMenu();
    }
  });
}

const demoForm = document.querySelector('#demo-form');
const demoSubmit = document.querySelector('#demo-submit');
const formStatus = document.querySelector('#form-status');

if (demoForm && demoSubmit && formStatus) {
  demoSubmit.addEventListener('click', () => {
    demoForm.querySelectorAll('input, textarea').forEach((control) => {
      control.value = '';
    });
    demoForm.querySelectorAll('select').forEach((control) => {
      control.selectedIndex = 0;
    });
    formStatus.textContent = 'Demo complete — nothing was sent, saved, or shared.';
  });
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

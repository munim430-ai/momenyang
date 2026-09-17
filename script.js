const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-hidden', String(!open));
  mobileMenu.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
}

menuToggle.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1120) setMenu(false);
});

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px' },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('revealed'));
}

const form = document.getElementById('eligibility-form');
const successCard = document.getElementById('success-card');
const successLink = document.getElementById('success-link');
const editDetails = document.getElementById('edit-details');

const validators = {
  'full-name': (value) => value.trim().length >= 2 || 'Please enter your full name.',
  whatsapp: (value) => {
    const digits = value.replace(/\D/g, '').replace(/^880/, '').replace(/^0/, '');
    return /^1\d{9}$/.test(digits) || 'Enter a valid Bangladeshi mobile number.';
  },
  education: (value) => Boolean(value) || 'Select your educational level.',
  gpa: (value) => /^[0-9]+(?:\.[0-9]{1,2})?(?:\s*\/\s*[0-9]+(?:\.[0-9]{1,2})?)?$/.test(value.trim()) || 'Enter a GPA or CGPA, such as 4.50 or 3.40.',
};

function showFieldError(id, message = '') {
  const field = id === 'koreanLevel' || id === 'intake'
    ? form.querySelector(`[name="${id}"]`).closest('.field')
    : document.getElementById(id).closest('.field');
  const error = form.querySelector(`[data-error-for="${id}"]`);
  field.classList.toggle('has-error', Boolean(message));
  error.textContent = message;
}

function validateForm() {
  let valid = true;

  Object.entries(validators).forEach(([id, validator]) => {
    const input = document.getElementById(id);
    const result = validator(input.value);
    const message = result === true ? '' : result;
    showFieldError(id, message);
    if (message) valid = false;
  });

  ['koreanLevel', 'intake'].forEach((name) => {
    const selected = form.querySelector(`[name="${name}"]:checked`);
    const message = selected ? '' : `Please choose your ${name === 'intake' ? 'target intake' : 'language level'}.`;
    showFieldError(name, message);
    if (message) valid = false;
  });

  return valid;
}

form.querySelectorAll('input, select').forEach((input) => {
  const eventName = input.type === 'radio' || input.tagName === 'SELECT' ? 'change' : 'input';
  input.addEventListener(eventName, () => {
    if (input.type === 'radio') {
      showFieldError(input.name);
      return;
    }
    if (validators[input.id]) {
      const result = validators[input.id](input.value);
      showFieldError(input.id, result === true ? '' : result);
    }
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!validateForm()) {
    form.querySelector('.has-error input, .has-error select')?.focus();
    return;
  }

  const data = new FormData(form);
  const message = [
    'Hello KLCC, I would like a free student eligibility assessment.',
    '',
    `Full Name: ${data.get('fullName').trim()}`,
    `WhatsApp Number: ${data.get('whatsapp').trim()}`,
    `Educational Level: ${data.get('education')}`,
    `GPA / CGPA: ${data.get('gpa').trim()}`,
    `Korean Language Level: ${data.get('koreanLevel')}`,
    `Target Intake: ${data.get('intake')}`,
    '',
    'Please advise me on the most suitable pathway to South Korea.',
  ].join('\n');

  const whatsappUrl = `https://wa.me/8801308338089?text=${encodeURIComponent(message)}`;
  successLink.href = whatsappUrl;
  successCard.hidden = false;
  successCard.focus?.();
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
});

editDetails.addEventListener('click', () => {
  successCard.hidden = true;
  document.getElementById('full-name').focus();
});

document.getElementById('current-year').textContent = new Date().getFullYear();

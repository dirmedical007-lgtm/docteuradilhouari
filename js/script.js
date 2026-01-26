// Cabinet Médical Dr Houari Adil - JavaScript

// ============ SCROLL TO TOP BUTTON ============
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ============ SMOOTH SCROLL FOR ANCHOR LINKS ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============ FORM SUBMISSION ============
function handleSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;

    // Afficher un message de confirmation
    alert(`Merci ${name}! Votre message a été reçu.\n\nNous vous contacterons bientôt au ${phone}.\n\nCordialement,\nCabinet Médical Dr Houari Adil`);

    // Réinitialiser le formulaire
    event.target.reset();

    // Optionnel: Envoyer un email via un service (nécessite un backend)
    // Pour un site statique, vous pouvez utiliser FormSubmit.co ou Netlify Forms
}

// ============ INTERSECTION OBSERVER FOR ANIMATIONS ============
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card').forEach(card => {
    observer.observe(card);
});

// ============ DOCUMENT READY ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cabinet Médical Dr Houari Adil - Site chargé');
});

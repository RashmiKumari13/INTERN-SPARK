/**
 * Rashmi Dev Space Portfolio - Dynamic Scripting
 * Handles: Custom Typing Loop, Scrollspy Navigation, Progress Bar Animations,
 * Project Filters, Form Val & Toast Alerts, and Responsive Close Behaviors.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. TYPING ANIMATION EFFECT
  // ==========================================
  const typingTextElement = document.getElementById('typing-text');
  const roles = [
    'Frontend Developer',
    'UI/UX Designer',
    'Creative Thinker',
    'Full Stack Enthusiast'
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeRole() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      // Deleting character
      typingTextElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50; // Delete faster
    } else {
      // Adding character
      typingTextElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 120; // Natural typing speed
    }

    // Determine state changes
    if (!isDeleting && charIndex === currentRole.length) {
      // Pause at full word
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      // Cycle to next role
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 500; // Small break before starting next word
    }

    setTimeout(typeRole, typingSpeed);
  }

  // Init Typing Effect
  if (typingTextElement) {
    typeRole();
  }


  // ==========================================
  // 2. STICKY NAVBAR SCROLL ACTION
  // ==========================================
  const mainNavbar = document.getElementById('mainNavbar');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  window.addEventListener('scroll', () => {
    // Shrink Navbar
    if (window.scrollY > 50) {
      mainNavbar.classList.add('navbar-shrink');
    } else {
      mainNavbar.classList.remove('navbar-shrink');
    }

    // Scroll to Top Button Visibility
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  });

  // Scroll to Top action
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });


  // ==========================================
  // 3. SCROLLSPY ACTIVE SECTION OBSERVATION
  // ==========================================
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link-custom');

  const spyObserverOptions = {
    root: null,
    rootMargin: '-25% 0px -55% 0px', // Trigger when section fills mid-screen
    threshold: 0
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${activeId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, spyObserverOptions);

  sections.forEach(section => {
    spyObserver.observe(section);
  });


  // ==========================================
  // 4. SKILLS PROGRESS METER ANIMATION
  // ==========================================
  const skillsSection = document.getElementById('skills');
  const progressFills = document.querySelectorAll('.progress-fill');

  const skillsObserverOptions = {
    root: null,
    threshold: 0.15
  };

  const skillsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        progressFills.forEach(fill => {
          const targetPercent = fill.getAttribute('data-progress');
          fill.style.width = targetPercent;
        });
        // Disconnect observer after bars animate
        observer.unobserve(entry.target);
      }
    });
  }, skillsObserverOptions);

  if (skillsSection) {
    skillsObserver.observe(skillsSection);
  }


  // ==========================================
  // 5. PROJECTS CATEGORY FILTER
  // ==========================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-item');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle button states
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      projectItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');

        if (filterVal === 'all' || itemCategory === filterVal) {
          // Show item with transition
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1) translateY(0)';
          }, 50);
        } else {
          // Hide item with transition
          item.style.opacity = '0';
          item.style.transform = 'scale(0.9) translateY(15px)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 350); // Matches CSS transition normal duration
        }
      });
    });
  });


  // ==========================================
  // 6. CONTACT FORM SUBMIT & VAL & TOAST
  // ==========================================
  const contactForm = document.getElementById('contactForm');
  const formToast = document.getElementById('formToast');
  const submitFormBtn = document.getElementById('submitFormBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Bootstrap validation checks
      if (!contactForm.checkValidity()) {
        e.stopPropagation();
        contactForm.classList.add('was-validated');
        return;
      }

      // Valid Submit State
      contactForm.classList.remove('was-validated');
      submitFormBtn.setAttribute('disabled', 'true');
      const originalBtnHTML = submitFormBtn.innerHTML;
      
      // Visual feedback loading state
      submitFormBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Sending...
      `;

      // Simulating network delay
      setTimeout(() => {
        // Show Success Toast Notification
        formToast.classList.add('show');
        
        // Hide Toast after 4 seconds
        setTimeout(() => {
          formToast.classList.remove('show');
        }, 4000);

        // Reset elements
        contactForm.reset();
        submitFormBtn.removeAttribute('disabled');
        submitFormBtn.innerHTML = originalBtnHTML;
      }, 1500);
    });
  }


  // ==========================================
  // 7. RESPONSIVE MOBILE MENU AUTO-CLOSE
  // ==========================================
  const navbarCollapse = document.getElementById('navbarContent');
  const bsCollapse = navbarCollapse ? new bootstrap.Collapse(navbarCollapse, { toggle: false }) : null;

  if (navbarCollapse) {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Auto-close hamburger menu on mobile link tap
        if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
          bsCollapse.hide();
        }
      });
    });
  }

});

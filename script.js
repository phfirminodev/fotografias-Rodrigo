/**
 * RODRIGO ZAGO FOTOGRAFIA & FILME — INTERAÇÕES & COMPORTAMENTO (UX)
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initGalleryFilter();
  initLightboxDialog();
  initHighlightsCarousel();
  initCinemaSection();
  initTestimonialsSlider();
  initContactForm();
});

/* ==========================================================================
   1. HEADER SCROLL EFFECT
   ========================================================================== */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const handleScroll = () => {
    header.classList.toggle('is-solid', window.scrollY > 40);
  };
  handleScroll();

  window.addEventListener('scroll', handleScroll, { passive: true });
}

/* ==========================================================================
   2. MENU MOBILE DRAWER
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggle');
  const drawer = document.getElementById('mobileMenu');
  if (!toggleBtn || !drawer) return;

  const links = drawer.querySelectorAll('.mobile-nav-link');

  const openDrawer = () => {
    toggleBtn.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    toggleBtn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', () => {
    const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });
}

/* ==========================================================================
   3. FILTRO DE GALERIA EDITORIAL
   ========================================================================== */
function initGalleryFilter() {
  const tabs = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.gallery-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Atualiza tabs ativas
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filterValue = tab.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        const categories = category.split(' ');
        if (filterValue === 'all' || categories.includes(filterValue) || category === filterValue) {
          card.classList.remove('hide');
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 40);
        } else {
          card.classList.add('hide');
        }
      });
    });
  });
}

/* ==========================================================================
   4. LIGHTBOX MODAL DIALOG (MODERN WEB GUIDANCE)
   ========================================================================== */
function initLightboxDialog() {
  const dialog = document.getElementById('lightboxDialog');
  const closeBtn = document.getElementById('dialogClose');
  const prevBtn = document.getElementById('dialogPrev');
  const nextBtn = document.getElementById('dialogNext');
  const dialogImg = document.getElementById('dialogImg');
  const dialogTitle = document.getElementById('dialogTitle');
  const dialogCategory = document.getElementById('dialogCategory');
  const dialogLocation = document.getElementById('dialogLocation');

  if (!dialog) return;

  const getAllCards = () => Array.from(document.querySelectorAll('.gallery-card')).filter(c => c.querySelector('.gallery-btn img'));
  const getVisibleCards = () => getAllCards().filter(c => !c.classList.contains('hide'));
  let currentIndex = 0;
  let activeCards = [];

  // Carrega os dados da foto pelo índice
  const loadPhoto = (index) => {
    if (!activeCards.length) activeCards = getVisibleCards();
    if (!activeCards.length) activeCards = getAllCards();
    const card = activeCards[index];
    if (!card) return;

    const img = card.querySelector('img');
    const title = card.querySelector('.card-title')?.textContent || '';
    const category = card.querySelector('.card-category')?.textContent || '';
    const location = card.querySelector('.card-location')?.textContent || '';

    if (dialogImg && img) {
      dialogImg.src = img.src;
      dialogImg.alt = img.alt;
    }
    if (dialogTitle) dialogTitle.textContent = title;
    if (dialogCategory) dialogCategory.textContent = category;
    if (dialogLocation) dialogLocation.textContent = location;
    const dialogDetails = document.querySelector('.dialog-details');
    if (dialogDetails) {
      dialogDetails.style.display = (title || category || location) ? 'block' : 'none';
    }
    currentIndex = index;
  };

  // Abre dialog ao clicar em qualquer card
  getAllCards().forEach((card) => {
    const btn = card.querySelector('.gallery-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        activeCards = getVisibleCards();
        if (!activeCards.length) activeCards = getAllCards();
        const idx = activeCards.indexOf(card);
        loadPhoto(idx >= 0 ? idx : 0);
        dialog.showModal();
        document.body.style.overflow = 'hidden';
      });
    }
  });

  const closeDialog = () => {
    dialog.close();
    document.body.style.overflow = '';
  };

  closeBtn?.addEventListener('click', closeDialog);

  // Navegação anterior / próximo
  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!activeCards.length) activeCards = getVisibleCards();
    currentIndex = (currentIndex - 1 + activeCards.length) % activeCards.length;
    loadPhoto(currentIndex);
  });

  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!activeCards.length) activeCards = getVisibleCards();
    currentIndex = (currentIndex + 1) % activeCards.length;
    loadPhoto(currentIndex);
  });

  // Light dismiss: fechar ao clicar no backdrop escuro
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width
    );
    if (event.target === dialog) {
      closeDialog();
    }
  });

  // Teclado: setas para passar fotos, esc fecha
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      if (!activeCards.length) activeCards = getVisibleCards();
      currentIndex = (currentIndex - 1 + activeCards.length) % activeCards.length;
      loadPhoto(currentIndex);
    } else if (e.key === 'ArrowRight') {
      if (!activeCards.length) activeCards = getVisibleCards();
      currentIndex = (currentIndex + 1) % activeCards.length;
      loadPhoto(currentIndex);
    } else if (e.key === 'Escape') {
      document.body.style.overflow = '';
    }
  });

  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
  });
}

/* ==========================================================================
   5. SLIDER DE DEPOIMENTOS (ECOS DE AFETO)
   ========================================================================== */
function initTestimonialsSlider() {
  const items = document.querySelectorAll('.testimonial-item');
  const dots = document.querySelectorAll('.slider-dot');
  if (!items.length || !dots.length) return;

  const showSlide = (index) => {
    items.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  };

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIndex = parseInt(dot.getAttribute('data-slide'), 10);
      showSlide(slideIndex);
    });
  });
}

/* ==========================================================================
   6. FORMULÁRIO DE CONTATO HUMANIZADO (INTEGRAÇÃO WHATSAPP)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successCard = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');
  if (!form || !successCard) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const namesInput = document.getElementById('names');
    const emailInput = document.getElementById('email');
    const locationInput = document.getElementById('location');
    const dateInput = document.getElementById('date');
    const storyInput = document.getElementById('story');
    const discoverySelect = document.getElementById('discovery');

    const namesError = document.getElementById('namesError');
    const emailError = document.getElementById('emailError');

    let isValid = true;

    // Validação Nomes
    const namesVal = namesInput ? namesInput.value.trim() : '';
    if (!namesVal) {
      namesError.textContent = 'Por favor, contem-me como devo chamar vocês.';
      namesInput.style.borderColor = '#A33B32';
      isValid = false;
    } else {
      namesError.textContent = '';
      namesInput.style.borderColor = '';
    }

    // Validação E-mail
    const emailVal = emailInput ? emailInput.value.trim() : '';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailPattern.test(emailVal)) {
      emailError.textContent = 'Precisamos de um e-mail válido para retornar a carta.';
      emailInput.style.borderColor = '#A33B32';
      isValid = false;
    } else {
      emailError.textContent = '';
      emailInput.style.borderColor = '';
    }

    if (!isValid) return;

    // Dados dos demais campos
    const locationVal = locationInput ? locationInput.value.trim() : '';
    const dateVal = dateInput ? dateInput.value.trim() : '';
    const storyVal = storyInput ? storyInput.value.trim() : '';

    let discoveryText = '';
    if (discoverySelect && discoverySelect.selectedIndex > 0) {
      discoveryText = discoverySelect.options[discoverySelect.selectedIndex].text;
    }

    // Montagem da mensagem formatada no modelo exato do formulário
    const messageLines = [
      'Olá, Rodrigo! Vim pelo site contar a nossa história:',
      '',
      '*Como devemos chamar vocês dois?*',
      namesVal,
      '',
      '*O melhor e-mail de vocês:*',
      emailVal,
      '',
      '*Onde sonham em celebrar?*',
      locationVal || 'A definir / A combinar',
      '',
      '*Data prevista ou época do ano:*',
      dateVal || 'A definir',
      '',
      '*O que faz o coração de vocês vibrar quando pensam nesse dia?*',
      storyVal || 'Queremos contar todos os detalhes na nossa conversa!',
      '',
      '*Como o caminho de vocês encontrou o meu?*',
      discoveryText || 'Pelo site / Outro acaso bonito'
    ];

    const messageText = messageLines.join('\n');
    const whatsappNumber = '5561998685870';
    const whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(messageText);

    // Feedback no botão de envio
    submitBtn.disabled = true;
    const btnText = submitBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'Abrindo WhatsApp...';

    // Configura o link de contingência no card de confirmação
    const fallbackBtn = document.getElementById('whatsappFallbackBtn');
    if (fallbackBtn) {
      fallbackBtn.href = whatsappUrl;
    }

    // Exibe o card de confirmação
    form.style.display = 'none';
    successCard.style.display = 'block';
    successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Abre o WhatsApp diretamente
    const openedWindow = window.open(whatsappUrl, '_blank');
    if (!openedWindow || openedWindow.closed || typeof openedWindow.closed === 'undefined') {
      window.location.href = whatsappUrl;
    }
  });
}

/* ==========================================================================
   CARROSSEL DE DESTAQUES MOBILE (HOME)
   ========================================================================== */
function initHighlightsCarousel() {
  const track = document.getElementById('galleryGrid');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('highlightsPrev');
  const nextBtn = document.getElementById('highlightsNext');

  if (!track || !dots.length) return;

  const slides = Array.from(track.querySelectorAll('.gallery-card'));
  if (!slides.length) return;

  const getStep = () => {
    if (slides.length > 1) {
      return slides[1].offsetLeft - slides[0].offsetLeft;
    }
    return slides[0].offsetWidth || track.clientWidth;
  };

  const updateActiveDot = () => {
    const step = getStep();
    if (!step) return;
    const scrollLeft = track.scrollLeft;
    const activeIndex = Math.min(Math.max(0, Math.round(scrollLeft / step)), slides.length - 1);

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activeIndex);
    });
  };

  track.addEventListener('scroll', updateActiveDot, { passive: true });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-slide'), 10);
      if (slides[idx]) {
        slides[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  });

  prevBtn?.addEventListener('click', () => {
    const step = getStep();
    track.scrollBy({ left: -step, behavior: 'smooth' });
  });

  nextBtn?.addEventListener('click', () => {
    const step = getStep();
    track.scrollBy({ left: step, behavior: 'smooth' });
  });
}

/* ==========================================================================
   SEÇÃO CINEMA & MODAL DE VÍDEO
   ========================================================================== */
function initCinemaSection() {
  const dialog = document.getElementById('videoDialog');
  const closeBtn = document.getElementById('videoDialogClose');
  const videoPlayer = document.getElementById('mainVideoPlayer');
  const dialogTitle = document.getElementById('videoDialogTitle');
  const dialogSubtitle = document.getElementById('videoDialogSubtitle');
  const playButtons = document.querySelectorAll('.cinema-play-btn');

  if (!dialog || !videoPlayer || !playButtons.length) return;

  const openVideo = (src, title, subtitle) => {
    videoPlayer.src = src;
    if (dialogTitle) dialogTitle.textContent = title || '';
    if (dialogSubtitle) dialogSubtitle.innerHTML = subtitle || '';
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    videoPlayer.play().catch(() => {});
  };

  const closeVideo = () => {
    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
    videoPlayer.load();
    dialog.close();
    document.body.style.overflow = '';
  };

  playButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const src = btn.getAttribute('data-video-src');
      const title = btn.getAttribute('data-video-title');
      const subtitle = btn.getAttribute('data-video-subtitle');
      if (src) {
        openVideo(src, title, subtitle);
      }
    });
  });

  // Clicar em qualquer parte do card do vídeo também ativa a reprodução
  document.querySelectorAll('.cinema-media-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      const btn = wrapper.querySelector('.cinema-play-btn');
      btn?.click();
    });
  });

  closeBtn?.addEventListener('click', closeVideo);

  // Fechar ao clicar no backdrop escuro
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      closeVideo();
    }
  });

  // Tecla ESC ou cancel nativo
  dialog.addEventListener('cancel', () => {
    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
    videoPlayer.load();
    document.body.style.overflow = '';
  });
}


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
  initJournalCarousel();
  initJournalModal();
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
        if (closeBtn) closeBtn.blur();
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
   SEÇÃO CINEMA & MODAL DE VÍDEO (HOVER PLAY COM ÁUDIO & FULLSCREEN DIALOG)
   ========================================================================== */
function initCinemaSection() {
  const dialog = document.getElementById('videoDialog');
  const closeBtn = document.getElementById('videoDialogClose');
  const videoPlayer = document.getElementById('mainVideoPlayer');
  const dialogTitle = document.getElementById('videoDialogTitle');
  const dialogSubtitle = document.getElementById('videoDialogSubtitle');
  const cards = document.querySelectorAll('.cinema-card');
  const wrappers = document.querySelectorAll('.cinema-media-wrapper');

  // Estado global de interação do usuário para desbloquear áudio de mídia no navegador
  let userInteracted = false;
  const unlockAudio = () => {
    userInteracted = true;
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });

  // Filtros de Categoria da Seção Cinema
  const cinemaTabs = document.querySelectorAll('.cinema-tab-btn');
  cinemaTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      cinemaTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.getAttribute('data-filter');
      cards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hide');
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 40);
        } else {
          card.classList.add('hide');
        }
      });

      // Atualiza os indicadores do carrossel mobile ao filtrar
      setTimeout(() => {
        renderDots();
        if (track) track.scrollTo({ left: 0, behavior: 'smooth' });
      }, 50);
    });
  });

  // Rastreamento de toque para não disparar abertura de modal durante o deslize (swipe)
  const track = document.getElementById('cinemaGrid');
  let isSwiping = false;
  let touchStartX = 0;
  let touchStartY = 0;

  if (track) {
    track.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = false;
      }
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx > 8 || dy > 8) {
          isSwiping = true;
        }
      }
    }, { passive: true });
  }

  // Controles do Carrossel Mobile de Vídeos (Setas e Dots)
  const dotsContainer = document.getElementById('cinemaDots');
  const prevBtn = document.getElementById('cinemaPrev');
  const nextBtn = document.getElementById('cinemaNext');

  const getVisibleCards = () => {
    if (!track) return [];
    return Array.from(track.querySelectorAll('.cinema-card')).filter(c => !c.classList.contains('hide'));
  };

  const getStep = () => {
    const visible = getVisibleCards();
    if (visible.length > 1) {
      return visible[1].offsetLeft - visible[0].offsetLeft;
    }
    return visible[0] ? (visible[0].offsetWidth || track.clientWidth) : track.clientWidth;
  };

  const renderDots = () => {
    if (!dotsContainer) return;
    const visible = getVisibleCards();
    dotsContainer.innerHTML = '';
    visible.forEach((card, idx) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (idx === 0 ? ' active' : '');
      dot.setAttribute('data-slide', idx);
      dot.setAttribute('aria-label', `Vídeo ${idx + 1} de ${visible.length}`);
      dot.addEventListener('click', () => {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
      dotsContainer.appendChild(dot);
    });
  };

  const updateActiveDot = () => {
    if (!dotsContainer || !track) return;
    const visible = getVisibleCards();
    if (!visible.length) return;
    const step = getStep();
    if (!step) return;
    const scrollLeft = track.scrollLeft;
    const activeIndex = Math.min(Math.max(0, Math.round(scrollLeft / step)), visible.length - 1);

    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activeIndex);
    });
  };

  if (track) {
    track.addEventListener('scroll', updateActiveDot, { passive: true });
  }

  prevBtn?.addEventListener('click', () => {
    if (!track) return;
    const step = getStep();
    track.scrollBy({ left: -step, behavior: 'smooth' });
  });

  nextBtn?.addEventListener('click', () => {
    if (!track) return;
    const step = getStep();
    track.scrollBy({ left: step, behavior: 'smooth' });
  });

  renderDots();

  // Configura cada card de vídeo da seção Cinema
  cards.forEach(card => {
    const wrapper = card.querySelector('.cinema-media-wrapper');
    const video = wrapper ? wrapper.querySelector('.cinema-hover-video') : null;
    if (!wrapper || !video) return;

    // Ao passar o mouse: reproduz com áudio (desktop)
    const playWithAudio = () => {
      wrapper.classList.add('playing');
      video.muted = false;
      video.volume = 1.0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Se o navegador bloquear áudio antes da primeira interação do usuário, inicia mudo
          if (!userInteracted) {
            video.muted = true;
            video.play().catch(() => {});
          }
        });
      }
    };

    const stopVideo = () => {
      wrapper.classList.remove('playing');
      video.pause();
      video.currentTime = 0;
    };

    card.addEventListener('mouseenter', playWithAudio);
    card.addEventListener('mouseleave', stopVideo);

    // Ao clicar em qualquer parte do card: abre o modal cinematográfico de tela cheia
    const triggerModal = (e) => {
      if (isSwiping) return; // Não abre modal se o usuário estiver apenas deslizando o carrossel no celular
      e.preventDefault();
      userInteracted = true;
      const startTime = video.currentTime || 0;
      video.pause();
      wrapper.classList.remove('playing');

      const src = wrapper.getAttribute('data-video-src');
      const title = wrapper.getAttribute('data-video-title');
      const subtitle = wrapper.getAttribute('data-video-subtitle');
      if (src && dialog) {
        openVideo(src, title, subtitle, startTime);
      }
    };

    card.addEventListener('click', triggerModal);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        triggerModal(e);
      }
    });
  });

  // Suporte a botões de filme na Galeria (.inline-film-btn)
  const inlineButtons = document.querySelectorAll('.inline-film-btn');
  inlineButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      userInteracted = true;
      const src = btn.getAttribute('data-video-src');
      const title = btn.getAttribute('data-video-title');
      const subtitle = btn.getAttribute('data-video-subtitle');
      if (src && dialog) {
        openVideo(src, title, subtitle, 0);
      }
    });
  });

  const openVideo = (src, title, subtitle, startTime = 0) => {
    if (!videoPlayer || !dialog) return;

    // Atualiza a fonte e garante carregamento limpo
    if (videoPlayer.getAttribute('src') !== src) {
      videoPlayer.src = src;
      videoPlayer.load();
    }

    videoPlayer.muted = false;
    videoPlayer.volume = 1.0;

    if (startTime > 0) {
      try {
        videoPlayer.currentTime = startTime;
      } catch (err) {}
    }

    if (dialogTitle) dialogTitle.textContent = title || '';
    if (dialogSubtitle) dialogSubtitle.innerHTML = subtitle || '';

    if (!dialog.open) {
      dialog.showModal();
    }
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.blur();
    if (videoPlayer) {
      try {
        videoPlayer.focus({ preventScroll: true });
      } catch (err) {}
    }

    // Inicia reprodução imediatamente com áudio
    const playPromise = videoPlayer.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Reprodução do modal capturada:', err);
      });
    }
  };

  const closeVideo = () => {
    if (!videoPlayer || !dialog) return;
    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
    videoPlayer.load();
    if (dialog.open) {
      dialog.close();
    }
    document.body.style.overflow = '';
  };

  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeVideo();
  });

  // Fechar ao clicar no backdrop escuro (fora do player de vídeo)
  dialog?.addEventListener('click', (event) => {
    const container = dialog.querySelector('.video-player-container');
    const details = dialog.querySelector('.video-dialog-details');
    if (container && !container.contains(event.target) && (!details || !details.contains(event.target))) {
      closeVideo();
    }
  });

  // Fechar com a tecla ESC
  dialog?.addEventListener('cancel', () => {
    if (videoPlayer) {
      videoPlayer.pause();
      videoPlayer.removeAttribute('src');
      videoPlayer.load();
    }
    document.body.style.overflow = '';
  });
}

/* ==========================================================================
   CARROSSEL MOBILE DE CRÔNICAS & DIÁRIO
   ========================================================================== */
let isJournalSwiping = false;

function initJournalCarousel() {
  const track = document.getElementById('journalGrid');
  const dotsContainer = document.getElementById('journalDots');
  const prevBtn = document.getElementById('journalPrev');
  const nextBtn = document.getElementById('journalNext');

  if (!track || !dotsContainer) return;

  const slides = Array.from(track.querySelectorAll('.journal-card'));
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

    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activeIndex);
    });
  };

  track.addEventListener('scroll', updateActiveDot, { passive: true });

  const dots = dotsContainer.querySelectorAll('.carousel-dot');
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

  // Rastreamento de toque para evitar disparar abertura da crônica durante o swipe no celular
  let touchStartX = 0;
  let touchStartY = 0;

  track.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isJournalSwiping = false;
    }
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const dx = Math.abs(e.touches[0].clientX - touchStartX);
      const dy = Math.abs(e.touches[0].clientY - touchStartY);
      if (dx > 8 || dy > 8) {
        isJournalSwiping = true;
      }
    }
  }, { passive: true });
}

/* ==========================================================================
   MODAL DE LEITURA EDITORIAL DE CRÔNICAS
   ========================================================================== */
function initJournalModal() {
  const dialog = document.getElementById('journalModal');
  const closeBtn = document.getElementById('journalModalClose');
  const tagEl = document.getElementById('journalModalTag');
  const dateEl = document.getElementById('journalModalDate');
  const readTimeEl = document.getElementById('journalModalReadTime');
  const titleEl = document.getElementById('journalModalTitle');
  const leadEl = document.getElementById('journalModalLead');
  const coverEl = document.getElementById('journalModalCover');
  const bodyEl = document.getElementById('journalModalBody');

  if (!dialog) return;

  const journalArticles = {
    'grao-analogico': {
      tag: 'Ensaio Intimista',
      date: 'Setembro de 2024',
      readTime: '4 min de leitura',
      title: 'Por que escolhemos a luz natural e o grão analógico',
      lead: 'A perfeição digital muitas vezes apaga a pulsação do instante. Uma reflexão sobre a poesia da imperfeição em tempos de filtros imediatos.',
      cover: 'assets/portfolio/aniversario-fashion/a7r01749.jpg',
      coverAlt: 'Noiva caminhando descalça entre a vegetação suave em luz natural',
      body: `
        <p class="article-paragraph">
          Vivemos numa era fascinada por sensores hiperdimensionados, contagem cirúrgica de pixels e algoritmos de inteligência que suavizam a pele antes mesmo de o obturador se fechar. As câmeras modernas são quase milagrosas: enxergam no escuro absoluto e eliminam qualquer vestígio de sombra. Mas a pergunta que me acompanha em cada casamento é simples: <em>a memória humana realmente funciona como um arquivo digital sem ruído?</em>
        </p>

        <p class="article-paragraph">
          Quando fechamos os olhos e resgatamos a lembrança de um abraço apertado de dez anos atrás, não nos lembramos do balanço de branco milimetricamente neutro. Lembramos da temperatura do quarto. Da luz oblíqua da tarde que batia na lateral do rosto. Da poeira dourada flutuando suspensa no ar. Da sensação quase tátil e imperfeita de estar vivo naquele instante.
        </p>

        <blockquote class="article-quote">
          “A perfeição clínica muitas vezes anestesia o afeto. O grão analógico não é um defeito técnico; ele é a própria textura do tempo assentando sobre a imagem.”
        </blockquote>

        <h3 class="article-subheading">O grão como matéria viva</h3>

        <p class="article-paragraph">
          Na fotografia analógica e nas lentes ópticas manuais que escolho para documentar histórias de amor, o grão desempenha o papel da textura em uma folha de papel de algodão feita à mão. Ele confere densidade, peso e calor. Uma fotografia que respira através do grão não parece ter sido gerada por uma máquina fria; ela parece ter sido moldada pela luz física incidindo sobre a matéria.
        </p>

        <p class="article-paragraph">
          O grão acolhe a imperfeição. Ele aceita com nobreza um movimento sutil do véu na brisa, um beijo roubado que desfocou levemente porque o coração bateu mais rápido do que a mecânica da câmera, ou a lágrima que escorreu sem pedir licença sob a luz quente das velas.
        </p>

        <h3 class="article-subheading">A luz natural: paciência e respeito ao silêncio</h3>

        <p class="article-paragraph">
          Instalar cinco tripés com iluminação estroboscópica artificial em volta de um altar ou numa capela íntima pode até produzir uma foto uniforme para catálogos comerciais, mas destrói o que havia de mais sagrado: a atmosfera original daquele espaço.
        </p>

        <p class="article-paragraph">
          A luz natural exige uma virtude rara: a humildade de observar. Ela pede que o fotógrafo compreenda o caminho do sol, identifique a janela mágica das 17h30 quando as sombras se alongam com doçura e saiba dançar com a penumbra. Quando não invadimos o ambiente com disparos ofuscantes de flash, os noivos e seus familiares esquecem que estão sendo fotografados. Eles não posam para a lente; eles habitam o seu próprio amor.
        </p>

        <blockquote class="article-quote">
          “Fotografar sem pressa é o único caminho para que a imagem não envelheça como moda, mas amadureça como herança.”
        </blockquote>

        <h3 class="article-subheading">Para daqui a cinquenta anos</h3>

        <p class="article-paragraph">
          As resoluções digitais de hoje parecerão datadas e primitivas daqui a duas décadas. Mas a luz da tarde sobre os cabelos, o toque desarmado das mãos no altar e a poesia do grão são atemporais.
        </p>

        <p class="article-paragraph">
          Quando os filhos ou netos de vocês abrirem o álbum físico sobre a mesa de jantar, não queremos que eles vejam uma tendência estética passageira. Queremos que eles sintam o pulso acelerado, o arrepio no antebraço e a verdade límpida de duas pessoas que escolheram caminhar juntas.
        </p>
      `
    },
    'carol-alex': {
      tag: 'História Completa & Bastidores',
      date: 'Agosto de 2024',
      readTime: '6 min de leitura',
      title: 'A celebração autêntica de Carol & Alex',
      lead: 'Luz dourada, risos descalços e a promessa de nunca deixar a rotina apagar a ternura e a verdade de cada olhar. Como funciona a nossa cobertura na prática baseada no briefing do grande dia.',
      cover: 'assets/portfolio/carol-e-alex/carolealex-291.jpg',
      coverAlt: 'Carol e Alex abraçados na luz dourada do entardecer',
      body: `
        <p class="article-paragraph">
          Quem vê as fotografias e o filme de casamento de Carol & Alex — com seus risos descalços na grama, o véu dançando na luz de poente e a emoção solene da capela — costuma imaginar que tudo aconteceu por mero acaso. Mas a verdade é que a espontaneidade mais pura só floresce onde existe um método invisível, rigoroso e acolhedor nos bastidores.
        </p>

        <p class="article-paragraph">
          Muitos casais nos procuram com o mesmo receio legítimo: <em>“Rodrigo, nós não somos modelos, não sabemos posar e não queremos passar a nossa festa inteira presos a um fotógrafo nos dando ordens.”</em> É por isso que, semanas antes de cada celebração, realizamos o nosso <strong>Briefing de Cobertura Autoral</strong>.
        </p>

        <p class="article-paragraph">
          A história de Carol & Alex foi construída em cima desse exato roteiro. A seguir, abrimos os bastidores de como funciona a nossa cobertura na prática — para que você entenda exatamente o que esperar no seu grande dia.
        </p>

        <blockquote class="article-quote">
          “Uma tarde de cerimônia, uma noite de festa. Discretos e quase invisíveis na primeira parte; soltos, cúmplices e imersos na segunda.”
        </blockquote>

        <h3 class="article-subheading">1. O Roteiro das Sete Horas: Do make-off ao encerramento</h3>

        <p class="article-paragraph">
          O tempo de um casamento não pode ser fatiado como uma linha de montagem. O nosso cronograma é desenhado para fluir com o ritmo natural das emoções:
        </p>

        <div class="article-timeline">
          <div class="timeline-step">
            <div class="step-time">15h00</div>
            <div class="step-content">
              <strong>Make-off íntimo com a família</strong>
              <p>Chegamos uma hora antes do início para nos integrarmos ao ambiente com calma. Nada de poses clichês com cabides suspensos: registramos o café compartilhado, as piadas internas dos padrinhos, a mãe abotoando o vestido com as mãos trêmulas e os primeiros retratos poéticos em luz natural.</p>
            </div>
          </div>

          <div class="timeline-step">
            <div class="step-time">15h30</div>
            <div class="step-content">
              <strong>Chegada dos convidados & Primeiros encontros</strong>
              <p>O reencontro de amigos de longa data, os abraços calorosos na entrada, a entrega das lembranças e a expectativa que paira no ar antes da marcha começar.</p>
            </div>
          </div>

          <div class="timeline-step">
            <div class="step-time">16h00</div>
            <div class="step-content">
              <strong>A Celebração / Missa na Capela</strong>
              <p>Aqui vigora o silêncio e o respeito absoluto ao sagrado. Não usamos flashes invasivos; alinhamos previamente com o celebrante onde podemos circular com movimento mínimo. O foco é a lágrima contida dos pais, o olhar recíproco no altar e a bênção das alianças.</p>
            </div>
          </div>

          <div class="timeline-step">
            <div class="step-time">17h00</div>
            <div class="step-content">
              <strong>Recepção, Antepastos & Descompressão</strong>
              <p>O momento do primeiro brinde. O casal respira, cumprimenta os mais próximos e desfruta dos sabores da recepção sem nenhuma interrupção.</p>
            </div>
          </div>

          <div class="timeline-step">
            <div class="step-time">17h30 às 18h15</div>
            <div class="step-content">
              <strong>A Janela Dourada: Retratos do casal no Pôr do Sol</strong>
              <p>Com o sol baixo e a luz dourada rasgando o horizonte, tiramos o casal por apenas 25 a 30 minutos. É um instante de respiro a dois: caminhadas leves, abraços espontâneos e retratos atemporais sem roubá-los da festa.</p>
            </div>
          </div>

          <div class="timeline-step">
            <div class="step-time">18h00 até o fim</div>
            <div class="step-content">
              <strong>Banda, DJ & A Euforia Desarmada</strong>
              <p>Com a noite instalada, nossa linguagem muda. Entramos na pista com lentes grande-angulares e luz de preenchimento dinâmica, celebrando junto com os convidados até os últimos instantes da festa.</p>
            </div>
          </div>
        </div>

        <h3 class="article-subheading">2. A Lista das Catorze Fotos Essenciais</h3>

        <p class="article-paragraph">
          Um dos maiores receios dos noivos é esquecer de registrar alguém importante — ou, pelo contrário, perder horas em filas cansativas de cumprimentos protocolares. 
        </p>

        <p class="article-paragraph">
          Para isso, operamos com a nossa lista de prioridades combinadas: fotos formais com pais, avós, irmãos e padrinhos são executadas com precisão cirúrgica e simpatia imediatamente ao término da cerimônia. Em menos de 15 minutos, todos os registros fundamentais para as próximas gerações estão garantidos, e o casal está livre para dançar.
        </p>

        <h3 class="article-subheading">3. A Dinâmica dos Dois Fotógrafos</h3>

        <p class="article-paragraph">
          Nenhum momento decisivo se repete. Por isso, a nossa equipe atua sempre em sintonia fina:
        </p>

        <ul class="article-checklist">
          <li><strong>Rodrigo Zago (Fotógrafo Principal):</strong> Condução dos retratos do casal, acompanhamento próximo dos noivos no altar, controle da lista de fotos familiares e olhar atento à narrativa principal.</li>
          <li><strong>Segundo Fotógrafo:</strong> Olhar periférico — captura a cenografia e detalhes antes dos convidados entrarem, o ângulo oposto na capela, as risadas descontraídas nas mesas e a energia viva do bar de drinks.</li>
        </ul>

        <h3 class="article-subheading">4. Segurança Inegociável nos Bastidores</h3>

        <p class="article-paragraph">
          A poesia só existe quando a retaguarda técnica é imbatível. Todas as nossas câmeras gravam simultaneamente em dois cartões de memória de alta velocidade (backup instantâneo a cada clique). Carregamos equipamento reserva idêntico no local e, ao término do evento, os arquivos passam por backup imediato em dois dispositivos físicos e na nuvem.
        </p>

        <blockquote class="article-quote">
          “A nossa promessa em cada celebração: a lista de fotos está com a gente, os horários estão combinados e ninguém vai precisar lembrar de nada. A sua única tarefa é viver esse dia.”
        </blockquote>

        <p class="article-paragraph">
          Foi exatamente assim que Carol & Alex viveram a sua celebração: leves, presentes e inteiros em cada segundo. E quando você olhar para as suas fotografias amanhã, é essa mesma sensação de paz e autenticidade que queremos que você encontre.
        </p>
      `
    }
  };

  const openArticle = (articleKey) => {
    const data = journalArticles[articleKey];
    if (!data) return;

    if (tagEl) tagEl.textContent = data.tag;
    if (dateEl) dateEl.textContent = data.date;
    if (readTimeEl) readTimeEl.textContent = data.readTime;
    if (titleEl) titleEl.textContent = data.title;
    if (leadEl) leadEl.textContent = data.lead;
    if (coverEl) {
      coverEl.src = data.cover;
      coverEl.alt = data.coverAlt || data.title;
    }
    if (bodyEl) bodyEl.innerHTML = data.body;

    if (!dialog.open) {
      dialog.showModal();
    }
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.blur();
  };

  const closeArticle = () => {
    if (dialog.open) {
      dialog.close();
    }
    document.body.style.overflow = '';
  };

  // Listener para os cards e links de ler crônica
  const articleTriggers = document.querySelectorAll('.open-journal-modal, .journal-card');
  articleTriggers.forEach(el => {
    el.addEventListener('click', (e) => {
      if (isJournalSwiping) return; // Não abre modal se o usuário estiver apenas deslizando o carrossel no celular
      const card = el.closest('.journal-card');
      const articleKey = card ? card.getAttribute('data-article') : el.getAttribute('data-article');
      if (articleKey && journalArticles[articleKey]) {
        e.preventDefault();
        openArticle(articleKey);
      }
    });
  });

  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeArticle();
  });

  // Fechar ao clicar no backdrop (fora do container da crônica)
  dialog?.addEventListener('click', (event) => {
    const inner = dialog.querySelector('.journal-modal-article');
    if (inner && !inner.contains(event.target)) {
      closeArticle();
    }
  });

  dialog?.addEventListener('cancel', () => {
    document.body.style.overflow = '';
  });
}


let currentViewerImages = [];
let currentViewerIndex = 0;

export function initImageViewer() {
    const modal = document.getElementById('image-modal');
    const wrapper = document.getElementById('modal-wrapper');
    const modalImg = document.getElementById('full-image');
    const closeBtn = document.querySelector('.close-modal');

    if (!document.querySelector('.viewer-nav-btn')) {
        wrapper.insertAdjacentHTML('afterend', `
            <div class="viewer-nav-btn prev hidden"><i class="fas fa-chevron-left"></i></div>
            <div class="viewer-nav-btn next hidden"><i class="fas fa-chevron-right"></i></div>
            <div class="viewer-carousel hidden"></div>
        `);
    }

    const prevBtn = document.querySelector('.viewer-nav-btn.prev');
    const nextBtn = document.querySelector('.viewer-nav-btn.next');
    const carousel = document.querySelector('.viewer-carousel');

    let scale = 1; let pointX = 0; let pointY = 0; let start = { x: 0, y: 0 };
    let isPanning = false; let wasPanning = false; let lastTap = 0; let lastDist = 0;
    let swipeStartX = 0;

    const setTransform = () => {
        modalImg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    };

    const resetZoom = () => {
        scale = 1; pointX = 0; pointY = 0;
        modalImg.classList.remove('zoomed');
        setTransform();
    };

    const renderCarousel = () => {
        if (currentViewerImages.length <= 1) return;
        let html = '';
        currentViewerImages.forEach((imgSrc, idx) => {
            const activeClass = idx === currentViewerIndex ? 'active' : '';
            html += `<div class="carousel-thumb ${activeClass}" data-idx="${idx}"><img src="${imgSrc}"></div>`;
        });
        carousel.innerHTML = html;
        const activeThumb = carousel.querySelector('.active');
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    };

    const updateImageDisplay = (isInitial = false) => {
        if (currentViewerImages.length === 0) return;
        const updateUI = () => {
            modalImg.src = currentViewerImages[currentViewerIndex];
            if (currentViewerImages.length > 1) {
                prevBtn.classList.remove('hidden');
                nextBtn.classList.remove('hidden');
                carousel.classList.remove('hidden');
            } else {
                prevBtn.classList.add('hidden');
                nextBtn.classList.add('hidden');
                carousel.classList.add('hidden');
            }
            renderCarousel();
        };

        if (isInitial) {
            updateUI();
            resetZoom();
        } else {
            modalImg.classList.add('switching');
            resetZoom();
            setTimeout(() => {
                updateUI();
                requestAnimationFrame(() => {
                    modalImg.classList.remove('switching');
                });
            }, 150);
        }
    };

    const showNextImage = () => {
        if (currentViewerIndex < currentViewerImages.length - 1) {
            currentViewerIndex++;
            updateImageDisplay();
        }
    };

    const showPrevImage = () => {
        if (currentViewerIndex > 0) {
            currentViewerIndex--;
            updateImageDisplay();
        }
    };

    nextBtn.onclick = (e) => { e.stopPropagation(); showNextImage(); };
    prevBtn.onclick = (e) => { e.stopPropagation(); showPrevImage(); };
    
    carousel.onclick = (e) => {
        const thumb = e.target.closest('.carousel-thumb');
        if (thumb) {
            e.stopPropagation();
            const newIndex = parseInt(thumb.dataset.idx);
            if (newIndex !== currentViewerIndex) {
                currentViewerIndex = newIndex;
                updateImageDisplay();
            }
        }
    };

    modalImg.addEventListener('mousedown', (e) => {
        if (scale > 1) {
            isPanning = true; wasPanning = false;
            modalImg.style.transition = 'none';
            start = { x: e.clientX - pointX, y: e.clientY - pointY };
            e.preventDefault();
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (isPanning && scale > 1) {
            pointX = e.clientX - start.x; pointY = e.clientY - start.y;
            wasPanning = true; setTransform();
        }
    });

    window.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            setTimeout(() => { wasPanning = false; }, 10);
            modalImg.style.transition = 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)';
        }
    });

    modalImg.addEventListener('click', (e) => {
        if (wasPanning) return;
        if (scale === 1) {
            scale = 2.5; modalImg.classList.add('zoomed'); 
            modalImg.style.transition = 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)';
        } else {
            resetZoom();
        }
        setTransform();
    });

    wrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const now = Date.now();
            swipeStartX = e.touches[0].clientX;
            if (now - lastTap < 300) {
                if (scale === 1) { scale = 2.5; modalImg.classList.add('zoomed'); } else { resetZoom(); }
                setTransform();
            }
            lastTap = now;
            if (scale > 1) {
                isPanning = true; modalImg.style.transition = 'none';
                start = { x: e.touches[0].clientX - pointX, y: e.touches[0].clientY - pointY };
            }
        } else if (e.touches.length === 2) {
            lastDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
        }
    });

    wrapper.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
            if (isPanning && scale > 1) {
                pointX = e.touches[0].clientX - start.x; pointY = e.touches[0].clientY - start.y;
                setTransform();
            }
        } else if (e.touches.length === 2) {
            const dist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
            const delta = dist / lastDist;
            scale = Math.min(Math.max(1, scale * delta), 5);
            lastDist = dist;
            if (scale > 1) modalImg.classList.add('zoomed'); else modalImg.classList.remove('zoomed');
            setTransform();
        }
    });

    wrapper.addEventListener('touchend', (e) => {
        isPanning = false;
        modalImg.style.transition = 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)';
        if (scale === 1 && e.changedTouches.length === 1) {
            const swipeEndX = e.changedTouches[0].clientX;
            const diffX = swipeStartX - swipeEndX;
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) showNextImage();
                else showPrevImage();
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('message-image')) {
            const rawData = e.target.dataset.images;
            const index = e.target.dataset.index;
            if (rawData) {
                currentViewerImages = JSON.parse(decodeURIComponent(rawData));
                currentViewerIndex = index ? parseInt(index) : 0;
            } else {
                currentViewerImages = [e.target.src];
                currentViewerIndex = 0;
            }
            modal.classList.add('active');
            updateImageDisplay(true);
        }
    });

    const closeViewer = () => {
        modal.classList.remove('active');
        setTimeout(() => {
            resetZoom();
            modalImg.src = ''; 
        }, 300);
    };

    closeBtn.onclick = closeViewer;
    modal.onclick = (e) => { if (e.target === modal || e.target === wrapper) closeViewer(); };
}
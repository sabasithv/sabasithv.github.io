(() => {
  const one = (sel) => document.querySelector(sel);
  const all = (sel) => [...document.querySelectorAll(sel)];
  const nav = one('#site-nav');
  const toggle = one('.nav-toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  let toastTimer;
  function toast(message) {
    const node = one('#toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('visible'), 2200);
  }
  all('.copy-btn').forEach((button) => button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else {
        const input = document.createElement('textarea');
        input.value = value; input.style.position = 'fixed'; input.style.opacity = '0';
        document.body.append(input); input.select();
        if (!document.execCommand('copy')) throw new Error('copy failed');
        input.remove();
      }
      toast('Citation copied');
    } catch { toast('Copy unavailable. Please select the citation text.'); }
  }));
  // Publication filters work offline, even when opened as file://.
  const search = one('#publication-search');
  if (search) {
    const type = one('#publication-type');
    const year = one('#publication-year');
    const topic = one('#publication-topic');
    const cards = all('.pub-card');
    const count = one('#publication-count');
    const empty = one('#publication-empty');
    const update = () => {
      const q = search.value.toLowerCase().trim().normalize('NFKD');
      let visible = 0;
      for (const card of cards) {
        const hay = (card.dataset.search || '').normalize('NFKD');
        const match = hay.includes(q) && (type.value === 'all' || card.dataset.kind === type.value) && (year.value === 'all' || card.dataset.year === year.value) && (topic.value === 'all' || card.dataset.topic === topic.value);
        card.hidden = !match; if (match) visible++;
      }
      count.textContent = `${visible} publication${visible === 1 ? '' : 's'} shown`;
      if (empty) empty.hidden = visible !== 0;
    };
    [search,type,year,topic].forEach(el => el.addEventListener(el === search ? 'input':'change', update));
    update();
  }
  function updateGallery() {
    const galleryGroup = one('[data-filter-group="gallery"]');
    if (!galleryGroup) return;
    const active = galleryGroup.querySelector('button.active');
    const category = active ? active.dataset.filter : 'All';
    const event = one('#gallery-event-select')?.value || 'All';
    let visible = 0;
    all('.gallery-tile').forEach(tile => {
      const keep = (category === 'All' || tile.dataset.gallery === category) &&
                   (event === 'All' || tile.dataset.event === event);
      tile.hidden = !keep;
      if (keep) visible += 1;
    });
    const count = one('#gallery-count');
    if (count) count.textContent = `${visible} photograph${visible === 1 ? '' : 's'}`;
  }
  all('[data-filter-group]').forEach(group => {
    const what = group.dataset.filterGroup;
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      all('[data-filter-group="'+what+'"] button').forEach(x => {
        x.classList.toggle('active', x === btn);
        x.setAttribute('aria-pressed', String(x === btn));
      });
      if (what === 'gallery') updateGallery();
      else {
        all('.patent-card').forEach(tile => {
          tile.hidden = !(btn.dataset.filter === 'All' || tile.dataset.status === btn.dataset.filter);
        });
      }
    });
  });
  const eventSelect = one('#gallery-event-select');
  if (eventSelect) {
    eventSelect.addEventListener('change', updateGallery);
    const urlParams = new URLSearchParams(location.search);
    const selectedEvent = urlParams.get('event');
    if (selectedEvent && [...eventSelect.options].some(x => x.value === selectedEvent)) {
      eventSelect.value = selectedEvent;
    }
    const selectedCategory = urlParams.get('filter');
    if (selectedCategory) {
      const found = all('[data-filter-group="gallery"] button').find(x => x.dataset.filter === selectedCategory);
      if (found) found.click();
    }
    updateGallery();
  }
  const eventFilter=one('#event-filter');
  if (eventFilter) eventFilter.addEventListener('change',() => all('.event-item').forEach(item => item.hidden = eventFilter.value !== 'all' && item.dataset.eventtype !== eventFilter.value));
  const dialog=one('#photo-dialog');
  if(dialog){
    const image=one('#dialog-image'),title=one('#dialog-title'),desc=one('#dialog-desc'),origin=one('#dialog-original');
    all('.image-open').forEach(button=>button.addEventListener('click',()=>{
      image.src=button.dataset.photo;
      image.alt=button.dataset.desc;
      title.textContent=button.dataset.title;
      desc.textContent=button.dataset.desc;
      origin.href=button.dataset.photo;
      dialog.showModal();
    }));
    one('.dialog-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click', e => {if(e.target === dialog) dialog.close();});
  }
})();

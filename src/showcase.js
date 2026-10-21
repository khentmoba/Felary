export function nextTabIndex(index, key, count) {
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (key === 'ArrowRight' || key === 'ArrowDown') return (index + 1) % count;
  if (key === 'ArrowLeft' || key === 'ArrowUp') return (index - 1 + count) % count;
  return index;
}

export function initShowcase(root) {
  const rail = root.querySelector('.app-rail');
  const tabs = [...rail.querySelectorAll('[data-panel]')];
  const panels = tabs.map(tab => root.querySelector('#' + tab.dataset.panel));
  if (!tabs.length || panels.some(panel => !panel)) return;
  const layout = matchMedia('(max-width: 760px)');
  const setOrientation = () => rail.setAttribute('aria-orientation', layout.matches ? 'horizontal' : 'vertical');
  rail.setAttribute('role', 'tablist');
  setOrientation();
  layout.addEventListener('change', setOrientation);
  const select = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  };
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      select(index);
    });
    tab.addEventListener('keydown', event => {
      if (!['Home','End','ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(event.key)) return;
      event.preventDefault();
      select(nextTabIndex(index, event.key, tabs.length), true);
    });
  });
  select(0);
  root.dataset.enhanced = '';
}

export function isRecent(date, now, days=30) {
  const age=now-Date.parse(date+'T00:00:00Z');
  return age>=0 && age<days*864e5;
}

export function featureFrameIndex(featureTops, readingLine, ready=true) {
  if (!ready) return 0;
  let frame=0;
  featureTops.forEach((top,i)=>{ if (top <= readingLine) frame=i+1; });
  return frame;
}

const readingLine=pin=>Math.max(pin,innerHeight*.45);

export function initFeatureStory(root) {
  const frames=[...root.querySelectorAll('[data-frame]')];
  const features=[...root.querySelectorAll('[data-feature-step]')];
  if (frames.length < 2 || typeof IntersectionObserver === 'undefined') return;
  const body=root.querySelector('.story-body');
  const figure=root.querySelector('.story-figure');
  const intro=root.querySelector('.story-copy>p');
  const caption=root.querySelector('[data-gallery-caption]');
  const link=root.querySelector('[data-gallery-link]');
  const layout=matchMedia('(min-width: 900px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)');
  let observers=[];
  let desired=0;
  let shown=0;
  const paint=frame=>{
    let image=frames[frame].querySelector('img');
    if (frame && (!image || (image.complete && !image.naturalWidth))) {
      frame=0;
      image=frames[0].querySelector('img');
    }
    if (image && !image.complete) { image.loading='eager'; return; }
    if (frame===shown) return;
    frames.forEach((el,i)=>{
      el.classList.toggle('is-current',i===frame);
      el.setAttribute('aria-hidden',String(i!==frame));
    });
    features.forEach((feature,i)=>feature.toggleAttribute('data-reading',i+1===frame));
    caption.textContent=frames[frame].dataset.caption;
    if (image) link.href=image.getAttribute('src');
    shown=frame;
  };
  const update=()=>{
    const pin=parseFloat(getComputedStyle(figure).top)||0;
    // Features light up as they pass mid-screen, where the reader is looking.
    const line=readingLine(pin);
    const ready=body.getBoundingClientRect().top<=pin+1
      && figure.getBoundingClientRect().top<=pin+1
      && intro.getBoundingClientRect().bottom<=line;
    desired=root.dataset.sceneScroll==='true'
      ? featureFrameIndex(features.map(el=>el.getBoundingClientRect().top),line,ready)
      : 0;
    paint(desired);
  };
  frames.forEach(frame=>{
    const image=frame.querySelector('img');
    image?.addEventListener('load',update);
    image?.addEventListener('error',update);
  });
  // The last feature must reach the reading line while the picture is still pinned.
  const sizeTail=enabled=>{
    body.style.paddingBottom='';
    if (!enabled) return;
    const pin=parseFloat(getComputedStyle(figure).top)||0;
    const below=body.getBoundingClientRect().bottom-features[features.length-1].getBoundingClientRect().top;
    const extra=Math.ceil(pin+figure.offsetHeight-readingLine(pin)-below+8);
    if (extra>0) body.style.paddingBottom=extra+'px';
  };
  const configure=()=>{
    observers.forEach(o=>o.disconnect());
    observers=[];
    const enabled=layout.matches && CSS.supports('animation-timeline: view()');
    root.dataset.sceneScroll=String(enabled);
    sizeTail(enabled);
    if (enabled) {
      // One line where the picture pins, one where features are read.
      const pin=parseFloat(getComputedStyle(figure).top)||0;
      const watch=(line,targets)=>{
        const top=Math.round(line);
        const observer=new IntersectionObserver(update,{rootMargin:`-${top}px 0px -${innerHeight-top-1}px 0px`,threshold:0});
        targets.forEach(el=>observer.observe(el));
        observers.push(observer);
      };
      watch(pin,[body,figure]);
      watch(readingLine(pin),[intro,...features]);
    }
    update();
  };
  layout.addEventListener('change',configure);
  window.addEventListener('resize',configure);
  window.addEventListener('hashchange',update);
  configure();
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('.spotlight').forEach(initShowcase);
  document.querySelectorAll('.spotlight-media img, .story-image img, .feature-inline img, .hero-image img').forEach(img => {
    const fallback = () => {
      const message = document.createElement('p');
      message.className = 'image-error';
      message.textContent = 'Preview unavailable. Read the introduction below or explore the app on GitHub.';
      img.replaceWith(message);
    };
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && !img.naturalWidth) fallback();
  });
  document.querySelectorAll('.app-story').forEach(initFeatureStory);
  // Release dates are baked in at build time; "New" depends on today, so it is decided here.
  document.querySelectorAll('.download time[data-released]').forEach(time => {
    if (!isRecent(time.dateTime, Date.now())) return;
    const tag = document.createElement('span');
    tag.className = 'fresh';
    tag.textContent = 'New';
    time.closest('.download').querySelector('h3').append(tag);
  });
}

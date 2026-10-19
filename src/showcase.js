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

export function featureFrameIndex(featureTops, readingLine, ready=true) {
  if (!ready) return 0;
  let frame=0;
  featureTops.forEach((top,i)=>{ if (top <= readingLine) frame=i+1; });
  return frame;
}

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
  let observer;
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
    const line=parseFloat(getComputedStyle(figure).top)||0;
    const ready=body.getBoundingClientRect().top<=line+1
      && figure.getBoundingClientRect().top<=line+1
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
  // The last feature must reach the top while the picture is still pinned.
  const sizeTail=enabled=>{
    body.style.paddingBottom='';
    if (!enabled) return;
    const below=body.getBoundingClientRect().bottom-features[features.length-1].getBoundingClientRect().top;
    const extra=Math.ceil(figure.offsetHeight-below+8);
    if (extra>0) body.style.paddingBottom=extra+'px';
  };
  const configure=()=>{
    observer?.disconnect();
    const enabled=layout.matches && CSS.supports('animation-timeline: view()');
    root.dataset.sceneScroll=String(enabled);
    sizeTail(enabled);
    if (enabled) {
      const top=Math.round(parseFloat(getComputedStyle(figure).top)||0);
      const bottom=innerHeight-top-1;
      observer=new IntersectionObserver(update,{rootMargin:`-${top}px 0px -${bottom}px 0px`,threshold:0});
      features.forEach(feature=>observer.observe(feature));
      observer.observe(intro);
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
  document.querySelectorAll('.spotlight-media img, .story-image img, .feature-inline img').forEach(img => {
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
}

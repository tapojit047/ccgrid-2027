// Simple loader to keep navbar/footer shared across static pages and handle domain redirects.
const loadFragment = async (selector, url) => {
  const target = document.querySelector(selector);
  if (!target) return;

  try {
    const fragmentUrl = new URL(url, document.baseURI);
    fragmentUrl.searchParams.set('v', Date.now().toString());
    const response = await fetch(fragmentUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    target.innerHTML = await response.text();
  } catch (error) {
    console.error(`Failed to load ${url}:`, error);
  }
};

// (() => {
//   const fromHosts = ['ccgrid2026.org', 'www.ccgrid2026.org'];
//   const targetDomain = 'ccgrid2026.cdms.westernsydney.edu.au';
//   const host = window.location.hostname.toLowerCase();

//   if (fromHosts.includes(host) && host !== targetDomain && host !== `www.${targetDomain}`) {
//     const { protocol, pathname, search, hash } = window.location;
//     window.location.replace(`${protocol}//${targetDomain}${pathname}${search}${hash}`);
//   }
// })();

document.addEventListener('DOMContentLoaded', () => {
  const stamp = Date.now().toString();
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || !href.endsWith('style.css')) return;
    const url = new URL(href, document.baseURI);
    url.searchParams.set('v', stamp);
    link.href = url.toString();
  });

  loadFragment('#navbar-placeholder', 'includes/navbar.html');
  loadFragment('#footer-placeholder', 'includes/footer.html');

  const tabs = Array.from(document.querySelectorAll('.program-tab'));
  const panels = Array.from(document.querySelectorAll('.program-panel'));
  const isProgramExport = window.location.search.includes('export=pdf');

  if (tabs.length && panels.length) {
    let activePanelId = panels.find((panel) => !panel.hidden)?.id || panels[0].id;

    const activateTab = (targetId) => {
      activePanelId = targetId;

      tabs.forEach((tab) => {
        const isActive = tab.dataset.day === targetId;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });

      panels.forEach((panel) => {
        const isActive = panel.id === targetId;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => activateTab(tab.dataset.day));
    });

    const enableProgramExportMode = () => {
      document.body.classList.add('program-export-pdf');
      panels.forEach((panel) => {
        panel.hidden = false;
        panel.classList.add('is-active');
      });
    };

    const disableProgramExportMode = () => {
      document.body.classList.remove('program-export-pdf');
      activateTab(activePanelId);
    };

    if (isProgramExport) {
      enableProgramExportMode();
      window.status = 'program-export-ready';
      return;
    }

    window.addEventListener('beforeprint', enableProgramExportMode);
    window.addEventListener('afterprint', disableProgramExportMode);
  }
});

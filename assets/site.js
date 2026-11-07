// Fills in the latest version and the changelog from this repo's GitHub
// Releases (created automatically by the app repo's build workflow).
(function () {
  const REPO = 'DoomBuoy/Musie_website';
  const API = 'https://api.github.com/repos/' + REPO + '/releases?per_page=5';

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const mb = (b) => (b / 1048576).toFixed(1) + ' MB';
  const day = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  function render(releases) {
    const box = document.getElementById('releases');
    box.textContent = '';
    if (!releases.length) {
      box.appendChild(el('p', 'muted', 'The first build is on its way. Check back soon.'));
      return;
    }

    // Hero: version, date and size of the newest build.
    const latest = releases[0];
    const apk = (latest.assets || []).find((a) => a.name === 'musie.apk');
    const meta = document.getElementById('relMeta');
    meta.textContent = [
      latest.name || latest.tag_name,
      'updated ' + day(latest.published_at),
      apk ? mb(apk.size) : null,
      'Android 7.0+'
    ].filter(Boolean).join(' · ');

    releases.forEach((r, i) => {
      const card = el('article', 'rel');
      const h = el('div', 'rel-h');
      h.appendChild(el('b', null, r.name || r.tag_name));
      if (i === 0) h.appendChild(el('span', 'tag', 'Latest'));
      h.appendChild(el('span', null, day(r.published_at)));
      card.appendChild(h);
      // Release notes are "- change" lines; show them as a list (text only).
      const items = (r.body || '').split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith('- '))
        .map((l) => l.slice(2));
      if (items.length) {
        const ul = el('ul');
        items.slice(0, 8).forEach((t) => ul.appendChild(el('li', null, t)));
        card.appendChild(ul);
      }
      box.appendChild(card);
    });
  }

  // Downloads are served from this site (downloads/, added by the Pages
  // workflow). If they aren't there yet, fall back to the GitHub release.
  const RELEASE_DL = 'https://github.com/' + REPO + '/releases/latest/download/';
  [['apkBtn', 'musie.apk'], ['pluginBtn', 'ystream-plugin.zip']].forEach(([id, file]) => {
    const a = document.getElementById(id);
    fetch(a.getAttribute('href'), { method: 'HEAD', cache: 'no-store' })
      .then((r) => { if (!r.ok) throw r.status; })
      .catch(() => {
        a.href = RELEASE_DL + file;
        a.removeAttribute('download');
      });
  });

  fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((list) => render(Array.isArray(list) ? list.filter((r) => !r.draft) : []))
    .catch(() => {
      document.getElementById('releases').textContent = '';
      document.getElementById('releases').appendChild(
        el('p', 'muted', "Couldn't load updates right now. The download buttons always give the newest version."));
    });
})();

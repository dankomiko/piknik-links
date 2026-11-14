(function () {
  var cfg = window.PIKNIK_LINKS || {};
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  var match = path.match(/^\/sequence\/([0-9a-fA-F-]{8,})$/);
  var stackId = match ? match[1] : null;
  var query = window.location.search || '';
  var tokenMatch = query.match(/[?&]t=([A-Za-z0-9_-]{16,64})(?:&|$)/);
  var token = tokenMatch ? tokenMatch[1] : null;
  var isAndroid = /android/i.test(navigator.userAgent);
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  function $(id) { return document.getElementById(id); }

  function isHttpUrl(value) {
    return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
  }

  function wireStoreBadge(el, url, label) {
    if (!el) return false;
    if (isHttpUrl(url)) {
      el.href = url.trim();
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
      el.classList.remove('is-soon');
      el.removeAttribute('aria-disabled');
      el.setAttribute('aria-label', label);
      return true;
    }
    el.removeAttribute('href');
    el.classList.add('is-soon');
    el.setAttribute('aria-disabled', 'true');
    el.setAttribute('aria-label', label + ' — coming soon');
    el.addEventListener('click', function (e) {
      e.preventDefault();
    });
    return false;
  }

  var iosLive = wireStoreBadge($('badge-ios'), cfg.appStoreUrl, 'Download on the App Store');
  var androidLive = wireStoreBadge($('badge-android'), cfg.playStoreUrl, 'Get it on Google Play');
  var apkLink = $('apk-download');
  var apkLive = false;
  // Play Store wins when it exists. Until then, the homepage links straight to the preview APK.
  if (apkLink && isHttpUrl(cfg.apkUrl) && !androidLive) {
    apkLink.href = cfg.apkUrl.trim();
    apkLink.target = '_blank';
    apkLink.rel = 'noopener noreferrer';
    apkLink.hidden = false;
    var androidBadge = $('badge-android');
    if (androidBadge) androidBadge.hidden = true;
    apkLive = true;
  }
  var soonNote = $('downloads-soon');
  if (soonNote) {
    var androidReady = androidLive || apkLive;
    if (iosLive && androidReady) soonNote.hidden = true;
    else if (iosLive) soonNote.textContent = 'Coming soon to Android';
    else if (androidLive) soonNote.textContent = 'Coming soon to iPhone';
    else if (apkLive) soonNote.textContent = 'Direct install for Android. iPhone coming soon.';
  }

  if (!stackId) {
    // Marketing root (and unknown paths that aren't invite deep links).
    if (path && path !== '/' && path !== '/index.html' && !/\.html$/i.test(path)) {
      // Keep marketing visible; invite-only dead paths still show the site.
    }
    return;
  }

  // —— Invite mode ——
  document.body.classList.add('invite-mode');
  var invite = $('invite');
  if (invite) {
    invite.hidden = false;
  }

  var title = $('title');
  var body = $('body');
  var meta = $('meta');
  var open = $('open');
  var get = $('get');
  var reopen = $('reopen');
  var note = $('note');

  // Prefer Play Store when configured; otherwise fall back to the preview APK.
  if (isHttpUrl(cfg.playStoreUrl)) {
    get.href = cfg.playStoreUrl.trim();
    get.target = '_blank';
    get.rel = 'noopener noreferrer';
  } else {
    get.href = cfg.apkUrl || '#';
  }

  var TAGLINE = 'Everyone adds one shot.\nNobody sees a thing until it’s full.';
  var RING_CIRCUMFERENCE = 2 * Math.PI * 83.5;

  function renderRing(filled, total, center, label, word) {
    var progress = total > 0 ? Math.min(1, Math.max(0, filled / total)) : 0;
    $('ringBlock').hidden = false;
    $('ringFill').style.strokeDasharray = (RING_CIRCUMFERENCE * progress) + ' ' + RING_CIRCUMFERENCE;
    $('ringNumber').textContent = center;
    $('ringLabel').textContent = label;
    $('ringCenter').classList.toggle('word', !!word);
    $('ring').setAttribute('aria-label', filled + ' of ' + total + ' spots filled');
  }

  function closesIn(ms) {
    var diff = ms - Date.now();
    if (diff <= 0) return 'closing soon';
    var hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'closes within the hour';
    if (hours < 24) return 'closes in ' + hours + (hours === 1 ? ' hour' : ' hours');
    var days = Math.round(hours / 24);
    return 'closes in ' + days + (days === 1 ? ' day' : ' days');
  }

  function avatarUrl(raw) {
    if (!raw) return null;
    if (/^https?:/i.test(raw)) return raw;
    return cfg.supabaseUrl.replace(/\/+$/, '') + '/storage/v1/object/public/' + raw.replace(/^\/+/, '');
  }

  var DEFAULT_AVATAR_COUNT = 70;

  function hashKey(key) {
    var h = 0;
    for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function defaultAvatarUrl(userId, name) {
    var key = String(userId || name || 'piknik').trim() || 'piknik';
    var index = (hashKey(key) % DEFAULT_AVATAR_COUNT) + 1;
    var n = index < 10 ? '00' + index : index < 100 ? '0' + index : String(index);
    return 'assets/default-avatars/food-' + n + '.png';
  }

  function showPreview(p) {
    var spots = Math.max(0, p.slotCount - p.filledCount);
    var expired = p.fillDeadlineAt && p.fillDeadlineAt <= Date.now();
    var state = p.status === 'closed_unfilled' || expired ? 'closed' : p.status === 'ready' || spots === 0 ? 'full' : 'open';

    $('inviter').hidden = false;
    $('inviterText').hidden = false;
    $('inviterText').textContent = p.privacy === 'public' ? p.creatorName + ' started an open Piknik' : p.creatorName + ' saved you a spot';
    $('avatar').src = avatarUrl(p.creatorAvatarUri) || defaultAvatarUrl(p.creatorUserId, p.creatorName);

    document.title = p.title + ' · Piknik';
    title.textContent = p.title;
    if (state === 'open') {
      renderRing(p.filledCount, p.slotCount, String(spots), spots === 1 ? 'spot left' : 'spots left');
      meta.textContent = p.filledCount + ' of ' + p.slotCount + ' are in · ' + closesIn(p.fillDeadlineAt);
      body.textContent = TAGLINE;
    } else if (state === 'full') {
      renderRing(p.slotCount, p.slotCount, 'Everyone’s in', '', true);
      meta.textContent = 'All ' + p.slotCount + ' are in';
      body.textContent = 'If you added a shot, open it in the app.';
      open.textContent = 'Open in Piknik';
    } else {
      renderRing(0, p.slotCount, 'Closed', '', true);
      meta.textContent = 'Closed before everyone joined';
      body.textContent = 'This one’s over, but you can start your own in the app.';
      open.textContent = 'Open Piknik';
    }
  }

  function loadPreview() {
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.fetch) return;
    fetch(cfg.supabaseUrl.replace(/\/+$/, '') + '/rest/v1/rpc/get_invite_preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: cfg.supabaseAnonKey, Authorization: 'Bearer ' + cfg.supabaseAnonKey },
      body: JSON.stringify(token ? { p_stack_id: stackId, p_token: token } : { p_stack_id: stackId }),
    })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data) return;
        if (data.error) {
          var code = data.error.code;
          if (code === 'invite_link_required') {
            title.textContent = 'This Piknik is invite-only';
            body.textContent = 'Ask whoever invited you for a personal link. Already in it? Open Piknik.';
            open.textContent = 'Open Piknik';
          } else if (code === 'invite_link_used') {
            title.textContent = 'This invite has already been used';
            body.textContent = 'If you joined with it, open Piknik. Otherwise ask for a new link.';
            open.textContent = 'Open Piknik';
          } else {
            title.textContent = 'That invite didn’t work';
            body.textContent = 'Ask whoever sent it for a fresh link, or get the app and start your own Piknik.';
            open.hidden = true;
          }
          return;
        }
        showPreview(data);
      })
      .catch(function () {});
  }

  document.title = 'You’re invited to a Piknik';
  title.textContent = 'You’re invited to a Piknik';
  body.textContent = TAGLINE;
  open.textContent = 'Join this Piknik';
  var appPath = 'sequence/' + stackId + query;
  var appHref = cfg.appScheme + '://' + appPath;

  // A fresh install can't receive the link, so the app checks the clipboard once on first launch
  // (Android) for exactly this URL and opens the invite.
  var canonicalInvite = 'https://pknk.app/sequence/' + stackId + '?invite=1' + (token ? '&t=' + token : '');
  function keepInviteForInstall() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(canonicalInvite).catch(function () {});
    } catch (e) {}
  }

  if (isAndroid) {
    var fallback = encodeURIComponent(cfg.apkUrl || window.location.href);
    open.href = 'intent://' + appPath + '#Intent;scheme=' + cfg.appScheme + ';package=' + cfg.androidPackage + ';S.browser_fallback_url=' + fallback + ';end';
    reopen.href = 'intent://' + appPath + '#Intent;scheme=' + cfg.appScheme + ';package=' + cfg.androidPackage + ';end';
    open.addEventListener('click', keepInviteForInstall);
    get.addEventListener('click', function () {
      keepInviteForInstall();
      setTimeout(function () { reopen.hidden = false; }, 1500);
    });
  } else {
    open.href = appHref;
  }
  open.hidden = false;
  loadPreview();

  if (isIOS) {
    get.hidden = true;
    note.textContent = isHttpUrl(cfg.appStoreUrl)
      ? 'Get Piknik on the App Store, then open your invite.'
      : 'Piknik for iPhone is coming soon.';
  } else if (isAndroid) {
    note.textContent = 'New to Piknik? We’ll copy your invite so it opens right after you install.';
  } else {
    note.textContent = 'Open this link on your phone to join.';
  }
})();

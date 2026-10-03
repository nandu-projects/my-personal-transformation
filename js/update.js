// ==========================================================================
// GitHub Release APK In-App Update System for My Personal Transformation
// ==========================================================================

// Easily configurable repository constant
const GITHUB_REPO = 'nandu-projects/my-personal-transformation';
const GITHUB_RELEASES_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

class UpdateManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.isChecking = false;
    this.isDownloading = false;
    this.cachedUpdateInfo = null;
    this.progressListenerAttached = false;
    this.appVersionInfo = {
      packageName: 'com.nanduprojects.transformation',
      versionName: '1.5.0',
      versionCode: 8
    };
  }

  async init() {
    await this.fetchLocalVersionInfo();
    this.updateStatusDisplay();

    // Check when online on start
    if (navigator.onLine) {
      setTimeout(() => this.checkForUpdate(false), 1500);
    }

    // Check when network connection is restored
    window.addEventListener('online', () => {
      this.updateStatusDisplay();
      this.checkForUpdate(false);
    });

    window.addEventListener('offline', () => {
      this.updateStatusDisplay();
    });

    // Check when returning to app from background
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        this.checkForUpdate(false);
      }
    });

    // Handle Capacitor native appStateChange
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener('appStateChange', (state) => {
        if (state.isActive && navigator.onLine) {
          this.checkForUpdate(false);
        }
      });
    }

    this.setupProgressListener();
  }

  async fetchLocalVersionInfo() {
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.GitHubUpdate) {
        const info = await window.Capacitor.Plugins.GitHubUpdate.getAppVersion();
        if (info) {
          this.appVersionInfo = {
            packageName: info.packageName || this.appVersionInfo.packageName,
            versionName: info.versionName || this.appVersionInfo.versionName,
            versionCode: info.versionCode || this.appVersionInfo.versionCode
          };
        }
      }
    } catch (e) {
      console.warn('Could not fetch native app version info:', e);
    }
    return this.appVersionInfo;
  }

  // Parse semver e.g. "v1.2.0" -> [1, 2, 0]
  parseSemVer(versionStr) {
    if (!versionStr) return [0, 0, 0];
    const cleaned = String(versionStr).trim().replace(/^[vV]/, '');
    const parts = cleaned.split('-')[0].split('.').map(n => parseInt(n, 10) || 0);
    while (parts.length < 3) parts.push(0);
    return parts.slice(0, 3);
  }

  // Compare v1 with v2: returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
  compareSemVer(v1, v2) {
    const p1 = this.parseSemVer(v1);
    const p2 = this.parseSemVer(v2);
    for (let i = 0; i < 3; i++) {
      if (p1[i] > p2[i]) return 1;
      if (p1[i] < p2[i]) return -1;
    }
    return 0;
  }

  async checkForUpdate(manualTrigger = false) {
    if (this.isChecking || this.isDownloading) return;

    if (!navigator.onLine) {
      this.updateStatusDisplay('Offline (connect to internet to check)');
      if (manualTrigger) {
        this.showToast('You are currently offline. Connect to internet to check for updates.');
      }
      return;
    }

    this.isChecking = true;
    this.updateStatusDisplay('Checking for updates...');

    try {
      const response = await fetch(GITHUB_RELEASES_URL, {
        headers: { Accept: 'application/vnd.github.v3+json' },
        cache: 'no-cache'
      });

      if (!response.ok) {
        if (response.status === 404) {
          this.updateStatusDisplay('Up to date (no releases published yet)');
          if (manualTrigger) {
            this.showToast('No GitHub release found. Running latest build.');
          }
          return;
        }
        throw new Error(`GitHub API returned status ${response.status}`);
      }

      const release = await response.json();
      const latestTag = release.tag_name || release.name || '';
      const currentVersion = this.appVersionInfo.versionName;

      // Find APK asset in the release
      const assets = Array.isArray(release.assets) ? release.assets : [];
      let apkAsset = assets.find(a => (a.name || '').toLowerCase().endsWith('.apk'));
      if (!apkAsset && assets.length > 0) {
        apkAsset = assets[0];
      }

      const downloadUrl = apkAsset ? apkAsset.browser_download_url : release.html_url;
      const fileName = apkAsset ? apkAsset.name : `MyPersonalTransformation-${latestTag}.apk`;

      const isNewer = this.compareSemVer(latestTag, currentVersion) > 0;

      if (isNewer && downloadUrl) {
        this.cachedUpdateInfo = {
          latestVersion: latestTag.replace(/^[vV]/, ''),
          currentVersion: currentVersion,
          downloadUrl: downloadUrl,
          fileName: fileName,
          releaseNotes: release.body || 'A new update is available on GitHub.',
          releaseName: release.name || latestTag,
          publishedAt: release.published_at
        };

        this.updateStatusDisplay(`Update available: v${this.cachedUpdateInfo.latestVersion}`);
        this.showUpdateBanner(this.cachedUpdateInfo);

        if (manualTrigger) {
          this.showToast(`New version v${this.cachedUpdateInfo.latestVersion} available!`);
        }
      } else {
        this.cachedUpdateInfo = null;
        this.updateStatusDisplay(`Up to date (v${currentVersion})`);
        if (manualTrigger) {
          this.showToast(`App is up to date (v${currentVersion})`);
        }
      }
    } catch (e) {
      console.warn('Update check failed:', e);
      this.updateStatusDisplay('Check failed (will retry automatically)');
      if (manualTrigger) {
        this.showToast('Could not check for updates: ' + (e.message || 'Network error'));
      }
    } finally {
      this.isChecking = false;
    }
  }

  showUpdateBanner(updateInfo) {
    const banner = document.getElementById('inAppUpdateBanner');
    if (!banner) return;

    const lblCurrent = document.getElementById('lblBannerCurrentVersion');
    const lblNew = document.getElementById('lblBannerNewVersion');
    const bannerText = document.getElementById('updateBannerText');
    const progressContainer = document.getElementById('updateProgressContainer');
    const actions = document.getElementById('updateBannerActions');

    if (lblCurrent) lblCurrent.textContent = `v${updateInfo.currentVersion}`;
    if (lblNew) lblNew.textContent = `v${updateInfo.latestVersion}`;
    if (bannerText) {
      bannerText.textContent = `Version v${updateInfo.latestVersion} is ready to install from GitHub Releases. Update now without resetting your data or streak.`;
    }

    if (progressContainer) progressContainer.style.display = 'none';
    if (actions) actions.style.display = 'flex';

    banner.style.display = 'block';
  }

  hideUpdateBanner() {
    const banner = document.getElementById('inAppUpdateBanner');
    if (banner) banner.style.display = 'none';
  }

  setupProgressListener() {
    if (this.progressListenerAttached) return;
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.GitHubUpdate) {
      try {
        window.Capacitor.Plugins.GitHubUpdate.addListener('downloadProgress', (data) => {
          this.onDownloadProgress(data);
        });
        this.progressListenerAttached = true;
      } catch (e) {
        console.warn('Could not attach download progress listener:', e);
      }
    }
  }

  onDownloadProgress(data) {
    const percent = Math.min(100, Math.max(0, parseInt(data.percent, 10) || 0));
    const fill = document.getElementById('updateProgressFill');
    const percentText = document.getElementById('updateProgressPercent');
    const statusText = document.getElementById('updateProgressStatus');

    if (fill) fill.style.width = `${percent}%`;
    if (percentText) percentText.textContent = `${percent}%`;
    if (statusText) {
      if (data.totalBytes && data.downloadedBytes) {
        const curMB = (data.downloadedBytes / (1024 * 1024)).toFixed(1);
        const totMB = (data.totalBytes / (1024 * 1024)).toFixed(1);
        statusText.textContent = `Downloading update (${curMB}MB / ${totMB}MB)...`;
      } else {
        statusText.textContent = 'Downloading update...';
      }
    }
  }

  async triggerUpdate() {
    if (!this.cachedUpdateInfo) {
      await this.checkForUpdate(true);
      if (!this.cachedUpdateInfo) return;
    }

    if (this.isDownloading) {
      this.showToast('Download is already in progress...');
      return;
    }

    const { downloadUrl, fileName } = this.cachedUpdateInfo;
    if (!downloadUrl) {
      this.showToast('No download link available for this update.');
      return;
    }

    const isNative = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    const plugin = window.Capacitor?.Plugins?.GitHubUpdate;

    if (isNative && plugin) {
      try {
        this.isDownloading = true;
        this.setupProgressListener();

        // Check if Android permission to install unknown apps is granted
        const permCheck = await plugin.canInstallPackages();
        if (permCheck && permCheck.canInstall === false) {
          const userAgreed = confirm(
            'Android requires permission to install APK updates directly from this app.\n\nTap OK to open settings and toggle "Allow from this source", then return here to update.'
          );
          if (userAgreed) {
            await plugin.openInstallPermissionSettings();
          }
          this.isDownloading = false;
          return;
        }

        // Show progress UI in banner
        const progressContainer = document.getElementById('updateProgressContainer');
        const actions = document.getElementById('updateBannerActions');
        const fill = document.getElementById('updateProgressFill');
        const percentText = document.getElementById('updateProgressPercent');
        const statusText = document.getElementById('updateProgressStatus');

        if (progressContainer) progressContainer.style.display = 'block';
        if (actions) actions.style.display = 'none';
        if (fill) fill.style.width = '0%';
        if (percentText) percentText.textContent = '0%';
        if (statusText) statusText.textContent = 'Connecting to GitHub...';

        this.showToast('Starting APK download from GitHub...');

        const result = await plugin.downloadAndInstallApk({
          url: downloadUrl,
          fileName: fileName || 'MyPersonalTransformation-update.apk'
        });

        if (statusText) statusText.textContent = 'Opening Android Package Installer...';
        this.showToast('Opening package installer. Tap "Install" or "Update" to finish.');

        // Reset banner state after short delay so user can return if installation is cancelled
        setTimeout(() => {
          this.isDownloading = false;
          if (actions) actions.style.display = 'flex';
          if (progressContainer) progressContainer.style.display = 'none';
        }, 3000);

      } catch (err) {
        console.error('Update failed:', err);
        this.isDownloading = false;
        alert('Could not complete update: ' + (err.message || err));
        const actions = document.getElementById('updateBannerActions');
        const progressContainer = document.getElementById('updateProgressContainer');
        if (actions) actions.style.display = 'flex';
        if (progressContainer) progressContainer.style.display = 'none';
      }
    } else {
      // Web / fallback browser environment
      this.showToast('Downloading release APK in browser...');
      window.open(downloadUrl, '_blank');
    }
  }

  async triggerImmediateUpdate() {
    return this.triggerUpdate();
  }

  updateStatusDisplay(customMessage) {
    if (typeof document === 'undefined') return;
    const lblVersion = document.getElementById('lblInstalledVersion');
    const lblStatus = document.getElementById('lblUpdateStatus');

    if (lblVersion) {
      lblVersion.textContent = `v${this.appVersionInfo.versionName} (Build ${this.appVersionInfo.versionCode})`;
    }

    if (lblStatus) {
      if (customMessage) {
        lblStatus.textContent = customMessage;
        if (customMessage.includes('available')) {
          lblStatus.style.color = 'var(--color-brand)';
        } else if (customMessage.includes('Offline') || customMessage.includes('failed')) {
          lblStatus.style.color = 'var(--color-danger)';
        } else {
          lblStatus.style.color = 'var(--color-success)';
        }
      } else if (!navigator.onLine) {
        lblStatus.textContent = 'Offline';
        lblStatus.style.color = 'var(--text-muted)';
      } else {
        lblStatus.textContent = 'Update system v1.5.0';
        lblStatus.style.color = 'var(--color-success)';
      }
    }
  }

  showToast(msg) {
    if (typeof document === 'undefined') return;
    const toast = document.getElementById('toastMessage');
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2800);
    }
  }
}

if (typeof window !== 'undefined') {
  window.UpdateManager = UpdateManager;
  window.GITHUB_REPO = GITHUB_REPO;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UpdateManager, GITHUB_REPO };
}

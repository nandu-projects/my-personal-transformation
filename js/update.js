// In-App Update Manager supporting Google Play In-App Updates and Offline-first resilience
class UpdateManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.isChecking = false;
    this.cachedUpdateInfo = null;
    this.appVersionInfo = {
      packageName: 'com.nanduprojects.transformation',
      versionName: '1.1.0',
      versionCode: 2
    };
  }

  async init() {
    await this.fetchLocalVersionInfo();
    // Check when online on start
    if (navigator.onLine) {
      this.checkForUpdate(false);
    }

    // Check when connection comes online
    window.addEventListener('online', () => {
      this.checkForUpdate(false);
    });

    // Check when app resumes from background
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        this.checkForUpdate(false);
      }
    });

    // Handle Capacitor appStateChange if available
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener('appStateChange', (state) => {
        if (state.isActive && navigator.onLine) {
          this.checkForUpdate(false);
        }
      });
    }
  }

  async fetchLocalVersionInfo() {
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.PlayUpdate) {
        const info = await window.Capacitor.Plugins.PlayUpdate.getAppVersion();
        if (info) {
          this.appVersionInfo = info;
        }
      }
    } catch (e) {
      console.warn('Could not fetch native app version info:', e);
    }
    return this.appVersionInfo;
  }

  async checkForUpdate(manualTrigger = false) {
    if (this.isChecking) return;
    if (!navigator.onLine) {
      if (manualTrigger) {
        this.showToast('You are currently offline. Connect to internet to check for updates.');
      }
      return;
    }

    this.isChecking = true;
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.PlayUpdate) {
        const result = await window.Capacitor.Plugins.PlayUpdate.checkUpdate();
        if (result && result.updateAvailable) {
          this.cachedUpdateInfo = result;
          this.showUpdateBanner(result);
          if (manualTrigger) {
            this.showToast('New version available!');
          }
        } else {
          if (manualTrigger) {
            this.showToast('App is up to date (Version ' + this.appVersionInfo.versionName + ')');
          }
        }
      } else {
        // Fallback check for web/development environment
        if (manualTrigger) {
          this.showToast('Running latest version (' + this.appVersionInfo.versionName + ')');
        }
      }
    } catch (e) {
      console.error('Update check failed:', e);
      if (manualTrigger) {
        this.showToast('Update check failed: ' + e.message);
      }
    } finally {
      this.isChecking = false;
    }
  }

  showUpdateBanner(updateInfo) {
    const banner = document.getElementById('inAppUpdateBanner');
    if (!banner) return;

    const versionText = updateInfo.availableVersionCode 
      ? `Version code ${updateInfo.availableVersionCode}` 
      : 'A new release';
    
    document.getElementById('updateBannerText').textContent = 
      `New version available (${versionText}). Update now via Google Play without losing your streak or data.`;
    
    banner.style.display = 'block';
  }

  hideUpdateBanner() {
    const banner = document.getElementById('inAppUpdateBanner');
    if (banner) banner.style.display = 'none';
  }

  async triggerImmediateUpdate() {
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.PlayUpdate) {
        this.showToast('Launching Google Play update...');
        await window.Capacitor.Plugins.PlayUpdate.startImmediateUpdate();
      } else {
        alert('Google Play In-App Updates is available on installed Android devices.');
      }
    } catch (e) {
      console.error('Failed to start immediate update:', e);
      alert('Could not start update: ' + e.message + '\nPlease check Google Play Store.');
    }
  }

  showToast(msg) {
    const toast = document.getElementById('toastMessage');
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2600);
    }
  }
}

if (typeof window !== 'undefined') {
  window.UpdateManager = UpdateManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UpdateManager };
}

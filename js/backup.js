// Data Export and Import module (JSON backup)
class BackupManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }

  exportBackup() {
    try {
      const state = this.stateManager.getState();
      const dataStr = JSON.stringify(state, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `my_personal_transformation_backup_${dateStr}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return { success: true, message: 'Backup file exported successfully!' };
    } catch (e) {
      console.error('Export failed:', e);
      return { success: false, message: 'Export failed: ' + e.message };
    }
  }

  async importBackup(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new Error('No file provided'));
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          const parsed = JSON.parse(content);
          if (!parsed || typeof parsed !== 'object') {
            throw new Error('Invalid JSON format');
          }
          this.stateManager.restoreData(parsed);
          resolve({ success: true, message: 'Backup restored successfully!' });
        } catch (err) {
          reject(new Error('Failed to parse backup: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }
}

if (typeof window !== 'undefined') {
  window.BackupManager = BackupManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BackupManager };
}

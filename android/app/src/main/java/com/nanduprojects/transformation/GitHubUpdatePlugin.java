package com.nanduprojects.transformation;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import android.util.Log;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "GitHubUpdate")
public class GitHubUpdatePlugin extends Plugin {
    private static final String TAG = "GitHubUpdatePlugin";
    private static final int REQUEST_CODE_INSTALL_PERMISSION = 9123;
    private File lastDownloadedApk = null;

    @PluginMethod
    public void getAppVersion(PluginCall call) {
        JSObject ret = new JSObject();
        try {
            Context ctx = getContext();
            PackageInfo pInfo = ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0);
            long versionCode;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                versionCode = pInfo.getLongVersionCode();
            } else {
                versionCode = pInfo.versionCode;
            }
            ret.put("packageName", pInfo.packageName);
            ret.put("versionName", pInfo.versionName);
            ret.put("versionCode", versionCode);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Error retrieving app version", e);
            ret.put("packageName", "com.nanduprojects.transformation");
            ret.put("versionName", "1.2.0");
            ret.put("versionCode", 3);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void canInstallPackages(PluginCall call) {
        JSObject ret = new JSObject();
        boolean canInstall = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            canInstall = getContext().getPackageManager().canRequestPackageInstalls();
        }
        ret.put("canInstall", canInstall);
        call.resolve(ret);
    }

    @PluginMethod
    public void openInstallPermissionSettings(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
                call.resolve();
            } else {
                call.resolve();
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to open install settings", e);
            call.reject("Could not open install settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void downloadAndInstallApk(PluginCall call) {
        String downloadUrl = call.getString("url");
        String fileName = call.getString("fileName", "MyPersonalTransformation-update.apk");

        if (downloadUrl == null || downloadUrl.trim().isEmpty()) {
            call.reject("Download URL is required");
            return;
        }

        // Run download on background worker thread
        new Thread(() -> {
            HttpURLConnection conn = null;
            InputStream in = null;
            FileOutputStream out = null;
            try {
                String currentUrl = downloadUrl;
                // Follow up to 5 redirects (GitHub release asset redirects to S3)
                for (int i = 0; i < 5; i++) {
                    URL u = new URL(currentUrl);
                    conn = (HttpURLConnection) u.openConnection();
                    conn.setConnectTimeout(20000);
                    conn.setReadTimeout(30000);
                    conn.setRequestProperty("User-Agent", "Mozilla/5.0 MyPersonalTransformation-Updater");
                    conn.setInstanceFollowRedirects(true);
                    int status = conn.getResponseCode();
                    if (status == HttpURLConnection.HTTP_MOVED_TEMP || status == HttpURLConnection.HTTP_MOVED_PERM 
                            || status == 307 || status == 308) {
                        String loc = conn.getHeaderField("Location");
                        if (loc != null) {
                            currentUrl = loc;
                            conn.disconnect();
                            continue;
                        }
                    }
                    break;
                }

                int responseCode = conn != null ? conn.getResponseCode() : -1;
                if (responseCode != HttpURLConnection.HTTP_OK) {
                    call.reject("Download failed with HTTP error: " + responseCode);
                    return;
                }

                long totalBytes = conn.getContentLengthLong();
                File targetDir = getContext().getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (targetDir == null) {
                    targetDir = new File(getContext().getCacheDir(), "apk_updates");
                }
                if (!targetDir.exists()) {
                    targetDir.mkdirs();
                }

                File apkFile = new File(targetDir, fileName);
                if (apkFile.exists()) {
                    apkFile.delete();
                }

                in = conn.getInputStream();
                out = new FileOutputStream(apkFile);

                byte[] buffer = new byte[8192];
                long downloadedBytes = 0;
                int read;
                int lastReportedPercent = -1;

                while ((read = in.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                    downloadedBytes += read;

                    if (totalBytes > 0) {
                        int percent = (int) ((downloadedBytes * 100) / totalBytes);
                        if (percent != lastReportedPercent) {
                            lastReportedPercent = percent;
                            JSObject progressObj = new JSObject();
                            progressObj.put("percent", percent);
                            progressObj.put("downloadedBytes", downloadedBytes);
                            progressObj.put("totalBytes", totalBytes);
                            notifyListeners("downloadProgress", progressObj);
                        }
                    }
                }
                out.flush();

                lastDownloadedApk = apkFile;

                // Launch package installer
                boolean launched = launchInstaller(apkFile);

                JSObject result = new JSObject();
                result.put("success", true);
                result.put("filePath", apkFile.getAbsolutePath());
                result.put("installerLaunched", launched);
                call.resolve(result);

            } catch (Exception e) {
                Log.e(TAG, "Download or installation error", e);
                call.reject("Download failed: " + e.getMessage());
            } finally {
                try {
                    if (in != null) in.close();
                } catch (Exception ignored) {}
                try {
                    if (out != null) out.close();
                } catch (Exception ignored) {}
                try {
                    if (conn != null) conn.disconnect();
                } catch (Exception ignored) {}
            }
        }).start();
    }

    @PluginMethod
    public void installApk(PluginCall call) {
        String filePath = call.getString("filePath");
        File target = null;
        if (filePath != null && !filePath.trim().isEmpty()) {
            target = new File(filePath);
        } else if (lastDownloadedApk != null) {
            target = lastDownloadedApk;
        }

        if (target == null || !target.exists()) {
            call.reject("APK file does not exist. Please download first.");
            return;
        }

        boolean launched = launchInstaller(target);
        JSObject ret = new JSObject();
        ret.put("success", launched);
        call.resolve(ret);
    }

    private boolean launchInstaller(File apkFile) {
        try {
            Context ctx = getContext();
            Uri apkUri = FileProvider.getUriForFile(
                    ctx,
                    ctx.getPackageName() + ".fileprovider",
                    apkFile
            );

            Intent installIntent = new Intent(Intent.ACTION_VIEW);
            installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
            installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            ctx.startActivity(installIntent);
            return true;
        } catch (Exception e) {
            Log.e(TAG, "Failed to launch package installer", e);
            return false;
        }
    }
}

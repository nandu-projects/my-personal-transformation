package com.nanduprojects.transformation;

import android.content.IntentSender;
import android.content.pm.PackageInfo;
import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.UpdateAvailability;
import com.google.android.gms.tasks.Task;

@CapacitorPlugin(name = "PlayUpdate")
public class PlayUpdatePlugin extends Plugin {
    private static final String TAG = "PlayUpdatePlugin";
    public static final int REQUEST_CODE_IMMEDIATE_UPDATE = 8899;

    private AppUpdateManager appUpdateManager;
    private AppUpdateInfo cachedAppUpdateInfo;

    @Override
    public void load() {
        super.load();
        try {
            appUpdateManager = AppUpdateManagerFactory.create(getContext());
        } catch (Exception e) {
            Log.e(TAG, "Error initializing AppUpdateManager", e);
        }
    }

    public AppUpdateManager getAppUpdateManager() {
        if (appUpdateManager == null && getContext() != null) {
            appUpdateManager = AppUpdateManagerFactory.create(getContext());
        }
        return appUpdateManager;
    }

    @PluginMethod
    public void getAppVersion(PluginCall call) {
        JSObject ret = new JSObject();
        try {
            PackageInfo pInfo = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            long versionCode;
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                versionCode = pInfo.getLongVersionCode();
            } else {
                versionCode = pInfo.versionCode;
            }
            ret.put("packageName", pInfo.packageName);
            ret.put("versionName", pInfo.versionName);
            ret.put("versionCode", versionCode);
            call.resolve(ret);
        } catch (Exception e) {
            ret.put("packageName", "com.nanduprojects.transformation");
            ret.put("versionName", "1.1.0");
            ret.put("versionCode", 2);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void checkUpdate(PluginCall call) {
        AppUpdateManager manager = getAppUpdateManager();
        if (manager == null) {
            JSObject ret = new JSObject();
            ret.put("updateAvailable", false);
            ret.put("reason", "AppUpdateManager not available");
            call.resolve(ret);
            return;
        }

        try {
            Task<AppUpdateInfo> appUpdateInfoTask = manager.getAppUpdateInfo();
            appUpdateInfoTask.addOnSuccessListener(appUpdateInfo -> {
                cachedAppUpdateInfo = appUpdateInfo;
                int updateAvailability = appUpdateInfo.updateAvailability();
                boolean isAvailable = (updateAvailability == UpdateAvailability.UPDATE_AVAILABLE);
                boolean immediateAllowed = appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE);
                boolean flexibleAllowed = appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE);

                JSObject ret = new JSObject();
                ret.put("updateAvailable", isAvailable);
                ret.put("availableVersionCode", appUpdateInfo.availableVersionCode());
                ret.put("immediateAllowed", immediateAllowed);
                ret.put("flexibleAllowed", flexibleAllowed);
                ret.put("clientVersionStalenessDays", appUpdateInfo.clientVersionStalenessDays() != null ? appUpdateInfo.clientVersionStalenessDays() : 0);
                ret.put("updateAvailabilityStatus", updateAvailability);
                call.resolve(ret);
            }).addOnFailureListener(e -> {
                Log.w(TAG, "Play in-app update check failed: " + e.getMessage());
                JSObject ret = new JSObject();
                ret.put("updateAvailable", false);
                ret.put("error", e.getMessage());
                call.resolve(ret);
            });
        } catch (Exception ex) {
            Log.e(TAG, "Exception during checkUpdate", ex);
            JSObject ret = new JSObject();
            ret.put("updateAvailable", false);
            ret.put("error", ex.getMessage());
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void startImmediateUpdate(PluginCall call) {
        AppUpdateManager manager = getAppUpdateManager();
        if (manager == null || cachedAppUpdateInfo == null) {
            call.reject("No cached update info available. Run checkUpdate first.");
            return;
        }

        try {
            if (cachedAppUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE
                    && cachedAppUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {
                
                manager.startUpdateFlowForResult(
                        cachedAppUpdateInfo,
                        AppUpdateType.IMMEDIATE,
                        getActivity(),
                        REQUEST_CODE_IMMEDIATE_UPDATE
                );
                
                JSObject ret = new JSObject();
                ret.put("started", true);
                ret.put("mode", "IMMEDIATE");
                call.resolve(ret);
            } else {
                call.reject("Immediate update not allowed or not available.");
            }
        } catch (IntentSender.SendIntentException e) {
            Log.e(TAG, "Failed to start update flow", e);
            call.reject("Failed to launch Google Play update intent: " + e.getMessage());
        } catch (Exception e) {
            Log.e(TAG, "General error starting update", e);
            call.reject("Error starting update: " + e.getMessage());
        }
    }
}

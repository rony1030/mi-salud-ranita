import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const AAPT2 = "/tmp/apk-tools/node_modules/aaptjs3/bin/x64/linux/aapt2";
const SMALI_JAR = "/tmp/apk-tools/smali.jar";
const ANDROID_JAR = "/tmp/apk-tools/platforms/android-33/android.jar";
const WORK_DIR = "/tmp/apk-build-ranita";

async function main() {
  fs.rmSync(WORK_DIR, { recursive: true, force: true });
  fs.mkdirSync(path.join(WORK_DIR, "res", "drawable"), { recursive: true });
  fs.mkdirSync(path.join(WORK_DIR, "res", "values"), { recursive: true });
  fs.mkdirSync(path.join(WORK_DIR, "smali", "com", "misalud", "ranitaglp1"), { recursive: true });
  fs.mkdirSync(path.join(WORK_DIR, "assets"), { recursive: true });
  fs.mkdirSync(path.join(WORK_DIR, "compiled"), { recursive: true });

  // 1. Copy standalone index.html and art-bundle.js into assets/
  const standaloneHtml = path.join(rootDir, "dist-apk", "index.html");
  const artBundleJs = path.join(rootDir, "dist-apk", "art-bundle.js");
  if (!fs.existsSync(standaloneHtml) || !fs.existsSync(artBundleJs)) {
    throw new Error("dist-apk files not found. Run build-standalone.mjs first.");
  }
  fs.copyFileSync(standaloneHtml, path.join(WORK_DIR, "assets", "index.html"));
  fs.copyFileSync(artBundleJs, path.join(WORK_DIR, "assets", "art-bundle.js"));

  // 2. Write AndroidManifest.xml (versionCode 2 / 1.1.0)
  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.misalud.ranitaglp1"
    android:versionCode="2"
    android:versionName="1.1.0">

    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="29" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:label="@string/app_name"
        android:icon="@drawable/ic_launcher"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar">

        <activity
            android:name="com.misalud.ranitaglp1.MainActivity"
            android:label="@string/app_name"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
  fs.writeFileSync(path.join(WORK_DIR, "AndroidManifest.xml"), manifestXml, "utf8");

  // 3. Write strings.xml and Ranita vector icon drawable
  const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Mi Salud Ranita GLP-1</string>
</resources>`;
  fs.writeFileSync(path.join(WORK_DIR, "res", "values", "strings.xml"), stringsXml, "utf8");

  const iconXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="100"
    android:viewportHeight="100">
    <path
        android:fillColor="#0c094e"
        android:pathData="M0,0h100v100h-100z" />
    <path
        android:fillColor="#4ade80"
        android:pathData="M15,46a35,23 0 1,0 70,0a35,23 0 1,0 -70,0z" />
    <path
        android:fillColor="#4ade80"
        android:pathData="M19,28a13,13 0 1,0 26,0a13,13 0 1,0 -26,0z" />
    <path
        android:fillColor="#4ade80"
        android:pathData="M55,28a13,13 0 1,0 26,0a13,13 0 1,0 -26,0z" />
    <path
        android:fillColor="#ffffff"
        android:pathData="M23,27a9,9 0 1,0 18,0a9,9 0 1,0 -18,0z" />
    <path
        android:fillColor="#ffffff"
        android:pathData="M59,27a9,9 0 1,0 18,0a9,9 0 1,0 -18,0z" />
    <path
        android:fillColor="#0f172a"
        android:pathData="M28,27a4.5,4.5 0 1,0 9,0a4.5,4.5 0 1,0 -9,0z" />
    <path
        android:fillColor="#0f172a"
        android:pathData="M64,27a4.5,4.5 0 1,0 9,0a4.5,4.5 0 1,0 -9,0z" />
    <path
        android:strokeColor="#14532d"
        android:strokeWidth="3.2"
        android:strokeLineCap="round"
        android:pathData="M36,51 Q50,62 64,51" />
</vector>`;
  fs.writeFileSync(path.join(WORK_DIR, "res", "drawable", "ic_launcher.xml"), iconXml, "utf8");

  // 4. Write MainActivity.smali (Full-screen WebView with DOMStorage/localStorage + Back navigation)
  const mainActivitySmali = `.class public Lcom/misalud/ranitaglp1/MainActivity;
.super Landroid/app/Activity;

.field private webView:Landroid/webkit/WebView;

.method public constructor <init>()V
    .registers 1
    invoke-direct {p0}, Landroid/app/Activity;-><init>()V
    return-void
.end method

.method protected onCreate(Landroid/os/Bundle;)V
    .registers 5

    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    new-instance v0, Landroid/webkit/WebView;
    invoke-direct {v0, p0}, Landroid/webkit/WebView;-><init>(Landroid/content/Context;)V
    iput-object v0, p0, Lcom/misalud/ranitaglp1/MainActivity;->webView:Landroid/webkit/WebView;

    invoke-virtual {v0}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;
    move-result-object v1

    const/4 v2, 0x1
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setDomStorageEnabled(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setDatabaseEnabled(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setAllowFileAccess(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setAllowContentAccess(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setAllowFileAccessFromFileURLs(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setAllowUniversalAccessFromFileURLs(Z)V

    new-instance v2, Landroid/webkit/WebViewClient;
    invoke-direct {v2}, Landroid/webkit/WebViewClient;-><init>()V
    invoke-virtual {v0, v2}, Landroid/webkit/WebView;->setWebViewClient(Landroid/webkit/WebViewClient;)V

    new-instance v2, Landroid/webkit/WebChromeClient;
    invoke-direct {v2}, Landroid/webkit/WebChromeClient;-><init>()V
    invoke-virtual {v0, v2}, Landroid/webkit/WebView;->setWebChromeClient(Landroid/webkit/WebChromeClient;)V

    invoke-virtual {p0, v0}, Lcom/misalud/ranitaglp1/MainActivity;->setContentView(Landroid/view/View;)V

    const-string v2, "file:///android_asset/index.html"
    invoke-virtual {v0, v2}, Landroid/webkit/WebView;->loadUrl(Ljava/lang/String;)V

    return-void
.end method

.method public onBackPressed()V
    .registers 2

    iget-object v0, p0, Lcom/misalud/ranitaglp1/MainActivity;->webView:Landroid/webkit/WebView;
    if-eqz v0, :call_super

    invoke-virtual {v0}, Landroid/webkit/WebView;->canGoBack()Z
    move-result v0
    if-eqz v0, :call_super

    iget-object v0, p0, Lcom/misalud/ranitaglp1/MainActivity;->webView:Landroid/webkit/WebView;
    invoke-virtual {v0}, Landroid/webkit/WebView;->goBack()V
    return-void

    :call_super
    invoke-super {p0}, Landroid/app/Activity;->onBackPressed()V
    return-void
.end method
`;
  fs.writeFileSync(
    path.join(WORK_DIR, "smali", "com", "misalud", "ranitaglp1", "MainActivity.smali"),
    mainActivitySmali,
    "utf8"
  );

  // 5. Assemble classes.dex with smali.jar
  const dexPath = path.join(WORK_DIR, "classes.dex");
  execFileSync("java", ["-jar", SMALI_JAR, path.join(WORK_DIR, "smali"), "-o", dexPath], {
    stdio: "inherit",
  });

  // 6. Compile resources with aapt2
  execFileSync(
    AAPT2,
    [
      "compile",
      "--dir",
      path.join(WORK_DIR, "res"),
      "-o",
      path.join(WORK_DIR, "compiled", "res.zip"),
    ],
    { stdio: "inherit" }
  );

  // 7. Link APK with aapt2 (including assets/index.html and assets/art-bundle.js)
  const unsignedApk = path.join(WORK_DIR, "unsigned.apk");
  execFileSync(
    AAPT2,
    [
      "link",
      "-I",
      ANDROID_JAR,
      "--manifest",
      path.join(WORK_DIR, "AndroidManifest.xml"),
      "-A",
      path.join(WORK_DIR, "assets"),
      "-0",
      "arsc",
      "-o",
      unsignedApk,
      path.join(WORK_DIR, "compiled", "res.zip"),
    ],
    { stdio: "inherit" }
  );

  // 8. Add classes.dex to the root of unsigned.apk
  execFileSync("zip", ["-j", unsignedApk, dexPath], { stdio: "inherit" });

  // 9. Generate signing key & self-signed certificate via keytool, then sign v1+v2+v3 with apk_sign_ts
  const keystorePath = path.join(WORK_DIR, "release.jks");
  execFileSync(
    "keytool",
    [
      "-genkeypair",
      "-v",
      "-keystore",
      keystorePath,
      "-storetype",
      "JKS",
      "-keyalg",
      "RSA",
      "-keysize",
      "2048",
      "-validity",
      "10000",
      "-alias",
      "ranita",
      "-storepass",
      "ranita123",
      "-keypass",
      "ranita123",
      "-dname",
      "CN=Mi Salud Ranita GLP-1, OU=Salud, O=Rony, L=SantoDomingo, ST=DO, C=DO",
    ],
    { stdio: "inherit" }
  );

  const apkSignModule = await import("/tmp/apk-tools/node_modules/apk_sign_ts/dist/index.js");
  const { ApkSigner, SigningKey, convertToPEM } = apkSignModule;

  const jksBytes = new Uint8Array(fs.readFileSync(keystorePath));
  const { privateKey, certificate } = await convertToPEM(jksBytes, "ranita123", "jks");

  const signer = new ApkSigner({
    signingKey: SigningKey.fromPEM(privateKey, certificate),
  });

  const unsignedBytes = new Uint8Array(fs.readFileSync(unsignedApk));
  const { signedApk } = await signer.sign(unsignedBytes);

  const finalApkPath = path.join(rootDir, "Mi-Salud-Ranita-GLP1.apk");
  fs.writeFileSync(finalApkPath, Buffer.from(signedApk));
  console.log(
    `✅ APK v1.1.0 compilado y firmado (v1+v2+v3): ${finalApkPath} (${(signedApk.byteLength / (1024 * 1024)).toFixed(2)} MB)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

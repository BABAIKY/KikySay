# Panduan Eksport Aplikasi Android kikysay (APK / AAB)

Projek **kikysay** kini telah dikonfigurasikan sepenuhnya menggunakan **Capacitor** untuk membolehkan kompilasi dan eksport ke platform Android sebagai fail **APK** (pemasangan terus pada peranti Android) atau **AAB** (Android App Bundle untuk Google Play Store).

---

## 1. Fail Konfigurasi yang Telah Disediakan

- **`capacitor.config.ts`**:
  - `appId`: `com.kikysay.app`
  - `appName`: `kikysay`
  - `webDir`: `dist`
  - `androidScheme`: `https` (memastikan akses mikrofon dan audio berfungsi lancar tanpa sekatan keselamatan)
  - Konfigurasi skrin percikan (*Splash Screen*) bertema warna kuning ceria `#FEF3C7`.

- **`android/app/src/main/AndroidManifest.xml`**:
  Telah ditambah kebenaran mikrofon & audio perkakasan penting:
  ```xml
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.RECORD_AUDIO" />
  <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
  <uses-feature android:name="android.hardware.microphone" android:required="false" />
  ```

- **Perintah Baharu dalam `package.json`**:
  - `npm run build`: Kompilasi kod web Vite ke folder `dist`
  - `npm run cap:sync`: Segerakkan kod web terkini ke dalam projek Android
  - `npm run cap:open`: Membuka projek secara automatik di Android Studio
  - `npm run build:android`: Kompilasi kod web dan segerak ke Android dalam satu arahan

---

## 2. Cara Menjana Fail APK / AAB

### Kaedah 1: Menggunakan Android Studio (Paling Mudah)

1. Pastikan perisian **Android Studio** telah dipasang di komputer anda.
2. Jalankan arahan berikut di terminal projek:
   ```bash
   npm run cap:open
   ```
   *(Atau buka Android Studio, pilih **Open**, dan pilih folder `android` dalam projek ini).*
3. Tunggu sehingga Gradle selesai menyegerakkan fail (*Gradle Sync*).
4. **Untuk menjana fail APK Debug (untuk uji terus di telefon):**
   - Di menu atas Android Studio, tekan:
     **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - Setelah selesai, tekan butang **locate** pada notifikasi di sudut kanan bawah. Fail APK berada di:
     `android/app/build/outputs/apk/debug/app-debug.apk`
5. **Untuk menjana fail APK Release atau AAB (untuk Google Play Store):**
   - Di menu atas Android Studio, tekan:
     **Build > Generate Signed Bundle / APK**
   - Pilih sama ada **Android App Bundle (.aab)** atau **APK (.apk)**.
   - Pilih fail kunci keselamatan (*Keystore*) anda dan tekan **Finish**.

---

### Kaedah 2: Menjana APK Terus Melalui Command Line / Terminal

Jika anda mempunyai Android SDK / Gradle dipasang, anda boleh membina APK tanpa membuka UI Android Studio:

**Pada Windows:**
```bash
npm run build
npx cap sync android
cd android
gradlew.bat assembleDebug
```

**Pada macOS / Linux:**
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

Fail APK yang dihasilkan akan berada di:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 3. Langkah Menguji Pada Telefon Pintar Android

1. Salin fail `app-debug.apk` ke telefon pintar anda (melalui kabel USB, WhatsApp, Telegram, atau Google Drive).
2. Buka fail tersebut pada telefon anda dan tekan **Pasang (Install)**.
   *(Jika telefon meminta kebenaran "Install unknown apps", pilih benarkan).*
3. Buka aplikasi **kikysay** dan benarkan akses mikrofon apabila ditanya untuk mula belajar menyebut perkataan!

# Movies Searching App / Receipt Scanner

Receipt Scanner / Movie Searching App is a React Native application that uses an LLM (Gemini API) to process receipts. The app can capture receipt images, extract key information such as vendor, date, and more. It also offers movie searching capabilities via the TMD API.

---

##  Get Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app

```bash
npx run start
```

On running the command, you'll find options to open the app in:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

Start developing by editing the files inside the **app** directory.

---

##  Features & Tech Stack

- **Gemini 2.0 Experimental API** for AI receipt processing  
- **AsyncStorage** for storing receipts locally  
- **.env file required:** store your Gemini API key as `API_KEY`  
- You can rename `API_KEY` and `API_KEY_MOVIES` by updating both the import in `CameraComponent` and the `const GEMINI_API_KEY` 
- **EventEmitter** to notify modules (e.g., receipt screen) when there’s a new receipt saved from the camera component
- **MaterialIcons** for polished icons and a clean UI
- **TMD API key** for searching and fetching movies
- **FlatList** for optimized fetching and performance with movies

---

## Notes

- Ensure you have your API keys (Gemini & TMD) set up in your `.env` file.
- Explore and edit code in the `app` directory to start building!

---

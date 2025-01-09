// Open IndexedDB
const dbName = "quizDB";
const storeName = "scores";

let db;

export function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = () => {
      db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

// Save the student's score to IndexedDB
export function saveScoreToIndexedDB(student, score) {
  openDatabase().then((db) => {
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const scoreData = {
      name: student.name,
      class: student.class,
      score: score,
      date: new Date().toISOString(),
    };

    store.add(scoreData);

    transaction.oncomplete = () => {
      console.log("Score saved to IndexedDB");
    };

    transaction.onerror = () => {
      console.error("Failed to save score to IndexedDB");
    };
  });
}

// Fetch all scores from IndexedDB
export function fetchScoresFromIndexedDB() {
  return new Promise((resolve, reject) => {
    openDatabase().then((db) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject("Failed to fetch scores from IndexedDB");
      };
    });
  });
}

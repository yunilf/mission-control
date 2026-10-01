import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBroPCNks5fvkDQopAVp1S5mlVw48Ro-0U",
  authDomain: "yunai-missioncontrol.firebaseapp.com",
  projectId: "yunai-missioncontrol",
  storageBucket: "yunai-missioncontrol.firebasestorage.app",
  messagingSenderId: "349121157859",
  appId: "1:349121157859:web:2bed4d34ba41cbe64e43d6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clean() {
  console.log("Cleaning agents...");
  const agentsSnap = await getDocs(collection(db, "agents"));
  for (const d of agentsSnap.docs) {
    await deleteDoc(doc(db, "agents", d.id));
  }

  console.log("Cleaning activity_logs...");
  const logsSnap = await getDocs(collection(db, "activity_logs"));
  for (const d of logsSnap.docs) {
    await deleteDoc(doc(db, "activity_logs", d.id));
  }

  console.log("Resetting metrics...");
  await setDoc(doc(db, "metrics", "global"), {
    tasksCompleted: 0,
    computeTokens: "0",
    criticalAlerts: 0
  });

  console.log("Done!");
  process.exit(0);
}

clean().catch(console.error);

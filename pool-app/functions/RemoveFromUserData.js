import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const RemoveFromUserData = async (userId, DatabaseId, RemoveValueId) => {
  try {
    console.log(userId, DatabaseId, RemoveValueId);
    const userRef = await getDoc(doc(db, "users", userId));

    // Only call arrayRemove if id is not null or undefined
    await updateDoc(userRef, {
      DatabaseId: arrayRemove(RemoveValueId),
    });

    console.log(`Deleted ${DatabaseId} with ID: ${RemoveValueId}`);
  } catch {
    console.error("Error removing from data");
  }
};

export { RemoveFromUserData };
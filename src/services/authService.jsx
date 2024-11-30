import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { setUser, clearUser } from '../redux/userSlice'
import { useDispatch } from 'react-redux';
import { auth, db } from "./firebase";

// Firebase authentication state listener (optional - can be added globally in your App component)
// This function listens for changes in the authentication state. It triggers whenever the user's login state changes (e.g., logged in or logged out).
export const useAuthStateChanged = () => {
  const dispatch = useDispatch();

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is logged in, fetch user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        dispatch(setUser(userDoc.data())); // Dispatch user data to Redux
      }
    } else {
      // No user is logged in, clear user data from Redux
      dispatch(clearUser());
    }
  });
};

// Sign-Up User
export const signupUser = async (email, password, role, familyId = null) => {

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const userId = userCredential.user.uid;

  // Default familyId to userId if Parent role
  const userDoc = {
    email,
    role,
    familyId: familyId || userId,
    userId,
  };

  // Add user data to Firestore
  await setDoc(doc(db, "users", userId), userDoc);

/* 
  While you can dispatch immediately after signup, it's generally a better practice to fetch 
  the user's data from Firestore after the login process and then dispatch that data to Redux. 
  This ensures you have all the data from Firestore before updating the Redux store, which helps 
  maintain data consistency and avoids issues with incomplete or missing data.
*/
 // dispatch(setUser(userDoc));

  // Return userDoc to use in components
  return userDoc;
};

// Login User
export const loginUser = async (email, password, dispatch) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  // Fetch user metadata from Firestore
  const userId = userCredential.user.uid;
  const userDocRef = doc(db, "users", userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error("User data not found.");
  }

  const userData = userDoc.data();

  // Dispatch user data to Redux after successful login
  dispatch(setUser(userData));

  return userData;
};

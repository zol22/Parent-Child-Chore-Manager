import { db } from './firebase';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';

// Add Firestore query functions here
export const getChildrenForParent = async (parentId) => {
    const parentDocRef = doc(db, "users", parentId);
    const parentDoc = await getDoc(parentDocRef);
  
    if (parentDoc.exists()) {
      const parentData = parentDoc.data();
      const familyId = parentData.familyId;
  
      // Query for children of the same family
      const childrenQuery = query(
        collection(db, "users"),
        where("familyId", "==", familyId),
        where("role", "==", "child")
      );
  
      const querySnapshot = await getDocs(childrenQuery);
      const children = querySnapshot.docs.map(doc => doc.data());
      return children;
    } else {
      console.log("Parent not found");
    }
  };
  

export const getParentOfChild = async (childId) => {
  const childDocRef = doc(db, 'users', childId);
  const childDoc = await getDoc(childDocRef);

  if (childDoc.exists()) {
    const { familyId } = childDoc.data();
    const parentDocRef = doc(db, 'users', familyId);
    const parentDoc = await getDoc(parentDocRef);

    if (parentDoc.exists()) {
      return parentDoc.data();
    }
    else {
        console.log("Parent not found");
      }
  }
  else {
    console.log("Child not found");
  }
};

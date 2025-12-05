// Firebase Configuration
// TODO: Replace with your Firebase project credentials
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (will be uncommented when Firebase SDK is installed)
// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);

// For now, use localStorage as mock database
export const db = {
  // Mock Firestore methods
  collection: (name) => ({
    get: () => Promise.resolve({ docs: JSON.parse(localStorage.getItem(name) || '[]').map(doc => ({ id: doc.id, data: () => doc })) }),
    add: (data) => {
      const items = JSON.parse(localStorage.getItem(name) || '[]');
      const newItem = { ...data, id: Date.now().toString() };
      items.push(newItem);
      localStorage.setItem(name, JSON.stringify(items));
      return Promise.resolve({ id: newItem.id });
    },
    doc: (id) => ({
      get: () => {
        const items = JSON.parse(localStorage.getItem(name) || '[]');
        const item = items.find(i => i.id === id);
        return Promise.resolve({ exists: !!item, id: item?.id, data: () => item });
      },
      set: (data) => {
        const items = JSON.parse(localStorage.getItem(name) || '[]');
        const index = items.findIndex(i => i.id === id);
        if (index >= 0) {
          items[index] = { ...data, id };
        } else {
          items.push({ ...data, id });
        }
        localStorage.setItem(name, JSON.stringify(items));
        return Promise.resolve();
      },
      update: (data) => {
        const items = JSON.parse(localStorage.getItem(name) || '[]');
        const index = items.findIndex(i => i.id === id);
        if (index >= 0) {
          items[index] = { ...items[index], ...data };
          localStorage.setItem(name, JSON.stringify(items));
        }
        return Promise.resolve();
      },
      delete: () => {
        const items = JSON.parse(localStorage.getItem(name) || '[]');
        const filtered = items.filter(i => i.id !== id);
        localStorage.setItem(name, JSON.stringify(filtered));
        return Promise.resolve();
      }
    }),
    where: (field, operator, value) => {
      const items = JSON.parse(localStorage.getItem(name) || '[]');
      let filtered = items;
      
      // Apply first filter
      if (operator === '==') {
        filtered = items.filter(i => i[field] === value);
      } else if (operator === '!=') {
        filtered = items.filter(i => i[field] !== value);
      } else if (operator === '>') {
        filtered = items.filter(i => i[field] > value);
      } else if (operator === '<') {
        filtered = items.filter(i => i[field] < value);
      } else if (operator === '>=') {
        filtered = items.filter(i => i[field] >= value);
      } else if (operator === '<=') {
        filtered = items.filter(i => i[field] <= value);
      }
      
      return {
        // Support chaining multiple where clauses
        where: (field2, operator2, value2) => {
          if (operator2 === '==') {
            filtered = filtered.filter(i => i[field2] === value2);
          } else if (operator2 === '!=') {
            filtered = filtered.filter(i => i[field2] !== value2);
          } else if (operator2 === '>') {
            filtered = filtered.filter(i => i[field2] > value2);
          } else if (operator2 === '<') {
            filtered = filtered.filter(i => i[field2] < value2);
          } else if (operator2 === '>=') {
            filtered = filtered.filter(i => i[field2] >= value2);
          } else if (operator2 === '<=') {
            filtered = filtered.filter(i => i[field2] <= value2);
          }
          
          return {
            get: () => {
              return Promise.resolve({ 
                docs: filtered.map(doc => ({ 
                  id: doc.id, 
                  data: () => doc 
                })) 
              });
            },
            // Support more chaining if needed
            where: (field3, operator3, value3) => {
              if (operator3 === '==') {
                filtered = filtered.filter(i => i[field3] === value3);
              }
              return {
                get: () => {
                  return Promise.resolve({ 
                    docs: filtered.map(doc => ({ 
                      id: doc.id, 
                      data: () => doc 
                    })) 
                  });
                }
              };
            }
          };
        },
        get: () => {
          return Promise.resolve({ 
            docs: filtered.map(doc => ({ 
              id: doc.id, 
              data: () => doc 
            })) 
          });
        }
      };
    }
  })
};

export default firebaseConfig;

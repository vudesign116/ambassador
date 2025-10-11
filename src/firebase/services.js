import { db } from './config';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';

// Collection names
const USERS_COLLECTION = 'users';
const SCORES_COLLECTION = 'scores';

// User service
export const userService = {
  // Kiểm tra user tồn tại bằng số điện thoại
  async checkUserExists(phoneNumber) {
    try {
      const q = query(
        collection(db, USERS_COLLECTION), 
        where('phoneNumber', '==', phoneNumber)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking user:', error);
      return false;
    }
  },

  // Lấy thông tin user
  async getUser(phoneNumber) {
    try {
      const q = query(
        collection(db, USERS_COLLECTION), 
        where('phoneNumber', '==', phoneNumber)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Tạo user mới
  async createUser(userData) {
    try {
      const userRef = doc(collection(db, USERS_COLLECTION));
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return userRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Cập nhật thông tin user
  async updateUser(userId, updateData) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};

// Score service
export const scoreService = {
  // Lấy điểm của user
  async getUserScore(userId) {
    try {
      const scoreRef = doc(db, SCORES_COLLECTION, userId);
      const scoreDoc = await getDoc(scoreRef);
      
      if (scoreDoc.exists()) {
        return scoreDoc.data();
      }
      
      // Tạo record điểm mới nếu chưa có
      const initialScore = {
        userId,
        totalScore: 0,
        weeklyScore: 0,
        monthlyScore: 0,
        quarterlyScore: 0,
        lastUpdated: new Date(),
        activities: []
      };
      
      await setDoc(scoreRef, initialScore);
      return initialScore;
    } catch (error) {
      console.error('Error getting user score:', error);
      return null;
    }
  },

  // Cập nhật điểm
  async updateScore(userId, scoreData) {
    try {
      const scoreRef = doc(db, SCORES_COLLECTION, userId);
      await updateDoc(scoreRef, {
        ...scoreData,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error updating score:', error);
      throw error;
    }
  },

  // Thêm hoạt động và cộng điểm
  async addActivity(userId, activity) {
    try {
      const scoreData = await this.getUserScore(userId);
      if (!scoreData) return;

      const updatedActivities = [...(scoreData.activities || []), {
        ...activity,
        timestamp: new Date()
      }];

      const newTotalScore = scoreData.totalScore + activity.points;

      await this.updateScore(userId, {
        totalScore: newTotalScore,
        activities: updatedActivities
      });

      return newTotalScore;
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  }
};

// Auth service
export const authService = {
  // Đăng nhập bằng số điện thoại
  async loginWithPhone(phoneNumber) {
    try {
      const userExists = await userService.checkUserExists(phoneNumber);
      
      if (!userExists) {
        throw new Error('Số điện thoại không tồn tại trong hệ thống');
      }

      const user = await userService.getUser(phoneNumber);
      return user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Đăng ký user mới
  async registerUser(userData) {
    try {
      const userExists = await userService.checkUserExists(userData.phoneNumber);
      
      if (userExists) {
        throw new Error('Số điện thoại đã được đăng ký');
      }

      const userId = await userService.createUser(userData);
      
      // Tạo điểm ban đầu cho user mới
      await scoreService.getUserScore(userId);
      
      return userId;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
};
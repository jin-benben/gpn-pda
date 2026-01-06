import * as SecureStore from 'expo-secure-store';

export interface User {
  userName: string;
  userId: string;
  whsCode:string;
  token:string;
}
export function getLocalUserInfo() { 
  const userString = SecureStore.getItem("user");
  if(userString){
    try {
      const userInfo = JSON.parse(userString);
      return userInfo as User
    } catch (error) {
      console.error('Error parsing user info:', error);
      return null;
    }
  }
  return null;
}

export function setLocalUserInfo(userInfo: User) { 
  SecureStore.setItem("user", JSON.stringify(userInfo));
}

export function removeLocalUserInfo() { 
  SecureStore.deleteItemAsync("user");
}
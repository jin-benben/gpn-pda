import axios, { AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { router } from "expo-router";
import { getLocalUserInfo } from './util';
import Toast from 'react-native-toast-message';

// 扩展 Axios 配置类型
export interface CustomRequestConfig extends AxiosRequestConfig {
  silent?: boolean; // 新增配置项，控制是否显示错误
}

const request = axios.create({
  baseURL: Constants.expoConfig?.extra?.api_url,
});

request.interceptors.request.use((config) => {
  const userInfo:any = getLocalUserInfo()
  if (userInfo?.token) {
    config.headers?.set('Authorization-Token', userInfo.token);
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    if (response.data.status === 200) {
      return response.data.data;
    }
    if (response.data.status === 401) {
      router.replace('/login');
      return Promise.reject("登录已过期");
    }
    Toast.show({
      type: "default",
      text1: response.data.message,
      visibilityTime: 3000,
    });
    return Promise.reject(new Error(response.data.message));
  },
  (error) => {
    Toast.show({
      type: "default",
      text1: error.message,
      visibilityTime: 3000,
    });
    return Promise.reject(error);
  },
);

export default request;




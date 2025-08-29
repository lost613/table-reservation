import { useNavigate } from '@solidjs/router';

let _navigate: ReturnType<typeof useNavigate> | null = null;

// 导航辅助函数
export const navigate = (path: string) => {
  if (!_navigate) {
    throw new Error('Navigation function not initialized. Make sure you are using this inside a Router component.');
  }
  _navigate(path);
};

// 初始化导航函数
export const initializeNavigation = (nav: ReturnType<typeof useNavigate>) => {
  _navigate = nav;
};

// 页面保护函数
export const requireAuth = () => {
  if (!localStorage.getItem('access_token')) {
    navigate('/');
    return false;
  }
  return true;
};

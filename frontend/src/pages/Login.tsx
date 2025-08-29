import { Component, createSignal, onMount } from 'solid-js';
import styles from '../App.module.css';
import { login, register, sendVerificationCode } from '../services/api';
import { navigate, initializeNavigation } from '../utils/navigation';
import { useNavigate } from '@solidjs/router';
import { jwtDecode } from 'jwt-decode';
import { showToast } from '../utils/toast';

const LoginPage: Component = () => {
  const navigateHook = useNavigate();

  onMount(() => {
    initializeNavigation(navigateHook);
    
    // 检查是否已有有效的access_token
    checkExistingToken();
  });

  // 检查现有token是否有效
  const checkExistingToken = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000; // 转换为秒
        
        // 检查token是否未过期
        if (decoded.exp && decoded.exp > currentTime) {
          // token有效，自动跳转到reservation页面
          console.log('Token valid, redirecting to reservation page');
          navigate('/reservation');
          return;
        } else {
          // token已过期，清除本地存储
          console.log('Token expired, removing from localStorage');
          localStorage.removeItem('access_token');
        }
      } catch (error) {
        // token无效，清除本地存储
        console.error('Invalid token:', error);
        localStorage.removeItem('access_token');
      }
    }
  };

  const [isLogin, setIsLogin] = createSignal(true);
  const [loginPhone, setLoginPhone] = createSignal('');
  const [loginCode, setLoginCode] = createSignal('');
  const [loginCountdown, setLoginCountdown] = createSignal(0);
  
  const [registerPhone, setRegisterPhone] = createSignal('');
  const [registerCode, setRegisterCode] = createSignal('');
  const [registerCountdown, setRegisterCountdown] = createSignal(0);
  const [registerName, setRegisterName] = createSignal('');
  const [registerGender, setRegisterGender] = createSignal<'M' | 'F' | ''>('');
  const [registerEmail, setRegisterEmail] = createSignal('');
  
  const handleSendCode = async (
    phone: string, 
    setCountdownFn: (value: number | ((prev: number) => number)) => void,
    type: 'login' | 'register'
  ) => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showToast('请输入正确的手机号', 'error');
      return;
    }

    try {
      const response = await sendVerificationCode(phone, type);
      
      // 自动填入验证码
      if (type === 'login') {
        setLoginCode(response.code);
      } else {
        setRegisterCode(response.code);
      }
      
      showToast('验证码已发送', 'success');
      
      setCountdownFn(60);
      const timer = setInterval(() => {
        setCountdownFn((prev: number) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '发送验证码失败', 'error');
    }
  };

  const handleLogin = async () => {
    if (!/^1[3-9]\d{9}$/.test(loginPhone())) {
      showToast('请输入正确的手机号', 'error');
      return;
    }
    if (!/^\d{6}$/.test(loginCode())) {
      showToast('请输入6位验证码', 'error');
      return;
    }

    try {
      const response = await login({
        phone: loginPhone(),
        code: loginCode()
      });
      
      // 保存 token 到本地存储，用于后续 API 调用的 JWT 认证
      localStorage.setItem('access_token', response.access_token);
      
      // 登录成功后跳转到预订列表页
      showToast('登录成功', 'success');
      setTimeout(() => navigate('/reservation'), 1000);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '登录失败', 'error');
    }
  };

  const handleRegister = async () => {
    if (!registerName().trim()) {
      showToast('请输入姓名', 'error');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(registerPhone())) {
      showToast('请输入正确的手机号', 'error');
      return;
    }
    if (!/^\d{6}$/.test(registerCode())) {
      showToast('请输入6位验证码', 'error');
      return;
    }
    if (registerEmail().trim() && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(registerEmail())) {
      showToast('请输入正确的邮箱地址（如果填写）', 'error');
      return;
    }

    try {
      const registerData = {
        name: registerName(),
        phone: registerPhone(),
        code: registerCode(),
        gender: registerGender() || undefined,
        email: registerEmail().trim() || undefined
      };

      const response = await register(registerData);
      
      // 保存 token 到本地存储，用于后续 API 调用的 JWT 认证
      localStorage.setItem('access_token', response.access_token);
      
      // 注册成功后跳转到预订列表页
      showToast('注册成功', 'success');
      setTimeout(() => navigate('/reservation'), 1000);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '注册失败', 'error');
    }
  };

  return (
    <div class={styles.loginContainer}>
      {/* 品牌头部 */}
      <div class={styles.brandHeader}>
        <div class={styles.brandLogo}>餐厅预订</div>
        <div class={styles.systemTitle}>预订系统</div>
      </div>

      <div class={styles.tabContainer}>
        <button 
          class={`${styles.tabButton} ${isLogin() ? styles.activeTab : ''}`}
          onClick={() => setIsLogin(true)}
        >
          登录
        </button>
        <button 
          class={`${styles.tabButton} ${!isLogin() ? styles.activeTab : ''}`}
          onClick={() => setIsLogin(false)}
        >
          注册
        </button>
      </div>

      {isLogin() ? (
        <div class={styles.formContainer}>
          {/* <h2>登录</h2> */}
          <div class={styles.inputGroup}>
            <input
              type="tel"
              placeholder="手机号码"
              value={loginPhone()}
              onInput={(e) => setLoginPhone(e.currentTarget.value)}
            />
          </div>
          <div class={styles.inputGroup}>
            <input
              type="text"
              placeholder="验证码"
              value={loginCode()}
              onInput={(e) => setLoginCode(e.currentTarget.value)}
            />
            <button 
              onClick={() => handleSendCode(loginPhone(), setLoginCountdown, 'login')}
              disabled={loginCountdown() > 0}
            >
              {loginCountdown() > 0 ? `${loginCountdown()}s` : '获取验证码'}
            </button>
          </div>
          <button class={styles.submitButton} onClick={handleLogin}>
            登录
          </button>
        </div>
      ) : (
        <div class={styles.formContainer}>
          {/* <h2>注册</h2> */}
          <div class={styles.inputGroup}>
            <input
              type="text"
              placeholder="姓名"
              value={registerName()}
              onInput={(e) => setRegisterName(e.currentTarget.value)}
            />
          </div>
          <div class={styles.inputGroup}>
            <input
              type="tel"
              placeholder="手机号码"
              value={registerPhone()}
              onInput={(e) => setRegisterPhone(e.currentTarget.value)}
            />
          </div>
          <div class={styles.inputGroup}>
            <input
              type="text"
              placeholder="验证码"
              value={registerCode()}
              onInput={(e) => setRegisterCode(e.currentTarget.value)}
            />
            <button 
              onClick={() => handleSendCode(registerPhone(), setRegisterCountdown, 'register')}
              disabled={registerCountdown() > 0}
            >
              {registerCountdown() > 0 ? `${registerCountdown()}s` : '获取验证码'}
            </button>
          </div>
          <div class={styles.genderGroup}>
            <label>性别（可选）</label>
            <div class={styles.genderOptions}>
              <label class={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  checked={registerGender() === 'M'}
                  onChange={() => setRegisterGender('M')}
                />
                <span>男士</span>
              </label>
              <label class={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  checked={registerGender() === 'F'}
                  onChange={() => setRegisterGender('F')}
                />
                <span>女士</span>
              </label>
              <label class={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  checked={registerGender() === ''}
                  onChange={() => setRegisterGender('')}
                />
                <span>不愿透露</span>
              </label>
            </div>
          </div>
          <div class={styles.inputGroup}>
            <input
              type="email"
              placeholder="邮箱地址（选填）"
              value={registerEmail()}
              onInput={(e) => setRegisterEmail(e.currentTarget.value)}
            />
          </div>
          <button class={styles.submitButton} onClick={handleRegister}>
            注册
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

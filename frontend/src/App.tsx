import { Component, createSignal } from 'solid-js';
import styles from './App.module.css';
import { login, register, sendVerificationCode } from './services/api';

const App: Component = () => {
  const [isLogin, setIsLogin] = createSignal(true);
  const [loginPhone, setLoginPhone] = createSignal('');
  const [loginCode, setLoginCode] = createSignal('');
  const [loginCountdown, setLoginCountdown] = createSignal(0);
  
  const [registerPhone, setRegisterPhone] = createSignal('');
  const [registerCode, setRegisterCode] = createSignal('');
  const [registerCountdown, setRegisterCountdown] = createSignal(0);
  const [registerName, setRegisterName] = createSignal('');
  const [registerGender, setRegisterGender] = createSignal<'male' | 'female' | ''>('');
  const [registerEmail, setRegisterEmail] = createSignal('');
  
  const handleSendCode = async (
    phone: string, 
    setCountdownFn: (value: number | ((prev: number) => number)) => void,
    type: 'login' | 'register'
  ) => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }

    try {
      await sendVerificationCode(phone, type);
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
      alert(error instanceof Error ? error.message : '发送验证码失败');
    }
  };

  const handleLogin = async () => {
    if (!/^1[3-9]\d{9}$/.test(loginPhone())) {
      alert('请输入正确的手机号');
      return;
    }
    if (!/^\d{6}$/.test(loginCode())) {
      alert('请输入6位验证码');
      return;
    }

    try {
      const response = await login({
        phone: loginPhone(),
        code: loginCode()
      });
      
      // 保存 token 到本地存储
      localStorage.setItem('token', response.data.token);
      
      // 登录成功后的处理，比如跳转到主页
      alert('登录成功');
      // TODO: 跳转到主页
    } catch (error) {
      alert(error instanceof Error ? error.message : '登录失败');
    }
  };

  const handleRegister = async () => {
    if (!registerName().trim()) {
      alert('请输入姓名');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(registerPhone())) {
      alert('请输入正确的手机号');
      return;
    }
    if (!/^\d{6}$/.test(registerCode())) {
      alert('请输入6位验证码');
      return;
    }
    if (registerEmail().trim() && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(registerEmail())) {
      alert('请输入正确的邮箱地址（如果填写）');
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
      
      // 保存 token 到本地存储
      localStorage.setItem('token', response.data.token);
      
      // 注册成功后的处理，比如跳转到主页
      alert('注册成功');
      // TODO: 跳转到主页
    } catch (error) {
      alert(error instanceof Error ? error.message : '注册失败');
    }
  };

  return (
    <div class={styles.App}>
      <div class={styles.loginContainer}>
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
            <h2>登录</h2>
            <div class={styles.inputGroup}>
              <input
                type="tel"
                placeholder="请输入手机号"
                value={loginPhone()}
                onInput={(e) => setLoginPhone(e.currentTarget.value)}
              />
            </div>
            <div class={styles.inputGroup}>
              <input
                type="text"
                placeholder="请输入验证码"
                value={loginCode()}
                onInput={(e) => setLoginCode(e.currentTarget.value)}
              />
              <button 
                onClick={() => handleSendCode(loginPhone(), setLoginCountdown, 'login')}
                disabled={loginCountdown() > 0}
              >
                {loginCountdown() > 0 ? `${loginCountdown()}秒后重发` : '发送验证码'}
              </button>
            </div>
            <button class={styles.submitButton} onClick={handleLogin}>
              登录
            </button>
          </div>
        ) : (
          <div class={styles.formContainer}>
            <h2>注册</h2>
            <div class={styles.inputGroup}>
              <input
                type="text"
                placeholder="请输入姓名"
                value={registerName()}
                onInput={(e) => setRegisterName(e.currentTarget.value)}
              />
            </div>
            <div class={styles.inputGroup}>
              <input
                type="tel"
                placeholder="请输入手机号"
                value={registerPhone()}
                onInput={(e) => setRegisterPhone(e.currentTarget.value)}
              />
            </div>
            <div class={styles.inputGroup}>
              <input
                type="text"
                placeholder="请输入验证码"
                value={registerCode()}
                onInput={(e) => setRegisterCode(e.currentTarget.value)}
              />
              <button 
                onClick={() => handleSendCode(registerPhone(), setRegisterCountdown, 'register')}
                disabled={registerCountdown() > 0}
              >
                {registerCountdown() > 0 ? `${registerCountdown()}秒后重发` : '发送验证码'}
              </button>
            </div>
            <div class={styles.genderGroup}>
              <label>性别（可选）：</label>
              <label class={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  checked={registerGender() === 'male'}
                  onChange={() => setRegisterGender('male')}
                />
                男
              </label>
              <label class={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  checked={registerGender() === 'female'}
                  onChange={() => setRegisterGender('female')}
                />
                女
              </label>
              <label class={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  checked={registerGender() === ''}
                  onChange={() => setRegisterGender('')}
                />
                不愿透露
              </label>
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
    </div>
  );
};

export default App;

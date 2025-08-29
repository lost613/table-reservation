interface LoginParams {
  phone: string;
  code: string;
}

interface RegisterParams {
  name: string;
  phone: string;
  code: string;
  gender?: 'male' | 'female' | '';
  email?: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 基础 API URL - 使用环境变量
const BASE_URL = import.meta.env.VITE_API_URL;

// 统一处理请求
async function request<T>(url: string, options: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function login(params: LoginParams) {
  return request<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function register(params: RegisterParams) {
  return request<{ token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function sendVerificationCode(phone: string, type: 'login' | 'register') {
  return request<{ expired: number }>('/auth/send-code', {
    method: 'POST',
    body: JSON.stringify({ phone, type }),
  });
}

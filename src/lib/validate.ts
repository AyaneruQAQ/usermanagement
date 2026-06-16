export function validatePhone(phone: unknown): string | null {
  if (typeof phone !== 'string' || !phone.trim()) {
    return '手机号不能为空';
  }
  if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
    return '手机号格式不正确';
  }
  return null;
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== 'string' || !password) {
    return '密码不能为空';
  }
  if (password.length < 6) {
    return '密码长度不能少于6位';
  }
  return null;
}

export function validateDuration(duration: unknown): string | null {
  if (typeof duration !== 'number' || !Number.isInteger(duration) || duration < 0) {
    return '订阅时长必须为非负整数';
  }
  return null;
}

export function validateExpireDate(date: unknown): string | null {
  if (typeof date !== 'string' || !date.trim()) {
    return '到期时间不能为空';
  }
  if (isNaN(Date.parse(date))) {
    return '到期时间格式不正确';
  }
  return null;
}

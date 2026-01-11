import Big from 'big.js';
class MyMath {
  /**
   * 静态方法add用于计算两个数字的和 a+b
   */
  static add(a: number, b: number) {
    a = a || 0;
    b = b || 0;
    const c = new Big(a);
    return c.plus(b).toNumber();
  }
  /**
   * 静态方法minus用于计算两个数字的差 a-b
   */
  static minus(a: number, b: number) {
    a = a || 0;
    b = b || 0;
    const c = new Big(a);
    return c.minus(b).toNumber();
  }
   /**
   * 静态方法times用于计算两个数字的乘积 a*b
   */
  static times(a: number, b: number) {
    a = a || 0;
    b = b || 0;
    const c = new Big(a);
    return c.times(b).toNumber();
  }

  /**
   * 静态方法div用于计算两个数字的除 a/b
   */
  static div(a: number, b: number) {
    a = a || 0;
    b = b || 0;
    if(b == 0){
      return 0;
    }
    const c = new Big(a);
    return c.div(b).toNumber();
  }
  
   /**
   * 静态方法toFixed用于保留小数点位数
   * a 为数据  b 为保留位数
   */
  static toFixed(a: number, n: number) {
    a = (isNaN(a) ? 0 : a) ?? 0;
    const c = new Big(a);
    return Number(c.toFixed(n));
  }
}

export default MyMath;
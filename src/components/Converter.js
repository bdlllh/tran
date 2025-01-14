import React, { useState, useCallback, useMemo } from 'react';
import { Copy } from 'lucide-react';

const Converter = () => {
  // 百家姓映射表保持不变
  const characterMap = useMemo(() => ({
    "赵": "0", "钱": "1", "孙": "2", "李": "3", "周": "4", "吴": "5",
    "郑": "6", "王": "7", "冯": "8", "陈": "9", "褚": "a", "卫": "b",
    "蒋": "c", "沈": "d", "韩": "e", "杨": "f", "朱": "g", "秦": "h",
    "尤": "i", "许": "j", "何": "k", "吕": "l", "施": "m", "张": "n",
    "孔": "o", "曹": "p", "严": "q", "华": "r", "金": "s", "魏": "t",
    "陶": "u", "姜": "v", "戚": "w", "谢": "x", "邹": "y", "喻": "z",
    "福": "A", "水": "B", "窦": "C", "章": "D", "云": "E", "苏": "F",
    "潘": "G", "葛": "H", "奚": "I", "范": "J", "彭": "K", "郎": "L",
    "鲁": "M", "韦": "N", "昌": "O", "马": "P", "苗": "Q", "凤": "R",
    "花": "S", "方": "T", "俞": "U", "任": "V", "袁": "W", "柳": "X",
    "唐": "Y", "罗": "Z", "薛": ".", "伍": "-", "余": "_", "米": "+",
    "贝": "=", "姚": "/", "孟": "?", "顾": "#", "尹": "%", "江": "&",
    "钟": "*", "竺": ":" // 包含了竺=>:的映射
  }), []);

  // 核心价值观数组
  const coreValues = useMemo(() => (
    ["富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治", "爱国", "敬业", "诚信", "友善"]
  ), []);

  // 生成随机布尔值
  const randBin = useCallback(() => Math.random() >= 0.5, []);

  // 字符串转UTF8十六进制
  const stringToHex = useCallback((str) => {
    const notEncoded = /[A-Za-z0-9\-\_\.\!\~\*\'\(\)]/g;
    const str1 = str.replace(notEncoded, c => c.charCodeAt(0).toString(16));
    const str2 = encodeURIComponent(str1);
    return str2.replace(/%/g, '').toUpperCase();
  }, []);

  // 十六进制转十二进制数组
  const hex2duo = useCallback((hexs) => {
    const duo = [];
    for(let c of hexs) {
      const n = parseInt(c, 16);
      if(n < 10) {
        duo.push(n);
      } else {
        if(randBin()) {
          duo.push(10);
          duo.push(n - 10);
        } else {
          duo.push(11);
          duo.push(n - 6);
        }
      }
    }
    return duo;
  }, [randBin]);

  // 十二进制数组转十六进制
  const duo2hex = useCallback((duo) => {
    const hex = [];
    let i = 0;
    while(i < duo.length) {
      if(duo[i] < 10) {
        hex.push(duo[i]);
      } else {
        if(duo[i] === 10) {
          i++;
          hex.push(duo[i] + 10);
        } else {
          i++;
          hex.push(duo[i] + 6);
        }
      }
      i++;
    }
    return hex.map(v => v.toString(16).toUpperCase()).join('');
  }, []);

  // 核心价值观编码
  const encodeToValues = useCallback((str) => {
    const hex = stringToHex(str);
    const duo = hex2duo(hex);
    return duo.map(d => coreValues[d]).join('');
  }, [stringToHex, hex2duo, coreValues]);

  // 核心价值观解码
  const decodeFromValues = useCallback((encoded) => {
    const duo = [];
    let current = '';
    
    for(let i = 0; i < encoded.length; i++) {
      current += encoded[i];
      const valueIndex = coreValues.indexOf(current);
      
      if(valueIndex !== -1) {
        const d = valueIndex;
        duo.push(d);
        current = '';
      } else if(current.length === 2) {
        if(!coreValues.some(value => value.startsWith(current))) {
          current = encoded[i];
        }
      }
    }

    const hex = duo2hex(duo);
    try {
      const hexPairs = hex.match(/.{2}/g) || [];
      const decoded = hexPairs.map(pair => '%' + pair).join('');
      return decodeURIComponent(decoded);
    } catch(e) {
      console.error('Decoding error:', e);
      return '';
    }
  }, [coreValues, duo2hex]);

  // 以下代码保持不变...
  const reverseCharacterMap = useMemo(() => 
    Object.fromEntries(Object.entries(characterMap).map(([key, value]) => [value, key]))
  , [characterMap]);

  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState({
    magnet: '',
    bjx: '',
    value: ''
  });
  const [inputType, setInputType] = useState('');

  // 检测输入类型
  const detectInputType = useCallback((text) => {
    if (!text) return '';
    if (text.startsWith('magnet:')) return 'magnet';
    if (/[\u4e00-\u9fa5]{2}/.test(text)) {
      for (const value of coreValues) {
        if (text.includes(value)) return 'value';
      }
      return 'names';
    }
    return '';
  }, [coreValues]);

  // 百家姓转磁力链接
  const bjx2mag = useCallback((text) => {
    const str = text.trim().split('');
    // 直接添加磁力链接头
    let result = 'magnet:?xt=urn:btih:';
    
    for (const char of str) {
      result += characterMap[char] || char;
    }
    
    return result;
  }, [characterMap]);

  // UI部分代码保持不变...
  
  return (
    // JSX部分保持不变...
  );
};

export default Converter;

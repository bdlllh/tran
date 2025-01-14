import React, { useState, useCallback, useMemo } from 'react';
import { Copy } from 'lucide-react';

const Converter = () => {
  // 状态定义
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState({
    magnet: '',
    bjx: '',
    value: ''
  });
  const [inputType, setInputType] = useState('');
  const [copyStatus, setCopyStatus] = useState({});

  // 百家姓映射表
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
    "钟": "*", "竺": ":"
  }), []);

  const reverseCharacterMap = useMemo(() => 
    Object.fromEntries(Object.entries(characterMap).map(([key, value]) => [value, key]))
  , [characterMap]);

  // 核心价值观数组
  const coreValues = useMemo(() => (
    ["富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治", "爱国", "敬业", "诚信", "友善"]
  ), []);

  // 工具函数
  const randBin = useCallback(() => Math.random() >= 0.5, []);

  const stringToHex = useCallback((str) => {
    const notEncoded = /[A-Za-z0-9\-\_\.\!\~\*\'\(\)]/g;
    const str1 = str.replace(notEncoded, c => c.charCodeAt(0).toString(16));
    const str2 = encodeURIComponent(str1);
    return str2.replace(/%/g, '').toUpperCase();
  }, []);

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

  // 核心价值观编码解码
  const encodeToValues = useCallback((str) => {
    const hex = stringToHex(str);
    const duo = hex2duo(hex);
    return duo.map(d => coreValues[d]).join('');
  }, [stringToHex, hex2duo, coreValues]);

  const decodeFromValues = useCallback((encoded) => {
    const duo = [];
    let current = '';
    
    for(let i = 0; i < encoded.length; i++) {
      current += encoded[i];
      const valueIndex = coreValues.indexOf(current);
      
      if(valueIndex !== -1) {
        duo.push(valueIndex);
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

  // 百家姓转换
  const bjx2mag = useCallback((text) => {
    const str = text.trim().split('');
    let result = 'magnet:?xt=urn:btih:';
    
    for (const char of str) {
      result += characterMap[char] || char;
    }
    
    return result;
  }, [characterMap]);

const mag2others = useCallback((text) => {
  // 使用正则表达式提取40位hash值
  const hashMatch = text.match(/urn:btih:([a-fA-F0-9]{40})/);
  const hash = hashMatch ? hashMatch[1] : '';
  let bjxResult = '';
  
  for (const char of hash) {
    bjxResult += reverseCharacterMap[char] || char;
  }
  
  const valueResult = encodeToValues(hash);
  return { bjx: bjxResult, value: valueResult };
}, [reverseCharacterMap, encodeToValues]);

  // 输入类型检测
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

  // 输入处理
  const handleInputChange = useCallback((e) => {
    const text = e.target.value;
    setInputText(text);
    const type = detectInputType(text);
    setInputType(type);
    
    if (!text) {
      setResults({ magnet: '', bjx: '', value: '' });
      return;
    }

    let newResults = { magnet: '', bjx: '', value: '' };

    try {
      if (type === 'magnet') {
        const converted = mag2others(text);
        newResults = {
          magnet: text,
          bjx: converted.bjx,
          value: converted.value
        };
      } else if (type === 'names') {
        const magnet = bjx2mag(text);
        const converted = mag2others(magnet);
        newResults = {
          magnet: magnet,
          bjx: text,
          value: converted.value
        };
      } else if (type === 'value') {
        const decoded = decodeFromValues(text);
        if (decoded) {
          const magnet = `magnet:?xt=urn:btih:${decoded}`;
          const converted = mag2others(magnet);
          newResults = {
            magnet: magnet,
            bjx: converted.bjx,
            value: text
          };
        }
      }
    } catch (error) {
      console.error('Conversion error:', error);
    }

    setResults(newResults);
  }, [detectInputType, mag2others, bjx2mag, decodeFromValues]);

  // 复制功能
  const handleCopy = useCallback((text, type) => {
    if (!text) return;
    
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    
    try {
      textArea.select();
      document.execCommand('copy');
      setCopyStatus(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('复制失败，请手动复制');
    } finally {
      document.body.removeChild(textArea);
    }
  }, []);

  // 结果区域组件
  const ResultSection = ({ title, content, type }) => {
    const copyWithFeedback = useCallback(() => {
      if (content) {
        handleCopy(content, type);
      }
    }, [content, type]);

    return (
      <div className="p-3 border rounded-lg bg-white relative group">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{title}</span>
          <button
            onClick={copyWithFeedback}
            className={`text-sm flex items-center gap-1 transition-colors ${
              copyStatus[type] 
                ? 'text-green-600' 
                : 'text-purple-600 hover:text-purple-700'
            }`}
            disabled={!content}
          >
            <Copy size={14} />
            {copyStatus[type] ? '已复制' : '复制'}
          </button>
        </div>
        <div className="break-all text-gray-600 min-h-[2rem]">
          {content || '等待输入...'}
        </div>
        {content && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 rounded-lg cursor-pointer"
            onClick={copyWithFeedback}
          />
        )}
      </div>
    );
  };

  // 渲染UI
  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
      {/* 输入区域 */}
      <div className="relative">
        <textarea
          className="w-full h-32 p-4 border rounded-lg resize-none"
          placeholder="请输入磁力链接、百家姓或核心价值观文字"
          value={inputText}
          onChange={handleInputChange}
        />
        <div className="absolute top-2 right-2 text-sm text-gray-500">
          {inputType === 'magnet' ? '磁力链接' : 
           inputType === 'names' ? '百家姓' :
           inputType === 'value' ? '核心价值观' : '等待输入'}
        </div>
      </div>

      {/* 转换结果区域 */}
      <div className="space-y-4">
        <ResultSection 
          title="磁力链接" 
          content={results.magnet} 
          type="magnet"
        />
        <ResultSection 
          title="百家姓" 
          content={results.bjx} 
          type="bjx"
        />
        <ResultSection 
          title="核心价值观" 
          content={results.value} 
          type="value"
        />
      </div>

      <p className="text-sm text-gray-500">
        小贴士：支持三种格式互转，系统会自动识别输入类型。每个结果都可以独立复制。
      </p>
    </div>
  );
};

export default Converter;

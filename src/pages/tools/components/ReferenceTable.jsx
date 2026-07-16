import React from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { useLang } from '../../../context/LanguageContext'
import ToggleGroup from './ui/ToggleGroup'

// ===================== 数据定义 =====================

// ASCII 表数据
const ASCII_TABLE = [
  { code: 0, char: 'NUL', description: 'Null', hex: '0x00', htmlEntity: '' },
  { code: 1, char: 'SOH', description: 'Start of Heading', hex: '0x01', htmlEntity: '' },
  { code: 2, char: 'STX', description: 'Start of Text', hex: '0x02', htmlEntity: '' },
  { code: 3, char: 'ETX', description: 'End of Text', hex: '0x03', htmlEntity: '' },
  { code: 4, char: 'EOT', description: 'End of Transmission', hex: '0x04', htmlEntity: '' },
  { code: 5, char: 'ENQ', description: 'Enquiry', hex: '0x05', htmlEntity: '' },
  { code: 6, char: 'ACK', description: 'Acknowledge', hex: '0x06', htmlEntity: '' },
  { code: 7, char: 'BEL', description: 'Bell', hex: '0x07', htmlEntity: '' },
  { code: 8, char: 'BS', description: 'Backspace', hex: '0x08', htmlEntity: '' },
  { code: 9, char: 'HT', description: 'Horizontal Tab', hex: '0x09', htmlEntity: '' },
  { code: 10, char: 'LF', description: 'Line Feed', hex: '0x0A', htmlEntity: '' },
  { code: 11, char: 'VT', description: 'Vertical Tab', hex: '0x0B', htmlEntity: '' },
  { code: 12, char: 'FF', description: 'Form Feed', hex: '0x0C', htmlEntity: '' },
  { code: 13, char: 'CR', description: 'Carriage Return', hex: '0x0D', htmlEntity: '' },
  { code: 14, char: 'SO', description: 'Shift Out', hex: '0x0E', htmlEntity: '' },
  { code: 15, char: 'SI', description: 'Shift In', hex: '0x0F', htmlEntity: '' },
  { code: 16, char: 'DLE', description: 'Data Link Escape', hex: '0x10', htmlEntity: '' },
  { code: 17, char: 'DC1', description: 'Device Control 1', hex: '0x11', htmlEntity: '' },
  { code: 18, char: 'DC2', description: 'Device Control 2', hex: '0x12', htmlEntity: '' },
  { code: 19, char: 'DC3', description: 'Device Control 3', hex: '0x13', htmlEntity: '' },
  { code: 20, char: 'DC4', description: 'Device Control 4', hex: '0x14', htmlEntity: '' },
  { code: 21, char: 'NAK', description: 'Negative Acknowledge', hex: '0x15', htmlEntity: '' },
  { code: 22, char: 'SYN', description: 'Synchronous Idle', hex: '0x16', htmlEntity: '' },
  { code: 23, char: 'ETB', description: 'End of Transmission Block', hex: '0x17', htmlEntity: '' },
  { code: 24, char: 'CAN', description: 'Cancel', hex: '0x18', htmlEntity: '' },
  { code: 25, char: 'EM', description: 'End of Medium', hex: '0x19', htmlEntity: '' },
  { code: 26, char: 'SUB', description: 'Substitute', hex: '0x1A', htmlEntity: '' },
  { code: 27, char: 'ESC', description: 'Escape', hex: '0x1B', htmlEntity: '' },
  { code: 28, char: 'FS', description: 'File Separator', hex: '0x1C', htmlEntity: '' },
  { code: 29, char: 'GS', description: 'Group Separator', hex: '0x1D', htmlEntity: '' },
  { code: 30, char: 'RS', description: 'Record Separator', hex: '0x1E', htmlEntity: '' },
  { code: 31, char: 'US', description: 'Unit Separator', hex: '0x1F', htmlEntity: '' },
  { code: 32, char: ' ', description: 'Space', hex: '0x20', htmlEntity: '' },
  { code: 33, char: '!', description: 'Exclamation', hex: '0x21', htmlEntity: '&#33;' },
  { code: 34, char: '"', description: 'Double Quote', hex: '0x22', htmlEntity: '&#34;' },
  { code: 35, char: '#', description: 'Hash', hex: '0x23', htmlEntity: '&#35;' },
  { code: 36, char: '$', description: 'Dollar', hex: '0x24', htmlEntity: '&#36;' },
  { code: 37, char: '%', description: 'Percent', hex: '0x25', htmlEntity: '&#37;' },
  { code: 38, char: '&', description: 'Ampersand', hex: '0x26', htmlEntity: '&#38;' },
  { code: 39, char: "'", description: 'Single Quote', hex: '0x27', htmlEntity: '&#39;' },
  { code: 40, char: '(', description: 'Left Parenthesis', hex: '0x28', htmlEntity: '&#40;' },
  { code: 41, char: ')', description: 'Right Parenthesis', hex: '0x29', htmlEntity: '&#41;' },
  { code: 42, char: '*', description: 'Asterisk', hex: '0x2A', htmlEntity: '&#42;' },
  { code: 43, char: '+', description: 'Plus', hex: '0x2B', htmlEntity: '&#43;' },
  { code: 44, char: ',', description: 'Comma', hex: '0x2C', htmlEntity: '&#44;' },
  { code: 45, char: '-', description: 'Hyphen', hex: '0x2D', htmlEntity: '&#45;' },
  { code: 46, char: '.', description: 'Period', hex: '0x2E', htmlEntity: '&#46;' },
  { code: 47, char: '/', description: 'Slash', hex: '0x2F', htmlEntity: '&#47;' },
  { code: 48, char: '0', description: 'Digit 0', hex: '0x30', htmlEntity: '&#48;' },
  { code: 49, char: '1', description: 'Digit 1', hex: '0x31', htmlEntity: '&#49;' },
  { code: 50, char: '2', description: 'Digit 2', hex: '0x32', htmlEntity: '&#50;' },
  { code: 51, char: '3', description: 'Digit 3', hex: '0x33', htmlEntity: '&#51;' },
  { code: 52, char: '4', description: 'Digit 4', hex: '0x34', htmlEntity: '&#52;' },
  { code: 53, char: '5', description: 'Digit 5', hex: '0x35', htmlEntity: '&#53;' },
  { code: 54, char: '6', description: 'Digit 6', hex: '0x36', htmlEntity: '&#54;' },
  { code: 55, char: '7', description: 'Digit 7', hex: '0x37', htmlEntity: '&#55;' },
  { code: 56, char: '8', description: 'Digit 8', hex: '0x38', htmlEntity: '&#56;' },
  { code: 57, char: '9', description: 'Digit 9', hex: '0x39', htmlEntity: '&#57;' },
  { code: 58, char: ':', description: 'Colon', hex: '0x3A', htmlEntity: '&#58;' },
  { code: 59, char: ';', description: 'Semicolon', hex: '0x3B', htmlEntity: '&#59;' },
  { code: 60, char: '<', description: 'Less Than', hex: '0x3C', htmlEntity: '&#60;' },
  { code: 61, char: '=', description: 'Equal', hex: '0x3D', htmlEntity: '&#61;' },
  { code: 62, char: '>', description: 'Greater Than', hex: '0x3E', htmlEntity: '&#62;' },
  { code: 63, char: '?', description: 'Question', hex: '0x3F', htmlEntity: '&#63;' },
  { code: 64, char: '@', description: 'At', hex: '0x40', htmlEntity: '&#64;' },
  { code: 65, char: 'A', description: 'Uppercase A', hex: '0x41', htmlEntity: '&#65;' },
  { code: 66, char: 'B', description: 'Uppercase B', hex: '0x42', htmlEntity: '&#66;' },
  { code: 67, char: 'C', description: 'Uppercase C', hex: '0x43', htmlEntity: '&#67;' },
  { code: 68, char: 'D', description: 'Uppercase D', hex: '0x44', htmlEntity: '&#68;' },
  { code: 69, char: 'E', description: 'Uppercase E', hex: '0x45', htmlEntity: '&#69;' },
  { code: 70, char: 'F', description: 'Uppercase F', hex: '0x46', htmlEntity: '&#70;' },
  { code: 71, char: 'G', description: 'Uppercase G', hex: '0x47', htmlEntity: '&#71;' },
  { code: 72, char: 'H', description: 'Uppercase H', hex: '0x48', htmlEntity: '&#72;' },
  { code: 73, char: 'I', description: 'Uppercase I', hex: '0x49', htmlEntity: '&#73;' },
  { code: 74, char: 'J', description: 'Uppercase J', hex: '0x4A', htmlEntity: '&#74;' },
  { code: 75, char: 'K', description: 'Uppercase K', hex: '0x4B', htmlEntity: '&#75;' },
  { code: 76, char: 'L', description: 'Uppercase L', hex: '0x4C', htmlEntity: '&#76;' },
  { code: 77, char: 'M', description: 'Uppercase M', hex: '0x4D', htmlEntity: '&#77;' },
  { code: 78, char: 'N', description: 'Uppercase N', hex: '0x4E', htmlEntity: '&#78;' },
  { code: 79, char: 'O', description: 'Uppercase O', hex: '0x4F', htmlEntity: '&#79;' },
  { code: 80, char: 'P', description: 'Uppercase P', hex: '0x50', htmlEntity: '&#80;' },
  { code: 81, char: 'Q', description: 'Uppercase Q', hex: '0x51', htmlEntity: '&#81;' },
  { code: 82, char: 'R', description: 'Uppercase R', hex: '0x52', htmlEntity: '&#82;' },
  { code: 83, char: 'S', description: 'Uppercase S', hex: '0x53', htmlEntity: '&#83;' },
  { code: 84, char: 'T', description: 'Uppercase T', hex: '0x54', htmlEntity: '&#84;' },
  { code: 85, char: 'U', description: 'Uppercase U', hex: '0x55', htmlEntity: '&#85;' },
  { code: 86, char: 'V', description: 'Uppercase V', hex: '0x56', htmlEntity: '&#86;' },
  { code: 87, char: 'W', description: 'Uppercase W', hex: '0x57', htmlEntity: '&#87;' },
  { code: 88, char: 'X', description: 'Uppercase X', hex: '0x58', htmlEntity: '&#88;' },
  { code: 89, char: 'Y', description: 'Uppercase Y', hex: '0x59', htmlEntity: '&#89;' },
  { code: 90, char: 'Z', description: 'Uppercase Z', hex: '0x5A', htmlEntity: '&#90;' },
  { code: 91, char: '[', description: 'Left Bracket', hex: '0x5B', htmlEntity: '&#91;' },
  { code: 92, char: '\\', description: 'Backslash', hex: '0x5C', htmlEntity: '&#92;' },
  { code: 93, char: ']', description: 'Right Bracket', hex: '0x5D', htmlEntity: '&#93;' },
  { code: 94, char: '^', description: 'Caret', hex: '0x5E', htmlEntity: '&#94;' },
  { code: 95, char: '_', description: 'Underscore', hex: '0x5F', htmlEntity: '&#95;' },
  { code: 96, char: '`', description: 'Grave', hex: '0x60', htmlEntity: '&#96;' },
  { code: 97, char: 'a', description: 'Lowercase a', hex: '0x61', htmlEntity: '&#97;' },
  { code: 98, char: 'b', description: 'Lowercase b', hex: '0x62', htmlEntity: '&#98;' },
  { code: 99, char: 'c', description: 'Lowercase c', hex: '0x63', htmlEntity: '&#99;' },
  { code: 100, char: 'd', description: 'Lowercase d', hex: '0x64', htmlEntity: '&#100;' },
  { code: 101, char: 'e', description: 'Lowercase e', hex: '0x65', htmlEntity: '&#101;' },
  { code: 102, char: 'f', description: 'Lowercase f', hex: '0x66', htmlEntity: '&#102;' },
  { code: 103, char: 'g', description: 'Lowercase g', hex: '0x67', htmlEntity: '&#103;' },
  { code: 104, char: 'h', description: 'Lowercase h', hex: '0x68', htmlEntity: '&#104;' },
  { code: 105, char: 'i', description: 'Lowercase i', hex: '0x69', htmlEntity: '&#105;' },
  { code: 106, char: 'j', description: 'Lowercase j', hex: '0x6A', htmlEntity: '&#106;' },
  { code: 107, char: 'k', description: 'Lowercase k', hex: '0x6B', htmlEntity: '&#107;' },
  { code: 108, char: 'l', description: 'Lowercase l', hex: '0x6C', htmlEntity: '&#108;' },
  { code: 109, char: 'm', description: 'Lowercase m', hex: '0x6D', htmlEntity: '&#109;' },
  { code: 110, char: 'n', description: 'Lowercase n', hex: '0x6E', htmlEntity: '&#110;' },
  { code: 111, char: 'o', description: 'Lowercase o', hex: '0x6F', htmlEntity: '&#111;' },
  { code: 112, char: 'p', description: 'Lowercase p', hex: '0x70', htmlEntity: '&#112;' },
  { code: 113, char: 'q', description: 'Lowercase q', hex: '0x71', htmlEntity: '&#113;' },
  { code: 114, char: 'r', description: 'Lowercase r', hex: '0x72', htmlEntity: '&#114;' },
  { code: 115, char: 's', description: 'Lowercase s', hex: '0x73', htmlEntity: '&#115;' },
  { code: 116, char: 't', description: 'Lowercase t', hex: '0x74', htmlEntity: '&#116;' },
  { code: 117, char: 'u', description: 'Lowercase u', hex: '0x75', htmlEntity: '&#117;' },
  { code: 118, char: 'v', description: 'Lowercase v', hex: '0x76', htmlEntity: '&#118;' },
  { code: 119, char: 'w', description: 'Lowercase w', hex: '0x77', htmlEntity: '&#119;' },
  { code: 120, char: 'x', description: 'Lowercase x', hex: '0x78', htmlEntity: '&#120;' },
  { code: 121, char: 'y', description: 'Lowercase y', hex: '0x79', htmlEntity: '&#121;' },
  { code: 122, char: 'z', description: 'Lowercase z', hex: '0x7A', htmlEntity: '&#122;' },
  { code: 123, char: '{', description: 'Left Brace', hex: '0x7B', htmlEntity: '&#123;' },
  { code: 124, char: '|', description: 'Pipe', hex: '0x7C', htmlEntity: '&#124;' },
  { code: 125, char: '}', description: 'Right Brace', hex: '0x7D', htmlEntity: '&#125;' },
  { code: 126, char: '~', description: 'Tilde', hex: '0x7E', htmlEntity: '&#126;' },
  { code: 127, char: 'DEL', description: 'Delete', hex: '0x7F', htmlEntity: '' },
]

// HTTP 状态码
const HTTP_STATUS = [
  { code: 100, desc: 'Continue', meaning: '继续', category: '1xx 信息' },
  { code: 101, desc: 'Switching Protocols', meaning: '切换协议', category: '1xx 信息' },
  { code: 200, desc: 'OK', meaning: '成功', category: '2xx 成功' },
  { code: 201, desc: 'Created', meaning: '已创建', category: '2xx 成功' },
  { code: 202, desc: 'Accepted', meaning: '已接受', category: '2xx 成功' },
  { code: 204, desc: 'No Content', meaning: '无内容', category: '2xx 成功' },
  { code: 206, desc: 'Partial Content', meaning: '部分内容', category: '2xx 成功' },
  { code: 301, desc: 'Moved Permanently', meaning: '永久重定向', category: '3xx 重定向' },
  { code: 302, desc: 'Found', meaning: '临时重定向', category: '3xx 重定向' },
  { code: 303, desc: 'See Other', meaning: '参见其他', category: '3xx 重定向' },
  { code: 304, desc: 'Not Modified', meaning: '未修改', category: '3xx 重定向' },
  { code: 307, desc: 'Temporary Redirect', meaning: '临时重定向', category: '3xx 重定向' },
  { code: 308, desc: 'Permanent Redirect', meaning: '永久重定向', category: '3xx 重定向' },
  { code: 400, desc: 'Bad Request', meaning: '请求错误', category: '4xx 客户端错误' },
  { code: 401, desc: 'Unauthorized', meaning: '未授权', category: '4xx 客户端错误' },
  { code: 403, desc: 'Forbidden', meaning: '禁止访问', category: '4xx 客户端错误' },
  { code: 404, desc: 'Not Found', meaning: '未找到', category: '4xx 客户端错误' },
  { code: 405, desc: 'Method Not Allowed', meaning: '方法不允许', category: '4xx 客户端错误' },
  { code: 406, desc: 'Not Acceptable', meaning: '不可接受', category: '4xx 客户端错误' },
  { code: 408, desc: 'Request Timeout', meaning: '请求超时', category: '4xx 客户端错误' },
  { code: 409, desc: 'Conflict', meaning: '冲突', category: '4xx 客户端错误' },
  { code: 410, desc: 'Gone', meaning: '已删除', category: '4xx 客户端错误' },
  { code: 413, desc: 'Payload Too Large', meaning: '请求实体过大', category: '4xx 客户端错误' },
  { code: 414, desc: 'URI Too Long', meaning: 'URI过长', category: '4xx 客户端错误' },
  { code: 415, desc: 'Unsupported Media Type', meaning: '不支持的媒体类型', category: '4xx 客户端错误' },
  { code: 429, desc: 'Too Many Requests', meaning: '请求过多', category: '4xx 客户端错误' },
  { code: 500, desc: 'Internal Server Error', meaning: '服务器内部错误', category: '5xx 服务器错误' },
  { code: 501, desc: 'Not Implemented', meaning: '未实现', category: '5xx 服务器错误' },
  { code: 502, desc: 'Bad Gateway', meaning: '网关错误', category: '5xx 服务器错误' },
  { code: 503, desc: 'Service Unavailable', meaning: '服务不可用', category: '5xx 服务器错误' },
  { code: 504, desc: 'Gateway Timeout', meaning: '网关超时', category: '5xx 服务器错误' },
  { code: 505, desc: 'HTTP Version Not Supported', meaning: 'HTTP版本不支持', category: '5xx 服务器错误' },
]

// MIME 类型
const MIME_TYPES = [
  { ext: '.html', type: 'text/html', desc: 'HTML 文档', category: '文本' },
  { ext: '.css', type: 'text/css', desc: 'CSS 样式表', category: '文本' },
  { ext: '.js', type: 'application/javascript', desc: 'JavaScript', category: '脚本' },
  { ext: '.json', type: 'application/json', desc: 'JSON 数据', category: '数据' },
  { ext: '.xml', type: 'application/xml', desc: 'XML 文档', category: '数据' },
  { ext: '.yaml', type: 'application/x-yaml', desc: 'YAML 文件', category: '数据' },
  { ext: '.toml', type: 'application/toml', desc: 'TOML 文件', category: '数据' },
  { ext: '.csv', type: 'text/csv', desc: 'CSV 表格', category: '数据' },
  { ext: '.pdf', type: 'application/pdf', desc: 'PDF 文档', category: '文档' },
  { ext: '.doc', type: 'application/msword', desc: 'Word 文档', category: '文档' },
  { ext: '.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', desc: 'Word 文档', category: '文档' },
  { ext: '.xls', type: 'application/vnd.ms-excel', desc: 'Excel 表格', category: '文档' },
  { ext: '.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', desc: 'Excel 表格', category: '文档' },
  { ext: '.ppt', type: 'application/vnd.ms-powerpoint', desc: 'PowerPoint', category: '文档' },
  { ext: '.pptx', type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', desc: 'PowerPoint', category: '文档' },
  { ext: '.zip', type: 'application/zip', desc: 'ZIP 压缩包', category: '压缩' },
  { ext: '.tar', type: 'application/x-tar', desc: 'Tar 归档', category: '压缩' },
  { ext: '.gz', type: 'application/gzip', desc: 'Gzip 压缩', category: '压缩' },
  { ext: '.rar', type: 'application/vnd.rar', desc: 'RAR 压缩包', category: '压缩' },
  { ext: '.7z', type: 'application/x-7z-compressed', desc: '7-Zip 压缩包', category: '压缩' },
  { ext: '.png', type: 'image/png', desc: 'PNG 图片', category: '图片' },
  { ext: '.jpg', type: 'image/jpeg', desc: 'JPEG 图片', category: '图片' },
  { ext: '.jpeg', type: 'image/jpeg', desc: 'JPEG 图片', category: '图片' },
  { ext: '.gif', type: 'image/gif', desc: 'GIF 图片', category: '图片' },
  { ext: '.svg', type: 'image/svg+xml', desc: 'SVG 图片', category: '图片' },
  { ext: '.webp', type: 'image/webp', desc: 'WebP 图片', category: '图片' },
  { ext: '.ico', type: 'image/x-icon', desc: '图标文件', category: '图片' },
  { ext: '.bmp', type: 'image/bmp', desc: 'BMP 图片', category: '图片' },
  { ext: '.mp3', type: 'audio/mpeg', desc: 'MP3 音频', category: '音频' },
  { ext: '.wav', type: 'audio/wav', desc: 'WAV 音频', category: '音频' },
  { ext: '.ogg', type: 'audio/ogg', desc: 'OGG 音频', category: '音频' },
  { ext: '.m4a', type: 'audio/mp4', desc: 'M4A 音频', category: '音频' },
  { ext: '.mp4', type: 'video/mp4', desc: 'MP4 视频', category: '视频' },
  { ext: '.webm', type: 'video/webm', desc: 'WebM 视频', category: '视频' },
  { ext: '.avi', type: 'video/x-msvideo', desc: 'AVI 视频', category: '视频' },
  { ext: '.mov', type: 'video/quicktime', desc: 'QuickTime 视频', category: '视频' },
  { ext: '.mkv', type: 'video/x-matroska', desc: 'MKV 视频', category: '视频' },
  { ext: '.woff', type: 'font/woff', desc: 'WOFF 字体', category: '字体' },
  { ext: '.woff2', type: 'font/woff2', desc: 'WOFF2 字体', category: '字体' },
  { ext: '.ttf', type: 'font/ttf', desc: 'TTF 字体', category: '字体' },
  { ext: '.otf', type: 'font/otf', desc: 'OTF 字体', category: '字体' },
  { ext: '.eot', type: 'application/vnd.ms-fontobject', desc: 'EOT 字体', category: '字体' },
  { ext: '.exe', type: 'application/octet-stream', desc: '可执行文件', category: '可执行' },
  { ext: '.dll', type: 'application/octet-stream', desc: '动态链接库', category: '可执行' },
  { ext: '.so', type: 'application/octet-stream', desc: '共享库', category: '可执行' },
  { ext: '.bin', type: 'application/octet-stream', desc: '二进制文件', category: '可执行' },
]

// 端口参考
const PORTS = [
  { port: 20, service: 'FTP Data', protocol: 'TCP', desc: 'FTP 数据端口', category: '文件传输' },
  { port: 21, service: 'FTP', protocol: 'TCP', desc: 'FTP 控制端口', category: '文件传输' },
  { port: 22, service: 'SSH', protocol: 'TCP', desc: '安全远程登录', category: '远程访问' },
  { port: 23, service: 'Telnet', protocol: 'TCP', desc: '远程终端', category: '远程访问' },
  { port: 25, service: 'SMTP', protocol: 'TCP', desc: '邮件传输', category: '邮件' },
  { port: 53, service: 'DNS', protocol: 'TCP/UDP', desc: '域名解析', category: '网络服务' },
  { port: 67, service: 'DHCP Server', protocol: 'UDP', desc: 'DHCP 服务端', category: '网络服务' },
  { port: 68, service: 'DHCP Client', protocol: 'UDP', desc: 'DHCP 客户端', category: '网络服务' },
  { port: 80, service: 'HTTP', protocol: 'TCP', desc: 'Web 服务', category: 'Web' },
  { port: 110, service: 'POP3', protocol: 'TCP', desc: '邮件接收', category: '邮件' },
  { port: 143, service: 'IMAP', protocol: 'TCP', desc: '邮件访问', category: '邮件' },
  { port: 443, service: 'HTTPS', protocol: 'TCP', desc: '安全 Web', category: 'Web' },
  { port: 445, service: 'SMB', protocol: 'TCP', desc: 'Windows 共享', category: 'Windows' },
  { port: 465, service: 'SMTPS', protocol: 'TCP', desc: 'SMTP over SSL', category: '邮件' },
  { port: 587, service: 'SMTP Submission', protocol: 'TCP', desc: 'SMTP 提交端口', category: '邮件' },
  { port: 993, service: 'IMAPS', protocol: 'TCP', desc: 'IMAP over SSL', category: '邮件' },
  { port: 995, service: 'POP3S', protocol: 'TCP', desc: 'POP3 over SSL', category: '邮件' },
  { port: 1080, service: 'SOCKS', protocol: 'TCP', desc: 'SOCKS 代理', category: '代理' },
  { port: 1194, service: 'OpenVPN', protocol: 'UDP', desc: 'VPN 服务', category: 'VPN' },
  { port: 1433, service: 'MSSQL', protocol: 'TCP', desc: 'SQL Server', category: '数据库' },
  { port: 1521, service: 'Oracle', protocol: 'TCP', desc: 'Oracle 数据库', category: '数据库' },
  { port: 3306, service: 'MySQL', protocol: 'TCP', desc: 'MySQL 数据库', category: '数据库' },
  { port: 3389, service: 'RDP', protocol: 'TCP', desc: '远程桌面', category: '远程访问' },
  { port: 5432, service: 'PostgreSQL', protocol: 'TCP', desc: 'PostgreSQL', category: '数据库' },
  { port: 5672, service: 'RabbitMQ', protocol: 'TCP', desc: '消息队列', category: '消息队列' },
  { port: 6379, service: 'Redis', protocol: 'TCP', desc: 'Redis 缓存', category: '数据库' },
  { port: 8080, service: 'HTTP Alt', protocol: 'TCP', desc: '备用 HTTP', category: 'Web' },
  { port: 8443, service: 'HTTPS Alt', protocol: 'TCP', desc: '备用 HTTPS', category: 'Web' },
  { port: 9000, service: 'PHP-FPM', protocol: 'TCP', desc: 'PHP FastCGI', category: 'Web' },
  { port: 9092, service: 'Kafka', protocol: 'TCP', desc: 'Kafka 消息', category: '消息队列' },
  { port: 9200, service: 'Elasticsearch', protocol: 'TCP', desc: 'ES HTTP', category: '数据库' },
  { port: 11211, service: 'Memcached', protocol: 'TCP', desc: 'Memcached', category: '数据库' },
  { port: 27017, service: 'MongoDB', protocol: 'TCP', desc: 'MongoDB', category: '数据库' },
  { port: 3000, service: 'Node.js', protocol: 'TCP', desc: 'Node 开发服务器', category: '开发' },
  { port: 5000, service: 'Flask', protocol: 'TCP', desc: 'Flask 开发服务器', category: '开发' },
  { port: 5173, service: 'Vite', protocol: 'TCP', desc: 'Vite 开发服务器', category: '开发' },
  { port: 8000, service: 'Django', protocol: 'TCP', desc: 'Django 开发服务器', category: '开发' },
]

// ===================== 主组件 =====================

export default function ReferenceTable() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [activeTable, setActiveTable] = React.useState('ascii')
  const [search, setSearch] = React.useState('')

  const tableOptions = [
    { value: 'ascii', label: lang === 'zh' ? 'ASCII 表' : 'ASCII' },
    { value: 'http', label: lang === 'zh' ? 'HTTP 状态码' : 'HTTP Status' },
    { value: 'mime', label: lang === 'zh' ? 'MIME 类型' : 'MIME Types' },
    { value: 'port', label: lang === 'zh' ? '端口参考' : 'Ports' },
  ]

  // 根据当前表和搜索过滤数据
  const filteredData = React.useMemo(() => {
    const q = search.toLowerCase()
    switch (activeTable) {
      case 'ascii':
        return ASCII_TABLE.filter(e =>
          e.char.toLowerCase().includes(q) ||
          e.code.toString().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.hex.toLowerCase().includes(q)
        )
      case 'http':
        return HTTP_STATUS.filter(e =>
          e.code.toString().includes(q) ||
          e.desc.toLowerCase().includes(q) ||
          e.meaning.includes(q) ||
          e.category.includes(q)
        )
      case 'mime':
        return MIME_TYPES.filter(e =>
          e.ext.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          e.desc.includes(q) ||
          e.category.includes(q)
        )
      case 'port':
        return PORTS.filter(e =>
          e.port.toString().includes(q) ||
          e.service.toLowerCase().includes(q) ||
          e.desc.includes(q) ||
          e.category.includes(q)
        )
      default:
        return []
    }
  }, [activeTable, search])

  // HTTP 状态码颜色
  const getHttpColor = (code) => {
    if (code < 200) return '#6B7280'
    if (code < 300) return '#10B981'
    if (code < 400) return '#3B82F6'
    if (code < 500) return '#F59E0B'
    return '#EF4444'
  }

  // 协议颜色
  const getProtocolColor = (protocol) => {
    if (protocol === 'TCP') return '#3B82F6'
    if (protocol === 'UDP') return '#10B981'
    return '#A855F7'
  }

  const styles = {
    container: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
    input: {
      width: '100%', padding: '10px 14px', background: theme.bgSecondary,
      color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.md,
      fontFamily: font.ui, fontSize: '13px', outline: 'none',
    },
    tableContainer: {
      overflow: 'auto', maxHeight: '500px', borderRadius: radius.md,
      border: `1px solid ${theme.border}`, background: theme.bgPrimary,
    },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: {
      padding: '12px 16px', textAlign: 'left', fontWeight: 500,
      color: theme.textMuted, background: theme.bgSecondary,
      borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, zIndex: 1,
    },
    td: { padding: '10px 16px', borderBottom: `1px solid ${theme.border}` },
    trHover: { transition: 'background 0.15s' },
    badge: {
      padding: '2px 8px', borderRadius: radius.sm, fontSize: '11px',
      fontWeight: 500, display: 'inline-block',
    },
    count: { fontSize: '11px', color: theme.textMuted, fontFamily: font.ui },
  }

  // 渲染 ASCII 表
  const renderAsciiTable = () => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Dec</th>
          <th style={styles.th}>Hex</th>
          <th style={styles.th}>Char</th>
          <th style={styles.th}>Description</th>
          <th style={styles.th}>HTML</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((entry, i) => (
          <tr
            key={entry.code}
            style={styles.trHover}
            onMouseEnter={e => e.currentTarget.style.background = theme.bgSecondary}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <td style={{ ...styles.td, fontFamily: font.ui, color: theme.textAccent }}>{entry.code}</td>
            <td style={{ ...styles.td, fontFamily: font.ui }}>{entry.hex}</td>
            <td style={{ ...styles.td, fontFamily: font.ui, fontWeight: 600, color: theme.textPrimary, minWidth: '40px' }}>{entry.char}</td>
            <td style={{ ...styles.td, color: theme.textSecondary }}>{entry.description}</td>
            <td style={{ ...styles.td, fontFamily: font.ui, color: theme.textMuted }}>{entry.htmlEntity || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  // 渲染 HTTP 状态码表
  const renderHttpTable = () => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Code</th>
          <th style={styles.th}>Description</th>
          <th style={styles.th}>Meaning</th>
          <th style={styles.th}>Category</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((entry, i) => (
          <tr
            key={entry.code}
            style={styles.trHover}
            onMouseEnter={e => e.currentTarget.style.background = theme.bgSecondary}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <td style={{ ...styles.td, fontFamily: font.ui, fontWeight: 600, color: getHttpColor(entry.code), fontSize: '15px' }}>{entry.code}</td>
            <td style={{ ...styles.td, fontFamily: font.ui, fontWeight: 500, color: theme.textPrimary }}>{entry.desc}</td>
            <td style={{ ...styles.td, color: theme.textSecondary }}>{entry.meaning}</td>
            <td style={styles.td}>
              <span style={{ ...styles.badge, background: `${getHttpColor(entry.code)}20`, color: getHttpColor(entry.code) }}>{entry.category}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  // 渲染 MIME 类型表
  const renderMimeTable = () => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Extension</th>
          <th style={styles.th}>MIME Type</th>
          <th style={styles.th}>Description</th>
          <th style={styles.th}>Category</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((entry, i) => (
          <tr
            key={entry.ext}
            style={styles.trHover}
            onMouseEnter={e => e.currentTarget.style.background = theme.bgSecondary}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <td style={{ ...styles.td, fontFamily: font.ui, fontWeight: 600, color: theme.textPrimary }}>{entry.ext}</td>
            <td style={{ ...styles.td, fontFamily: font.ui, color: theme.textAccent }}>{entry.type}</td>
            <td style={{ ...styles.td, color: theme.textSecondary }}>{entry.desc}</td>
            <td style={styles.td}>
              <span style={{ ...styles.badge, background: `${theme.bgAccent}20`, color: theme.bgAccent }}>{entry.category}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  // 渲染端口表
  const renderPortTable = () => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Port</th>
          <th style={styles.th}>Service</th>
          <th style={styles.th}>Protocol</th>
          <th style={styles.th}>Description</th>
          <th style={styles.th}>Category</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((entry, i) => (
          <tr
            key={entry.port}
            style={styles.trHover}
            onMouseEnter={e => e.currentTarget.style.background = theme.bgSecondary}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <td style={{ ...styles.td, fontFamily: font.ui, fontWeight: 600, color: theme.textAccent }}>{entry.port}</td>
            <td style={{ ...styles.td, fontWeight: 500, color: theme.textPrimary }}>{entry.service}</td>
            <td style={styles.td}>
              <span style={{ ...styles.badge, background: `${getProtocolColor(entry.protocol)}20`, color: getProtocolColor(entry.protocol) }}>{entry.protocol}</span>
            </td>
            <td style={{ ...styles.td, color: theme.textSecondary }}>{entry.desc}</td>
            <td style={{ ...styles.td, color: theme.textMuted, fontSize: '11px' }}>{entry.category}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div style={styles.container}>
      <ToggleGroup options={tableOptions} value={activeTable} onChange={setActiveTable} />

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={lang === 'zh' ? '搜索...' : 'Search...'}
        style={styles.input}
      />

      <p style={styles.count}>{lang === 'zh' ? '共' : 'Total'} {filteredData.length} {lang === 'zh' ? '条' : 'entries'}</p>

      <div style={styles.tableContainer}>
        {activeTable === 'ascii' && renderAsciiTable()}
        {activeTable === 'http' && renderHttpTable()}
        {activeTable === 'mime' && renderMimeTable()}
        {activeTable === 'port' && renderPortTable()}
      </div>
    </div>
  )
}
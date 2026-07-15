// 工具组件统一导出

import BarcodeQrTool from './components/BarcodeQrTool'
import EncodingConvert from './components/EncodingConvert'
import CryptoTool from './components/CryptoTool'
import FormatTool from './components/FormatTool'
import TextTool from './components/TextTool'
import FileParser from './components/FileParser'
import NumberTool from './components/NumberTool'
import DevTool from './components/DevTool'
import CssTool from './components/CssTool'
import JsonTool from './components/JsonTool'
import ReferenceTable from './components/ReferenceTable'

import Timestamp from './components/Timestamp'
import DateCalc from './components/DateCalc'
import DurationFormat from './components/DurationFormat'
import EpochFormats from './components/EpochFormats'
import TimezoneConvert from './components/TimezoneConvert'
import CronParser from './components/CronParser'

import UrlParser from './components/UrlParser'
import UserAgent from './components/UserAgent'
import HttpHeaders from './components/HttpHeaders'
import IpSubnet from './components/IpSubnet'

import CurlConverter from './components/CurlConverter'
import OpenapiViewer from './components/OpenapiViewer'
import IconSearch from './components/IconSearch'
import FontPair from './components/FontPair'

import SvgOptimizer from './components/SvgOptimizer'
import SvgToDataUri from './components/SvgToDataUri'

// 工具组件映射表
const tools = {
  // 条码/二维码
  'barcode-qr-tool': { title: '条码/二维码工具', component: BarcodeQrTool },

  // 编码转换
  'encoding-convert': { title: '编码转换工具', component: EncodingConvert },

  // 加密解密
  'crypto-tool': { title: '加密解密工具', component: CryptoTool },

  // 格式化
  'format-tool': { title: '格式化工具', component: FormatTool },

  // 文本处理
  'text-tool': { title: '文本处理工具', component: TextTool },

  // 文件处理
  'file-parser': { title: '文件解析器', component: FileParser },

  // 数值计算
  'number-tool': { title: '数值计算工具', component: NumberTool },

  // 开发工具
  'dev-tool': { title: '开发工具集', component: DevTool },

  // CSS 工具
  'css-tool': { title: 'CSS 工具集', component: CssTool },

  // JSON 工具
  'json-tool': { title: 'JSON 工具集', component: JsonTool },

  // 常用表
  'reference-table': { title: '常用表', component: ReferenceTable },

  // 时间日期
  'timestamp': { title: '时间戳转换', component: Timestamp },
  'date-calc': { title: '日期计算', component: DateCalc },
  'duration-format': { title: '时长格式化', component: DurationFormat },
  'epoch-formats': { title: '时间格式转换', component: EpochFormats },
  'timezone-convert': { title: '时区转换', component: TimezoneConvert },
  'cron-parser': { title: 'Cron 解析', component: CronParser },

  // Web 开发
  'url-parser': { title: 'URL 解析', component: UrlParser },
  'user-agent': { title: 'User Agent 解析', component: UserAgent },
  'http-headers': { title: 'HTTP 请求头', component: HttpHeaders },
  'ip-subnet': { title: 'IP 子网计算', component: IpSubnet },

  // 开发辅助
  'curl-converter': { title: 'cURL 转换', component: CurlConverter },
  'openapi-viewer': { title: 'OpenAPI 查看器', component: OpenapiViewer },
  'icon-search': { title: '图标搜索', component: IconSearch },
  'font-pair': { title: '字体搭配', component: FontPair },

  // SVG 工具
  'svg-optimizer': { title: 'SVG 优化', component: SvgOptimizer },
  'svg-to-data-uri': { title: 'SVG 转 Data URI', component: SvgToDataUri },
}

export default tools
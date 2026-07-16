import React from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { useLang } from '../../../context/LanguageContext'

// 辅助函数
function readString(view, offset, maxLen = 256) {
  let str = ''
  for (let i = 0; i < maxLen && offset + i < view.byteLength; i++) {
    const c = view.getUint8(offset + i)
    if (c === 0) break
    str += String.fromCharCode(c)
  }
  return str
}

function readStringUtf8(buffer, offset, maxLen = 512) {
  const view = new DataView(buffer)
  const bytes = []
  for (let i = 0; i < maxLen && offset + i < buffer.byteLength; i++) {
    const c = view.getUint8(offset + i)
    if (c === 0) break
    bytes.push(c)
  }
  try {
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes))
  } catch {
    return ''
  }
}

// PE 文件解析
function parsePE(buffer) {
  const view = new DataView(buffer)
  const result = { 
    format: 'PE (Windows Executable)', 
    sections: [], 
    imports: [], 
    exports: [],
    resources: [],
    delayedImports: [],
    tlsCallbacks: [],
    debugInfo: [],
  }

  try {
    // 检查 DOS 头
    const dosMagic = view.getUint16(0, true)
    if (dosMagic !== 0x5A4D) {
      return { ok: false, error: 'Invalid DOS header (MZ signature not found)' }
    }

    // 获取 PE 头偏移
    const peOffset = view.getUint32(60, true)
    
    // 检查 PE 签名
    if (view.getUint32(peOffset, true) !== 0x00004550) {
      return { ok: false, error: 'Invalid PE signature' }
    }

    // 解析 COFF 头
    const machine = view.getUint16(peOffset + 4, true)
    const machineTypes = {
      0x014c: 'i386', 0x8664: 'AMD64', 0xaa64: 'ARM64',
      0x01c0: 'ARM', 0x01c2: 'ARM Thumb', 0x01c4: 'ARM Thumb-2',
      0x0200: 'IA-64', 0x01f0: 'PowerPC', 0x01f1: 'PowerPC FP',
      0x0ebc: 'EFI', 0x5032: 'RISC-V 32', 0x5064: 'RISC-V 64',
    }
    result.machine = machineTypes[machine] || `Unknown (0x${machine.toString(16)})`

    const numberOfSections = view.getUint16(peOffset + 6, true)
    const timeDateStamp = view.getUint32(peOffset + 8, true)
    const sizeOfOptionalHeader = view.getUint16(peOffset + 20, true)
    const characteristics = view.getUint16(peOffset + 22, true)

    // 可选头信息
    const magic = view.getUint16(peOffset + 24, true)
    const is64Bit = magic === 0x20b
    result.peType = magic === 0x10b ? 'PE32' : magic === 0x20b ? 'PE32+' : 'Unknown'

    // 计算数据目录偏移
    const optHeaderOffset = peOffset + 24
    const dataDirectoryOffset = is64Bit ? optHeaderOffset + 112 : optHeaderOffset + 96

    // 获取数据目录
    const dataDirectories = []
    const dirNames = ['Export', 'Import', 'Resource', 'Exception', 'Certificate', 'Base Reloc', 'Debug', 'Architecture', 'Global Ptr', 'TLS', 'Load Config', 'Bound Import', 'IAT', 'Delay Import', 'CLR', 'Reserved']
    for (let i = 0; i < 16; i++) {
      const dirOffset = dataDirectoryOffset + i * 8
      const rva = view.getUint32(dirOffset, true)
      const size = view.getUint32(dirOffset + 4, true)
      dataDirectories.push({ name: dirNames[i], rva, size })
    }

    // 入口点和镜像基址
    const entryPoint = view.getUint32(optHeaderOffset + 16, true)
    const imageBase = is64Bit 
      ? view.getBigUint64(optHeaderOffset + 24, true) 
      : view.getUint32(optHeaderOffset + 28, true)
    const subsystem = view.getUint16(optHeaderOffset + (is64Bit ? 68 : 52), true)
    const dllCharacteristics = view.getUint16(optHeaderOffset + (is64Bit ? 70 : 54), true)

    const subsystemNames = {
      0: 'Unknown', 1: 'Native', 2: 'GUI', 3: 'Console', 5: 'OS/2', 7: 'POSIX',
      9: 'Windows CE', 10: 'EFI Application', 11: 'EFI Boot Service', 12: 'EFI Runtime', 13: 'EFI ROM', 14: 'XBOX',
    }

    const dllChars = []
    if (dllCharacteristics & 0x0020) dllChars.push('HIGH_ENTROPY_VA')
    if (dllCharacteristics & 0x0040) dllChars.push('DYNAMIC_BASE')
    if (dllCharacteristics & 0x0080) dllChars.push('FORCE_INTEGRITY')
    if (dllCharacteristics & 0x0100) dllChars.push('NX_COMPAT')
    if (dllCharacteristics & 0x0200) dllChars.push('NO_ISOLATION')
    if (dllCharacteristics & 0x0400) dllChars.push('NO_SEH')
    if (dllCharacteristics & 0x0800) dllChars.push('NO_BIND')
    if (dllCharacteristics & 0x1000) dllChars.push('APPCONTAINER')
    if (dllCharacteristics & 0x2000) dllChars.push('WDM_DRIVER')
    if (dllCharacteristics & 0x4000) dllChars.push('GUARD_CF')
    if (dllCharacteristics & 0x8000) dllChars.push('TERMINAL_SERVER_AWARE')

    // 获取 Section 表
    const sectionTableOffset = peOffset + 24 + sizeOfOptionalHeader
    const sections = []
    
    for (let i = 0; i < numberOfSections; i++) {
      const sectionOffset = sectionTableOffset + i * 40
      const name = readString(view, sectionOffset, 8)
      const virtualSize = view.getUint32(sectionOffset + 8, true)
      const virtualAddress = view.getUint32(sectionOffset + 12, true)
      const sizeOfRawData = view.getUint32(sectionOffset + 16, true)
      const rawPointer = view.getUint32(sectionOffset + 20, true)
      const sectionChars = view.getUint32(sectionOffset + 36, true)

      sections.push({ name, virtualAddress, virtualSize, rawPointer, sizeOfRawData, characteristics: sectionChars })
      result.sections.push({
        name,
        virtualAddress: '0x' + virtualAddress.toString(16).padStart(8, '0'),
        virtualSize,
        rawSize: sizeOfRawData,
        rawPointer: '0x' + rawPointer.toString(16).padStart(8, '0'),
        characteristics: '0x' + sectionChars.toString(16),
      })
    }

    // RVA 转文件偏移
    const rvaToOffset = (rva) => {
      for (const sec of sections) {
        if (rva >= sec.virtualAddress && rva < sec.virtualAddress + sec.virtualSize) {
          return rva - sec.virtualAddress + sec.rawPointer
        }
      }
      return null
    }

    // 解析导出表
    const exportDir = dataDirectories[0]
    if (exportDir.rva > 0) {
      const exportOffset = rvaToOffset(exportDir.rva)
      if (exportOffset !== null) {
        const numOfFunctions = view.getUint32(exportOffset + 20, true)
        const numOfNames = view.getUint32(exportOffset + 24, true)
        const addressOfFunctions = view.getUint32(exportOffset + 28, true)
        const addressOfNames = view.getUint32(exportOffset + 32, true)
        const addressOfOrdinals = view.getUint32(exportOffset + 36, true)
        const dllName = readString(view, rvaToOffset(view.getUint32(exportOffset + 12, true)) || exportOffset)

        result.exportTable = {
          name: dllName,
          functions: numOfFunctions,
          names: numOfNames,
        }

        for (let i = 0; i < Math.min(numOfNames, 100); i++) {
          const nameRva = view.getUint32(rvaToOffset(addressOfNames) + i * 4, true)
          const name = readString(view, rvaToOffset(nameRva))
          const ordinal = view.getUint16(rvaToOffset(addressOfOrdinals) + i * 2, true)
          const funcRva = view.getUint32(rvaToOffset(addressOfFunctions) + ordinal * 4, true)
          result.exports.push({ name, ordinal, rva: '0x' + funcRva.toString(16) })
        }
      }
    }

    // 解析导入表
    const importDir = dataDirectories[1]
    if (importDir.rva > 0) {
      let importOffset = rvaToOffset(importDir.rva)
      if (importOffset !== null) {
        let idx = 0
        while (true) {
          const importLookup = view.getUint32(importOffset + idx * 20, true)
          if (importLookup === 0) break
          
          const timeDate = view.getUint32(importOffset + idx * 20 + 4, true)
          const forwarderChain = view.getUint32(importOffset + idx * 20 + 8, true)
          const nameRva = view.getUint32(importOffset + idx * 20 + 12, true)
          const iatRva = view.getUint32(importOffset + idx * 20 + 16, true)

          if (nameRva === 0) break
          const name = readString(view, rvaToOffset(nameRva))
          
          const dllImports = { dll: name, functions: [] }
          
          // 解析导入函数
          const thunkOffset = rvaToOffset(is64Bit ? importLookup : iatRva)
          if (thunkOffset !== null) {
            let funcIdx = 0
            while (true) {
              const thunkData = is64Bit 
                ? Number(view.getBigUint64(thunkOffset + funcIdx * 8, true))
                : view.getUint32(thunkOffset + funcIdx * 4, true)
              if (thunkData === 0) break
              
              // 获取函数名
              const hintNameRva = thunkData & 0x7FFFFFFF
              const hintNameOffset = rvaToOffset(hintNameRva)
              if (hintNameOffset !== null) {
                const hint = view.getUint16(hintNameOffset, true)
                const funcName = readString(view, hintNameOffset + 2)
                dllImports.functions.push({ hint: '0x' + hint.toString(16).padStart(4, '0'), name: funcName })
              }
              funcIdx++
            }
          }
          
          result.imports.push(dllImports)
          idx++
        }
      }
    }

    // 解析资源表
    const resourceDir = dataDirectories[2]
    if (resourceDir.rva > 0) {
      const parseResourceDir = (rva, level = 0, typeStr = '') => {
        const offset = rvaToOffset(rva)
        if (offset === null) return []
        
        const results = []
        const characteristics = view.getUint32(offset, true)
        const timeDate = view.getUint32(offset + 4, true)
        const majorVer = view.getUint16(offset + 8, true)
        const minorVer = view.getUint16(offset + 10, true)
        const numOfNamed = view.getUint16(offset + 12, true)
        const numOfId = view.getUint16(offset + 14, true)
        
        const total = numOfNamed + numOfId
        for (let i = 0; i < total; i++) {
          const entryOffset = offset + 16 + i * 8
          const nameId = view.getUint32(entryOffset, true)
          const offsetToData = view.getUint32(entryOffset + 4, true)
          
          const isDir = (offsetToData & 0x80000000) !== 0
          const childRva = offsetToData & 0x7FFFFFFF
          
          if (level === 0) {
            const typeNames = {
              1: 'Cursor', 2: 'Bitmap', 3: 'Icon', 4: 'Menu', 5: 'Dialog',
              6: 'String', 7: 'FontDir', 8: 'Font', 9: 'Accelerator', 10: 'RCData',
              11: 'MessageTable', 12: 'GroupCursor', 14: 'GroupIcon', 16: 'Version',
              17: 'DlgInclude', 19: 'PlugPlay', 20: 'VXD', 21: 'AniCursor', 22: 'AniIcon',
              23: 'HTML', 24: 'Manifest'
            }
            const typeName = typeNames[nameId] || `Type ${nameId}`
            if (isDir) {
              parseResourceDir(childRva, 1, typeName)
            }
          } else if (level === 1) {
            if (isDir) {
              parseResourceDir(childRva, 2, typeStr)
            }
          } else {
            const dataOffset = rvaToOffset(childRva)
            if (dataOffset !== null) {
              const dataRva = view.getUint32(dataOffset, true)
              const dataSize = view.getUint32(dataOffset + 4, true)
              result.resources.push({
                type: typeStr,
                id: nameId,
                rva: '0x' + dataRva.toString(16),
                size: dataSize,
              })
            }
          }
        }
      }
      parseResourceDir(resourceDir.rva)
    }

    // 解析 TLS 回调
    const tlsDir = dataDirectories[9]
    if (tlsDir.rva > 0) {
      const tlsOffset = rvaToOffset(tlsDir.rva)
      if (tlsOffset !== null) {
        const startAddress = view.getUint32(tlsOffset, true)
        const endAddress = view.getUint32(tlsOffset + 4, true)
        const addressOfIndex = view.getUint32(tlsOffset + 8, true)
        const addressOfCallbacks = view.getUint32(tlsOffset + 12, true)
        
        let callbackOffset = rvaToOffset(addressOfCallbacks)
        if (callbackOffset !== null) {
          let i = 0
          while (i < 10) {
            const callback = view.getUint32(callbackOffset + i * 4, true)
            if (callback === 0) break
            result.tlsCallbacks.push('0x' + callback.toString(16))
            i++
          }
        }
      }
    }

    // 解析延迟导入
    const delayDir = dataDirectories[13]
    if (delayDir.rva > 0) {
      const delayOffset = rvaToOffset(delayDir.rva)
      if (delayOffset !== null) {
        let idx = 0
        while (true) {
          const attrs = view.getUint32(delayOffset + idx * 32, true)
          const moduleRva = view.getUint32(delayOffset + idx * 32 + 4, true)
          if (moduleRva === 0) break
          
          const moduleName = readString(view, rvaToOffset(moduleRva))
          result.delayedImports.push({ module: moduleName })
          idx++
        }
      }
    }

    // 解析调试信息
    const debugDir = dataDirectories[6]
    if (debugDir.rva > 0) {
      const debugOffset = rvaToOffset(debugDir.rva)
      if (debugOffset !== null) {
        const numOfEntries = Math.floor(debugDir.size / 28)
        for (let i = 0; i < Math.min(numOfEntries, 10); i++) {
          const entryOffset = debugOffset + i * 28
          const characteristics = view.getUint32(entryOffset, true)
          const timeDate = view.getUint32(entryOffset + 4, true)
          const majorVer = view.getUint16(entryOffset + 8, true)
          const minorVer = view.getUint16(entryOffset + 10, true)
          const type = view.getUint32(entryOffset + 12, true)
          const sizeOfData = view.getUint32(entryOffset + 16, true)
          const addrOfRawData = view.getUint32(entryOffset + 20, true)
          
          const debugTypes = {
            0: 'Unknown', 1: 'COFF', 2: 'CV', 3: 'FPO', 4: 'MISC', 5: 'BMT',
            6: 'IA64', 7: 'DATA', 8: 'ILTC', 9: 'MP', 10: 'REPRO', 11: 'EMBED_CTG', 12: 'EMBEDDED_PORTABLE_PDB'
          }
          
          result.debugInfo.push({
            type: debugTypes[type] || `Type ${type}`,
            timeDate: new Date(timeDate * 1000).toISOString(),
            size: sizeOfData,
            address: '0x' + addrOfRawData.toString(16),
          })
        }
      }
    }

    result.headers = {
      machine: result.machine,
      peType: result.peType,
      subsystem: subsystemNames[subsystem] || `Unknown (${subsystem})`,
      characteristics: dllChars.join(', ') || 'None',
      sections: numberOfSections,
      timeStamp: new Date(timeDateStamp * 1000).toISOString(),
      entryPoint: '0x' + entryPoint.toString(16),
      imageBase: '0x' + imageBase.toString(16),
    }

    return { ok: true, value: result }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// ELF 文件解析
function parseELF(buffer) {
  const view = new DataView(buffer)
  const result = { 
    format: 'ELF (Linux/Unix Executable)', 
    sections: [], 
    symbols: [],
    dynamicSymbols: [],
    dynamicEntries: [],
    programHeaders: [],
    relocations: [],
  }

  try {
    if (view.getUint8(0) !== 0x7F || view.getUint8(1) !== 0x45 || view.getUint8(2) !== 0x4C || view.getUint8(3) !== 0x46) {
      return { ok: false, error: 'Invalid ELF magic number' }
    }

    const eiClass = view.getUint8(4)
    const eiData = view.getUint8(5)
    const is64Bit = eiClass === 2
    const isLittleEndian = eiData === 1

    result.eiClass = is64Bit ? 'ELF64' : 'ELF32'
    result.endianness = isLittleEndian ? 'Little-endian' : 'Big-endian'

    const abiTypes = {
      0: 'System V', 3: 'Linux', 9: 'FreeBSD', 12: 'OpenBSD',
      6: 'Solaris', 53: 'Sortix',
    }
    result.osABI = abiTypes[view.getUint8(7)] || `Unknown`

    const e_type = view.getUint16(16, isLittleEndian)
    const typeNames = { 0: 'None', 1: 'Relocatable', 2: 'Executable', 3: 'Shared', 4: 'Core' }
    result.type = typeNames[e_type] || `Unknown (${e_type})`

    const e_machine = view.getUint16(18, isLittleEndian)
    const machineNames = {
      0x03: 'x86', 0x3E: 'x86-64', 0x28: 'ARM', 0xB7: 'AArch64',
      0x08: 'MIPS', 0x14: 'PowerPC', 0x15: 'PowerPC64', 0xF3: 'RISC-V',
    }
    result.machine = machineNames[e_machine] || `Unknown (0x${e_machine.toString(16)})`

    const e_entry = is64Bit ? view.getBigUint64(24, isLittleEndian) : view.getUint32(24, isLittleEndian)
    const e_phoff = is64Bit ? view.getBigUint64(32, isLittleEndian) : view.getUint32(28, isLittleEndian)
    const e_shoff = is64Bit ? view.getBigUint64(40, isLittleEndian) : view.getUint32(32, isLittleEndian)
    const e_phentsize = view.getUint16(is64Bit ? 54 : 42, isLittleEndian)
    const e_phnum = view.getUint16(is64Bit ? 56 : 44, isLittleEndian)
    const e_shentsize = view.getUint16(is64Bit ? 58 : 46, isLittleEndian)
    const e_shnum = view.getUint16(is64Bit ? 60 : 48, isLittleEndian)
    const e_shstrndx = view.getUint16(is64Bit ? 62 : 50, isLittleEndian)

    // 解析 Program Headers
    for (let i = 0; i < e_phnum; i++) {
      const phOffset = Number(e_phoff) + i * e_phentsize
      const p_type = view.getUint32(phOffset, isLittleEndian)
      const p_flags = is64Bit ? view.getUint32(phOffset + 4, isLittleEndian) : 0
      const p_offset = is64Bit ? view.getBigUint64(phOffset + 8, isLittleEndian) : view.getUint32(phOffset + 4, isLittleEndian)
      const p_vaddr = is64Bit ? view.getBigUint64(phOffset + 16, isLittleEndian) : view.getUint32(phOffset + 8, isLittleEndian)
      const p_filesz = is64Bit ? view.getBigUint64(phOffset + 32, isLittleEndian) : view.getUint32(phOffset + 16, isLittleEndian)
      const p_memsz = is64Bit ? view.getBigUint64(phOffset + 40, isLittleEndian) : view.getUint32(phOffset + 20, isLittleEndian)
      const p_flags32 = is64Bit ? view.getUint32(phOffset + 4, isLittleEndian) : view.getUint32(phOffset + 24, isLittleEndian)

      const typeNames = {
        0: 'NULL', 1: 'LOAD', 2: 'DYNAMIC', 3: 'INTERP', 4: 'NOTE',
        5: 'SHLIB', 6: 'PHDR', 7: 'TLS', 0x6474e550: 'GNU_EH_FRAME',
        0x6474e551: 'GNU_STACK', 0x6474e552: 'GNU_RELRO', 0x6474e553: 'GNU_PROPERTY',
      }
      const flags = []
      if (p_flags32 & 1) flags.push('X')
      if (p_flags32 & 2) flags.push('W')
      if (p_flags32 & 4) flags.push('R')

      result.programHeaders.push({
        type: typeNames[p_type] || `0x${p_type.toString(16)}`,
        flags: flags.join(' '),
        offset: '0x' + p_offset.toString(16),
        vaddr: '0x' + p_vaddr.toString(16),
        fileSize: p_filesz.toString(),
        memSize: p_memsz.toString(),
      })
    }

    // 解析 Section 头
    if (e_shoff > 0 && e_shnum > 0) {
      const shstrtabOffset = Number(e_shoff) + e_shstrndx * e_shentsize
      const shstrtabOff = is64Bit 
        ? Number(view.getBigUint64(shstrtabOffset + 24, isLittleEndian))
        : view.getUint32(shstrtabOffset + 16, isLittleEndian)

      const sectionData = []
      for (let i = 0; i < e_shnum; i++) {
        const shOffset = Number(e_shoff) + i * e_shentsize
        const sh_name = view.getUint32(shOffset, isLittleEndian)
        const sh_type = view.getUint32(shOffset + 4, isLittleEndian)
        const sh_flags = is64Bit ? view.getBigUint64(shOffset + 8, isLittleEndian) : view.getUint32(shOffset + 8, isLittleEndian)
        const sh_addr = is64Bit ? view.getBigUint64(shOffset + 16, isLittleEndian) : view.getUint32(shOffset + 12, isLittleEndian)
        const sh_offset = is64Bit ? view.getBigUint64(shOffset + 24, isLittleEndian) : view.getUint32(shOffset + 16, isLittleEndian)
        const sh_size = is64Bit ? view.getBigUint64(shOffset + 32, isLittleEndian) : view.getUint32(shOffset + 20, isLittleEndian)
        const sh_link = view.getUint32(is64Bit ? shOffset + 40 : shOffset + 24, isLittleEndian)
        const sh_info = view.getUint32(is64Bit ? shOffset + 44 : shOffset + 28, isLittleEndian)

        const name = shstrtabOff > 0 ? readString(view, shstrtabOff + sh_name) : ''
        
        const typeNames = {
          0: 'NULL', 1: 'PROGBITS', 2: 'SYMTAB', 3: 'STRTAB',
          4: 'RELA', 5: 'HASH', 6: 'DYNAMIC', 7: 'NOTE',
          8: 'NOBITS', 9: 'REL', 10: 'SHLIB', 11: 'DYNSYM',
          14: 'INIT_ARRAY', 15: 'FINI_ARRAY', 16: 'PREINIT_ARRAY',
          17: 'GROUP', 18: 'SYMTAB_SHNDX', 0x6ffffff5: 'GNU_ATTRIBUTES',
          0x6ffffff6: 'GNU_HASH', 0x6ffffffd: 'VERDEF', 0x6fffffff: 'VERSYM',
        }

        sectionData.push({
          index: i,
          name,
          type: sh_type,
          typeName: typeNames[sh_type] || `0x${sh_type.toString(16)}`,
          flags: Number(sh_flags),
          addr: Number(sh_addr),
          offset: Number(sh_offset),
          size: Number(sh_size),
          link: sh_link,
          info: sh_info,
        })
      }

      // 输出 sections
      for (const sec of sectionData) {
        const flagStr = []
        if (sec.flags & 1) flagStr.push('WRITE')
        if (sec.flags & 2) flagStr.push('ALLOC')
        if (sec.flags & 4) flagStr.push('EXECINSTR')
        
        result.sections.push({
          name: sec.name || `[${sec.index}]`,
          type: sec.typeName,
          address: '0x' + sec.addr.toString(16),
          offset: '0x' + sec.offset.toString(16),
          size: sec.size,
          flags: flagStr.join(' '),
        })

        // 解析符号表
        if (sec.type === 2 || sec.type === 11) { // SYMTAB or DYNSYM
          const symOffset = sec.offset
          const symSize = sec.size
          const strTabOffset = sectionData[sec.link]?.offset || 0
          const symEntSize = sec.type === 2 ? (is64Bit ? 24 : 16) : (is64Bit ? 24 : 16)
          
          const symbols = sec.type === 2 ? result.symbols : result.dynamicSymbols
          
          for (let j = 0; j < Math.floor(symSize / symEntSize) && j < 100; j++) {
            const sOffset = symOffset + j * symEntSize
            const st_name = view.getUint32(sOffset, isLittleEndian)
            const st_info = view.getUint8(sOffset + (is64Bit ? 4 : 12))
            const st_other = view.getUint8(sOffset + (is64Bit ? 5 : 13))
            const st_shndx = view.getUint16(sOffset + (is64Bit ? 6 : 14), isLittleEndian)
            const st_value = is64Bit ? view.getBigUint64(sOffset + 8, isLittleEndian) : view.getUint32(sOffset + 4, isLittleEndian)
            
            const symName = readString(view, strTabOffset + st_name)
            const bindTypes = { 0: 'LOCAL', 1: 'GLOBAL', 2: 'WEAK', 10: 'LOPROC', 12: 'HIPROC' }
            const typeTypes = { 0: 'NOTYPE', 1: 'OBJECT', 2: 'FUNC', 3: 'SECTION', 4: 'FILE', 13: 'LOPROC', 15: 'HIPROC' }
            const bind = (st_info >> 4)
            const type = (st_info & 0xf)
            
            symbols.push({
              name: symName,
              value: '0x' + st_value.toString(16),
              bind: bindTypes[bind] || bind,
              type: typeTypes[type] || type,
              index: st_shndx,
            })
          }
        }

        // 解析重定位表
        if (sec.type === 4 || sec.type === 9) { // RELA or REL
          const relOffset = sec.offset
          const relSize = sec.size
          const relEntSize = sec.type === 4 ? (is64Bit ? 24 : 12) : (is64Bit ? 16 : 8)
          
          for (let j = 0; j < Math.floor(relSize / relEntSize) && j < 50; j++) {
            const rOffset = relOffset + j * relEntSize
            const r_offset = is64Bit ? view.getBigUint64(rOffset, isLittleEndian) : view.getUint32(rOffset, isLittleEndian)
            const r_info = is64Bit ? view.getBigUint64(rOffset + 8, isLittleEndian) : view.getUint32(rOffset + 4, isLittleEndian)
            
            result.relocations.push({
              offset: '0x' + r_offset.toString(16),
              info: '0x' + r_info.toString(16),
            })
          }
        }
      }
    }

    result.headers = {
      class: result.eiClass,
      endianness: result.endianness,
      osABI: result.osABI,
      type: result.type,
      machine: result.machine,
      entry: '0x' + e_entry.toString(16),
      programHeaders: e_phnum,
      sectionHeaders: e_shnum,
    }

    return { ok: true, value: result }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// Mach-O 文件解析
function parseMachO(buffer) {
  const view = new DataView(buffer)
  const result = { 
    format: 'Mach-O (macOS/iOS Executable)', 
    sections: [],
    loadCommands: [],
    symbols: [],
  }

  try {
    const magic = view.getUint32(0, false)
    
    let is64Bit = false
    let isLittleEndian = true
    
    if (magic === 0xFEEDFACE) result.format = 'Mach-O 32-bit'
    else if (magic === 0xFEEDFACF) { result.format = 'Mach-O 64-bit'; is64Bit = true }
    else if (magic === 0xCEFAEDFE) { result.format = 'Mach-O 32-bit (Big-endian)'; isLittleEndian = false }
    else if (magic === 0xCFFAEDFE) { result.format = 'Mach-O 64-bit (Big-endian)'; is64Bit = true; isLittleEndian = false }
    else if (magic === 0xCAFEBABE) { result.format = 'Fat/Universal Binary' }
    else return { ok: false, error: 'Invalid Mach-O magic number' }

    const cputype = view.getUint32(4, isLittleEndian)
    const cpusubtype = view.getUint32(8, isLittleEndian)
    const filetype = view.getUint32(12, isLittleEndian)
    const ncmds = view.getUint32(16, isLittleEndian)
    const sizeofcmds = view.getUint32(20, isLittleEndian)
    const flags = view.getUint32(24, isLittleEndian)

    const cpuTypes = {
      0x00000007: 'i386', 0x01000007: 'x86_64',
      0x0000000C: 'ARM', 0x0100000C: 'ARM64',
      0x00000012: 'PowerPC', 0x01000012: 'PowerPC64',
    }

    const fileTypes = {
      1: 'Object', 2: 'Executable', 6: 'Dynamic Library', 7: 'Bundle',
      8: 'Dynamic Linker', 4: 'Core',
    }

    const flagNames = []
    if (flags & 0x1) flagNames.push('NOUNDEFS')
    if (flags & 0x2) flagNames.push('INCRLINK')
    if (flags & 0x4) flagNames.push('DYLDLINK')
    if (flags & 0x8) flagNames.push('BINDATLOAD')
    if (flags & 0x10) flagNames.push('PREBOUND')
    if (flags & 0x20) flagNames.push('SPLIT_SEGS')
    if (flags & 0x40) flagNames.push('TWOLEVEL')
    if (flags & 0x80) flagNames.push('FORCE_FLAT')
    if (flags & 0x100) flagNames.push('NOMULTIDEFS')
    if (flags & 0x200) flagNames.push('NOFIXPREBINDING')
    if (flags & 0x400) flagNames.push('PREBINDABLE')
    if (flags & 0x800) flagNames.push('ALLMODSBOUND')
    if (flags & 0x1000) flagNames.push('SUBSECTIONS_VIA_SYMBOLS')
    if (flags & 0x2000) flagNames.push('CANONICAL')
    if (flags & 0x4000) flagNames.push('WEAK_DEFINES')
    if (flags & 0x8000) flagNames.push('BINDS_TO_WEAK')
    if (flags & 0x10000) flagNames.push('ALLOW_STACK_EXECUTION')
    if (flags & 0x20000) flagNames.push('ROOT_SAFE')
    if (flags & 0x40000) flagNames.push('SETUID_SAFE')
    if (flags & 0x80000) flagNames.push('NO_REEXPORTED_DYLIBS')
    if (flags & 0x100000) flagNames.push('PIE')
    if (flags & 0x200000) flagNames.push('NO_DEAD_STRIP')
    if (flags & 0x400000) flagNames.push('HAS_TLV_DESCRIPTORS')
    if (flags & 0x800000) flagNames.push('NO_HEAP_EXECUTION')

    // 解析 Load Commands
    let offset = is64Bit ? 32 : 28
    for (let i = 0; i < ncmds && i < 30; i++) {
      const cmd = view.getUint32(offset, isLittleEndian)
      const cmdsize = view.getUint32(offset + 4, isLittleEndian)
      
      const cmdNames = {
        0x1: 'LC_SEGMENT', 0x19: 'LC_SEGMENT_64',
        0x2: 'LC_SYMTAB', 0x6: 'LC_SYMTAB', 0xb: 'LC_DYSYMTAB',
        0x7: 'LC_ID_DYLIB', 0x8: 'LC_LOAD_DYLIB', 0xc: 'LC_LOAD_WEAK_DYLIB',
        0x9: 'LC_ID_DYLINKER', 0xa: 'LC_LOAD_DYLINKER', 0xe: 'LC_PREBOUND_DYLIB',
        0x4: 'LC_THREAD', 0x5: 'LC_UNIXTHREAD', 0x26: 'LC_ROUTINES_64',
        0xd: 'LC_ROUTINES', 0x22: 'LC_TWOLEVEL_HINTS',
        0x10: 'LC_ID_DYLIB', 0x11: 'LC_LOAD_DYLIB', 0x12: 'LC_LOAD_WEAK_DYLIB',
        0x18: 'LC_MAIN', 0x80000000: 'LC_REQ_DYLD',
        0x80000022: 'LC_LOAD_WEAK_DYLIB',
        0x24: 'LC_UUID', 0x21: 'LC_RPATH', 0x80000024: 'LC_CODE_SIGNATURE',
        0x80000025: 'LC_SEGMENT_SPLIT_INFO', 0x80000026: 'LC_REEXPORT_DYLIB',
        0x80000027: 'LC_LAZY_LOAD_DYLIB', 0x80000028: 'LC_ENCRYPTION_INFO',
        0x80000029: 'LC_DYLD_INFO', 0x80000030: 'LC_DYLD_INFO_ONLY',
        0x80000031: 'LC_LOAD_UPWARD_DYLIB', 0x80000032: 'LC_VERSION_MIN_MACOSX',
        0x80000033: 'LC_VERSION_MIN_IPHONEOS', 0x80000034: 'LC_FUNCTION_STARTS',
        0x80000035: 'LC_DYLD_ENVIRONMENT', 0x80000036: 'LC_MAIN',
        0x80000037: 'LC_DATA_IN_CODE', 0x80000038: 'LC_SOURCE_VERSION',
        0x80000039: 'LC_DYLIB_CODE_SIGN_DRS', 0x8000003a: 'LC_ENCRYPTION_INFO_64',
        0x8000003b: 'LC_LINKER_OPTION', 0x8000003c: 'LC_LINKER_OPTIMIZATION_HINT',
        0x8000003d: 'LC_VERSION_MIN_TVOS', 0x8000003e: 'LC_VERSION_MIN_WATCHOS',
        0x80000041: 'LC_BUILD_VERSION', 0x80000042: 'LC_DYLD_EXPORTED_TRIE',
      }
      
      const cmdInfo = { 
        cmd: cmdNames[cmd] || `0x${cmd.toString(16)}`, 
        size: cmdsize,
        details: {},
      }
      
      // 解析 SEGMENT
      if (cmd === 0x19 || cmd === 0x1) { // LC_SEGMENT_64 or LC_SEGMENT
        let segName = readString(view, offset + 8, 16)
        const vmaddr = is64Bit ? view.getBigUint64(offset + 24, isLittleEndian) : view.getUint32(offset + 24, isLittleEndian)
        const vmsize = is64Bit ? view.getBigUint64(offset + 32, isLittleEndian) : view.getUint32(offset + 28, isLittleEndian)
        const fileoff = is64Bit ? view.getBigUint64(offset + 40, isLittleEndian) : view.getUint32(offset + 32, isLittleEndian)
        const filesize = is64Bit ? view.getBigUint64(offset + 48, isLittleEndian) : view.getUint32(offset + 36, isLittleEndian)
        const maxprot = is64Bit ? view.getUint32(offset + 56, isLittleEndian) : view.getUint32(offset + 40, isLittleEndian)
        const initprot = is64Bit ? view.getUint32(offset + 60, isLittleEndian) : view.getUint32(offset + 44, isLittleEndian)
        const nsects = is64Bit ? view.getUint32(offset + 64, isLittleEndian) : view.getUint32(offset + 48, isLittleEndian)
        
        cmdInfo.details = {
          segment: segName,
          vmaddr: '0x' + vmaddr.toString(16),
          vmsize: vmsize.toString(),
          fileoff: '0x' + fileoff.toString(16),
          filesize: filesize.toString(),
          sections: nsects,
          protection: { max: maxprot, init: initprot },
        }
        
        // 解析 sections
        const sectOffset = offset + (is64Bit ? 72 : 56)
        const sectSize = is64Bit ? 80 : 68
        for (let s = 0; s < nsects && s < 20; s++) {
          const sOff = sectOffset + s * sectSize
          const sectName = readString(view, sOff, 16)
          const segName2 = readString(view, sOff + 16, 16)
          const addr = is64Bit ? view.getBigUint64(sOff + 32, isLittleEndian) : view.getUint32(sOff + 32, isLittleEndian)
          const size = is64Bit ? view.getBigUint64(sOff + 40, isLittleEndian) : view.getUint32(sOff + 36, isLittleEndian)
          
          result.sections.push({
            segment: segName2,
            section: sectName,
            address: '0x' + addr.toString(16),
            size: size.toString(),
          })
        }
      }
      
      // 解析 LC_MAIN
      if (cmd === 0x80000028 || cmd === 0x18) {
        const entryoff = is64Bit ? view.getBigUint64(offset + 8, isLittleEndian) : view.getUint32(offset + 8, isLittleEndian)
        cmdInfo.details = { entryOff: '0x' + entryoff.toString(16) }
      }
      
      // 解析 LC_UUID
      if (cmd === 0x1b) {
        const uuid = []
        for (let u = 0; u < 16; u++) {
          uuid.push(view.getUint8(offset + 8 + u).toString(16).padStart(2, '0'))
        }
        cmdInfo.details = { uuid: uuid.join('') }
      }
      
      result.loadCommands.push(cmdInfo)
      offset += cmdsize
    }

    result.headers = {
      format: result.format,
      cpuType: cpuTypes[cputype] || `0x${cputype.toString(16)}`,
      cpuSubtype: cpusubtype,
      fileType: fileTypes[filetype] || `Unknown (${filetype})`,
      loadCommands: ncmds,
      flags: flagNames.slice(0, 5).join(', ') || 'None',
    }

    return { ok: true, value: result }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// 检测文件类型并解析
function detectAndParse(buffer) {
  const view = new DataView(buffer)
  
  if (view.byteLength < 64) {
    return { ok: false, error: 'File too small' }
  }
  
  const dosMagic = view.getUint16(0, true)
  if (dosMagic === 0x5A4D) return parsePE(buffer)
  
  if (view.getUint8(0) === 0x7F && view.getUint8(1) === 0x45 && view.getUint8(2) === 0x4C && view.getUint8(3) === 0x46) {
    return parseELF(buffer)
  }
  
  const magic = view.getUint32(0, false)
  if (magic === 0xFEEDFACE || magic === 0xFEEDFACF || magic === 0xCEFAEDFE || magic === 0xCFFAEDFE || magic === 0xCAFEBABE) {
    return parseMachO(buffer)
  }
  
  return { ok: false, error: 'Unknown file format. Supported: PE, ELF, Mach-O' }
}

export default function FileParser() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [result, setResult] = React.useState(null)
  const [error, setError] = React.useState('')
  const [fileName, setFileName] = React.useState('')
  const [fileSize, setFileSize] = React.useState(0)
  const [activeTab, setActiveTab] = React.useState('headers')
  const [collapsed, setCollapsed] = React.useState({})
  const [visibleCount, setVisibleCount] = React.useState({})
  const fileInputRef = React.useRef(null)

  const toggleCollapse = (key) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const loadMore = (key, increment = 100) => {
    setVisibleCount(prev => ({ ...prev, [key]: (prev[key] || 100) + increment }))
  }

  // 渐进式渲染组件 - 用于大量数据
  const ProgressiveList = ({ items, renderItem, initialCount = 100, scrollKey }) => {
    const count = visibleCount[scrollKey] || initialCount
    const visibleItems = items.slice(0, count)
    const hasMore = count < items.length

    return (
      <div>
        {visibleItems.map((item, i) => renderItem(item, i))}
        {hasMore && (
          <div 
            onClick={() => loadMore(scrollKey)}
            style={{
              padding: '12px',
              textAlign: 'center',
              color: theme.bgAccent,
              cursor: 'pointer',
              fontFamily: font.ui,
              fontSize: '12px',
            }}
          >
            {lang === 'zh' ? `加载更多 (${items.length - count} 条剩余)` : `Load more (${items.length - count} remaining)`}
          </div>
        )}
      </div>
    )
  }

  const CollapsibleSection = ({ title, count, children, defaultCollapsed = false }) => {
    const isCollapsed = collapsed[title] ?? defaultCollapsed
    return (
      <div style={{ padding: '16px', background: theme.bgSecondary, borderRadius: radius.md, border: `1px solid ${theme.border}` }}>
        <div 
          onClick={() => toggleCollapse(title)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600, color: theme.textPrimary, fontFamily: font.ui }}>
            {title}
            {count !== undefined && <span style={{ marginLeft: '8px', fontSize: '12px', color: theme.textMuted }}>({count})</span>}
          </div>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={theme.textMuted}
            strokeWidth="2"
            style={{
              transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {!isCollapsed && <div style={{ marginTop: '12px' }}>{children}</div>}
      </div>
    )
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setFileSize(file.size)
    setError('')
    setResult(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      const parsed = detectAndParse(event.target.result)
      if (parsed.ok) {
        setResult(parsed.value)
      } else {
        setError(parsed.error)
      }
    }
    reader.onerror = () => setError('Failed to read file')
    reader.readAsArrayBuffer(file)
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const tabs = [
    { id: 'headers', label: lang === 'zh' ? '基本信息' : 'Headers' },
    { id: 'sections', label: lang === 'zh' ? '节区' : 'Sections' },
    { id: 'imports', label: lang === 'zh' ? '导入表' : 'Imports' },
    { id: 'exports', label: lang === 'zh' ? '导出表' : 'Exports' },
    { id: 'resources', label: lang === 'zh' ? '资源' : 'Resources' },
    { id: 'symbols', label: lang === 'zh' ? '符号表' : 'Symbols' },
    { id: 'others', label: lang === 'zh' ? '其他' : 'Others' },
  ]

  const styles = {
    container: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
    dropZone: {
      border: `2px dashed ${theme.border}`, borderRadius: radius.md, padding: '40px',
      textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: theme.bgSecondary,
    },
    fileInfo: {
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 16px', background: theme.bgSecondary, borderRadius: radius.md,
    },
    tabs: {
      display: 'flex', gap: '2px', background: theme.bgTertiary, borderRadius: radius.sm, padding: '2px',
    },
    tab: (active) => ({
      padding: '6px 12px', background: active ? theme.bgAccent : 'transparent',
      color: active ? theme.bgPrimary : theme.textSecondary, border: 'none',
      borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontFamily: font.ui, fontWeight: 500,
    }),
    section: {
      padding: '16px', background: theme.bgSecondary, borderRadius: radius.md, border: `1px solid ${theme.border}`,
    },
    sectionTitle: {
      fontSize: '14px', fontWeight: 600, color: theme.textPrimary, marginBottom: '12px', fontFamily: font.ui,
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
    item: { padding: '8px 12px', background: theme.bgTertiary, borderRadius: radius.sm },
    itemLabel: { fontSize: '11px', color: theme.textMuted, fontFamily: font.ui },
    itemValue: { fontSize: '13px', color: theme.textPrimary, fontFamily: font.ui, marginTop: '2px', wordBreak: 'break-all' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: font.ui },
    th: { padding: '8px 12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary, fontWeight: 500 },
    td: { padding: '8px 12px', borderBottom: `1px solid ${theme.border}40`, color: theme.textPrimary },
    error: { padding: '12px', background: '#FEE2E2', borderRadius: radius.md, color: '#DC2626', fontFamily: font.ui },
    empty: { padding: '20px', textAlign: 'center', color: theme.textMuted, fontFamily: font.ui },
  }

  return (
    <div style={styles.container}>
      <div style={styles.dropZone} onClick={() => fileInputRef.current?.click()}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.bgAccent}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border}>
        <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileSelect} />
        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📁</div>
        <div style={{ fontSize: '14px', color: theme.textSecondary, fontFamily: font.ui }}>
          {lang === 'zh' ? '点击选择或拖放文件' : 'Click to select or drop a file'}
        </div>
        <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '8px', fontFamily: font.ui }}>
          {lang === 'zh' ? '支持 PE (Windows), ELF (Linux/Unix), Mach-O (macOS/iOS)' : 'Supports PE, ELF, Mach-O'}
        </div>
      </div>

      {fileName && (
        <div style={styles.fileInfo}>
          <span style={{ fontSize: '24px' }}>📄</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', color: theme.textPrimary, fontFamily: font.ui }}>{fileName}</div>
            <div style={{ fontSize: '12px', color: theme.textMuted, fontFamily: font.ui }}>{formatBytes(fileSize)}</div>
          </div>
        </div>
      )}

      {error && <div style={styles.error}>⚠️ {error}</div>}

      {result && (
        <>
          <div style={styles.tabs}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={styles.tab(activeTab === tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'headers' && result.headers && (
            <CollapsibleSection title={lang === 'zh' ? '基本信息' : 'Headers'}>
              <div style={styles.grid}>
                {Object.entries(result.headers).map(([key, value]) => (
                  <div key={key} style={styles.item}>
                    <div style={styles.itemLabel}>{key}</div>
                    <div style={styles.itemValue}>{value}</div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {activeTab === 'sections' && (
            <CollapsibleSection title={lang === 'zh' ? '节区' : 'Sections'} count={result.sections?.length}>
              {result.sections?.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowX: 'auto', overflowY: 'auto' }}>
                  <table style={styles.table}>
                    <thead><tr>
                      <th style={styles.th}>{lang === 'zh' ? '名称' : 'Name'}</th>
                      <th style={styles.th}>{lang === 'zh' ? '类型' : 'Type'}</th>
                      <th style={styles.th}>{lang === 'zh' ? '地址' : 'Address'}</th>
                      <th style={styles.th}>{lang === 'zh' ? '偏移' : 'Offset'}</th>
                      <th style={styles.th}>{lang === 'zh' ? '大小' : 'Size'}</th>
                      <th style={styles.th}>{lang === 'zh' ? '标志' : 'Flags'}</th>
                    </tr></thead>
                    <tbody>
                      {result.sections.map((s, i) => (
                        <tr key={i}>
                          <td style={styles.td}>{s.name}</td>
                          <td style={styles.td}>{s.type || '-'}</td>
                          <td style={styles.td}>{s.address || s.virtualAddress}</td>
                          <td style={styles.td}>{s.rawPointer || s.offset}</td>
                          <td style={styles.td}>{s.virtualSize || s.rawSize || s.size}</td>
                          <td style={styles.td}>{s.flags || s.characteristics || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <div style={styles.empty}>{lang === 'zh' ? '无节区信息' : 'No sections'}</div>}
            </CollapsibleSection>
          )}

          {activeTab === 'imports' && (
            <CollapsibleSection title={lang === 'zh' ? '导入表' : 'Imports'} count={result.imports?.length}>
              {result.imports?.length > 0 ? (
                result.imports.map((imp, i) => (
                  <CollapsibleSection key={i} title={imp.dll} count={imp.functions?.length} defaultCollapsed={imp.functions?.length > 50}>
                    <ProgressiveList
                      items={imp.functions || []}
                      scrollKey={`import-${i}`}
                      renderItem={(f, j) => (
                        <div key={j} style={{ padding: '4px 12px', fontSize: '12px', fontFamily: font.ui, color: theme.textSecondary }}>
                          {f.hint && <span style={{ color: theme.textMuted }}>[{f.hint}] </span>}
                          {f.name}
                        </div>
                      )}
                    />
                  </CollapsibleSection>
                ))
              ) : <div style={styles.empty}>{lang === 'zh' ? '无导入表' : 'No imports'}</div>}
            </CollapsibleSection>
          )}

          {activeTab === 'exports' && (
            <CollapsibleSection title={lang === 'zh' ? '导出表' : 'Exports'} count={result.exports?.length}>
              {result.exports?.length > 0 ? (
                <table style={styles.table}>
                  <thead><tr>
                    <th style={styles.th}>{lang === 'zh' ? '名称' : 'Name'}</th>
                    <th style={styles.th}>{lang === 'zh' ? '序号' : 'Ordinal'}</th>
                    <th style={styles.th}>{lang === 'zh' ? '地址' : 'RVA'}</th>
                  </tr></thead>
                  <tbody>
                    <ProgressiveList
                      items={result.exports}
                      scrollKey="exports"
                      renderItem={(e, i) => (
                        <tr key={i}>
                          <td style={styles.td}>{e.name}</td>
                          <td style={styles.td}>{e.ordinal}</td>
                          <td style={styles.td}>{e.rva}</td>
                        </tr>
                      )}
                    />
                  </tbody>
                </table>
              ) : <div style={styles.empty}>{lang === 'zh' ? '无导出表' : 'No exports'}</div>}
            </CollapsibleSection>
          )}

          {activeTab === 'resources' && (
            <CollapsibleSection title={lang === 'zh' ? '资源' : 'Resources'} count={result.resources?.length}>
              {result.resources?.length > 0 ? (
                <table style={styles.table}>
                  <thead><tr>
                    <th style={styles.th}>{lang === 'zh' ? '类型' : 'Type'}</th>
                    <th style={styles.th}>{lang === 'zh' ? 'ID' : 'ID'}</th>
                    <th style={styles.th}>{lang === 'zh' ? '地址' : 'RVA'}</th>
                    <th style={styles.th}>{lang === 'zh' ? '大小' : 'Size'}</th>
                  </tr></thead>
                  <tbody>
                    <ProgressiveList
                      items={result.resources}
                      scrollKey="resources"
                      renderItem={(r, i) => (
                        <tr key={i}>
                          <td style={styles.td}>{r.type}</td>
                          <td style={styles.td}>{r.id}</td>
                          <td style={styles.td}>{r.rva}</td>
                          <td style={styles.td}>{r.size}</td>
                        </tr>
                      )}
                    />
                  </tbody>
                </table>
              ) : <div style={styles.empty}>{lang === 'zh' ? '无资源信息' : 'No resources'}</div>}
            </CollapsibleSection>
          )}

          {activeTab === 'symbols' && (
            <CollapsibleSection title={lang === 'zh' ? '符号表' : 'Symbols'} count={(result.symbols?.length || 0) + (result.dynamicSymbols?.length || 0)}>
              {(result.symbols?.length > 0 || result.dynamicSymbols?.length > 0) ? (
                <table style={styles.table}>
                  <thead><tr>
                    <th style={styles.th}>{lang === 'zh' ? '名称' : 'Name'}</th>
                    <th style={styles.th}>{lang === 'zh' ? '值' : 'Value'}</th>
                    <th style={styles.th}>{lang === 'zh' ? '绑定' : 'Bind'}</th>
                    <th style={styles.th}>{lang === 'zh' ? '类型' : 'Type'}</th>
                  </tr></thead>
                  <tbody>
                    <ProgressiveList
                      items={result.symbols || result.dynamicSymbols || []}
                      scrollKey="symbols"
                      renderItem={(s, i) => (
                        <tr key={i}>
                          <td style={styles.td}>{s.name || '-'}</td>
                          <td style={styles.td}>{s.value}</td>
                          <td style={styles.td}>{s.bind}</td>
                          <td style={styles.td}>{s.type}</td>
                        </tr>
                      )}
                    />
                  </tbody>
                </table>
              ) : <div style={styles.empty}>{lang === 'zh' ? '无符号信息' : 'No symbols'}</div>}
            </CollapsibleSection>
          )}

          {activeTab === 'others' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {result.programHeaders?.length > 0 && (
                <CollapsibleSection title={lang === 'zh' ? '程序头' : 'Program Headers'} count={result.programHeaders?.length}>
                  <div style={{ maxHeight: '400px', overflowX: 'auto', overflowY: 'auto' }}>
                    <table style={styles.table}>
                      <thead><tr>
                        <th style={styles.th}>{lang === 'zh' ? '类型' : 'Type'}</th>
                        <th style={styles.th}>{lang === 'zh' ? '标志' : 'Flags'}</th>
                        <th style={styles.th}>{lang === 'zh' ? '偏移' : 'Offset'}</th>
                        <th style={styles.th}>{lang === 'zh' ? '虚拟地址' : 'VAddr'}</th>
                      </tr></thead>
                      <tbody>
                        {result.programHeaders.map((p, i) => (
                          <tr key={i}>
                            <td style={styles.td}>{p.type}</td>
                            <td style={styles.td}>{p.flags}</td>
                            <td style={styles.td}>{p.offset}</td>
                            <td style={styles.td}>{p.vaddr}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CollapsibleSection>
              )}

              {result.loadCommands?.length > 0 && (
                <CollapsibleSection title={lang === 'zh' ? '加载命令' : 'Load Commands'} count={result.loadCommands?.length}>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {result.loadCommands.map((lc, i) => (
                      <div key={i} style={{ padding: '8px 12px', background: theme.bgTertiary, borderRadius: radius.sm, marginBottom: '8px' }}>
                        <div style={{ fontFamily: font.ui, color: theme.bgAccent }}>{lc.cmd}</div>
                        <div style={{ fontSize: '11px', color: theme.textMuted, fontFamily: font.ui }}>
                          {lc.details?.segment && <span>Segment: {lc.details.segment} </span>}
                          {lc.details?.entryOff && <span>Entry: {lc.details.entryOff}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {result.tlsCallbacks?.length > 0 && (
                <CollapsibleSection title={lang === 'zh' ? 'TLS回调' : 'TLS Callbacks'} count={result.tlsCallbacks?.length}>
                  {result.tlsCallbacks.map((cb, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: theme.bgTertiary, borderRadius: radius.sm, marginBottom: '8px', fontFamily: font.ui }}>
                      {cb}
                    </div>
                  ))}
                </CollapsibleSection>
              )}

              {result.debugInfo?.length > 0 && (
                <CollapsibleSection title={lang === 'zh' ? '调试信息' : 'Debug Info'} count={result.debugInfo?.length}>
                  <table style={styles.table}>
                    <thead><tr>
                      <th style={styles.th}>{lang === 'zh' ? '类型' : 'Type'}</th>
                      <th style={styles.th}>{lang === 'zh' ? '时间' : 'Time'}</th>
                      <th style={styles.th}>{lang === 'zh' ? '大小' : 'Size'}</th>
                    </tr></thead>
                    <tbody>
                      {result.debugInfo.map((d, i) => (
                        <tr key={i}>
                          <td style={styles.td}>{d.type}</td>
                          <td style={styles.td}>{d.timeDate}</td>
                          <td style={styles.td}>{d.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CollapsibleSection>
              )}

              {result.delayedImports?.length > 0 && (
                <CollapsibleSection title={lang === 'zh' ? '延迟导入' : 'Delayed Imports'} count={result.delayedImports?.length}>
                  {result.delayedImports.map((di, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: theme.bgTertiary, borderRadius: radius.sm, marginBottom: '8px', fontFamily: font.ui }}>
                      {di.module}
                    </div>
                  ))}
                </CollapsibleSection>
              )}

              {result.relocations?.length > 0 && (
                <CollapsibleSection title={lang === 'zh' ? '重定位表' : 'Relocations'} count={result.relocations?.length} defaultCollapsed>
                  <ProgressiveList
                    items={result.relocations}
                    scrollKey="relocations"
                    renderItem={(r, i) => (
                      <div key={i} style={{ padding: '4px 12px', fontSize: '12px', fontFamily: font.ui }}>
                        {r.offset} → {r.info}
                      </div>
                    )}
                  />
                </CollapsibleSection>
              )}

              {!result.programHeaders?.length && !result.loadCommands?.length && !result.tlsCallbacks?.length && !result.debugInfo?.length && !result.delayedImports?.length && !result.relocations?.length && (
                <div style={styles.empty}>{lang === 'zh' ? '无其他信息' : 'No other info'}</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
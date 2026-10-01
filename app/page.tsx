"use client";

import { useState, useRef } from "react";

type ConversionType = "dec-bin" | "dec-hex" | "ip-bin" | "bin-hex";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ConversionType>("dec-bin");
  const [inputValue, setInputValue] = useState("");
  const [isReversed, setIsReversed] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const formatBinary = (binStr: string) => {
    return binStr.replace(/\B(?=(.{4})+(?!.))/g, " ");
  };

  const handleConvert = (val: string, type: ConversionType, reversed: boolean) => {
    const cleanVal = val.replace(/\s+/g, ''); // Remove espaços da entrada para evitar erros
    if (!cleanVal.trim()) return { result: "", steps: [], errorMsg: "" };

    try {
      if (type === "dec-bin") {
        if (!reversed) {
          // Decimal to Binary
          if (!/^\d+$/.test(cleanVal)) throw new Error("Apenas números decimais válidos.");
          const num = BigInt(cleanVal);
          const binRaw = num.toString(2);
          const binFmt = formatBinary(binRaw);
          return {
            result: binFmt,
            steps: [
              `O número decimal é ${num}`,
              `Convertido para binário: ${binRaw}`,
              `Formatado em blocos de 4 bits: ${binFmt}`
            ]
          };
        } else {
          // Binary to Decimal
          if (!/^[01]+$/.test(cleanVal)) throw new Error("Apenas 0s e 1s são permitidos.");
          const dec = BigInt("0b" + cleanVal).toString(10);
          return {
            result: dec,
            steps: [
              `O número binário fornecido é ${formatBinary(cleanVal)}`,
              `Multiplicando as potências de 2, obtemos o decimal: ${dec}`
            ]
          };
        }
      } else if (type === "dec-hex") {
        if (!reversed) {
          // Decimal to Hexadecimal
          if (!/^\d+$/.test(cleanVal)) throw new Error("Apenas números decimais válidos.");
          const num = BigInt(cleanVal);
          const hex = num.toString(16).toUpperCase();
          const binRaw = num.toString(2);
          const binFmt = formatBinary(binRaw);
          return {
            result: hex,
            steps: [
              `1. ${num} em binário é ${binFmt}.`,
              `2. Agrupando os bits (4 em 4) e convertendo para base 16: ${hex}.`
            ]
          };
        } else {
          // Hexadecimal to Decimal
          if (!/^[0-9A-Fa-f]+$/.test(cleanVal)) throw new Error("Apenas caracteres hexadecimais válidos.");
          const dec = BigInt("0x" + cleanVal).toString(10);
          return {
            result: dec,
            steps: [
              `Hexadecimal: ${cleanVal.toUpperCase()}`,
              `Convertido para decimal é ${dec}.`
            ]
          };
        }
      } else if (type === "ip-bin") {
        if (!reversed) {
          // IP to Binary
          // O IP ainda pode ter pontos, então usamos `val` original em vez de `cleanVal` (que remove espaços)
          // Mas vamos permitir remover apenas espaços, mantendo pontos.
          const ipVal = val.replace(/\s+/g, '');
          const parts = ipVal.split(".");
          if (parts.length !== 4 || parts.some(p => isNaN(Number(p)) || Number(p) < 0 || Number(p) > 255 || p === "")) {
            throw new Error("Formato de IP inválido (ex: 192.168.11.10).");
          }
          const binParts = parts.map(p => Number(p).toString(2).padStart(8, '0'));
          const binResult = binParts.join(".");
          return {
            result: binResult,
            steps: [
              `1. Dividir os octetos do IP: ${parts.join(", ")}`,
              `2. Converter cada octeto para binário de 8 bits:`,
              ...parts.map((p, i) => `   - ${p} -> ${formatBinary(binParts[i])}`),
              `3. Juntar tudo separado por pontos: ${binResult}`
            ]
          };
        } else {
          // Binary to IP
          const ipVal = val.replace(/\s+/g, '');
          const parts = ipVal.split(".");
          if (parts.length !== 4 || parts.some(p => !/^[01]{8}$/.test(p))) {
            throw new Error("Formato binário inválido (ex: 11000000.10101000.00001011.00001010).");
          }
          const decParts = parts.map(p => parseInt(p, 2));
          const ipResult = decParts.join(".");
          return {
            result: ipResult,
            steps: [
              `1. Dividir os grupos binários: ${parts.join(", ")}`,
              `2. Converter cada grupo para decimal:`,
              ...parts.map((p, i) => `   - ${formatBinary(p)} -> ${decParts[i]}`),
              `3. Juntar tudo: ${ipResult}`
            ]
          };
        }
      } else if (type === "bin-hex") {
        if (!reversed) {
          // Binary to Hexadecimal
          if (!/^[01]+$/.test(cleanVal)) throw new Error("Apenas 0s e 1s são permitidos.");
          const num = BigInt("0b" + cleanVal);
          const hex = num.toString(16).toUpperCase();
          const binFmt = formatBinary(cleanVal);
          return {
            result: hex,
            steps: [
              `Binário fornecido: ${binFmt}`,
              `Agrupando os bits (4 em 4) e convertendo para base 16: ${hex}.`
            ]
          };
        } else {
          // Hexadecimal to Binary
          if (!/^[0-9A-Fa-f]+$/.test(cleanVal)) throw new Error("Apenas caracteres hexadecimais válidos.");
          const num = BigInt("0x" + cleanVal);
          const binRaw = num.toString(2);
          const binFmt = formatBinary(binRaw);
          return {
            result: binFmt,
            steps: [
              `Hexadecimal: ${cleanVal.toUpperCase()}`,
              `Convertido para binário: ${binRaw}`,
              `Formatado em blocos de 4 bits: ${binFmt}`
            ]
          };
        }
      }
    } catch (err: any) {
      return { result: "", steps: [], errorMsg: err.message };
    }
    return { result: "", steps: [], errorMsg: "" };
  };

  const { result, steps, errorMsg } = handleConvert(inputValue, activeTab, isReversed);

  const getLabelInput = () => {
    if (activeTab === "dec-bin") return isReversed ? "Binário" : "Decimal";
    if (activeTab === "dec-hex") return isReversed ? "Hexadecimal" : "Decimal";
    if (activeTab === "ip-bin") return isReversed ? "IP Binário" : "IP Decimal (IPv4)";
    if (activeTab === "bin-hex") return isReversed ? "Hexadecimal" : "Binário";
    return "";
  };

  const getLabelOutput = () => {
    if (activeTab === "dec-bin") return isReversed ? "Decimal" : "Binário";
    if (activeTab === "dec-hex") return isReversed ? "Decimal" : "Hexadecimal";
    if (activeTab === "ip-bin") return isReversed ? "IP Decimal (IPv4)" : "IP Binário";
    if (activeTab === "bin-hex") return isReversed ? "Binário" : "Hexadecimal";
    return "";
  };

  const handleClear = () => {
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleTabChange = (tabId: ConversionType) => {
    setActiveTab(tabId);
    setInputValue("");
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4"
      style={{
        backgroundImage: "radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.15) 0px, transparent 50%)",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="w-full max-w-md flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Conversor Numérico - CCNA SENAC Papaleo
          </h1>
          <p className="text-slate-400 text-sm">Rápido, moderno e preciso.</p>
        </header>

        <main className="bg-slate-800/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
          <div className="flex bg-black/20 rounded-xl p-1 gap-1">
            {[
              { id: "dec-bin", label: "Dec ↔ Bin" },
              { id: "dec-hex", label: "Dec ↔ Hex" },
              { id: "ip-bin", label: "IP ↔ Bin" },
              { id: "bin-hex", label: "Bin ↔ Hex" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as ConversionType)}
                className={`flex-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${activeTab === tab.id ? "bg-blue-500 text-white shadow-md" : "text-slate-400 hover:text-white"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">{getLabelInput()}</label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite o valor..."
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-4 pl-4 pr-12 text-white text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {inputValue && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                  aria-label="Limpar campo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            {errorMsg && <p className="text-red-400 text-xs mt-1">{errorMsg}</p>}
          </div>

          <div className="flex flex-col items-center justify-center relative py-4 gap-1">
            <div className="absolute h-px bg-white/10 w-full top-1/2 left-0 -translate-y-1/2"></div>
            <button
              onClick={() => setIsReversed(!isReversed)}
              className="relative z-10 bg-slate-700 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 border border-white/10"
              aria-label="Inverter conversão"
              title="Clique para inverter (Ex: Hexadecimal para Decimal)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isReversed ? 'rotate-180' : ''} transition-transform duration-300`}><path d="M7 10v12" /><path d="M11 18l-4 4-4-4" /><path d="M17 14V2" /><path d="M13 6l4-4 4 4" /></svg>
            </button>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase bg-slate-800 px-3 py-1 rounded-full z-10 border border-white/5 shadow-sm">
              Inverter direção
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">{getLabelOutput()}</label>
            <div className="relative">
              <textarea
                readOnly
                value={result}
                rows={2}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl p-4 text-white text-lg resize-none pr-12"
                placeholder="Resultado..."
              ></textarea>
              {result && (
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-blue-500 rounded-lg transition-colors text-slate-300 hover:text-white"
                  aria-label="Copiar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                </button>
              )}
            </div>
          </div>

          {steps.length > 0 && (
            <div className="bg-black/20 rounded-xl p-4 mt-2">
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Passo a Passo (Explicação)</h3>
              <ul className="text-sm text-slate-300 flex flex-col gap-1 list-none">
                {steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

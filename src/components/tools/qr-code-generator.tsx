"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ToolShell, ToolPanel } from "@/components/tools/tool-shell";
import { CopyButton } from "@/components/copy-button";

// ── Minimal QR Code encoder (byte mode, error correction L) ──

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = (x << 1) ^ (x & 128 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a: number, b: number) {
  return a && b ? GF_EXP[GF_LOG[a] + GF_LOG[b]] : 0;
}

function rsEncode(data: number[], ecLen: number): number[] {
  const gen: number[] = new Array(ecLen + 1).fill(0);
  gen[0] = 1;
  for (let i = 0; i < ecLen; i++) {
    for (let j = i + 1; j >= 1; j--) {
      gen[j] = gen[j] ^ gfMul(gen[j - 1], GF_EXP[i]);
    }
  }
  const msg = [...data, ...new Array(ecLen).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef) {
      for (let j = 0; j <= ecLen; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return msg.slice(data.length);
}

const VERSION_INFO: { cap: number; ecPerBlock: number; blocks: number; dataCw: number }[] = [
  { cap: 17, ecPerBlock: 7, blocks: 1, dataCw: 19 },   // v1
  { cap: 28, ecPerBlock: 10, blocks: 1, dataCw: 34 },  // v2
  { cap: 44, ecPerBlock: 15, blocks: 1, dataCw: 55 },  // v3
  { cap: 58, ecPerBlock: 20, blocks: 1, dataCw: 80 },  // v4
  { cap: 74, ecPerBlock: 26, blocks: 1, dataCw: 108 }, // v5
  { cap: 86, ecPerBlock: 18, blocks: 2, dataCw: 136 }, // v6
  { cap: 98, ecPerBlock: 20, blocks: 2, dataCw: 156 }, // v7
  { cap: 114, ecPerBlock: 24, blocks: 2, dataCw: 194 },// v8
  { cap: 122, ecPerBlock: 30, blocks: 2, dataCw: 232 },// v9
  { cap: 130, ecPerBlock: 18, blocks: 4, dataCw: 274 },// v10
];

function encodeQR(text: string): boolean[][] | null {
  const bytes = new TextEncoder().encode(text);
  const len = bytes.length;

  const vIdx = VERSION_INFO.findIndex((v) => v.cap >= len);
  if (vIdx < 0) return null;
  const version = vIdx + 1;
  const info = VERSION_INFO[vIdx];
  const size = 17 + version * 4;

  // Build data codewords (byte mode)
  const bits: number[] = [];
  const pushBits = (val: number, count: number) => {
    for (let i = count - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };
  pushBits(0b0100, 4); // byte mode indicator
  pushBits(len, version >= 10 ? 16 : 8); // character count
  for (const b of bytes) pushBits(b, 8);
  pushBits(0, 4); // terminator (up to 4 bits)

  while (bits.length % 8) bits.push(0);
  const totalDataCw = info.dataCw;
  while (bits.length < totalDataCw * 8) {
    pushBits(0xec, 8);
    if (bits.length < totalDataCw * 8) pushBits(0x11, 8);
  }

  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] || 0);
    codewords.push(byte);
  }

  // Error correction
  const cwPerBlock = Math.floor(totalDataCw / info.blocks);
  const ecCw: number[][] = [];
  const dataCwBlocks: number[][] = [];
  for (let b = 0; b < info.blocks; b++) {
    const start = b * cwPerBlock;
    const block = codewords.slice(start, start + cwPerBlock);
    dataCwBlocks.push(block);
    ecCw.push(rsEncode(block, info.ecPerBlock));
  }

  // Interleave
  const interleaved: number[] = [];
  const maxDataLen = Math.max(...dataCwBlocks.map((b) => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of dataCwBlocks) {
      if (i < block.length) interleaved.push(block[i]);
    }
  }
  for (let i = 0; i < info.ecPerBlock; i++) {
    for (const block of ecCw) {
      if (i < block.length) interleaved.push(block[i]);
    }
  }

  // Create matrix
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    new Array(size).fill(null)
  );

  const set = (r: number, c: number, v: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) matrix[r][c] = v;
  };

  // Finder patterns
  const drawFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
        set(row + r, col + c, inInner || (inOuter && onBorder));
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  // Alignment patterns (v2+)
  if (version >= 2) {
    const pos = [6, size - 7];
    if (version >= 7) pos.splice(1, 0, Math.floor((6 + size - 7) / 2));
    for (const r of pos) {
      for (const c of pos) {
        if (matrix[r][c] !== null) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            set(r + dr, c + dc, Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0));
          }
        }
      }
    }
  }

  // Dark module + reserved areas
  set(size - 8, 8, true);

  // Reserve format info areas
  for (let i = 0; i < 8; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
    if (matrix[8][size - 1 - i] === null) matrix[8][size - 1 - i] = false;
    if (matrix[size - 1 - i][8] === null) matrix[size - 1 - i][8] = false;
  }
  if (matrix[8][8] === null) matrix[8][8] = false;

  // Place data bits
  const dataBits: number[] = [];
  for (const byte of interleaved) {
    for (let i = 7; i >= 0; i--) dataBits.push((byte >> i) & 1);
  }

  let bitIdx = 0;
  let upward = true;
  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5; // skip timing column
    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);
    for (const row of rows) {
      for (const dc of [0, -1]) {
        const c = col + dc;
        if (c < 0 || c >= size) continue;
        if (matrix[row][c] !== null) continue;
        matrix[row][c] = bitIdx < dataBits.length ? dataBits[bitIdx++] === 1 : false;
      }
    }
    upward = !upward;
  }

  // Apply mask (pattern 0: (row + col) % 2 === 0) and write format info
  const FORMAT_BITS = 0b000011010011101; // mask 0, ECL L
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === null) matrix[r][c] = false;
    }
  }

  // Apply mask only to data modules
  const isData = (r: number, c: number) => {
    // Check if module is a function pattern
    if (r < 9 && c < 9) return false;
    if (r < 9 && c >= size - 8) return false;
    if (r >= size - 8 && c < 9) return false;
    if (r === 6 || c === 6) return false;
    return true;
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isData(r, c) && (r + c) % 2 === 0) {
        matrix[r][c] = !matrix[r][c];
      }
    }
  }

  // Write format info
  const fmtBits: boolean[] = [];
  for (let i = 14; i >= 0; i--) fmtBits.push(((FORMAT_BITS >> i) & 1) === 1);

  const positions = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];
  for (let i = 0; i < 15; i++) set(positions[i][0], positions[i][1], fmtBits[i]);

  const positions2 = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8],
    [size - 5, 8], [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5],
    [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1],
  ];
  for (let i = 0; i < 15; i++) set(positions2[i][0], positions2[i][1], fmtBits[i]);

  return matrix as boolean[][];
}

// ── Component ──

export function QrCodeGenerator() {
  const [input, setInput] = useState("");
  const [qrSize, setQrSize] = useState(300);
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!input.trim()) {
      canvas.width = qrSize;
      canvas.height = qrSize;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, qrSize, qrSize);
      ctx.fillStyle = "#aaa";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Enter text to generate QR", qrSize / 2, qrSize / 2);
      setError(null);
      return;
    }

    const matrix = encodeQR(input);
    if (!matrix) {
      setError("Text too long for QR encoding (max ~130 bytes).");
      canvas.width = qrSize;
      canvas.height = qrSize;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, qrSize, qrSize);
      return;
    }

    setError(null);
    const modules = matrix.length;
    const quiet = 4;
    const total = modules + quiet * 2;
    const cellSize = qrSize / total;

    canvas.width = qrSize;
    canvas.height = qrSize;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, qrSize, qrSize);

    ctx.fillStyle = fg;
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        if (matrix[r][c]) {
          ctx.fillRect(
            Math.floor((c + quiet) * cellSize),
            Math.floor((r + quiet) * cellSize),
            Math.ceil(cellSize),
            Math.ceil(cellSize)
          );
        }
      }
    }
  }, [input, qrSize, fg, bg]);

  useEffect(() => { render(); }, [render]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    a.click();
  };

  const dataUrl = canvasRef.current?.toDataURL("image/png") || "";

  return (
    <ToolShell
      title="QR Code Generator"
      description="Paste a URL or text. Get a QR code. Download it as PNG."
    >
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Left: Input */}
        <div className="space-y-4">
          <ToolPanel
            label="Text / URL"
            actions={
              <div className="flex gap-2">
                <button
                  onClick={() => setInput("https://apibee.io")}
                  className="text-[10px] font-bold text-[var(--accent)] cursor-pointer hover:underline"
                >
                  Load Example
                </button>
                <button
                  onClick={() => setInput("")}
                  className="text-[10px] font-bold text-[var(--text-muted)] cursor-pointer hover:text-[var(--text)]"
                >
                  Clear
                </button>
              </div>
            }
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full min-h-[120px] bg-[var(--code-bg)] px-4 py-3 text-[13px] font-mono text-[var(--code-fg)] resize-y outline-none leading-[1.6] placeholder-[#525252] focus:outline-none focus:ring-0 focus-visible:outline-none border-none"
              placeholder="https://apibee.io"
              spellCheck={false}
            />
          </ToolPanel>

          {/* Settings */}
          <div className="rounded-xl border border-[var(--border)] p-4 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1 block">
                Size: {qrSize}px
              </label>
              <input
                type="range"
                min={150}
                max={600}
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>
            <div className="flex gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1 block">
                  Foreground
                </label>
                <input
                  type="color"
                  value={fg}
                  onChange={(e) => setFg(e.target.value)}
                  className="w-10 h-8 rounded cursor-pointer border border-[var(--border)]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1 block">
                  Background
                </label>
                <input
                  type="color"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="w-10 h-8 rounded cursor-pointer border border-[var(--border)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: QR output */}
        <ToolPanel
          label="QR Code"
          dark
          actions={
            <div className="flex gap-2">
              <button
                onClick={download}
                className="text-[10px] font-bold text-[var(--accent)] cursor-pointer hover:underline"
              >
                Download PNG
              </button>
              {dataUrl && (
                <CopyButton text={dataUrl} label="Data URL" className="text-[10px] text-[#525252] hover:text-[var(--accent)]" />
              )}
            </div>
          }
        >
          <div className="bg-[var(--code-bg)] p-6 flex items-center justify-center min-h-[350px]">
            <canvas
              ref={canvasRef}
              style={{ width: Math.min(qrSize, 400), height: Math.min(qrSize, 400), imageRendering: "pixelated" }}
              className="rounded"
            />
          </div>
          {error && (
            <div className="px-4 py-2 text-[11px] text-red-400 font-mono">
              {error}
            </div>
          )}
        </ToolPanel>
      </div>
    </ToolShell>
  );
}

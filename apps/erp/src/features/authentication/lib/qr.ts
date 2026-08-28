/* Self-contained QR encoder for TOTP provisioning URIs. Fixed QR Version 10-L (57x57, 274 data codewords). */
const VERSION = 10,
  SIZE = 57,
  DATA_CODEWORDS = 274,
  ECC_PER_BLOCK = 18,
  BLOCKS = 4;
function appendBits(out: number[], value: number, count: number) {
  for (let i = count - 1; i >= 0; i--) out.push((value >>> i) & 1);
}
function multiply(x: number, y: number) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ (((z >>> 7) & 1) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}
function divisor(degree: number) {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = multiply(result[j] ?? 0, root);
      if (j + 1 < degree) result[j] = (result[j] ?? 0) ^ (result[j + 1] ?? 0);
    }
    root = multiply(root, 2);
  }
  return result;
}
function remainder(data: number[], div: number[]) {
  const result = new Array<number>(div.length).fill(0);
  for (const b of data) {
    const factor = b ^ (result.shift() ?? 0);
    result.push(0);
    for (let i = 0; i < div.length; i++)
      result[i] = (result[i] ?? 0) ^ multiply(div[i] ?? 0, factor);
  }
  return result;
}
function codewords(text: string) {
  const bytes = Array.from(new TextEncoder().encode(text));
  if (bytes.length > 271)
    throw new Error("TOTP provisioning URI is too long for the local QR encoder.");
  const bits: number[] = [];
  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, 16);
  for (const b of bytes) appendBits(bits, b, 8);
  for (let i = 0; i < Math.min(4, DATA_CODEWORDS * 8 - bits.length); i++) bits.push(0);
  while (bits.length % 8) bits.push(0);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | (bits[i + j] ?? 0);
    data.push(b);
  }
  for (let p = 0; data.length < DATA_CODEWORDS; p++) data.push(p % 2 === 0 ? 0xec : 0x11);
  const base = Math.floor(DATA_CODEWORDS / BLOCKS),
    long = DATA_CODEWORDS % BLOCKS;
  const blocks: number[][] = [],
    ecc: number[][] = [],
    gen = divisor(ECC_PER_BLOCK);
  let k = 0;
  for (let i = 0; i < BLOCKS; i++) {
    const len = base + (i >= BLOCKS - long ? 1 : 0);
    const block = data.slice(k, k + len);
    k += len;
    blocks.push(block);
    ecc.push(remainder(block, gen));
  }
  const out: number[] = [];
  for (let i = 0; i < base + 1; i++) {
    for (const b of blocks) {
      const val = b[i];
      if (val !== undefined) out.push(val);
    }
  }
  for (let i = 0; i < ECC_PER_BLOCK; i++) {
    for (const e of ecc) {
      const val = e[i];
      if (val !== undefined) out.push(val);
    }
  }
  return out;
}
function bchFormat(mask: number) {
  const data = (1 << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ (((rem >>> 9) & 1) * 0x537);
  return ((data << 10) | rem) ^ 0x5412;
}
function bchVersion() {
  let rem = VERSION;
  for (let i = 0; i < 12; i++) rem = (rem << 1) ^ (((rem >>> 11) & 1) * 0x1f25);
  return (VERSION << 12) | rem;
}
export function qrMatrix(text: string) {
  const m = Array.from({ length: SIZE }, () => new Array<boolean>(SIZE).fill(false));
  const f = Array.from({ length: SIZE }, () => new Array<boolean>(SIZE).fill(false));
  const set = (x: number, y: number, v: boolean) => {
    if (x >= 0 && y >= 0 && x < SIZE && y < SIZE) {
      const rowM = m[y];
      if (rowM) rowM[x] = v;
      const rowF = f[y];
      if (rowF) rowF[x] = true;
    }
  };
  const finder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        set(cx + dx, cy + dy, dist !== 2 && dist !== 4);
      }
  };
  finder(3, 3);
  finder(SIZE - 4, 3);
  finder(3, SIZE - 4);
  for (let i = 8; i < SIZE - 8; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  for (const cy of [6, 28, 50])
    for (const cx of [6, 28, 50]) {
      if (f[cy]?.[cx]) continue;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++)
          set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  const fmt = bchFormat(0),
    bit = (i: number) => ((fmt >>> i) & 1) !== 0;
  for (let i = 0; i <= 5; i++) set(8, i, bit(i));
  set(8, 7, bit(6));
  set(8, 8, bit(7));
  set(7, 8, bit(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
  for (let i = 0; i < 8; i++) set(SIZE - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) set(8, SIZE - 15 + i, bit(i));
  set(8, SIZE - 8, true);
  const ver = bchVersion();
  for (let i = 0; i < 18; i++) {
    const v = ((ver >>> i) & 1) !== 0;
    const a = SIZE - 11 + (i % 3),
      b = Math.floor(i / 3);
    set(a, b, v);
    set(b, a, v);
  }
  const cw = codewords(text);
  const dataBits: number[] = [];
  for (const b of cw) appendBits(dataBits, b, 8);
  let pos = 0,
    up = true;
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right--;
    for (let vert = 0; vert < SIZE; vert++) {
      const y = up ? SIZE - 1 - vert : vert;
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        if (f[y]?.[x]) continue;
        const raw = pos < dataBits.length ? dataBits[pos++] !== 0 : false;
        const masked = raw !== ((x + y) % 2 === 0);
        const rowM = m[y];
        if (rowM) rowM[x] = masked;
      }
    }
    up = !up;
  }
  return m;
}
export function qrSvgDataUri(text: string) {
  const matrix = qrMatrix(text),
    quiet = 4,
    size = matrix.length + quiet * 2;
  let path = "";
  for (let y = 0; y < matrix.length; y++)
    for (let x = 0; x < matrix.length; x++)
      if (matrix[y]?.[x]) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="white"/><path d="${path}" fill="black"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export type CriterionStatus = 'excellent' | 'good' | 'warning' | 'error';

export interface PhotoCriterion {
  key: string;
  label: string;
  score: number; // 0-100
  status: CriterionStatus;
  value: string;
  advice: string;
}

export interface PhotoReport {
  overall: number;
  passed: boolean;
  criteria: PhotoCriterion[];
  width: number;
  height: number;
  sizeKB: number;
  format: string;
  faceBox: { x: number; y: number; w: number; h: number } | null;
}

export const MIN_ACCEPTABLE_SCORE = 70;
export const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_MB = 12;

const statusOf = (s: number): CriterionStatus =>
  s >= 85 ? 'excellent' : s >= 70 ? 'good' : s >= 45 ? 'warning' : 'error';

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image illisible'));
    img.src = src;
  });
}

function toCanvas(img: HTMLImageElement, maxSide = 480) {
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  return { canvas: c, ctx, w, h };
}

/** Analyse complète : netteté, exposition, contraste, cadrage visage, fond, résolution, format. */
export async function analyzePhoto(dataUrl: string, fileSizeBytes: number, mime: string): Promise<PhotoReport> {
  const img = await loadImage(dataUrl);
  const { ctx, w, h } = toCanvas(img);
  const { data } = ctx.getImageData(0, 0, w, h);

  // --- Luminance map + statistics ---
  const lum = new Float32Array(w * h);
  let sum = 0, skinCount = 0;
  let sxMin = w, sxMax = 0, syMin = h, syMax = 0;
  let skinSumX = 0, skinSumY = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lum[p] = l;
    sum += l;
    // skin detection (RGB rule + YCbCr rule)
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    const rgbRule = r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15 &&
      (Math.max(r, g, b) - Math.min(r, g, b)) > 15;
    const ycRule = cb >= 77 && cb <= 130 && cr >= 133 && cr <= 176;
    if (rgbRule && ycRule) {
      skinCount++;
      const x = p % w, y = (p / w) | 0;
      skinSumX += x; skinSumY += y;
      if (x < sxMin) sxMin = x; if (x > sxMax) sxMax = x;
      if (y < syMin) syMin = y; if (y > syMax) syMax = y;
    }
  }
  const mean = sum / (w * h);
  let varSum = 0;
  for (let i = 0; i < lum.length; i++) varSum += (lum[i] - mean) ** 2;
  const std = Math.sqrt(varSum / lum.length);

  // --- Sharpness: Laplacian variance ---
  let lapSum = 0, lapSq = 0, n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      const v = 4 * lum[p] - lum[p - 1] - lum[p + 1] - lum[p - w] - lum[p + w];
      lapSum += v; lapSq += v * v; n++;
    }
  }
  const lapMean = lapSum / n;
  const sharpness = lapSq / n - lapMean * lapMean; // variance

  // --- Background uniformity (border band) ---
  const band = Math.max(2, Math.round(Math.min(w, h) * 0.06));
  let bSum = 0, bCount = 0;
  const bVals: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x < band || x >= w - band || y < band) {
        const v = lum[y * w + x];
        bSum += v; bCount++; bVals.push(v);
      }
    }
  }
  const bMean = bSum / bCount;
  let bVar = 0;
  for (const v of bVals) bVar += (v - bMean) ** 2;
  const bgStd = Math.sqrt(bVar / bCount);

  // --- Clipping (over/under exposure) ---
  let dark = 0, bright = 0;
  for (let i = 0; i < lum.length; i++) {
    if (lum[i] < 12) dark++;
    else if (lum[i] > 245) bright++;
  }
  const clip = ((dark + bright) / lum.length) * 100;

  const skinRatio = (skinCount / (w * h)) * 100;
  const faceBox = skinCount > w * h * 0.005
    ? { x: sxMin / w, y: syMin / h, w: (sxMax - sxMin) / w, h: (syMax - syMin) / h }
    : null;
  const faceCx = skinCount ? (skinSumX / skinCount) / w : 0.5;
  const faceCy = skinCount ? (skinSumY / skinCount) / h : 0.5;

  const criteria: PhotoCriterion[] = [];
  const push = (key: string, label: string, score: number, value: string, advice: string) =>
    criteria.push({ key, label, score: Math.round(Math.max(0, Math.min(100, score))), status: statusOf(score), value, advice });

  // 1. Résolution
  const minSide = Math.min(img.width, img.height);
  const resScore = minSide >= 800 ? 100 : minSide >= 600 ? 90 : minSide >= 400 ? 75 : minSide >= 250 ? 45 : 15;
  push('resolution', 'Résolution', resScore, `${img.width} × ${img.height} px`,
    minSide >= 600 ? 'Résolution idéale pour une impression nette.' : 'Utilisez une photo d\'au moins 600 px de côté pour éviter le flou à l\'impression.');

  // 2. Format / cadrage
  const ratio = img.width / img.height;
  const ratioScore = ratio >= 0.72 && ratio <= 0.82 ? 100 : ratio >= 0.9 && ratio <= 1.1 ? 92 : ratio >= 0.6 && ratio <= 1.35 ? 72 : 40;
  push('ratio', 'Format / proportions', ratioScore, ratio.toFixed(2) + ':1',
    ratioScore >= 92 ? 'Format portrait/carré parfait pour un CV.' : 'Préférez un format portrait 3:4 ou carré 1:1 — le recadrage ci-dessous le corrige automatiquement.');

  // 3. Netteté
  const sharpScore = sharpness >= 900 ? 100 : sharpness >= 450 ? 88 : sharpness >= 200 ? 72 : sharpness >= 90 ? 50 : 20;
  push('sharpness', 'Netteté / clarté', sharpScore, sharpness < 90 ? 'Floue' : sharpness < 450 ? 'Correcte' : 'Très nette',
    sharpScore >= 72 ? 'Le visage est net et lisible.' : 'Photo floue : reprenez-la avec une mise au point sur le visage et un appareil stable.');

  // 4. Exposition
  const expoScore = mean >= 105 && mean <= 180 ? 100 : mean >= 85 && mean <= 205 ? 78 : mean >= 60 && mean <= 225 ? 50 : 22;
  push('exposure', 'Exposition / lumière', expoScore, mean < 85 ? 'Sombre' : mean > 205 ? 'Surexposée' : 'Équilibrée',
    expoScore >= 78 ? 'Éclairage équilibré et flatteur.' : 'Photographiez face à une lumière douce (fenêtre), sans contre-jour.');

  // 5. Contraste
  const contrastScore = std >= 55 ? 100 : std >= 42 ? 88 : std >= 30 ? 68 : std >= 20 ? 45 : 20;
  push('contrast', 'Contraste', contrastScore, std < 30 ? 'Plat' : std < 55 ? 'Correct' : 'Excellent',
    contrastScore >= 68 ? 'Bon relief, le sujet se détache.' : 'Image terne : activez l\'amélioration automatique ci-dessous.');

  // 6. Cadrage du visage
  let frameScore: number, frameValue: string, frameAdvice: string;
  if (!faceBox) {
    frameScore = 30; frameValue = 'Visage non détecté';
    frameAdvice = 'Aucun visage clairement identifié : cadrez la tête et les épaules, visage bien éclairé et dégagé.';
  } else {
    const cover = skinRatio;
    const sizeOk = cover >= 6 && cover <= 42;
    const centerErr = Math.abs(faceCx - 0.5) + Math.abs(faceCy - 0.42);
    frameScore = (sizeOk ? 60 : 30) + Math.max(0, 40 - centerErr * 110);
    frameValue = `Visage ${cover < 6 ? 'trop petit' : cover > 42 ? 'trop proche' : 'bien dimensionné'}`;
    frameAdvice = frameScore >= 70
      ? 'Cadrage professionnel : tête et épaules bien centrées.'
      : 'Centrez le visage dans le tiers supérieur et cadrez tête + épaules (portrait type identité professionnelle).';
  }
  push('framing', 'Cadrage du visage', frameScore, frameValue, frameAdvice);

  // 7. Arrière-plan
  const bgScore = bgStd <= 18 ? 100 : bgStd <= 30 ? 85 : bgStd <= 45 ? 62 : bgStd <= 60 ? 40 : 22;
  push('background', 'Arrière-plan', bgScore, bgStd <= 30 ? 'Uni et sobre' : 'Chargé',
    bgScore >= 62 ? 'Fond neutre : le regard va vers vous.' : 'Fond trop chargé : choisissez un mur uni clair ou un fond neutre.');

  // 8. Détails (écrêtage)
  const clipScore = clip <= 1 ? 100 : clip <= 3 ? 85 : clip <= 7 ? 60 : clip <= 15 ? 35 : 15;
  push('details', 'Détails / ombres', clipScore, `${clip.toFixed(1)} % de pixels écrêtés`,
    clipScore >= 60 ? 'Les détails sont préservés dans les ombres et lumières.' : 'Zones brûlées ou bouchées : évitez le flash direct et le contre-jour.');

  // 9. Poids & format de fichier
  const sizeKB = fileSizeBytes / 1024;
  const fmtOk = ACCEPTED_FORMATS.includes(mime);
  const fileScore = !fmtOk ? 35 : sizeKB > MAX_FILE_SIZE_MB * 1024 ? 45 : sizeKB < 25 ? 55 : 100;
  push('file', 'Fichier', fileScore, `${mime.replace('image/', '').toUpperCase()} · ${sizeKB < 1024 ? sizeKB.toFixed(0) + ' Ko' : (sizeKB / 1024).toFixed(1) + ' Mo'}`,
    fileScore === 100 ? 'Format et poids optimaux (export compressé automatiquement).' : 'Utilisez un JPEG ou PNG de qualité, entre 100 Ko et 12 Mo.');

  // Pondération : la clarté et le cadrage priment
  const weights: Record<string, number> = {
    resolution: 1.3, ratio: 0.8, sharpness: 1.8, exposure: 1.3,
    contrast: 1.0, framing: 1.6, background: 0.9, details: 0.8, file: 0.5,
  };
  let wSum = 0, wScore = 0;
  criteria.forEach(c => { const wt = weights[c.key] ?? 1; wSum += wt; wScore += c.score * wt; });
  const overall = Math.round(wScore / wSum);

  return {
    overall,
    passed: overall >= MIN_ACCEPTABLE_SCORE && criteria.every(c => c.status !== 'error'),
    criteria,
    width: img.width,
    height: img.height,
    sizeKB,
    format: mime,
    faceBox,
  };
}

export interface RenderOptions {
  zoom: number;        // 1 = fit
  offsetX: number;     // -1..1
  offsetY: number;     // -1..1
  enhance: boolean;    // auto contraste/luminosité + netteté
  grayscale: boolean;
  rotate: number;      // degrés
  shape: 'rect' | 'circle';
  aspect: number;      // largeur/hauteur cible (0.75 = 3:4)
}

/** Recadre, oriente et optimise la photo → JPEG haute qualité prêt pour le CV. */
export async function renderPhoto(src: string, o: RenderOptions, outHeight = 900): Promise<string> {
  const img = await loadImage(src);
  const outH = outHeight;
  const outW = Math.round(outHeight * o.aspect);
  const canvas = document.createElement('canvas');
  canvas.width = outW; canvas.height = outH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outW, outH);

  ctx.save();
  if (o.shape === 'circle') {
    ctx.beginPath();
    ctx.arc(outW / 2, outH / 2, Math.min(outW, outH) / 2, 0, Math.PI * 2);
    ctx.clip();
  }
  ctx.translate(outW / 2, outH / 2);
  if (o.rotate) ctx.rotate((o.rotate * Math.PI) / 180);

  const baseScale = Math.max(outW / img.width, outH / img.height);
  const scale = baseScale * o.zoom;
  const dw = img.width * scale, dh = img.height * scale;
  const maxDx = Math.max(0, (dw - outW) / 2), maxDy = Math.max(0, (dh - outH) / 2);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, -dw / 2 + o.offsetX * maxDx, -dh / 2 + o.offsetY * maxDy, dw, dh);
  ctx.restore();

  if (o.enhance || o.grayscale) {
    const imgData = ctx.getImageData(0, 0, outW, outH);
    const d = imgData.data;

    if (o.enhance) {
      // auto-levels via percentile stretch
      const hist = new Uint32Array(256);
      for (let i = 0; i < d.length; i += 4) {
        const l = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) | 0;
        hist[l]++;
      }
      const total = outW * outH;
      let acc = 0, lo = 0, hi = 255;
      for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc > total * 0.005) { lo = i; break; } }
      acc = 0;
      for (let i = 255; i >= 0; i--) { acc += hist[i]; if (acc > total * 0.005) { hi = i; break; } }
      const range = Math.max(1, hi - lo);
      const gamma = 1.03;
      for (let i = 0; i < d.length; i += 4) {
        for (let k = 0; k < 3; k++) {
          let v = ((d[i + k] - lo) / range) * 255;
          v = 255 * Math.pow(Math.max(0, Math.min(1, v / 255)), gamma);
          d[i + k] = Math.max(0, Math.min(255, v));
        }
      }
    }

    if (o.grayscale) {
      for (let i = 0; i < d.length; i += 4) {
        const g = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        d[i] = d[i + 1] = d[i + 2] = g;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    if (o.enhance) {
      // unsharp mask léger
      const src2 = ctx.getImageData(0, 0, outW, outH);
      const out = ctx.createImageData(outW, outH);
      const s = src2.data, t = out.data;
      const amount = 0.45;
      for (let y = 0; y < outH; y++) {
        for (let x = 0; x < outW; x++) {
          const p = (y * outW + x) * 4;
          for (let k = 0; k < 3; k++) {
            if (x === 0 || y === 0 || x === outW - 1 || y === outH - 1) { t[p + k] = s[p + k]; continue; }
            const blur = (s[p + k - 4] + s[p + k + 4] + s[p + k - outW * 4] + s[p + k + outW * 4] + s[p + k] * 4) / 8;
            t[p + k] = Math.max(0, Math.min(255, s[p + k] + (s[p + k] - blur) * amount * 2));
          }
          t[p + 3] = s[p + 3];
        }
      }
      ctx.putImageData(out, 0, 0);
    }
  }

  return canvas.toDataURL('image/jpeg', 0.93);
}

export const scoreColor = (s: number) =>
  s >= 85 ? '#059669' : s >= 70 ? '#2563eb' : s >= 45 ? '#d97706' : '#dc2626';

export const scoreLabel = (s: number) =>
  s >= 85 ? 'Excellente' : s >= 70 ? 'Bonne' : s >= 45 ? 'Perfectible' : 'Insuffisante';

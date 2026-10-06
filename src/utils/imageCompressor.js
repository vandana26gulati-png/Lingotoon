/**
 * High-Performance Client-Side Image Resizer & Optimizer
 * Compresses storyboard frames & character sheets into lightweight base64 / JPEG
 * so that full databases stay ultra-compact (< 150KB), sync effortlessly across
 * Google Apps Script / Drive / ScriptProperties, and load instantly on all collaborator devices.
 */

export function compressImageFile(file, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.82
  } = options;

  return new Promise((resolve) => {
    if (!file) {
      resolve(null);
      return;
    }

    // Keep SVGs and GIFs in original format to preserve vectors / animations
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result || null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const originalDataUrl = event.target?.result;
      if (!originalDataUrl) {
        resolve(null);
        return;
      }

      // Check if running in browser environment with Image & Canvas
      if (typeof Image === 'undefined' || typeof document === 'undefined') {
        resolve(originalDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // Only downscale if the image exceeds max boundaries
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(originalDataUrl);
            return;
          }

          // Fill white background in case source is a transparent PNG being converted to JPEG
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);

          ctx.drawImage(img, 0, 0, width, height);

          // Export as optimized JPEG
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (err) {
          console.warn('Image compression fallback:', err);
          resolve(originalDataUrl);
        }
      };

      img.onerror = () => resolve(originalDataUrl);
      img.src = originalDataUrl;
    };

    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

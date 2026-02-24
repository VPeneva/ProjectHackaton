const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

const wrapText = (ctx, text, x, y, maxWidth, lineHeight, maxLines) => {
  const words = text.split(' ')
  let line = ''
  let lines = 0

  for (let i = 0; i < words.length; i += 1) {
    const testLine = `${line}${words[i]} `
    const { width } = ctx.measureText(testLine)
    if (width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, y)
      line = `${words[i]} `
      y += lineHeight
      lines += 1
      if (lines >= maxLines - 1) {
        break
      }
    } else {
      line = testLine
    }
  }
  ctx.fillText(line.trim(), x, y)
}

export const generateShareImage = async ({
  title,
  statusLabel,
  address,
  imageUrl,
}) => {
  const canvas = document.createElement('canvas')
  const width = 1200
  const height = 630
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#0f172a')
  gradient.addColorStop(1, '#1e293b')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  const imageArea = { x: 640, y: 0, w: 560, h: 630 }
  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl)
      const scale = Math.max(imageArea.w / img.width, imageArea.h / img.height)
      const drawWidth = img.width * scale
      const drawHeight = img.height * scale
      const drawX = imageArea.x + (imageArea.w - drawWidth) / 2
      const drawY = imageArea.y + (imageArea.h - drawHeight) / 2
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
      ctx.fillRect(imageArea.x, imageArea.y, imageArea.w, imageArea.h)
    } catch (err) {
      // Ignore image load failures
    }
  }

  ctx.fillStyle = '#fbbf24'
  ctx.fillRect(80, 70, 160, 40)
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 18px Inter, system-ui, sans-serif'
  ctx.fillText(statusLabel, 92, 96)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px Inter, system-ui, sans-serif'
  wrapText(ctx, title, 80, 170, 520, 58, 3)

  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = '20px Inter, system-ui, sans-serif'
  if (address) {
    wrapText(ctx, address, 80, 360, 520, 28, 2)
  }

  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '18px Inter, system-ui, sans-serif'
  ctx.fillText('CityClarity', 80, 560)

  return canvas.toDataURL('image/png')
}

export default generateShareImage

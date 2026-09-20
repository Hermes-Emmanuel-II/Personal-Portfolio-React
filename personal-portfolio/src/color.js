export default function color (source, quantize = 16, sampleSize = 100) {
    return new Promise((resolve, reject) => {
        const img = typeof source === 'string' ? new Image() : source

        function process () {
            const canvas = document.createElement('canvas')
            const scale = Math.min(1, sampleSize / Math.max(img.naturalWidth, img.naturalHeight))
            canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
            canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))

            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

            let data
            try {
                data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
            } catch (err) {
                reject(err)
                return
            }

            const buckets = new Map()

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i]
                const g = data[i + 1]
                const b = data[i + 2]
                const a = data[i + 3]
                if (a < 125) continue

                const qr = Math.round(r / quantize) * quantize
                const qg = Math.round(g / quantize) * quantize
                const qb = Math.round(b / quantize) * quantize
                const key = `${ qr },${ qg },${ qb }`

                const bucket = buckets.get(key)
                if (bucket) {
                    bucket.count++
                    bucket.rSum += r
                    bucket.gSum += g
                    bucket.bSum += b
                } else {
                    buckets.set(key, { count: 1, rSum: r, gSum: g, bSum: b })
                }
            }

            let best = null
            for (const bucket of buckets.values()) {
                if (!best || bucket.count > best.count) best = bucket
            }

            if (!best) {
                reject(new Error('No opaque pixels found in image'))
                return
            }

            const r = Math.round(best.rSum / best.count)
            const g = Math.round(best.gSum / best.count)
            const b = Math.round(best.bSum / best.count)
            const hex = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')

            resolve({ r, g, b, hex })
        }

        if (typeof source === 'string') {
            img.crossOrigin = 'anonymous'
            img.onload = process
            img.onerror = reject
            img.src = source
        } else if (img.complete) {
            process()
        } else {
            img.onload = process
            img.onerror = reject
        }
    })
}
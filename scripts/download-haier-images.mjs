import fs from 'node:fs/promises'
import path from 'node:path'

const products = [
  {
    id: 'hrf-458tif',
    page: 'https://www.haier.com/pk/refrigerators/hrf-458tif.shtml',
    fallback: 'https://image.haier.com/pk/refrigerators/W020260422545513867417_60.jpg',
  },
  {
    id: 'hsu-14hftex',
    page: 'https://www.haier.com/pk/air-conditioners/hsu-14hftex013wdc-ow--t3plus.shtml',
    fallback: 'https://image.haier.com/pk/air-conditioners/W020260403690235466110_60.png',
  },
  {
    id: 'hwm-100-316',
    page: 'https://www.haier.com/pk/washing-machines/hwm100-316.shtml',
    fallback: 'https://image.haier.com/pk/washing-machines/W020250306606992156842_60.jpg',
  },
  {
    id: '75m90',
    page: 'https://www.haier.com/pk/tvs/75m90.shtml',
    fallback: 'https://image.haier.com/pk/tvs/W020250802560458649545_60.jpg',
  },
  {
    id: 'hdf-385ig',
    page: 'https://www.haier.com/pk/freezers/hdf-385ig.shtml',
    fallback: 'https://image.haier.com/pk/freezers/W020241003063831398520_60.jpg',
  },
  {
    id: 'hmw-30afs',
    page: 'https://www.haier.com/pk/microwaves/hmw-30afs.shtml',
    fallback: 'https://image.haier.com/pk/microwaves/W020240813559970459620_60.jpg',
  },
]

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
}

function decodeHtml(s) {
  return s.replaceAll('&amp;', '&').replaceAll('&#x2F;', '/').replaceAll('&#47;', '/')
}

function findOgImage(html, pageUrl) {
  const patterns = [
    /<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["'][^>]*>/i,
    /https:\/\/image\.haier\.com\/[^"'<> ]+\.(?:jpg|jpeg|png|webp)/i,
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (!m) continue
    const candidate = decodeHtml(m[1] || m[0])
    try { return new URL(candidate, pageUrl).href } catch {}
  }
  return null
}

async function fetchOk(url, referer = '') {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      ...headers,
      ...(referer ? { Referer: referer } : {}),
    },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res
}

await fs.mkdir('public/products', { recursive: true })

for (const product of products) {
  console.log(`\n${product.id}`)
  let imageUrl = null

  try {
    const pageRes = await fetchOk(product.page)
    const html = await pageRes.text()
    imageUrl = findOgImage(html, product.page)
    if (imageUrl) console.log(`  official page image: ${imageUrl}`)
  } catch (error) {
    console.warn(`  could not parse product page: ${error.message}`)
  }

  imageUrl ||= product.fallback
  console.log(`  downloading: ${imageUrl}`)

  try {
    const imageRes = await fetchOk(imageUrl, product.page)
    const type = imageRes.headers.get('content-type') || ''
    if (!type.startsWith('image/')) {
      throw new Error(`Unexpected content-type: ${type || 'unknown'}`)
    }

    const data = Buffer.from(await imageRes.arrayBuffer())
    if (data.length < 1500) throw new Error(`Image response is too small (${data.length} bytes)`)

    const target = path.join('public', 'products', product.id)
    await fs.writeFile(target, data)
    console.log(`  saved ${target} (${Math.round(data.length / 1024)} KB)`)
  } catch (error) {
    console.error(`  FAILED: ${error.message}`)
    process.exitCode = 1
  }
}

if (process.exitCode) {
  console.error('\nOne or more images failed. Send the error back to ChatGPT; do not substitute random retailer images.')
} else {
  console.log('\nAll Haier product images saved locally.')
}

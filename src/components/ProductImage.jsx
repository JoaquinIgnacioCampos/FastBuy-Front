/**
 * Renders a product's image — `image` can be either a URL (rendered as <img>)
 * or an emoji string (rendered as inline text). Falls back to product.emoji
 * if `image` is missing.
 */
export default function ProductImage({ product, size = 32 }) {
  const src = product?.image ?? product?.emoji ?? '📦'
  const isUrl = typeof src === 'string' && (src.startsWith('/') || src.startsWith('http'))

  if (isUrl) {
    return (
      <img
        src={src}
        alt={product?.name ?? ''}
        loading="lazy"
        style={{
          width: size, height: size, objectFit: 'cover',
          borderRadius: 8, background: 'var(--surface3)',
        }}
        onError={(e) => {
          // If the image fails (404, broken path) fall back to the emoji glyph
          e.currentTarget.replaceWith(
            Object.assign(document.createElement('span'),
              { textContent: product?.emoji ?? '📦', style: `font-size:${Math.round(size * 0.7)}px` })
          )
        }}
      />
    )
  }

  return (
    <span style={{ fontSize: Math.round(size * 0.85), lineHeight: 1, display: 'inline-block' }}>
      {src}
    </span>
  )
}

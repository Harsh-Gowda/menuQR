import { CartItem, OrderType, Language } from '@/types'

interface OrderDetails {
  restaurantWhatsApp: string
  restaurantNameEn: string
  tableNumber?: string
  orderType: OrderType
  items: CartItem[]
  subtotal: number
  gstAmount: number
  gstPercentage: number
  total: number
  customerName?: string
  language: Language
}

export function buildWhatsAppOrderURL(order: OrderDetails): string {
  const phoneClean = order.restaurantWhatsApp.replace(/\D/g, '')
  const message =
    order.language === 'hi'
      ? buildHindiMessage(order)
      : buildEnglishMessage(order)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phoneClean}?text=${encoded}`
}

function buildEnglishMessage(order: OrderDetails): string {
  const orderTypeLabel = {
    dine_in: `Dine In — Table ${order.tableNumber || '?'}`,
    takeaway: 'Takeaway',
    delivery: 'Delivery',
  }[order.orderType]

  const itemLines = order.items
    .map((cartItem) => {
      const opts = Object.values(cartItem.selectedOptions)
        .map((o) => o.label)
        .filter(Boolean)
      let line = `• ${cartItem.quantity}× ${cartItem.menuItem.name_en}`
      if (opts.length) line += ` (${opts.join(', ')})`
      if (cartItem.notes) line += ` — Note: ${cartItem.notes}`
      line += ` — ₹${cartItem.totalPrice.toFixed(2)}`
      return line
    })
    .join('\n')

  return `🍽️ *NEW ORDER — ${order.restaurantNameEn}*

*Order Type:* ${orderTypeLabel}${order.customerName ? `\n*Name:* ${order.customerName}` : ''}

*Items:*
${itemLines}

━━━━━━━━━━━━━━━━
Subtotal: ₹${order.subtotal.toFixed(2)}
GST (${order.gstPercentage}%): ₹${order.gstAmount.toFixed(2)}
*TOTAL: ₹${order.total.toFixed(2)}*
━━━━━━━━━━━━━━━━
Ordered via MenuQR.in`
}

function buildHindiMessage(order: OrderDetails): string {
  const orderTypeLabel = {
    dine_in: `डाइन इन — टेबल ${order.tableNumber || '?'}`,
    takeaway: 'टेकअवे',
    delivery: 'डिलीवरी',
  }[order.orderType]

  const itemLines = order.items
    .map((cartItem) => {
      const name = cartItem.menuItem.name_hi || cartItem.menuItem.name_en
      const opts = Object.values(cartItem.selectedOptions)
        .map((o) => o.label_hi || o.label)
        .filter(Boolean)
      let line = `• ${cartItem.quantity}× ${name}`
      if (opts.length) line += ` (${opts.join(', ')})`
      if (cartItem.notes) line += ` — नोट: ${cartItem.notes}`
      line += ` — ₹${cartItem.totalPrice.toFixed(2)}`
      return line
    })
    .join('\n')

  return `🍽️ *नया ऑर्डर — ${order.restaurantNameEn}*

*ऑर्डर प्रकार:* ${orderTypeLabel}${order.customerName ? `\n*नाम:* ${order.customerName}` : ''}

*आइटम:*
${itemLines}

━━━━━━━━━━━━━━━━
उप-योग: ₹${order.subtotal.toFixed(2)}
GST (${order.gstPercentage}%): ₹${order.gstAmount.toFixed(2)}
*कुल: ₹${order.total.toFixed(2)}*
━━━━━━━━━━━━━━━━
MenuQR.in के माध्यम से ऑर्डर किया`
}

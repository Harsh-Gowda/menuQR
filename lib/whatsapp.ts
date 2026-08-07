import { CartItem, OrderType, Language } from '@/types'

interface OrderDetails {
  restaurantWhatsApp: string
  restaurantNameEn: string
  restaurantNameAr?: string
  tableNumber?: string
  orderType: OrderType
  items: CartItem[]
  subtotal: number
  vatAmount: number
  vatPercentage: number
  total: number
  customerName?: string
  language: Language
}

export function buildWhatsAppOrderURL(order: OrderDetails): string {
  const phoneClean = order.restaurantWhatsApp.replace(/\D/g, '')
  const message =
    order.language === 'ar'
      ? buildArabicMessage(order)
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
      line += ` — AED ${cartItem.totalPrice.toFixed(2)}`
      return line
    })
    .join('\n')

  return `🍽️ *NEW ORDER — ${order.restaurantNameEn}*

*Order Type:* ${orderTypeLabel}${order.customerName ? `\n*Name:* ${order.customerName}` : ''}

*Items:*
${itemLines}

━━━━━━━━━━━━━━━━
Subtotal: AED ${order.subtotal.toFixed(2)}
VAT (${order.vatPercentage}%): AED ${order.vatAmount.toFixed(2)}
*TOTAL: AED ${order.total.toFixed(2)}*
━━━━━━━━━━━━━━━━
Ordered via MenuQR.ae`
}

function buildArabicMessage(order: OrderDetails): string {
  const restaurantName = order.restaurantNameAr || order.restaurantNameEn

  const orderTypeLabel = {
    dine_in: `تناول في المطعم — طاولة ${order.tableNumber || '?'}`,
    takeaway: 'استلام',
    delivery: 'توصيل',
  }[order.orderType]

  const itemLines = order.items
    .map((cartItem) => {
      const name = cartItem.menuItem.name_ar || cartItem.menuItem.name_en
      const opts = Object.values(cartItem.selectedOptions)
        .map((o) => o.label_ar || o.label)
        .filter(Boolean)
      let line = `• ${cartItem.quantity}× ${name}`
      if (opts.length) line += ` (${opts.join(', ')})`
      if (cartItem.notes) line += ` — ملاحظة: ${cartItem.notes}`
      line += ` — ${cartItem.totalPrice.toFixed(2)} درهم`
      return line
    })
    .join('\n')

  return `🍽️ *طلب جديد — ${restaurantName}*

*نوع الطلب:* ${orderTypeLabel}${order.customerName ? `\n*الاسم:* ${order.customerName}` : ''}

*الطلبات:*
${itemLines}

━━━━━━━━━━━━━━━━
المجموع: ${order.subtotal.toFixed(2)} درهم
ضريبة القيمة المضافة (${order.vatPercentage}%): ${order.vatAmount.toFixed(2)} درهم
*الإجمالي: ${order.total.toFixed(2)} درهم*
━━━━━━━━━━━━━━━━
تم الطلب عبر MenuQR.ae`
}

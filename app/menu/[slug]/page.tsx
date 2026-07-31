import { Metadata } from 'next'
import MenuPage from '@/components/menu/MenuPage'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Menu — ${slug.replace(/-/g, ' ')} | MenuQR.in`,
    description: 'View menu and order via WhatsApp',
  }
}

export default async function PublicMenuPage({ params }: Props) {
  const { slug } = await params
  return <MenuPage slug={slug} />
}

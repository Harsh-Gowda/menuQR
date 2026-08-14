import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import KitchenDisplay from '@/components/kitchen/KitchenDisplay'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Kitchen Display — ${slug} | MenuQR`,
    description: 'Live kitchen order display',
  }
}

export default async function KitchenPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name_en')
    .eq('slug', slug)
    .single()

  const restaurantName = restaurant?.name_en || slug

  return <KitchenDisplay slug={slug} restaurantName={restaurantName} />
}

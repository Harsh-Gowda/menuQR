import MenuPage from '@/components/menu/MenuPage'

interface Props {
  params: Promise<{ slug: string; table: string }>
}

export default async function TableMenuPage({ params }: Props) {
  const { slug, table } = await params
  return <MenuPage slug={slug} tableNumber={table} />
}

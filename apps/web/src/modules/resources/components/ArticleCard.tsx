export interface ArticleCardProps {
  className?: string
}

export function ArticleCard({ className }: ArticleCardProps) {
  return <section className={className} data-component="ArticleCard" />
}

import { memo, useMemo } from 'react'
import iconsData from '@foodics/ui-common/icons/icon.json'

interface IconData {
  prefix: string
  icons: Record<string, { body: string }>
}

const icons = iconsData as IconData

export interface FoodicsIconProps {
  name: string
  size?: number | string
  className?: string
  color?: string
}

export const FoodicsIcon = memo(function FoodicsIcon({
  name,
  size = 24,
  className = '',
  color = 'currentColor',
}: FoodicsIconProps) {
  const iconBody = useMemo(() => {
    const icon = icons.icons[name]
    if (!icon) {
      console.warn(`[FoodicsIcon] Icon "${name}" not found`)
      return null
    }
    return icon.body
  }, [name])

  if (!iconBody) {
    return null
  }

  const sizeValue = typeof size === 'number' ? `${size}px` : size

  return (
    <svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      dangerouslySetInnerHTML={{ __html: iconBody }}
    />
  )
})

export const getAvailableIcons = (): string[] => {
  return Object.keys(icons.icons)
}

export const hasIcon = (name: string): boolean => {
  return name in icons.icons
}

export default FoodicsIcon

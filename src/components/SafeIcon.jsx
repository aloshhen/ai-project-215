/**
 * SafeIcon Component - Pure JavaScript version
 * Supports ALL icons from lucide-react library via kebab-case naming
 */

import { useState, useEffect, useRef } from 'react'

const kebabToPascal = (str) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

export const SafeIcon = ({ name, size = 24, className = '', strokeWidth = 2, ...props }) => {
  const IconRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    let mounted = true
    
    const loadIcon = async () => {
      try {
        const lucide = await import('lucide-react')
        const pascalName = kebabToPascal(name)
        const IconComponent = lucide[pascalName] || lucide.HelpCircle
        
        if (mounted) {
          IconRef.current = IconComponent
          setIsLoaded(true)
        }
      } catch (error) {
        if (mounted) {
          const { HelpCircle } = await import('lucide-react')
          IconRef.current = HelpCircle
          setIsLoaded(true)
        }
      }
    }
    
    loadIcon()
    return () => { mounted = false }
  }, [name])
  
  if (!isLoaded || !IconRef.current) {
    return <div style={{ width: size, height: size }} className={className} />
  }
  
  const Icon = IconRef.current
  return (
    <Icon 
      size={size} 
      className={className} 
      strokeWidth={strokeWidth}
      {...props} 
    />
  )
}

export default SafeIcon
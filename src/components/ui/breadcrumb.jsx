import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "../../lib/utils"

const Breadcrumb = React.forwardRef(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground", className)}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp ref={ref} className={cn("transition-colors hover:text-foreground hover:underline cursor-pointer", className)} {...props} />
  )
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbSeparator = ({ children, className, ...props }) => (
  <li role="presentation" aria-hidden="true" className={cn("", className)} {...props}>
    {children || "/"}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = ({ className, ...props }) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    &#8230;
  </span>
)
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis"

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbEllipsis }


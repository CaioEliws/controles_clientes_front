import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { dialogLayout } from "./dialog-layout"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[2px]  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { overlayClassName?: string }
>(({ className, children, overlayClassName, onOpenAutoFocus, onCloseAutoFocus, ...props }, ref) => {
  const origemFoco = React.useRef<HTMLElement | null>(null)
  return (
  <DialogPortal>
    <DialogOverlay className={overlayClassName} />
    <DialogPrimitive.Content
      ref={ref}
      onOpenAutoFocus={event => {
        origemFoco.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        onOpenAutoFocus?.(event)
      }}
      onCloseAutoFocus={event => {
        onCloseAutoFocus?.(event)
        if (!event.defaultPrevented && origemFoco.current?.isConnected) {
          event.preventDefault()
          origemFoco.current.focus()
        }
      }}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        dialogLayout.dialog, "max-w-lg",
        "[&_form]:min-h-0 [&_form]:min-w-0 [&_input:not([type=checkbox]):not([type=radio])]:h-11 [&_input]:min-w-0 [&_input]:rounded-lg [&_input]:border-slate-200 [&_input]:text-sm [&_select]:h-11 [&_select]:min-w-0 [&_select]:rounded-lg [&_select]:border-slate-200 [&_textarea]:rounded-lg [&_textarea]:border-slate-200 [&_textarea]:text-sm [&_label]:text-sm [&_label]:font-medium [&_label]:text-slate-700 [&_[data-ui=button]]:rounded-lg [&_[data-ui=button][data-size=default]]:h-11 [&_[data-ui=button][data-variant=default]]:bg-slate-950 [&_[data-ui=button][data-variant=default]]:text-white [&_[data-ui=button][data-variant=default]]:hover:bg-slate-800",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Fechar janela</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5", dialogLayout.header,
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-wrap items-center [&_[data-ui=button]]:max-w-full [&_[data-ui=button]]:whitespace-normal [&_[data-ui=button]]:min-h-11 [&_[data-ui=button][data-variant=ghost]]:border [&_[data-ui=button][data-variant=ghost]]:border-slate-200 [&_[data-ui=button][data-variant=ghost]]:bg-white", dialogLayout.footer,
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      dialogLayout.title,
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(dialogLayout.description, className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Cabeçalho e rodapé ficam fora da rolagem; somente o corpo cresce.
const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const area = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    let frame = 0
    const reposicionar = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const campo = document.activeElement
        if (campo instanceof HTMLElement && area.current?.contains(campo)) campo.scrollIntoView({ block: "nearest", inline: "nearest" })
      })
    }
    const observer = new ResizeObserver(reposicionar)
    if (area.current) observer.observe(area.current)
    window.visualViewport?.addEventListener("resize", reposicionar)
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.visualViewport?.removeEventListener("resize", reposicionar) }
  }, [])
  return <div ref={area} data-dialog-body className={cn(dialogLayout.content, "space-y-5", className)} {...props} />
}

const DialogSection = ({ title, icon, children, className, ...props }: React.HTMLAttributes<HTMLElement> & { title: string; icon?: React.ReactNode }) => {
  const id = React.useId()
  return <section aria-labelledby={id} className={cn("space-y-4", className)} {...props}>
    <h3 id={id} className="flex items-center gap-2 text-sm font-semibold text-slate-900">{icon && <span aria-hidden="true" className="rounded-lg bg-slate-100 p-2 text-slate-500 [&_svg]:h-4 [&_svg]:w-4">{icon}</span>}{title}</h3>
    {children}
  </section>
}

export {
  Dialog,
  DialogBody,
  DialogSection,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

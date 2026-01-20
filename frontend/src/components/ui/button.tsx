import * as React from "react"

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50 disabled:pointer-events-none"

    const variants = {
      default: "bg-emerald-600 hover:bg-emerald-700 text-white",
      ghost: "bg-transparent hover:bg-zinc-800 text-zinc-300",
      outline:
        "border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white",
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${className}`}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

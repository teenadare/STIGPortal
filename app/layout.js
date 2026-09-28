import './globals.css'

export const metadata = {
  title: 'STIG Development Collaboration Portal',
  description: 'Internal collaboration tool for authoring DISA STIGs derived from parent SRGs.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}

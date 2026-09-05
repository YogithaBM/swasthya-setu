# Swasthya Setu — preview run doc

## Reproduce the uncommitted artifacts

- `.env.local` must exist at the project root with a `GEMINI_API_KEY` value
  (the `/api/triage` route reads `process.env.GEMINI_API_KEY` at runtime; when
  absent the route gracefully falls back to an offline keyword triage). Copy
  `.env.local` from the main checkout if missing — never commit its contents.
- Install dependencies with npm: `npm install` (package-lock.json pins
  Next.js 14.2.x + React 18, react-leaflet 4, recharts 2, tailwindcss 3).
- Optional: `npm run build` first if serving the production build via
  `npm run start`.

## Run the server

- This environment exports `PORT=0`, which makes Next pick a RANDOM port
  unless pinned. Always pass the explicit flag: `npm run dev -- -p 3000`
  (3000 is the project default and is normally free).
- Detached start on Windows (PowerShell — stdout and stderr MUST go to
  different files):
  `powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev','--','-p','3000' -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"`
- Verify: `powershell -NoProfile -Command "Get-Process -Id <pid>"` to confirm
  it survived; then poll `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
  until it returns 200 (first page compiles on demand in dev).
- Register the preview with the URL and the LISTENING pid
  (`netstat -ano | grep ':3000 ' | grep LISTENING`) rather than the npm wrapper
  pid, so stopping the preview actually stops the server.

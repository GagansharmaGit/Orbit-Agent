#!/bin/bash
set -e

# Day 2: June 17
# 5. feat(ui): implement global app layout and navigation sidebar
git add src/app/layout.tsx src/app/\(app\)/layout.tsx src/components/layout/ src/components/command-palette.tsx
GIT_AUTHOR_DATE="2026-06-17 09:30:00 +0530" GIT_COMMITTER_DATE="2026-06-17 09:30:00 +0530" git commit -m "feat(ui): implement global app layout and navigation sidebar"

# 6. feat(auth): build login screen and account connection dialog
git add src/app/login/ src/components/auth/
GIT_AUTHOR_DATE="2026-06-17 11:45:00 +0530" GIT_COMMITTER_DATE="2026-06-17 11:45:00 +0530" git commit -m "feat(auth): build login screen and account connection dialog"

# 7. feat(calendar): implement calendar grid and quick invite logic
git add src/components/calendar/ src/app/\(app\)/calendar/
GIT_AUTHOR_DATE="2026-06-17 15:00:00 +0530" GIT_COMMITTER_DATE="2026-06-17 15:00:00 +0530" git commit -m "feat(calendar): implement calendar grid and quick invite logic"

# 8. feat(mail): build inbox view and message components
git add src/components/mail/ src/app/\(app\)/mail/
GIT_AUTHOR_DATE="2026-06-17 17:30:00 +0530" GIT_COMMITTER_DATE="2026-06-17 17:30:00 +0530" git commit -m "feat(mail): build inbox view and message components"

# Day 3: June 18
# 9. feat(api): set up trpc routers and google client
git add src/server/trpc/ src/server/google.ts src/server/corsair.ts src/app/api/trpc/ src/app/api/webhooks/
GIT_AUTHOR_DATE="2026-06-18 10:15:00 +0530" GIT_COMMITTER_DATE="2026-06-18 10:15:00 +0530" git commit -m "feat(api): set up trpc routers and google client"

# 10. feat(ai): integrate corsair agent chat interface
git add src/components/agent/ src/app/api/chat/
GIT_AUTHOR_DATE="2026-06-18 12:45:00 +0530" GIT_COMMITTER_DATE="2026-06-18 12:45:00 +0530" git commit -m "feat(ai): integrate corsair agent chat interface"

# 11. feat(dashboard): assemble main dashboard view
git add src/app/\(app\)/dashboard/ src/components/dashboard/ || true
GIT_AUTHOR_DATE="2026-06-18 14:30:00 +0530" GIT_COMMITTER_DATE="2026-06-18 14:30:00 +0530" git commit -m "feat(dashboard): assemble main dashboard view"

# 12. feat(landing): design landing page and add static assets
git add src/app/page.tsx public/logo.jpg src/app/icon.jpg
git rm --cached src/app/favicon.ico || true
rm -f src/app/favicon.ico
GIT_AUTHOR_DATE="2026-06-18 16:00:00 +0530" GIT_COMMITTER_DATE="2026-06-18 16:00:00 +0530" git commit -m "feat(landing): design landing page and add static assets"

# 13. chore: prepare render deployment configuration
git add render.yaml RENDER_DEPLOYMENT.md
GIT_AUTHOR_DATE="2026-06-18 17:15:00 +0530" GIT_COMMITTER_DATE="2026-06-18 17:15:00 +0530" git commit -m "chore: prepare render deployment configuration"

echo "Done generating history!"

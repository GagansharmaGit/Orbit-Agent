#!/bin/bash
set -e

# Reset staging area
git reset

# Day 1: June 16
# 1. chore: setup dependencies, tailwind, and drizzle config
git add package.json package-lock.json next.config.ts drizzle.config.ts src/app/globals.css
GIT_AUTHOR_DATE="2026-06-16 10:00:00 +0530" GIT_COMMITTER_DATE="2026-06-16 10:00:00 +0530" git commit -m "chore: setup dependencies, tailwind, and drizzle config"

# 2. feat(db): implement database schema and drizzle client
git add src/server/db/
GIT_AUTHOR_DATE="2026-06-16 12:30:00 +0530" GIT_COMMITTER_DATE="2026-06-16 12:30:00 +0530" git commit -m "feat(db): implement database schema and drizzle client"

# 3. feat(core): add utility functions and zustand store
git add src/lib/ src/hooks/ src/stores/
GIT_AUTHOR_DATE="2026-06-16 14:15:00 +0530" GIT_COMMITTER_DATE="2026-06-16 14:15:00 +0530" git commit -m "feat(core): add utility functions and zustand store"

# 4. feat(auth): integrate next-auth and proxy middleware
git add src/server/auth.ts src/proxy.ts src/app/api/auth/ src/app/actions/
GIT_AUTHOR_DATE="2026-06-16 17:45:00 +0530" GIT_COMMITTER_DATE="2026-06-16 17:45:00 +0530" git commit -m "feat(auth): integrate next-auth and proxy middleware"

# Day 2: June 17
# 5. feat(ui): implement global app layout and navigation sidebar
git add src/app/layout.tsx src/app/\(app\)/layout.tsx src/components/layout/ src/components/ui/ src/components/theme-provider.tsx
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
git add src/server/trpc/ src/server/google.ts src/app/api/trpc/
GIT_AUTHOR_DATE="2026-06-18 10:15:00 +0530" GIT_COMMITTER_DATE="2026-06-18 10:15:00 +0530" git commit -m "feat(api): set up trpc routers and google client"

# 10. feat(ai): integrate corsair agent chat interface
git add src/components/agent/ src/app/api/chat/
GIT_AUTHOR_DATE="2026-06-18 12:45:00 +0530" GIT_COMMITTER_DATE="2026-06-18 12:45:00 +0530" git commit -m "feat(ai): integrate corsair agent chat interface"

# 11. feat(dashboard): assemble main dashboard view
git add src/app/\(app\)/dashboard/
GIT_AUTHOR_DATE="2026-06-18 14:30:00 +0530" GIT_COMMITTER_DATE="2026-06-18 14:30:00 +0530" git commit -m "feat(dashboard): assemble main dashboard view"

# 12. feat(landing): design landing page and add static assets
git add src/app/page.tsx public/logo.jpg src/app/icon.jpg
git rm --cached src/app/favicon.ico || true # remove if tracked
rm -f src/app/favicon.ico
GIT_AUTHOR_DATE="2026-06-18 16:00:00 +0530" GIT_COMMITTER_DATE="2026-06-18 16:00:00 +0530" git commit -m "feat(landing): design landing page and add static assets"

# 13. chore: prepare render deployment configuration
git add render.yaml RENDER_DEPLOYMENT.md
GIT_AUTHOR_DATE="2026-06-18 17:15:00 +0530" GIT_COMMITTER_DATE="2026-06-18 17:15:00 +0530" git commit -m "chore: prepare render deployment configuration"

echo "Done generating history!"

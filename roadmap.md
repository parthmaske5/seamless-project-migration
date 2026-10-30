# Roadmap — Student & Teacher Accounts

- [ ] Enable email/password auth + Google + Lovable sign-in providers
- [ ] Migration: app_role enum, user_roles + has_role, profiles (+ signup trigger), student_profiles, teacher_profiles (pending-approval status), RLS + grants
- [ ] Wire bearer-token functionMiddleware in src/start.ts; onAuthStateChange + Toaster in __root
- [ ] Auth pages: /auth/student and /auth/teacher (sign-in/sign-up, cross-links, role add-on for existing accounts)
- [ ] Protected areas: /account/student and /account/teacher under _authenticated gate
- [ ] Skippable onboarding dialog (student: display name + level; teacher: tutor listing info) with "complete later" path
- [ ] Account-aware nav in SiteHeader (sign-in/up vs role link + sign out)
- [ ] Verify: build clean, sign-up/sign-in flow end-to-end in preview

# October 20 English games

- 9A: `261019_9A_9th_Parallel_Structure_Boss_Battle.html`
- 10A: `261019_10A_10th_Semicolons_Escape_Room.html`
- Teacher results: `261019_9A_10A_English_Teacher_Grades.html`

Warm orange/yellow/red illustrations, large type, 20 server-scored challenges, 5 creative extras, optional hints, timer, audio controls, unlimited attempts and a final screenshot instruction for Algebraix.

## Access and saving

The games require a verified `@colegiointernacional.edu.mx` Supabase Auth identity. Typing an email address is not authentication. The deployed `classroom-games` Edge Function calls Auth `/user` on every request, checks verified school email, scopes each attempt to the signed-in user's UUID, and allows the grades list only to `mlopezp@colegiointernacional.edu.mx`. Database client roles have no direct table grants. Service credentials remain only in the function environment.

The server awards 2 points for a correct first answer and 1 after retries; the main total is 40 and grade is points / 4, out of 10. A complete written explanation is required and saved for teacher review; its quality is not automatically graded. Five creative extras are stored separately and do not affect the main grade. No student-facing teacher approval button grants points.

## Auth prerequisite to verify before classroom use

Google login was disabled in the current project's public Auth settings. Email sign-in is enabled. The pages support email links and verification codes, including pasting the full sign-in link from the verification email. Production email delivery to school addresses still needs an actual account sign-in check. If the project uses Supabase's default SMTP, configure a custom SMTP sender; default SMTP does not deliver to arbitrary school accounts. Alternatively configure Google OAuth for the school and add its sign-in flow.

Auth SMTP settings: https://supabase.com/dashboard/project/ioinjygibdzkoonuvknd/auth/smtp
Auth URL configuration: https://supabase.com/dashboard/project/ioinjygibdzkoonuvknd/auth/url-configuration
Allowed redirect prefix: https://thatyslpv-code.github.io/miss-martha-games/
No sign-in emails were sent as a test, and no student accounts were fabricated.

## Validation

Both games' 20-mission server flows were tested with mocked verified identities, including a wrong answer and retry producing 39/40 = 9.75/10, ownership rejection, external-domain rejection, teacher authorization and creative-response storage. JavaScript parses in all three pages. Live unauthorized requests and table grants are checked separately. Real inbox delivery and full browser visual QA remain unverified in this environment.

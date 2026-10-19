# October 20 English games

Student links:
- 261019_9A_9th_Parallel_Structure_Boss_Battle.html
- 261019_10A_10th_Semicolons_Escape_Room.html

Teacher results:
- 261019_9A_10A_English_Teacher_Grades.html

## Simplified student entry

Students enter full name, fixed class group and an email ending in @colegiointernacional.edu.mx. No email verification or Supabase Auth account is required for students. The address is self-reported, not proof of ownership. This deliberately simpler classroom flow was requested by Miss Martha.

A random 256-bit token is generated for each attempt and returned once to that browser. Only its SHA-256 hash is stored in the table. All answer, finish and creative-extra requests require that token and the attempt UUID. A browser cannot fetch another attempt using only an email or an attempt UUID. The short-lived tab session retains the token to resume unfinished work. No attempt tokens or service credentials appear in published source.

Scores remain server-calculated: 2 points for a first correct answer, 1 after retries, maximum 40, grade = score / 4 out of 10. Explanations are saved for teacher review; their quality is not automatically graded. Five creative extras are saved separately without changing the main grade. Final results instruct students to submit a screenshot to Algebraix with name, group, school email and grade visible.

## Teacher protection

The teacher page still requires a verified Supabase Auth session for mlopezp@colegiointernacional.edu.mx. Student entry cannot open the grade list. Browser roles have no direct SELECT or INSERT table grants and RLS remains enabled. Email delivery for teacher sign-in is still unverified; Google login was disabled when inspected. If default Supabase SMTP is in use, configure production SMTP for school email delivery.

Auth SMTP: https://supabase.com/dashboard/project/ioinjygibdzkoonuvknd/auth/smtp

The student games do not depend on that teacher-email setup.

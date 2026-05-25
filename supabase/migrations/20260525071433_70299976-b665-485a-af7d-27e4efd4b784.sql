-- Remove public insert policy on training_certificates (server-side uses service role)
DROP POLICY IF EXISTS "public insert training_certificates" ON public.training_certificates;

-- Replace overly permissive physicians ALL policy on user_roles with read-only
DROP POLICY IF EXISTS "physicians manage roles" ON public.user_roles;

-- Only admins may assign/modify/delete roles
CREATE POLICY "admins manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));
DROP POLICY "Integration settings are readable" ON public.integration_settings;
CREATE POLICY "Enabled integration settings are readable"
  ON public.integration_settings FOR SELECT TO anon, authenticated
  USING (enabled = true);
CREATE POLICY "Admins can read all integration settings"
  ON public.integration_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
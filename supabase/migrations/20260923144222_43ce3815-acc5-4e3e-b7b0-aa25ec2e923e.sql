
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE TABLE IF NOT EXISTS public.integration_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  method text NOT NULL DEFAULT 'POST',
  url text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'webhook',
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.integration_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_settings TO authenticated;
GRANT ALL ON public.integration_settings TO service_role;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Integration settings are readable"
  ON public.integration_settings FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert integration settings"
  ON public.integration_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update integration settings"
  ON public.integration_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete integration settings"
  ON public.integration_settings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER integration_settings_set_updated_at
  BEFORE UPDATE ON public.integration_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN public.has_role(uid, 'admin');
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

INSERT INTO public.integration_settings (key, label, description, method, url, kind, sort_order) VALUES
  ('feedback', 'Feedback form webhook', 'Receives feedback form submissions.', 'POST', 'https://xacade.app.n8n.cloud/webhook/feedback', 'webhook', 10),
  ('feedbackFallback', 'Feedback fallback form', 'Standalone hosted form shown when the feedback webhook fails.', 'GET', 'https://xacade.app.n8n.cloud/form/cfcf4fd4-dba8-417c-ba04-19438a58409a', 'link', 20),
  ('newsletter', 'Newsletter webhook', 'Subscribe and unsubscribe requests (email and action are added as query parameters).', 'GET', 'https://vetixe.app.n8n.cloud/webhook/GitaStrategyNewsletter', 'webhook', 30),
  ('contact', 'Contact enquiry webhook', 'Contact enquiries forwarded from the site server.', 'POST', 'https://vetixe.app.n8n.cloud/webhook/contact-us', 'webhook', 40)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  date_label text NOT NULL DEFAULT '',
  published_at timestamptz,
  category text NOT NULL DEFAULT '',
  sub_category text NOT NULL DEFAULT '',
  topic text NOT NULL DEFAULT '',
  trend text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  urn text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'article',
  status text NOT NULL DEFAULT 'published',
  source_id text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles are public" ON public.articles FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE INDEX articles_published_at_idx ON public.articles (published_at DESC NULLS LAST);

CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General Enquiry',
  subject text NOT NULL DEFAULT '',
  message text NOT NULL,
  source text NOT NULL DEFAULT 'contact',
  delivered_email boolean NOT NULL DEFAULT false,
  delivered_webhook boolean NOT NULL DEFAULT false,
  delivery_error text,
  user_agent text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER articles_set_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
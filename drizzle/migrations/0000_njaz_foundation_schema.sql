
CREATE TYPE public.app_role AS ENUM ('SUPER_ADMIN','ADMIN','MODERATOR','SUPPORT','COMPANY_OWNER','COMPANY_RECRUITER','JOB_SEEKER','FREELANCER');
CREATE TYPE public.employment_type AS ENUM ('FULL_TIME','PART_TIME','TEMPORARY','SEASONAL','PROJECT');
CREATE TYPE public.work_mode AS ENUM ('ONSITE','REMOTE','HYBRID');
CREATE TYPE public.application_status AS ENUM ('APPLIED','REVIEWING','SHORTLISTED','INTERVIEW','OFFER','HIRED','REJECTED','WITHDRAWN');
CREATE TYPE public.verification_status AS ENUM ('UNVERIFIED','PENDING','VERIFIED','REJECTED','SUSPENDED');
CREATE TYPE public.job_status AS ENUM ('DRAFT','PUBLISHED','CLOSED','ARCHIVED');
CREATE TYPE public.company_member_role AS ENUM ('OWNER','RECRUITER');
CREATE TYPE public.report_status AS ENUM ('OPEN','IN_REVIEW','RESOLVED','DISMISSED');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('SUPER_ADMIN','ADMIN')) $$;
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('SUPER_ADMIN','ADMIN','MODERATOR','SUPPORT')) $$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()) AND role <> 'SUPER_ADMIN');

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text,
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  city_ar text NOT NULL,
  city_en text,
  region_ar text,
  region_en text,
  country_code text NOT NULL DEFAULT 'SA',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories, public.locations, public.skills TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories, public.locations, public.skills TO authenticated;
GRANT ALL ON public.categories, public.locations, public.skills TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "admin write categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "public read locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "admin write locations" ON public.locations FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "admin write skills" ON public.skills FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  username text UNIQUE,
  headline text,
  bio text,
  phone text,
  avatar_url text,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  preferred_work_mode public.work_mode,
  is_public boolean NOT NULL DEFAULT false,
  open_to_work boolean NOT NULL DEFAULT true,
  locale text NOT NULL DEFAULT 'ar',
  verification_status public.verification_status NOT NULL DEFAULT 'UNVERIFIED',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "public profiles read" ON public.profiles FOR SELECT USING (is_public = true);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin(auth.uid())) WITH CHECK (id = auth.uid() OR public.is_admin(auth.uid()));
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.guard_profile_verification() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status AND NOT public.is_admin(auth.uid()) THEN
    NEW.verification_status := OLD.verification_status;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_profiles_guard BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_profile_verification();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  IF COALESCE(NEW.raw_user_meta_data->>'account_type', 'JOB_SEEKER') = 'COMPANY_OWNER' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'COMPANY_OWNER');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'JOB_SEEKER');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  name_en text,
  description text,
  website text,
  email text,
  phone text,
  industry_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  size_range text,
  logo_url text,
  cover_url text,
  cr_number text,
  verification_status public.verification_status NOT NULL DEFAULT 'UNVERIFIED',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_companies_owner ON public.companies(owner_id);
CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.company_member_role NOT NULL DEFAULT 'RECRUITER',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);
CREATE INDEX idx_company_members_user ON public.company_members(user_id);

CREATE OR REPLACE FUNCTION public.is_company_member(_company_id uuid, _user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.companies WHERE id = _company_id AND owner_id = _user_id)
      OR EXISTS (SELECT 1 FROM public.company_members WHERE company_id = _company_id AND user_id = _user_id) $$;
CREATE OR REPLACE FUNCTION public.is_company_owner(_company_id uuid, _user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.companies WHERE id = _company_id AND owner_id = _user_id) $$;

GRANT SELECT ON public.companies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public active companies" ON public.companies FOR SELECT USING (is_active = true AND verification_status <> 'SUSPENDED');
CREATE POLICY "members read company" ON public.companies FOR SELECT TO authenticated USING (public.is_company_member(id, auth.uid()) OR public.is_staff(auth.uid()));
CREATE POLICY "owners create company" ON public.companies FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'COMPANY_OWNER'));
CREATE POLICY "owners update company" ON public.companies FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.is_admin(auth.uid())) WITH CHECK (owner_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "owners delete company" ON public.companies FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.guard_company_verification() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_admin(auth.uid()) THEN NEW.verification_status := 'UNVERIFIED'; END IF;
  ELSIF NEW.verification_status IS DISTINCT FROM OLD.verification_status AND NOT public.is_admin(auth.uid()) THEN
    NEW.verification_status := OLD.verification_status;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_companies_guard BEFORE INSERT OR UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.guard_company_verification();

CREATE OR REPLACE FUNCTION public.add_owner_membership() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.company_members (company_id, user_id, role) VALUES (NEW.id, NEW.owner_id, 'OWNER') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_companies_owner_member AFTER INSERT ON public.companies FOR EACH ROW EXECUTE FUNCTION public.add_owner_membership();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_members TO authenticated;
GRANT ALL ON public.company_members TO service_role;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read members" ON public.company_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_company_member(company_id, auth.uid()) OR public.is_staff(auth.uid()));
CREATE POLICY "owner manages members" ON public.company_members FOR ALL TO authenticated USING (public.is_company_owner(company_id, auth.uid()) OR public.is_admin(auth.uid())) WITH CHECK (public.is_company_owner(company_id, auth.uid()) OR public.is_admin(auth.uid()));

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  requirements text,
  benefits text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  employment_type public.employment_type NOT NULL DEFAULT 'FULL_TIME',
  work_mode public.work_mode NOT NULL DEFAULT 'ONSITE',
  experience_min_years int CHECK (experience_min_years IS NULL OR experience_min_years >= 0),
  salary_min numeric(12,2),
  salary_max numeric(12,2),
  salary_currency text NOT NULL DEFAULT 'SAR',
  show_salary boolean NOT NULL DEFAULT false,
  status public.job_status NOT NULL DEFAULT 'DRAFT',
  is_featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  expires_at timestamptz,
  applications_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min)
);
CREATE INDEX idx_jobs_company ON public.jobs(company_id);
CREATE INDEX idx_jobs_status_pub ON public.jobs(status, published_at DESC);
CREATE INDEX idx_jobs_category ON public.jobs(category_id);
CREATE INDEX idx_jobs_location ON public.jobs(location_id);
CREATE INDEX idx_jobs_mode_type ON public.jobs(work_mode, employment_type);
CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.jobs_before_write() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'PUBLISHED' AND NEW.published_at IS NULL THEN NEW.published_at := now(); END IF;
  IF NOT public.is_admin(auth.uid()) THEN
    IF TG_OP = 'INSERT' THEN NEW.is_featured := false; NEW.applications_count := 0;
    ELSIF current_setting('njaz.internal', true) IS DISTINCT FROM 'on' THEN
      NEW.is_featured := OLD.is_featured; NEW.applications_count := OLD.applications_count;
    END IF;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_jobs_before BEFORE INSERT OR UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.jobs_before_write();

GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public published jobs" ON public.jobs FOR SELECT USING (status = 'PUBLISHED' AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "members read jobs" ON public.jobs FOR SELECT TO authenticated USING (public.is_company_member(company_id, auth.uid()) OR public.is_staff(auth.uid()));
CREATE POLICY "members create jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id, auth.uid()) AND created_by = auth.uid());
CREATE POLICY "members update jobs" ON public.jobs FOR UPDATE TO authenticated USING (public.is_company_member(company_id, auth.uid()) OR public.is_admin(auth.uid())) WITH CHECK (public.is_company_member(company_id, auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "members delete jobs" ON public.jobs FOR DELETE TO authenticated USING (public.is_company_member(company_id, auth.uid()) OR public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.can_manage_job(_job_id uuid, _user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = _job_id AND public.is_company_member(j.company_id, _user_id)) $$;
CREATE OR REPLACE FUNCTION public.is_job_public(_job_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = _job_id AND j.status = 'PUBLISHED' AND (j.expires_at IS NULL OR j.expires_at > now())) $$;

CREATE TABLE public.job_skills (
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  is_required boolean NOT NULL DEFAULT true,
  PRIMARY KEY (job_id, skill_id)
);
CREATE INDEX idx_job_skills_skill ON public.job_skills(skill_id);
GRANT SELECT ON public.job_skills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_skills TO authenticated;
GRANT ALL ON public.job_skills TO service_role;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read job skills" ON public.job_skills FOR SELECT USING (public.is_job_public(job_id) OR public.can_manage_job(job_id, auth.uid()));
CREATE POLICY "manage job skills" ON public.job_skills FOR ALL TO authenticated USING (public.can_manage_job(job_id, auth.uid())) WITH CHECK (public.can_manage_job(job_id, auth.uid()));

CREATE TABLE public.profile_skills (
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  level smallint CHECK (level BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, skill_id)
);
CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL, company_name text NOT NULL, location text,
  employment_type public.employment_type,
  start_date date NOT NULL, end_date date, is_current boolean NOT NULL DEFAULT false,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.educations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution text NOT NULL, degree text, field_of_study text,
  start_date date, end_date date, grade text, description text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL, issuer text, issue_date date, expiry_date date,
  credential_id text, credential_url text, file_path text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  proficiency text NOT NULL DEFAULT 'INTERMEDIATE',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, language_code)
);
CREATE TABLE public.portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL, description text, url text, cover_path text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL, file_path text NOT NULL, file_size int, mime_type text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_experiences_profile ON public.experiences(profile_id);
CREATE INDEX idx_educations_profile ON public.educations(profile_id);
CREATE INDEX idx_certifications_profile ON public.certifications(profile_id);
CREATE INDEX idx_portfolios_profile ON public.portfolios(profile_id);
CREATE INDEX idx_resumes_profile ON public.resumes(profile_id);
CREATE UNIQUE INDEX uq_resumes_default ON public.resumes(profile_id) WHERE is_default;
CREATE TRIGGER trg_exp_updated BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_edu_updated BEFORE UPDATE ON public.educations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_cert_updated BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_port_updated BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_res_updated BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES public.resumes(id) ON DELETE SET NULL,
  cover_letter text,
  status public.application_status NOT NULL DEFAULT 'APPLIED',
  employer_notes text,
  status_changed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, applicant_id)
);
CREATE INDEX idx_applications_applicant ON public.job_applications(applicant_id);
CREATE INDEX idx_applications_job_status ON public.job_applications(job_id, status);
CREATE TRIGGER trg_app_updated BEFORE UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.is_applicant_visible_to(_profile_id uuid, _user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.job_applications a JOIN public.jobs j ON j.id = a.job_id
    WHERE a.applicant_id = _profile_id AND public.is_company_member(j.company_id, _user_id)) $$;

CREATE OR REPLACE FUNCTION public.applications_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE is_emp boolean;
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'APPLIED'; NEW.employer_notes := NULL;
    PERFORM set_config('njaz.internal', 'on', true);
    UPDATE public.jobs SET applications_count = applications_count + 1 WHERE id = NEW.job_id;
    PERFORM set_config('njaz.internal', 'off', true);
    RETURN NEW;
  END IF;
  is_emp := public.can_manage_job(OLD.job_id, auth.uid()) OR public.is_admin(auth.uid());
  NEW.job_id := OLD.job_id; NEW.applicant_id := OLD.applicant_id;
  IF NOT is_emp THEN
    NEW.employer_notes := OLD.employer_notes;
    IF NEW.status <> OLD.status AND NEW.status <> 'WITHDRAWN' THEN NEW.status := OLD.status; END IF;
  ELSIF OLD.applicant_id <> auth.uid() THEN
    NEW.cover_letter := OLD.cover_letter; NEW.resume_id := OLD.resume_id;
  END IF;
  IF NEW.status <> OLD.status THEN NEW.status_changed_at := now(); END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_app_guard BEFORE INSERT OR UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.applications_guard();

GRANT SELECT, INSERT, UPDATE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "applicant or employer reads" ON public.job_applications FOR SELECT TO authenticated USING (applicant_id = auth.uid() OR public.can_manage_job(job_id, auth.uid()) OR public.is_staff(auth.uid()));
CREATE POLICY "applicant applies" ON public.job_applications FOR INSERT TO authenticated WITH CHECK (applicant_id = auth.uid() AND public.is_job_public(job_id) AND (resume_id IS NULL OR EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.profile_id = auth.uid())));
CREATE POLICY "applicant or employer updates" ON public.job_applications FOR UPDATE TO authenticated USING (applicant_id = auth.uid() OR public.can_manage_job(job_id, auth.uid()) OR public.is_admin(auth.uid())) WITH CHECK (applicant_id = auth.uid() OR public.can_manage_job(job_id, auth.uid()) OR public.is_admin(auth.uid()));

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['profile_skills','experiences','educations','certifications','languages','portfolios','resumes'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "owner manages %s" ON public.%I FOR ALL TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid())', t, t);
    EXECUTE format('CREATE POLICY "employer or staff reads %s" ON public.%I FOR SELECT TO authenticated USING (public.is_applicant_visible_to(profile_id, auth.uid()) OR public.is_staff(auth.uid()))', t, t);
  END LOOP;
END $$;
CREATE POLICY "employer reads applicant profile" ON public.profiles FOR SELECT TO authenticated USING (public.is_applicant_visible_to(id, auth.uid()));

CREATE TABLE public.saved_jobs (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_jobs TO authenticated;
GRANT ALL ON public.saved_jobs TO service_role;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved jobs" ON public.saved_jobs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own notifications update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own notifications delete" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('JOB','COMPANY','PROFILE')),
  target_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status public.report_status NOT NULL DEFAULT 'OPEN',
  handled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_status ON public.reports(status, created_at DESC);
CREATE TRIGGER trg_reports_updated BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reporter reads own" ON public.reports FOR SELECT TO authenticated USING (reporter_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "user files report" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid() AND status = 'OPEN');
CREATE POLICY "staff handles reports" ON public.reports FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  subject_type text NOT NULL CHECK (subject_type IN ('COMPANY','PROFILE')),
  document_paths text[] NOT NULL DEFAULT '{}',
  notes text,
  status public.verification_status NOT NULL DEFAULT 'PENDING',
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (subject_type <> 'COMPANY' OR company_id IS NOT NULL)
);
CREATE INDEX idx_verif_status ON public.verification_requests(status, created_at DESC);
CREATE TRIGGER trg_verif_updated BEFORE UPDATE ON public.verification_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT, INSERT, UPDATE ON public.verification_requests TO authenticated;
GRANT ALL ON public.verification_requests TO service_role;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "requester reads own" ON public.verification_requests FOR SELECT TO authenticated USING (requester_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "requester submits" ON public.verification_requests FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid() AND status = 'PENDING' AND (company_id IS NULL OR public.is_company_owner(company_id, auth.uid())));
CREATE POLICY "admin reviews" ON public.verification_requests FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.legal_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document text NOT NULL CHECK (document IN ('TERMS','PRIVACY','DATA_POLICY')),
  version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  user_agent text,
  UNIQUE (user_id, document, version)
);
GRANT SELECT, INSERT ON public.legal_consents TO authenticated;
GRANT ALL ON public.legal_consents TO service_role;
ALTER TABLE public.legal_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own consents read" ON public.legal_consents FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "own consents insert" ON public.legal_consents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.audit_status_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (auth.uid(), 'VERIFICATION_CHANGED', TG_TABLE_NAME, NEW.id, jsonb_build_object('from', OLD.verification_status, 'to', NEW.verification_status));
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_companies_audit AFTER UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.audit_status_change();
CREATE TRIGGER trg_profiles_audit AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.audit_status_change();

CREATE OR REPLACE FUNCTION public.notify_application_status() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'WITHDRAWN' THEN
    INSERT INTO public.notifications (user_id, type, title, link, data)
    VALUES (NEW.applicant_id, 'APPLICATION_STATUS', 'تم تحديث حالة طلبك', '/dashboard/applications', jsonb_build_object('application_id', NEW.id, 'status', NEW.status));
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_app_notify AFTER UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.notify_application_status();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

INSERT INTO public.locations (slug, city_ar, city_en, region_ar, region_en) VALUES
('riyadh','الرياض','Riyadh','منطقة الرياض','Riyadh'),
('jeddah','جدة','Jeddah','منطقة مكة المكرمة','Makkah'),
('makkah','مكة المكرمة','Makkah','منطقة مكة المكرمة','Makkah'),
('madinah','المدينة المنورة','Madinah','منطقة المدينة المنورة','Madinah'),
('dammam','الدمام','Dammam','المنطقة الشرقية','Eastern Province'),
('khobar','الخبر','Khobar','المنطقة الشرقية','Eastern Province'),
('dhahran','الظهران','Dhahran','المنطقة الشرقية','Eastern Province'),
('taif','الطائف','Taif','منطقة مكة المكرمة','Makkah'),
('tabuk','تبوك','Tabuk','منطقة تبوك','Tabuk'),
('abha','أبها','Abha','منطقة عسير','Asir'),
('buraydah','بريدة','Buraydah','منطقة القصيم','Qassim'),
('hail','حائل','Hail','منطقة حائل','Hail'),
('jazan','جازان','Jazan','منطقة جازان','Jazan'),
('najran','نجران','Najran','منطقة نجران','Najran'),
('al-ahsa','الأحساء','Al Ahsa','المنطقة الشرقية','Eastern Province');

INSERT INTO public.categories (slug, name_ar, name_en) VALUES
('technology','التقنية والبرمجيات','Technology'),
('sales','المبيعات','Sales'),
('marketing','التسويق','Marketing'),
('finance','المالية والمحاسبة','Finance'),
('hr','الموارد البشرية','Human Resources'),
('engineering','الهندسة','Engineering'),
('healthcare','الرعاية الصحية','Healthcare'),
('education','التعليم والتدريب','Education'),
('hospitality','الضيافة والسياحة','Hospitality'),
('retail','التجزئة','Retail'),
('logistics','الخدمات اللوجستية','Logistics'),
('customer-service','خدمة العملاء','Customer Service'),
('design','التصميم والإبداع','Design'),
('admin','الإدارة والأعمال المكتبية','Administration');

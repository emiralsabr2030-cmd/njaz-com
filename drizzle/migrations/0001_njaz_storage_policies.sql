
CREATE OR REPLACE FUNCTION public.try_uuid(_t text) RETURNS uuid LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
BEGIN RETURN _t::uuid; EXCEPTION WHEN others THEN RETURN NULL; END; $$;

-- Public-display buckets (read by anyone, write by owner folder)
CREATE POLICY "public read display media" ON storage.objects FOR SELECT
  USING (bucket_id IN ('avatars','company-logos','company-covers','portfolio'));

-- User-owned folders: {user_id}/...
CREATE POLICY "user writes own folder" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('avatars','portfolio','resumes','certificates','documents') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "user updates own folder" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('avatars','portfolio','resumes','certificates','documents') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "user deletes own folder" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('avatars','portfolio','resumes','certificates','documents') AND (storage.foldername(name))[1] = auth.uid()::text);

-- Private buckets read: owner, employers of applied jobs (resumes/certificates), staff
CREATE POLICY "private read owner or authorized" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('resumes','certificates','documents') AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_staff(auth.uid())
    OR (bucket_id IN ('resumes','certificates') AND public.is_applicant_visible_to(public.try_uuid((storage.foldername(name))[1]), auth.uid()))
  ));

-- Company media: {company_id}/...
CREATE POLICY "company members write media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('company-logos','company-covers') AND public.is_company_member(public.try_uuid((storage.foldername(name))[1]), auth.uid()));
CREATE POLICY "company members update media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('company-logos','company-covers') AND public.is_company_member(public.try_uuid((storage.foldername(name))[1]), auth.uid()));
CREATE POLICY "company members delete media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('company-logos','company-covers') AND public.is_company_member(public.try_uuid((storage.foldername(name))[1]), auth.uid()));

-- Company verification documents: documents/company/{company_id}/...
CREATE POLICY "company owner writes company docs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'company' AND public.is_company_owner(public.try_uuid((storage.foldername(name))[2]), auth.uid()));
CREATE POLICY "company owner reads company docs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'company' AND public.is_company_owner(public.try_uuid((storage.foldername(name))[2]), auth.uid()));

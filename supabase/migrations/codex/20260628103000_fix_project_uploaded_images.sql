-- Fix project images after admin upload.
-- Some old seed rows still keep thumbnail_url as /projects/... while image has the new Supabase Storage URL.
-- Public frontend now prefers image, and this backfill keeps both columns synced for old rows.

update public.projects
set thumbnail_url = image
where nullif(image, '') is not null
  and (
    nullif(thumbnail_url, '') is null
    or thumbnail_url like '/projects/%'
    or thumbnail_url like 'projects/%'
    or thumbnail_url like '/placeholder%'
  );


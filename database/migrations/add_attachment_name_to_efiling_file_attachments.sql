-- User-preferred display name for attachments (original file_name is kept as-is)

ALTER TABLE public.efiling_file_attachments
ADD COLUMN IF NOT EXISTS attachment_name varchar(255) NULL;

COMMENT ON COLUMN public.efiling_file_attachments.attachment_name IS 'User-preferred label for the attachment; file_name remains the original uploaded file name';

-- CC (carbon copy) recipients when marking a file to another user.
-- CC users are notified and can view the file, but are not assigned ownership.

CREATE TABLE IF NOT EXISTS public.efiling_file_cc (
    id serial4 NOT NULL,
    file_id int4 NOT NULL,
    cc_user_id int4 NOT NULL,
    marked_by int4 NOT NULL,
    remarks text NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    CONSTRAINT efiling_file_cc_pkey PRIMARY KEY (id),
    CONSTRAINT efiling_file_cc_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.efiling_files(id) ON DELETE CASCADE,
    CONSTRAINT efiling_file_cc_cc_user_id_fkey FOREIGN KEY (cc_user_id) REFERENCES public.efiling_users(id) ON DELETE CASCADE,
    CONSTRAINT efiling_file_cc_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.efiling_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_efiling_file_cc_file_id ON public.efiling_file_cc USING btree (file_id);
CREATE INDEX IF NOT EXISTS idx_efiling_file_cc_cc_user_id ON public.efiling_file_cc USING btree (cc_user_id);
CREATE INDEX IF NOT EXISTS idx_efiling_file_cc_file_user ON public.efiling_file_cc USING btree (file_id, cc_user_id);

COMMENT ON TABLE public.efiling_file_cc IS 'Users carbon-copied when a file is marked to another user. CC does not change assignment.';

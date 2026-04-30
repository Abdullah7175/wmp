-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA public IS 'standard public schema';

-- DROP TYPE public.box2d;

CREATE TYPE public.box2d (
	INPUT = box2d_in,
	OUTPUT = box2d_out,
	INTERNALLENGTH = 65,
	ALIGNMENT = 4,
	STORAGE = plain,
	CATEGORY = U,
	DELIMITER = ',');

-- DROP TYPE public.box2df;

CREATE TYPE public.box2df (
	INPUT = box2df_in,
	OUTPUT = box2df_out,
	INTERNALLENGTH = 16,
	ALIGNMENT = 8,
	STORAGE = plain,
	CATEGORY = U,
	DELIMITER = ',');

-- DROP TYPE public.box3d;

CREATE TYPE public.box3d (
	INPUT = box3d_in,
	OUTPUT = box3d_out,
	INTERNALLENGTH = 52,
	ALIGNMENT = 8,
	STORAGE = plain,
	CATEGORY = U,
	DELIMITER = ',');

-- DROP TYPE public.geography;

CREATE TYPE public.geography (
	INPUT = geography_in,
	OUTPUT = geography_out,
	RECEIVE = geography_recv,
	SEND = geography_send,
	TYPMOD_IN = geography_typmod_in,
	TYPMOD_OUT = geography_typmod_out,
	ANALYZE = geography_analyze,
	ALIGNMENT = 8,
	STORAGE = compressed,
	CATEGORY = U,
	DELIMITER = ':');

-- DROP TYPE public.geometry;

CREATE TYPE public.geometry (
	INPUT = geometry_in,
	OUTPUT = geometry_out,
	RECEIVE = geometry_recv,
	SEND = geometry_send,
	TYPMOD_IN = geometry_typmod_in,
	TYPMOD_OUT = geometry_typmod_out,
	ANALYZE = geometry_analyze,
	ALIGNMENT = 8,
	STORAGE = compressed,
	CATEGORY = U,
	DELIMITER = ':');

-- DROP TYPE public.gidx;

CREATE TYPE public.gidx (
	INPUT = gidx_in,
	OUTPUT = gidx_out,
	ALIGNMENT = 8,
	STORAGE = plain,
	CATEGORY = U,
	DELIMITER = ',');

-- DROP TYPE public.spheroid;

CREATE TYPE public.spheroid (
	INPUT = spheroid_in,
	OUTPUT = spheroid_out,
	INTERNALLENGTH = 65,
	ALIGNMENT = 8,
	STORAGE = plain,
	CATEGORY = U,
	DELIMITER = ',');

-- DROP SEQUENCE public.access_control_id_seq;

CREATE SEQUENCE public.access_control_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.access_control_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.access_control_id_seq TO root;

-- DROP SEQUENCE public.agents_id_seq;

CREATE SEQUENCE public.agents_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.agents_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.agents_id_seq TO root;

-- DROP SEQUENCE public.before_images_id_seq;

CREATE SEQUENCE public.before_images_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.before_images_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.before_images_id_seq TO root;

-- DROP SEQUENCE public.ce_user_departments_id_seq;

CREATE SEQUENCE public.ce_user_departments_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.ce_user_departments_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.ce_user_departments_id_seq TO root;

-- DROP SEQUENCE public.ce_user_districts_id_seq;

CREATE SEQUENCE public.ce_user_districts_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.ce_user_districts_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.ce_user_districts_id_seq TO root;

-- DROP SEQUENCE public.ce_user_divisions_id_seq;

CREATE SEQUENCE public.ce_user_divisions_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.ce_user_divisions_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.ce_user_divisions_id_seq TO root;

-- DROP SEQUENCE public.ce_user_towns_id_seq;

CREATE SEQUENCE public.ce_user_towns_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.ce_user_towns_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.ce_user_towns_id_seq TO root;

-- DROP SEQUENCE public.ce_user_zones_id_seq;

CREATE SEQUENCE public.ce_user_zones_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.ce_user_zones_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.ce_user_zones_id_seq TO root;

-- DROP SEQUENCE public.ce_users_id_seq;

CREATE SEQUENCE public.ce_users_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.ce_users_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.ce_users_id_seq TO root;

-- DROP SEQUENCE public.complaint_subtypes_id_seq;

CREATE SEQUENCE public.complaint_subtypes_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.complaint_subtypes_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.complaint_subtypes_id_seq TO root;

-- DROP SEQUENCE public.complaint_type_divisions_id_seq;

CREATE SEQUENCE public.complaint_type_divisions_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.complaint_type_divisions_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.complaint_type_divisions_id_seq TO root;

-- DROP SEQUENCE public.complaint_types_id_seq;

CREATE SEQUENCE public.complaint_types_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.complaint_types_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.complaint_types_id_seq TO root;

-- DROP SEQUENCE public.district_id_seq;

CREATE SEQUENCE public.district_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.district_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.district_id_seq TO root;

-- DROP SEQUENCE public.divisions_id_seq;

CREATE SEQUENCE public.divisions_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.divisions_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.divisions_id_seq TO root;

-- DROP SEQUENCE public.efiling_comments_id_seq;

CREATE SEQUENCE public.efiling_comments_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_comments_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_comments_id_seq TO root;

-- DROP SEQUENCE public.efiling_daak_acknowledgments_id_seq;

CREATE SEQUENCE public.efiling_daak_acknowledgments_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_daak_acknowledgments_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_daak_acknowledgments_id_seq TO root;

-- DROP SEQUENCE public.efiling_daak_attachments_id_seq;

CREATE SEQUENCE public.efiling_daak_attachments_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_daak_attachments_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_daak_attachments_id_seq TO root;

-- DROP SEQUENCE public.efiling_daak_categories_id_seq;

CREATE SEQUENCE public.efiling_daak_categories_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_daak_categories_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_daak_categories_id_seq TO root;

-- DROP SEQUENCE public.efiling_daak_id_seq;

CREATE SEQUENCE public.efiling_daak_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_daak_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_daak_id_seq TO root;

-- DROP SEQUENCE public.efiling_daak_recipients_id_seq;

CREATE SEQUENCE public.efiling_daak_recipients_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_daak_recipients_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_daak_recipients_id_seq TO root;

-- DROP SEQUENCE public.efiling_department_locations_id_seq;

CREATE SEQUENCE public.efiling_department_locations_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_department_locations_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_department_locations_id_seq TO root;

-- DROP SEQUENCE public.efiling_departments_id_seq;

CREATE SEQUENCE public.efiling_departments_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_departments_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_departments_id_seq TO root;

-- DROP SEQUENCE public.efiling_document_comments_id_seq;

CREATE SEQUENCE public.efiling_document_comments_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_document_comments_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_document_comments_id_seq TO root;

-- DROP SEQUENCE public.efiling_document_pages_id_seq;

CREATE SEQUENCE public.efiling_document_pages_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_document_pages_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_document_pages_id_seq TO root;

-- DROP SEQUENCE public.efiling_document_signatures_id_seq;

CREATE SEQUENCE public.efiling_document_signatures_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_document_signatures_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_document_signatures_id_seq TO root;

-- DROP SEQUENCE public.efiling_documents_id_seq;

CREATE SEQUENCE public.efiling_documents_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_documents_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_documents_id_seq TO root;

-- DROP SEQUENCE public.efiling_file_categories_id_seq;

CREATE SEQUENCE public.efiling_file_categories_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_file_categories_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_file_categories_id_seq TO root;

-- DROP SEQUENCE public.efiling_file_movements_id_seq;

CREATE SEQUENCE public.efiling_file_movements_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_file_movements_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_file_movements_id_seq TO root;

-- DROP SEQUENCE public.efiling_file_page_additions_id_seq;

CREATE SEQUENCE public.efiling_file_page_additions_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_file_page_additions_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_file_page_additions_id_seq TO root;

-- DROP SEQUENCE public.efiling_file_status_id_seq;

CREATE SEQUENCE public.efiling_file_status_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_file_status_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_file_status_id_seq TO root;

-- DROP SEQUENCE public.efiling_file_types_id_seq;

CREATE SEQUENCE public.efiling_file_types_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_file_types_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_file_types_id_seq TO root;

-- DROP SEQUENCE public.efiling_file_workflow_states_id_seq;

CREATE SEQUENCE public.efiling_file_workflow_states_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_file_workflow_states_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_file_workflow_states_id_seq TO root;

-- DROP SEQUENCE public.efiling_files_costing_id_seq;

CREATE SEQUENCE public.efiling_files_costing_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_files_costing_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_files_costing_id_seq TO root;

-- DROP SEQUENCE public.efiling_files_id_seq;

CREATE SEQUENCE public.efiling_files_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_files_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_files_id_seq TO root;

-- DROP SEQUENCE public.efiling_meeting_attachments_id_seq;

CREATE SEQUENCE public.efiling_meeting_attachments_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_meeting_attachments_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_meeting_attachments_id_seq TO root;

-- DROP SEQUENCE public.efiling_meeting_attendees_id_seq;

CREATE SEQUENCE public.efiling_meeting_attendees_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_meeting_attendees_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_meeting_attendees_id_seq TO root;

-- DROP SEQUENCE public.efiling_meeting_external_attendees_id_seq;

CREATE SEQUENCE public.efiling_meeting_external_attendees_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_meeting_external_attendees_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_meeting_external_attendees_id_seq TO root;

-- DROP SEQUENCE public.efiling_meeting_reminders_id_seq;

CREATE SEQUENCE public.efiling_meeting_reminders_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_meeting_reminders_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_meeting_reminders_id_seq TO root;

-- DROP SEQUENCE public.efiling_meeting_settings_id_seq;

CREATE SEQUENCE public.efiling_meeting_settings_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_meeting_settings_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_meeting_settings_id_seq TO root;

-- DROP SEQUENCE public.efiling_meetings_id_seq;

CREATE SEQUENCE public.efiling_meetings_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_meetings_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_meetings_id_seq TO root;

-- DROP SEQUENCE public.efiling_notifications_id_seq;

CREATE SEQUENCE public.efiling_notifications_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_notifications_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_notifications_id_seq TO root;

-- DROP SEQUENCE public.efiling_otp_codes_id_seq;

CREATE SEQUENCE public.efiling_otp_codes_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_otp_codes_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_otp_codes_id_seq TO root;

-- DROP SEQUENCE public.efiling_permission_audit_log_id_seq;

CREATE SEQUENCE public.efiling_permission_audit_log_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_permission_audit_log_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_permission_audit_log_id_seq TO root;

-- DROP SEQUENCE public.efiling_permissions_id_seq;

CREATE SEQUENCE public.efiling_permissions_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_permissions_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_permissions_id_seq TO root;

-- DROP SEQUENCE public.efiling_role_group_locations_id_seq;

CREATE SEQUENCE public.efiling_role_group_locations_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_role_group_locations_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_role_group_locations_id_seq TO root;

-- DROP SEQUENCE public.efiling_role_group_members_id_seq;

CREATE SEQUENCE public.efiling_role_group_members_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_role_group_members_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_role_group_members_id_seq TO root;

-- DROP SEQUENCE public.efiling_role_groups_id_seq;

CREATE SEQUENCE public.efiling_role_groups_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_role_groups_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_role_groups_id_seq TO root;

-- DROP SEQUENCE public.efiling_role_locations_id_seq;

CREATE SEQUENCE public.efiling_role_locations_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_role_locations_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_role_locations_id_seq TO root;

-- DROP SEQUENCE public.efiling_role_permissions_id_seq;

CREATE SEQUENCE public.efiling_role_permissions_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_role_permissions_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_role_permissions_id_seq TO root;

-- DROP SEQUENCE public.efiling_roles_id_seq;

CREATE SEQUENCE public.efiling_roles_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_roles_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_roles_id_seq TO root;

-- DROP SEQUENCE public.efiling_signatures_id_seq;

CREATE SEQUENCE public.efiling_signatures_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_signatures_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_signatures_id_seq TO root;

-- DROP SEQUENCE public.efiling_sla_matrix_id_seq;

CREATE SEQUENCE public.efiling_sla_matrix_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_sla_matrix_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_sla_matrix_id_seq TO root;

-- DROP SEQUENCE public.efiling_sla_pause_history_id_seq;

CREATE SEQUENCE public.efiling_sla_pause_history_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_sla_pause_history_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_sla_pause_history_id_seq TO root;

-- DROP SEQUENCE public.efiling_sla_policies_id_seq;

CREATE SEQUENCE public.efiling_sla_policies_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_sla_policies_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_sla_policies_id_seq TO root;

-- DROP SEQUENCE public.efiling_tat_logs_id_seq;

CREATE SEQUENCE public.efiling_tat_logs_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_tat_logs_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_tat_logs_id_seq TO root;

-- DROP SEQUENCE public.efiling_template_departments_id_seq;

CREATE SEQUENCE public.efiling_template_departments_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_template_departments_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_template_departments_id_seq TO root;

-- DROP SEQUENCE public.efiling_template_roles_id_seq;

CREATE SEQUENCE public.efiling_template_roles_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_template_roles_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_template_roles_id_seq TO root;

-- DROP SEQUENCE public.efiling_templates_id_seq;

CREATE SEQUENCE public.efiling_templates_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_templates_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_templates_id_seq TO root;

-- DROP SEQUENCE public.efiling_tools_id_seq;

CREATE SEQUENCE public.efiling_tools_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_tools_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_tools_id_seq TO root;

-- DROP SEQUENCE public.efiling_user_actions_id_seq;

CREATE SEQUENCE public.efiling_user_actions_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_user_actions_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_user_actions_id_seq TO root;

-- DROP SEQUENCE public.efiling_user_teams_id_seq;

CREATE SEQUENCE public.efiling_user_teams_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_user_teams_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_user_teams_id_seq TO root;

-- DROP SEQUENCE public.efiling_user_tools_id_seq;

CREATE SEQUENCE public.efiling_user_tools_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_user_tools_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_user_tools_id_seq TO root;

-- DROP SEQUENCE public.efiling_users_id_seq;

CREATE SEQUENCE public.efiling_users_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_users_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_users_id_seq TO root;

-- DROP SEQUENCE public.efiling_zone_locations_id_seq;

CREATE SEQUENCE public.efiling_zone_locations_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_zone_locations_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_zone_locations_id_seq TO root;

-- DROP SEQUENCE public.efiling_zones_id_seq;

CREATE SEQUENCE public.efiling_zones_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.efiling_zones_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.efiling_zones_id_seq TO root;

-- DROP SEQUENCE public.final_videos_id_seq;

CREATE SEQUENCE public.final_videos_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.final_videos_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.final_videos_id_seq TO root;

-- DROP SEQUENCE public.images_id_seq;

CREATE SEQUENCE public.images_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.images_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.images_id_seq TO root;

-- DROP SEQUENCE public.main_id_seq;

CREATE SEQUENCE public.main_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.main_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.main_id_seq TO root;

-- DROP SEQUENCE public.milestone_content_id_seq;

CREATE SEQUENCE public.milestone_content_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.milestone_content_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.milestone_content_id_seq TO root;

-- DROP SEQUENCE public.milestone_definitions_id_seq;

CREATE SEQUENCE public.milestone_definitions_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.milestone_definitions_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.milestone_definitions_id_seq TO root;

-- DROP SEQUENCE public.notifications_id_seq;

CREATE SEQUENCE public.notifications_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.notifications_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.notifications_id_seq TO root;

-- DROP SEQUENCE public.public_access_log_id_seq;

CREATE SEQUENCE public.public_access_log_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.public_access_log_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.public_access_log_id_seq TO root;

-- DROP SEQUENCE public.rate_limiting_id_seq;

CREATE SEQUENCE public.rate_limiting_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.rate_limiting_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.rate_limiting_id_seq TO root;

-- DROP SEQUENCE public.request_assign_agent_id_seq;

CREATE SEQUENCE public.request_assign_agent_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.request_assign_agent_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.request_assign_agent_id_seq TO root;

-- DROP SEQUENCE public.request_assign_smagent_id_seq;

CREATE SEQUENCE public.request_assign_smagent_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.request_assign_smagent_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.request_assign_smagent_id_seq TO root;

-- DROP SEQUENCE public.role_id_seq;

CREATE SEQUENCE public.role_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.role_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.role_id_seq TO root;

-- DROP SEQUENCE public.secure_files_id_seq;

CREATE SEQUENCE public.secure_files_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.secure_files_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.secure_files_id_seq TO root;

-- DROP SEQUENCE public.security_audit_log_id_seq;

CREATE SEQUENCE public.security_audit_log_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.security_audit_log_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.security_audit_log_id_seq TO root;

-- DROP SEQUENCE public.security_config_id_seq;

CREATE SEQUENCE public.security_config_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.security_config_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.security_config_id_seq TO root;

-- DROP SEQUENCE public.security_events_id_seq;

CREATE SEQUENCE public.security_events_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.security_events_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.security_events_id_seq TO root;

-- DROP SEQUENCE public.socialmediaperson_id_seq;

CREATE SEQUENCE public.socialmediaperson_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.socialmediaperson_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.socialmediaperson_id_seq TO root;

-- DROP SEQUENCE public.status_id_seq;

CREATE SEQUENCE public.status_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.status_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.status_id_seq TO root;

-- DROP SEQUENCE public.subtown_id_seq;

CREATE SEQUENCE public.subtown_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.subtown_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.subtown_id_seq TO root;

-- DROP SEQUENCE public.suspicious_activity_id_seq;

CREATE SEQUENCE public.suspicious_activity_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.suspicious_activity_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.suspicious_activity_id_seq TO root;

-- DROP SEQUENCE public.town_id_seq;

CREATE SEQUENCE public.town_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.town_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.town_id_seq TO root;

-- DROP SEQUENCE public.user_actions_id_seq;

CREATE SEQUENCE public.user_actions_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.user_actions_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.user_actions_id_seq TO root;

-- DROP SEQUENCE public.users_id_seq;

CREATE SEQUENCE public.users_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.users_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.users_id_seq TO root;

-- DROP SEQUENCE public.videos_id_seq;

CREATE SEQUENCE public.videos_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.videos_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.videos_id_seq TO root;

-- DROP SEQUENCE public.work_id_seq;

CREATE SEQUENCE public.work_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.work_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.work_id_seq TO root;

-- DROP SEQUENCE public.work_request_approvals_id_seq;

CREATE SEQUENCE public.work_request_approvals_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.work_request_approvals_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.work_request_approvals_id_seq TO root;

-- DROP SEQUENCE public.work_request_locations_id_seq;

CREATE SEQUENCE public.work_request_locations_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.work_request_locations_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.work_request_locations_id_seq TO root;

-- DROP SEQUENCE public.work_request_soft_approvals_id_seq;

CREATE SEQUENCE public.work_request_soft_approvals_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.work_request_soft_approvals_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.work_request_soft_approvals_id_seq TO root;

-- DROP SEQUENCE public.work_request_subtowns_id_seq;

CREATE SEQUENCE public.work_request_subtowns_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.work_request_subtowns_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.work_request_subtowns_id_seq TO root;

-- DROP SEQUENCE public.work_requests_id_seq;

CREATE SEQUENCE public.work_requests_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.work_requests_id_seq OWNER TO root;
GRANT ALL ON SEQUENCE public.work_requests_id_seq TO root;
-- public.access_control definition

-- Drop table

-- DROP TABLE public.access_control;

CREATE TABLE public.access_control ( id serial4 NOT NULL, resource_type varchar(50) NOT NULL, resource_id int4 NOT NULL, user_id int4 NULL, role_id int4 NULL, ip_address inet NULL, "action" varchar(50) NOT NULL, allowed bool NOT NULL, reason text NULL, "timestamp" timestamp DEFAULT CURRENT_TIMESTAMP NULL, session_id varchar(255) NULL, user_agent text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT access_control_pkey PRIMARY KEY (id));
CREATE INDEX idx_access_control_resource ON public.access_control USING btree (resource_type, resource_id);
CREATE INDEX idx_access_control_role ON public.access_control USING btree (role_id);
CREATE INDEX idx_access_control_timestamp ON public.access_control USING btree ("timestamp");
CREATE INDEX idx_access_control_user ON public.access_control USING btree (user_id);
COMMENT ON TABLE public.access_control IS 'Logs access control decisions and attempts';

-- Permissions

ALTER TABLE public.access_control OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.access_control TO root;


-- public.district definition

-- Drop table

-- DROP TABLE public.district;

CREATE TABLE public.district ( id serial4 NOT NULL, title varchar(255) NOT NULL, created_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT district_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.district OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.district TO root;


-- public.efiling_daak_categories definition

-- Drop table

-- DROP TABLE public.efiling_daak_categories;

CREATE TABLE public.efiling_daak_categories ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, code varchar(50) NOT NULL, description text NULL, icon varchar(100) NULL, color varchar(20) NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_daak_categories_code_key UNIQUE (code), CONSTRAINT efiling_daak_categories_pkey PRIMARY KEY (id));
CREATE INDEX idx_daak_categories_active ON public.efiling_daak_categories USING btree (is_active) WHERE (is_active = true);
CREATE INDEX idx_daak_categories_code ON public.efiling_daak_categories USING btree (code);
COMMENT ON TABLE public.efiling_daak_categories IS 'Predefined categories for organizing daak (Promotion, Transfer, Notice, Announcement, etc.)';

-- Column comments

COMMENT ON COLUMN public.efiling_daak_categories.code IS 'Unique code for category (e.g., PROMOTION, TRANSFER, NOTICE)';

-- Table Triggers

create trigger trigger_efiling_daak_categories_updated_at before
update
    on
    public.efiling_daak_categories for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.efiling_daak_categories OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_daak_categories TO root;


-- public.efiling_file_attachments definition

-- Drop table

-- DROP TABLE public.efiling_file_attachments;

CREATE TABLE public.efiling_file_attachments ( id varchar(255) NOT NULL, file_id varchar(255) NOT NULL, file_name varchar(255) NOT NULL, file_size int8 NOT NULL, file_type varchar(100) NOT NULL, file_url text NULL, uploaded_by varchar(255) NOT NULL, uploaded_at timestamp DEFAULT now() NULL, deleted_at timestamp NULL, is_active bool DEFAULT true NULL, CONSTRAINT efiling_file_attachments_pkey PRIMARY KEY (id));
CREATE INDEX idx_efiling_file_attachments_file ON public.efiling_file_attachments USING btree (file_id);
COMMENT ON TABLE public.efiling_file_attachments IS 'Stores file attachments linked to e-filing documents';

-- Permissions

ALTER TABLE public.efiling_file_attachments OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_file_attachments TO root;


-- public.efiling_file_status definition

-- Drop table

-- DROP TABLE public.efiling_file_status;

CREATE TABLE public.efiling_file_status ( id serial4 NOT NULL, "name" varchar(100) NOT NULL, code varchar(50) NOT NULL, description text NULL, color varchar(20) DEFAULT '#000000'::character varying NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_file_status_code_key UNIQUE (code), CONSTRAINT efiling_file_status_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.efiling_file_status OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_file_status TO root;


-- public.efiling_otp_codes definition

-- Drop table

-- DROP TABLE public.efiling_otp_codes;

CREATE TABLE public.efiling_otp_codes ( id serial4 NOT NULL, user_id varchar(255) NOT NULL, otp_code varchar(10) NOT NULL, "method" varchar(50) NOT NULL, expires_at timestamp NOT NULL, created_at timestamp DEFAULT now() NULL, verified bool DEFAULT false NULL, CONSTRAINT efiling_otp_codes_pkey PRIMARY KEY (id));
CREATE INDEX idx_efiling_otp_codes_expires ON public.efiling_otp_codes USING btree (expires_at);
CREATE INDEX idx_efiling_otp_codes_user_method ON public.efiling_otp_codes USING btree (user_id, method);
COMMENT ON TABLE public.efiling_otp_codes IS 'Stores temporary OTP codes for user authentication';

-- Permissions

ALTER TABLE public.efiling_otp_codes OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_otp_codes TO root;


-- public.efiling_permissions definition

-- Drop table

-- DROP TABLE public.efiling_permissions;

CREATE TABLE public.efiling_permissions ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, description text NULL, resource_type varchar(100) NOT NULL, "action" varchar(100) NOT NULL, resource_subtype varchar(100) NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_permissions_pkey PRIMARY KEY (id), CONSTRAINT efiling_permissions_unique UNIQUE (resource_type, action, resource_subtype));
CREATE INDEX idx_efiling_permissions_resource_action ON public.efiling_permissions USING btree (resource_type, action);
COMMENT ON TABLE public.efiling_permissions IS 'Universal permissions system for e-filing module';

-- Permissions

ALTER TABLE public.efiling_permissions OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_permissions TO root;


-- public.efiling_role_groups definition

-- Drop table

-- DROP TABLE public.efiling_role_groups;

CREATE TABLE public.efiling_role_groups ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, code varchar(50) NOT NULL, description text NULL, role_codes jsonb DEFAULT '[]'::jsonb NOT NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_role_groups_code_key UNIQUE (code), CONSTRAINT efiling_role_groups_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.efiling_role_groups OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_role_groups TO root;


-- public.efiling_tools definition

-- Drop table

-- DROP TABLE public.efiling_tools;

CREATE TABLE public.efiling_tools ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, tool_type varchar(50) NOT NULL, description text NULL, icon varchar(100) NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_tools_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.efiling_tools OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_tools TO root;


-- public.efiling_user_actions definition

-- Drop table

-- DROP TABLE public.efiling_user_actions;

CREATE TABLE public.efiling_user_actions ( id serial4 NOT NULL, file_id varchar(255) NULL, user_id varchar(255) NOT NULL, action_type varchar(100) NOT NULL, description text NULL, "timestamp" timestamp NOT NULL, created_at timestamp DEFAULT now() NULL, user_type varchar(50) NOT NULL, user_role int4 NOT NULL, user_name varchar(255) NOT NULL, user_email varchar(255) NOT NULL, entity_type varchar(100) NOT NULL, entity_name varchar(255) NULL, details jsonb NULL, ip_address inet NULL, user_agent text NULL, updated_at timestamptz DEFAULT now() NULL, CONSTRAINT efiling_user_actions_pkey PRIMARY KEY (id));
CREATE INDEX idx_efiling_user_actions_entity_type ON public.efiling_user_actions USING btree (entity_type);
CREATE INDEX idx_efiling_user_actions_file ON public.efiling_user_actions USING btree (file_id);
CREATE INDEX idx_efiling_user_actions_timestamp ON public.efiling_user_actions USING btree ("timestamp");
CREATE INDEX idx_efiling_user_actions_updated_at ON public.efiling_user_actions USING btree (updated_at);
CREATE INDEX idx_efiling_user_actions_user ON public.efiling_user_actions USING btree (user_id);
CREATE INDEX idx_efiling_user_actions_user_role ON public.efiling_user_actions USING btree (user_role);
CREATE INDEX idx_efiling_user_actions_user_type ON public.efiling_user_actions USING btree (user_type);
CREATE INDEX idx_efiling_user_actions_user_type_role ON public.efiling_user_actions USING btree (user_type, user_role);
COMMENT ON TABLE public.efiling_user_actions IS 'Comprehensive logging of all user actions in the e-filing system for audit and tracking purposes';

-- Column comments

COMMENT ON COLUMN public.efiling_user_actions.file_id IS 'File ID for file-related actions, NULL for system/auth actions like login/logout';
COMMENT ON COLUMN public.efiling_user_actions.user_type IS 'Type of user: efiling_user, efiling_admin, efiling_manager, etc.';
COMMENT ON COLUMN public.efiling_user_actions.user_role IS 'Role ID of the user in the e-filing system';
COMMENT ON COLUMN public.efiling_user_actions.user_name IS 'Full name of the user performing the action';
COMMENT ON COLUMN public.efiling_user_actions.user_email IS 'Email address of the user performing the action';
COMMENT ON COLUMN public.efiling_user_actions.entity_type IS 'Type of entity being acted upon: efiling_file, efiling_department, efiling_role, etc.';
COMMENT ON COLUMN public.efiling_user_actions.entity_name IS 'Name or title of the entity being acted upon';
COMMENT ON COLUMN public.efiling_user_actions.details IS 'JSON object containing additional details about the action';
COMMENT ON COLUMN public.efiling_user_actions.ip_address IS 'IP address of the user performing the action';
COMMENT ON COLUMN public.efiling_user_actions.user_agent IS 'User agent string of the browser/client used';
COMMENT ON COLUMN public.efiling_user_actions.updated_at IS 'Timestamp when the record was last updated';

-- Table Triggers

create trigger trigger_update_efiling_user_actions_updated_at before
update
    on
    public.efiling_user_actions for each row execute function update_efiling_user_actions_updated_at();

-- Permissions

ALTER TABLE public.efiling_user_actions OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_user_actions TO root;


-- public.efiling_user_signatures definition

-- Drop table

-- DROP TABLE public.efiling_user_signatures;

CREATE TABLE public.efiling_user_signatures ( id varchar(255) NOT NULL, user_id varchar(255) NOT NULL, signature_name varchar(255) NOT NULL, signature_type varchar(50) NOT NULL, file_name varchar(255) NULL, file_size int8 NULL, file_type varchar(100) NULL, file_url text NULL, signature_data text NULL, created_at timestamp DEFAULT now() NULL, is_active bool DEFAULT true NULL, signature_color varchar(20) DEFAULT 'black'::character varying NULL, signature_text text NULL, signature_font varchar(100) DEFAULT 'Arial'::character varying NULL, CONSTRAINT efiling_user_signatures_pkey PRIMARY KEY (id), CONSTRAINT efiling_user_signatures_signature_color_check CHECK (((signature_color)::text = ANY ((ARRAY['black'::character varying, 'blue'::character varying, 'red'::character varying])::text[]))));
CREATE INDEX idx_efiling_user_signatures_color ON public.efiling_user_signatures USING btree (signature_color);
CREATE INDEX idx_efiling_user_signatures_user ON public.efiling_user_signatures USING btree (user_id);
COMMENT ON TABLE public.efiling_user_signatures IS 'Stores user-created signatures for e-filing documents';

-- Column comments

COMMENT ON COLUMN public.efiling_user_signatures.signature_color IS 'Color of the signature: black, blue, or red';
COMMENT ON COLUMN public.efiling_user_signatures.signature_text IS 'Text content for typed signatures';
COMMENT ON COLUMN public.efiling_user_signatures.signature_font IS 'Font family for typed signatures';

-- Permissions

ALTER TABLE public.efiling_user_signatures OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_user_signatures TO root;


-- public.efiling_zones definition

-- Drop table

-- DROP TABLE public.efiling_zones;

CREATE TABLE public.efiling_zones ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, ce_type varchar(100) NULL, description text NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_zones_name_key UNIQUE (name), CONSTRAINT efiling_zones_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.efiling_zones OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_zones TO root;


-- public.milestone_definitions definition

-- Drop table

-- DROP TABLE public.milestone_definitions;

CREATE TABLE public.milestone_definitions ( id serial4 NOT NULL, nature_of_work varchar NOT NULL, milestone_name text NOT NULL, order_sequence int4 NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT milestone_definitions_pkey PRIMARY KEY (id));

-- Table Triggers

create trigger update_milestone_definitions_modtime before
update
    on
    public.milestone_definitions for each row execute function update_modified_column();

-- Permissions

ALTER TABLE public.milestone_definitions OWNER TO root;
GRANT ALL ON TABLE public.milestone_definitions TO root;


-- public.public_access_log definition

-- Drop table

-- DROP TABLE public.public_access_log;

CREATE TABLE public.public_access_log ( id serial4 NOT NULL, media_type varchar(50) NOT NULL, media_id int4 NOT NULL, ip_address inet NOT NULL, user_agent text NULL, referer text NULL, access_granted bool NOT NULL, reason text NULL, response_time_ms int4 NULL, "timestamp" timestamp DEFAULT CURRENT_TIMESTAMP NULL, session_id varchar(255) NULL, geographic_location jsonb NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT public_access_log_pkey PRIMARY KEY (id));
CREATE INDEX idx_public_access_granted ON public.public_access_log USING btree (access_granted);
CREATE INDEX idx_public_access_ip ON public.public_access_log USING btree (ip_address);
CREATE INDEX idx_public_access_media ON public.public_access_log USING btree (media_type, media_id);
CREATE INDEX idx_public_access_timestamp ON public.public_access_log USING btree ("timestamp");
COMMENT ON TABLE public.public_access_log IS 'Logs public access to media files';

-- Permissions

ALTER TABLE public.public_access_log OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.public_access_log TO root;


-- public.rate_limiting definition

-- Drop table

-- DROP TABLE public.rate_limiting;

CREATE TABLE public.rate_limiting ( id serial4 NOT NULL, identifier varchar(255) NOT NULL, rate_limit_type varchar(50) NOT NULL, request_count int4 DEFAULT 1 NULL, first_request timestamp DEFAULT CURRENT_TIMESTAMP NULL, last_request timestamp DEFAULT CURRENT_TIMESTAMP NULL, window_start timestamp DEFAULT CURRENT_TIMESTAMP NULL, is_blocked bool DEFAULT false NULL, block_reason text NULL, block_until timestamp NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT rate_limiting_pkey PRIMARY KEY (id));
CREATE INDEX idx_rate_limiting_blocked ON public.rate_limiting USING btree (is_blocked);
CREATE INDEX idx_rate_limiting_identifier ON public.rate_limiting USING btree (identifier);
CREATE INDEX idx_rate_limiting_type ON public.rate_limiting USING btree (rate_limit_type);
CREATE INDEX idx_rate_limiting_window ON public.rate_limiting USING btree (window_start);
COMMENT ON TABLE public.rate_limiting IS 'Tracks rate limiting for various operations';

-- Table Triggers

create trigger update_rate_limiting_updated_at before
update
    on
    public.rate_limiting for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.rate_limiting OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.rate_limiting TO root;


-- public."role" definition

-- Drop table

-- DROP TABLE public."role";

CREATE TABLE public."role" ( id serial4 NOT NULL, title varchar(255) NOT NULL, created_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT role_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public."role" OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public."role" TO root;


-- public.secure_files definition

-- Drop table

-- DROP TABLE public.secure_files;

CREATE TABLE public.secure_files ( id serial4 NOT NULL, original_name varchar(255) NOT NULL, secure_name varchar(255) NOT NULL, file_hash varchar(64) NOT NULL, checksum varchar(32) NOT NULL, file_size int8 NOT NULL, file_type varchar(50) NOT NULL, mime_type varchar(100) NOT NULL, uploaded_by int4 NOT NULL, uploaded_at timestamp NOT NULL, storage_path text NOT NULL, is_active bool DEFAULT true NULL, access_count int4 DEFAULT 0 NULL, last_accessed timestamp NULL, virus_scan_status varchar(20) DEFAULT 'PENDING'::character varying NULL, virus_scan_date timestamp NULL, virus_scan_result jsonb NULL, file_integrity_verified bool DEFAULT false NULL, integrity_check_date timestamp NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT secure_files_pkey PRIMARY KEY (id), CONSTRAINT secure_files_secure_name_key UNIQUE (secure_name), CONSTRAINT secure_files_virus_scan_status_check CHECK (((virus_scan_status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('CLEAN'::character varying)::text, ('INFECTED'::character varying)::text, ('ERROR'::character varying)::text]))));
CREATE INDEX idx_secure_files_active ON public.secure_files USING btree (is_active);
CREATE INDEX idx_secure_files_hash ON public.secure_files USING btree (file_hash);
CREATE INDEX idx_secure_files_type ON public.secure_files USING btree (file_type);
CREATE INDEX idx_secure_files_uploaded_by ON public.secure_files USING btree (uploaded_by);
CREATE INDEX idx_secure_files_virus_scan ON public.secure_files USING btree (virus_scan_status);
COMMENT ON TABLE public.secure_files IS 'Stores metadata for securely uploaded files';

-- Table Triggers

create trigger update_secure_files_updated_at before
update
    on
    public.secure_files for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.secure_files OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.secure_files TO root;


-- public.security_audit_log definition

-- Drop table

-- DROP TABLE public.security_audit_log;

CREATE TABLE public.security_audit_log ( id serial4 NOT NULL, table_name varchar(100) NOT NULL, record_id int4 NOT NULL, "action" varchar(20) NOT NULL, old_values jsonb NULL, new_values jsonb NULL, changed_by int4 NULL, changed_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, ip_address inet NULL, user_agent text NULL, session_id varchar(255) NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT security_audit_log_action_check CHECK (((action)::text = ANY (ARRAY[('INSERT'::character varying)::text, ('UPDATE'::character varying)::text, ('DELETE'::character varying)::text]))), CONSTRAINT security_audit_log_pkey PRIMARY KEY (id));
CREATE INDEX idx_security_audit_action ON public.security_audit_log USING btree (action);
CREATE INDEX idx_security_audit_changed_by ON public.security_audit_log USING btree (changed_by);
CREATE INDEX idx_security_audit_table ON public.security_audit_log USING btree (table_name, record_id);
CREATE INDEX idx_security_audit_timestamp ON public.security_audit_log USING btree (changed_at);
COMMENT ON TABLE public.security_audit_log IS 'Audit trail for security-related table changes';

-- Permissions

ALTER TABLE public.security_audit_log OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.security_audit_log TO root;


-- public.security_config definition

-- Drop table

-- DROP TABLE public.security_config;

CREATE TABLE public.security_config ( id serial4 NOT NULL, config_key varchar(100) NOT NULL, config_value jsonb NOT NULL, description text NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT security_config_config_key_key UNIQUE (config_key), CONSTRAINT security_config_pkey PRIMARY KEY (id));
COMMENT ON TABLE public.security_config IS 'Stores security configuration parameters';

-- Table Triggers

create trigger update_security_config_updated_at before
update
    on
    public.security_config for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.security_config OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.security_config TO root;


-- public.security_events definition

-- Drop table

-- DROP TABLE public.security_events;

CREATE TABLE public.security_events ( id serial4 NOT NULL, event_type varchar(100) NOT NULL, user_id int4 NULL, ip_address inet NOT NULL, details jsonb NULL, severity varchar(20) DEFAULT 'INFO'::character varying NULL, "timestamp" timestamp DEFAULT CURRENT_TIMESTAMP NULL, user_agent text NULL, session_id varchar(255) NULL, request_method varchar(10) NULL, request_url text NULL, response_status int4 NULL, processing_time_ms int4 NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT security_events_pkey PRIMARY KEY (id), CONSTRAINT security_events_severity_check CHECK (((severity)::text = ANY (ARRAY[('INFO'::character varying)::text, ('WARNING'::character varying)::text, ('ERROR'::character varying)::text, ('CRITICAL'::character varying)::text]))));
CREATE INDEX idx_security_events_ip ON public.security_events USING btree (ip_address);
CREATE INDEX idx_security_events_severity ON public.security_events USING btree (severity);
CREATE INDEX idx_security_events_timestamp ON public.security_events USING btree ("timestamp");
CREATE INDEX idx_security_events_type ON public.security_events USING btree (event_type);
CREATE INDEX idx_security_events_user ON public.security_events USING btree (user_id);
COMMENT ON TABLE public.security_events IS 'Logs all security-related events in the system';

-- Permissions

ALTER TABLE public.security_events OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.security_events TO root;


-- public.socialmediaperson definition

-- Drop table

-- DROP TABLE public.socialmediaperson;

CREATE TABLE public.socialmediaperson ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, email varchar(255) NOT NULL, contact_number varchar(50) NULL, address text NULL, "role" int4 NULL, created_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, "password" varchar(255) NOT NULL, image varchar(250) NULL, session_token varchar(255) NULL, CONSTRAINT socialmediaperson_email_key UNIQUE (email), CONSTRAINT socialmediaperson_pkey PRIMARY KEY (id));
CREATE INDEX idx_socialmediaperson_email ON public.socialmediaperson USING btree (email);
CREATE INDEX idx_socialmediaperson_role ON public.socialmediaperson USING btree (role);

-- Permissions

ALTER TABLE public.socialmediaperson OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.socialmediaperson TO root;


-- public.spatial_ref_sys definition

-- Drop table

-- DROP TABLE public.spatial_ref_sys;

CREATE TABLE public.spatial_ref_sys ( srid int4 NOT NULL, auth_name varchar(256) NULL, auth_srid int4 NULL, srtext varchar(2048) NULL, proj4text varchar(2048) NULL, CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid), CONSTRAINT spatial_ref_sys_srid_check CHECK (((srid > 0) AND (srid <= 998999))));

-- Permissions

ALTER TABLE public.spatial_ref_sys OWNER TO postgres;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.spatial_ref_sys TO postgres;
GRANT SELECT ON TABLE public.spatial_ref_sys TO public;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.spatial_ref_sys TO root;


-- public.status definition

-- Drop table

-- DROP TABLE public.status;

CREATE TABLE public.status ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, created_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT status_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.status OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.status TO root;


-- public.suspicious_activity definition

-- Drop table

-- DROP TABLE public.suspicious_activity;

CREATE TABLE public.suspicious_activity ( id serial4 NOT NULL, ip_address inet NOT NULL, user_id int4 NULL, activity_type varchar(100) NOT NULL, patterns jsonb NOT NULL, severity varchar(20) DEFAULT 'WARNING'::character varying NULL, description text NULL, user_agent text NULL, referer text NULL, request_count int4 DEFAULT 1 NULL, first_detected timestamp DEFAULT CURRENT_TIMESTAMP NULL, last_detected timestamp DEFAULT CURRENT_TIMESTAMP NULL, is_blocked bool DEFAULT false NULL, block_reason text NULL, block_until timestamp NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT suspicious_activity_pkey PRIMARY KEY (id), CONSTRAINT suspicious_activity_severity_check CHECK (((severity)::text = ANY (ARRAY[('LOW'::character varying)::text, ('MEDIUM'::character varying)::text, ('HIGH'::character varying)::text, ('CRITICAL'::character varying)::text]))));
CREATE INDEX idx_suspicious_activity_blocked ON public.suspicious_activity USING btree (is_blocked);
CREATE INDEX idx_suspicious_activity_ip ON public.suspicious_activity USING btree (ip_address);
CREATE INDEX idx_suspicious_activity_severity ON public.suspicious_activity USING btree (severity);
CREATE INDEX idx_suspicious_activity_type ON public.suspicious_activity USING btree (activity_type);
COMMENT ON TABLE public.suspicious_activity IS 'Logs suspicious activity patterns';

-- Table Triggers

create trigger update_suspicious_activity_updated_at before
update
    on
    public.suspicious_activity for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.suspicious_activity OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.suspicious_activity TO root;


-- public.user_actions definition

-- Drop table

-- DROP TABLE public.user_actions;

CREATE TABLE public.user_actions ( id serial4 NOT NULL, user_id int4 NOT NULL, user_type varchar(50) NOT NULL, user_role int4 NOT NULL, user_name varchar(255) NOT NULL, user_email varchar(255) NOT NULL, action_type varchar(100) NOT NULL, entity_type varchar(100) NOT NULL, entity_id int4 NULL, entity_name varchar(255) NULL, details jsonb NULL, ip_address inet NULL, user_agent text NULL, created_at timestamptz DEFAULT now() NULL, updated_at timestamptz DEFAULT now() NULL, CONSTRAINT user_actions_pkey PRIMARY KEY (id));
CREATE INDEX idx_user_actions_action_type ON public.user_actions USING btree (action_type);
CREATE INDEX idx_user_actions_created_at ON public.user_actions USING btree (created_at);
CREATE INDEX idx_user_actions_entity_id ON public.user_actions USING btree (entity_id);
CREATE INDEX idx_user_actions_entity_type ON public.user_actions USING btree (entity_type);
CREATE INDEX idx_user_actions_user_id ON public.user_actions USING btree (user_id);
CREATE INDEX idx_user_actions_user_type ON public.user_actions USING btree (user_type);
CREATE INDEX idx_user_actions_user_type_role ON public.user_actions USING btree (user_type, user_role);
COMMENT ON TABLE public.user_actions IS 'Tracks all user actions across the system for audit purposes';

-- Column comments

COMMENT ON COLUMN public.user_actions.user_type IS 'Type of user: user, agent, socialmediaperson';
COMMENT ON COLUMN public.user_actions.user_role IS 'Role ID of the user';
COMMENT ON COLUMN public.user_actions.action_type IS 'Type of action performed: CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT, UPLOAD, DOWNLOAD';
COMMENT ON COLUMN public.user_actions.entity_type IS 'Type of entity being acted upon: request, image, video, user, agent, etc.';
COMMENT ON COLUMN public.user_actions.entity_id IS 'ID of the entity being acted upon';
COMMENT ON COLUMN public.user_actions.details IS 'JSON object containing additional details about the action';
COMMENT ON COLUMN public.user_actions.ip_address IS 'IP address of the user performing the action';
COMMENT ON COLUMN public.user_actions.user_agent IS 'User agent string of the browser/client';

-- Table Triggers

create trigger update_user_actions_updated_at before
update
    on
    public.user_actions for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.user_actions OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.user_actions TO root;


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, email varchar(255) NOT NULL, "password" varchar(255) NOT NULL, contact_number varchar(50) NULL, image varchar(250) NULL, "role" int4 NULL, created_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, session_token varchar(255) NULL, cnic varchar(15) NULL, CONSTRAINT users_email_key UNIQUE (email), CONSTRAINT users_pkey PRIMARY KEY (id));
CREATE UNIQUE INDEX idx_users_cnic ON public.users USING btree (cnic) WHERE (cnic IS NOT NULL);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_role ON public.users USING btree (role);

-- Column comments

COMMENT ON COLUMN public.users.cnic IS 'Computerized National Identity Card number (13 digits with format: 11111-1111111-1)';

-- Permissions

ALTER TABLE public.users OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.users TO root;


-- public.ce_users definition

-- Drop table

-- DROP TABLE public.ce_users;

CREATE TABLE public.ce_users ( id serial4 NOT NULL, user_id int4 NOT NULL, designation varchar(255) NULL, address text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT ce_users_pkey PRIMARY KEY (id), CONSTRAINT ce_users_user_id_key UNIQUE (user_id), CONSTRAINT ce_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE);
CREATE INDEX idx_ce_users_user_id ON public.ce_users USING btree (user_id);
COMMENT ON TABLE public.ce_users IS 'Stores Chief Engineer user information';

-- Column comments

COMMENT ON COLUMN public.ce_users.designation IS 'Job title/designation of the CE';
COMMENT ON COLUMN public.ce_users.address IS 'Physical address of the CE';

-- Permissions

ALTER TABLE public.ce_users OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.ce_users TO root;


-- public.efiling_departments definition

-- Drop table

-- DROP TABLE public.efiling_departments;

CREATE TABLE public.efiling_departments ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, code varchar(50) NOT NULL, description text NULL, parent_department_id int4 NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, department_type varchar(50) DEFAULT 'district'::character varying NULL, CONSTRAINT efiling_departments_code_key UNIQUE (code), CONSTRAINT efiling_departments_pkey PRIMARY KEY (id), CONSTRAINT efiling_departments_parent_department_id_fkey FOREIGN KEY (parent_department_id) REFERENCES public.efiling_departments(id));
CREATE INDEX idx_departments_type ON public.efiling_departments USING btree (department_type);

-- Column comments

COMMENT ON COLUMN public.efiling_departments.department_type IS 'Type of department: district (geographic), division+x (work-based), or global (top management)';

-- Permissions

ALTER TABLE public.efiling_departments OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_departments TO root;


-- public.efiling_file_categories definition

-- Drop table

-- DROP TABLE public.efiling_file_categories;

CREATE TABLE public.efiling_file_categories ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, code varchar(50) NOT NULL, description text NULL, department_id int4 NULL, is_work_related bool DEFAULT false NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_file_categories_code_key UNIQUE (code), CONSTRAINT efiling_file_categories_pkey PRIMARY KEY (id), CONSTRAINT efiling_file_categories_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.efiling_departments(id));

-- Permissions

ALTER TABLE public.efiling_file_categories OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_file_categories TO root;


-- public.efiling_roles definition

-- Drop table

-- DROP TABLE public.efiling_roles;

CREATE TABLE public.efiling_roles ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, code varchar(50) NOT NULL, description text NULL, department_id int4 NULL, permissions jsonb NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_roles_code_key UNIQUE (code), CONSTRAINT efiling_roles_pkey PRIMARY KEY (id), CONSTRAINT efiling_roles_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.efiling_departments(id));

-- Permissions

ALTER TABLE public.efiling_roles OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_roles TO root;


-- public.efiling_sla_matrix definition

-- Drop table

-- DROP TABLE public.efiling_sla_matrix;

CREATE TABLE public.efiling_sla_matrix ( id serial4 NOT NULL, from_role_code varchar(100) NOT NULL, to_role_code varchar(100) NOT NULL, level_scope varchar(20) DEFAULT 'district'::character varying NULL, sla_hours int4 DEFAULT 24 NULL, description text NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, department_id int4 NULL, from_role_id int4 NULL, to_role_id int4 NULL, CONSTRAINT efiling_sla_matrix_pkey PRIMARY KEY (id), CONSTRAINT efiling_sla_matrix_unique UNIQUE (from_role_code, to_role_code), CONSTRAINT efiling_sla_matrix_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.efiling_departments(id) ON DELETE SET NULL, CONSTRAINT fk_sla_from_role FOREIGN KEY (from_role_id) REFERENCES public.efiling_roles(id), CONSTRAINT fk_sla_to_role FOREIGN KEY (to_role_id) REFERENCES public.efiling_roles(id));
CREATE INDEX idx_efiling_sla_matrix_active ON public.efiling_sla_matrix USING btree (is_active) WHERE (is_active = true);
CREATE INDEX idx_efiling_sla_matrix_department ON public.efiling_sla_matrix USING btree (department_id);
CREATE INDEX idx_efiling_sla_matrix_from_role ON public.efiling_sla_matrix USING btree (from_role_code);
CREATE INDEX idx_efiling_sla_matrix_to_role ON public.efiling_sla_matrix USING btree (to_role_code);
COMMENT ON TABLE public.efiling_sla_matrix IS 'Defines SLA deadlines for role-to-role transitions (EE→SE, SE→CE, etc.)';

-- Column comments

COMMENT ON COLUMN public.efiling_sla_matrix.level_scope IS 'Geographic scope: district (same district required), division (same division required), global (no geography restriction)';
COMMENT ON COLUMN public.efiling_sla_matrix.department_id IS 'Department ID for department-specific SLA matrix. NULL means the policy is global and applies to all departments.';

-- Permissions

ALTER TABLE public.efiling_sla_matrix OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_sla_matrix TO root;


-- public.efiling_sla_policies definition

-- Drop table

-- DROP TABLE public.efiling_sla_policies;

CREATE TABLE public.efiling_sla_policies ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, description text NULL, policy_type varchar(50) DEFAULT 'TIME_BASED'::character varying NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, department_id int4 NULL, CONSTRAINT efiling_sla_policies_pkey PRIMARY KEY (id), CONSTRAINT efiling_sla_policies_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.efiling_departments(id) ON DELETE SET NULL);
CREATE INDEX idx_efiling_sla_policies_department ON public.efiling_sla_policies USING btree (department_id);

-- Column comments

COMMENT ON COLUMN public.efiling_sla_policies.department_id IS 'Department ID for department-specific SLA policies. NULL means the policy is global and applies to all departments.';

-- Permissions

ALTER TABLE public.efiling_sla_policies OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_sla_policies TO root;


-- public.town definition

-- Drop table

-- DROP TABLE public.town;

CREATE TABLE public.town ( id serial4 NOT NULL, district_id int4 NULL, town varchar(255) NOT NULL, subtown varchar(255) NULL, created_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT town_pkey PRIMARY KEY (id), CONSTRAINT town_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.district(id));
CREATE INDEX idx_town_district_id ON public.town USING btree (district_id);

-- Permissions

ALTER TABLE public.town OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.town TO root;


-- public.ce_user_districts definition

-- Drop table

-- DROP TABLE public.ce_user_districts;

CREATE TABLE public.ce_user_districts ( id serial4 NOT NULL, ce_user_id int4 NOT NULL, district_id int4 NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT ce_user_districts_pkey PRIMARY KEY (id), CONSTRAINT unique_ce_user_district UNIQUE (ce_user_id, district_id), CONSTRAINT ce_user_districts_ce_user_id_fkey FOREIGN KEY (ce_user_id) REFERENCES public.ce_users(id) ON DELETE CASCADE, CONSTRAINT ce_user_districts_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.district(id) ON DELETE CASCADE);
CREATE INDEX idx_ce_user_districts_ce_user ON public.ce_user_districts USING btree (ce_user_id);
CREATE INDEX idx_ce_user_districts_district ON public.ce_user_districts USING btree (district_id);
COMMENT ON TABLE public.ce_user_districts IS 'Bridge table linking CE users to districts';

-- Permissions

ALTER TABLE public.ce_user_districts OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.ce_user_districts TO root;


-- public.ce_user_towns definition

-- Drop table

-- DROP TABLE public.ce_user_towns;

CREATE TABLE public.ce_user_towns ( id serial4 NOT NULL, ce_user_id int4 NOT NULL, town_id int4 NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT ce_user_towns_pkey PRIMARY KEY (id), CONSTRAINT unique_ce_user_town UNIQUE (ce_user_id, town_id), CONSTRAINT ce_user_towns_ce_user_id_fkey FOREIGN KEY (ce_user_id) REFERENCES public.ce_users(id) ON DELETE CASCADE, CONSTRAINT ce_user_towns_town_id_fkey FOREIGN KEY (town_id) REFERENCES public.town(id) ON DELETE CASCADE);
CREATE INDEX idx_ce_user_towns_ce_user ON public.ce_user_towns USING btree (ce_user_id);
CREATE INDEX idx_ce_user_towns_town ON public.ce_user_towns USING btree (town_id);
COMMENT ON TABLE public.ce_user_towns IS 'Bridge table linking CE users to towns';

-- Permissions

ALTER TABLE public.ce_user_towns OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.ce_user_towns TO root;


-- public.ce_user_zones definition

-- Drop table

-- DROP TABLE public.ce_user_zones;

CREATE TABLE public.ce_user_zones ( id serial4 NOT NULL, ce_user_id int4 NOT NULL, zone_id int4 NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT ce_user_zones_pkey PRIMARY KEY (id), CONSTRAINT unique_ce_user_zone UNIQUE (ce_user_id, zone_id), CONSTRAINT ce_user_zones_ce_user_id_fkey FOREIGN KEY (ce_user_id) REFERENCES public.ce_users(id) ON DELETE CASCADE, CONSTRAINT ce_user_zones_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.efiling_zones(id) ON DELETE CASCADE);
CREATE INDEX idx_ce_user_zones_ce_user ON public.ce_user_zones USING btree (ce_user_id);
CREATE INDEX idx_ce_user_zones_zone ON public.ce_user_zones USING btree (zone_id);
COMMENT ON TABLE public.ce_user_zones IS 'Bridge table linking CE users to zones';

-- Permissions

ALTER TABLE public.ce_user_zones OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.ce_user_zones TO root;


-- public.divisions definition

-- Drop table

-- DROP TABLE public.divisions;

CREATE TABLE public.divisions ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, code varchar(50) NULL, ce_type varchar(100) NULL, department_id int4 NULL, description text NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT divisions_code_key UNIQUE (code), CONSTRAINT divisions_pkey PRIMARY KEY (id), CONSTRAINT divisions_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.efiling_departments(id));
CREATE INDEX idx_divisions_active ON public.divisions USING btree (is_active) WHERE (is_active = true);
CREATE INDEX idx_divisions_ce_type ON public.divisions USING btree (ce_type);
CREATE INDEX idx_divisions_department ON public.divisions USING btree (department_id);
COMMENT ON TABLE public.divisions IS 'Division-based organizational units (E&M Water Bulk, Sewerage, Bulk Transmission, WTM)';

-- Permissions

ALTER TABLE public.divisions OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.divisions TO root;


-- public.efiling_department_locations definition

-- Drop table

-- DROP TABLE public.efiling_department_locations;

CREATE TABLE public.efiling_department_locations ( id serial4 NOT NULL, department_id int4 NOT NULL, zone_id int4 NULL, district_id int4 NULL, town_id int4 NULL, division_id int4 NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_department_locations_pkey PRIMARY KEY (id), CONSTRAINT efiling_department_locations_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.efiling_departments(id) ON DELETE CASCADE, CONSTRAINT efiling_department_locations_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.district(id), CONSTRAINT efiling_department_locations_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id), CONSTRAINT efiling_department_locations_town_id_fkey FOREIGN KEY (town_id) REFERENCES public.town(id), CONSTRAINT efiling_department_locations_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.efiling_zones(id));
CREATE INDEX idx_department_locations_department ON public.efiling_department_locations USING btree (department_id);
CREATE INDEX idx_department_locations_zone_district ON public.efiling_department_locations USING btree (zone_id, district_id);

-- Permissions

ALTER TABLE public.efiling_department_locations OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_department_locations TO root;


-- public.efiling_file_types definition

-- Drop table

-- DROP TABLE public.efiling_file_types;

CREATE TABLE public.efiling_file_types ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, code varchar(50) NOT NULL, description text NULL, category_id int4 NULL, department_id int4 NULL, can_create_roles jsonb NULL, requires_approval bool DEFAULT true NULL, max_approval_level int4 DEFAULT 5 NULL, sla_matrix_id int4 NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_file_types_code_key UNIQUE (code), CONSTRAINT efiling_file_types_pkey PRIMARY KEY (id), CONSTRAINT efiling_file_types_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.efiling_file_categories(id), CONSTRAINT efiling_file_types_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.efiling_departments(id), CONSTRAINT efiling_file_types_sla_matrix_id_fkey FOREIGN KEY (sla_matrix_id) REFERENCES public.efiling_sla_matrix(id) ON DELETE SET NULL);
CREATE INDEX idx_efiling_file_types_active ON public.efiling_file_types USING btree (id) WHERE (is_active = true);
CREATE INDEX idx_efiling_file_types_category ON public.efiling_file_types USING btree (category_id);
CREATE INDEX idx_efiling_file_types_department ON public.efiling_file_types USING btree (department_id);
CREATE INDEX idx_efiling_file_types_sla_matrix ON public.efiling_file_types USING btree (sla_matrix_id);

-- Column comments

COMMENT ON COLUMN public.efiling_file_types.sla_matrix_id IS 'Reference to efiling_sla_matrix for SLA timing rules based on role routing';

-- Permissions

ALTER TABLE public.efiling_file_types OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_file_types TO root;


-- public.efiling_role_group_locations definition

-- Drop table

-- DROP TABLE public.efiling_role_group_locations;

CREATE TABLE public.efiling_role_group_locations ( id serial4 NOT NULL, role_group_id int4 NOT NULL, zone_id int4 NULL, district_id int4 NULL, town_id int4 NULL, division_id int4 NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_role_group_locations_pkey PRIMARY KEY (id), CONSTRAINT efiling_role_group_locations_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.district(id), CONSTRAINT efiling_role_group_locations_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id), CONSTRAINT efiling_role_group_locations_role_group_id_fkey FOREIGN KEY (role_group_id) REFERENCES public.efiling_role_groups(id) ON DELETE CASCADE, CONSTRAINT efiling_role_group_locations_town_id_fkey FOREIGN KEY (town_id) REFERENCES public.town(id), CONSTRAINT efiling_role_group_locations_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.efiling_zones(id));
CREATE INDEX idx_role_group_locations_group ON public.efiling_role_group_locations USING btree (role_group_id);

-- Permissions

ALTER TABLE public.efiling_role_group_locations OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_role_group_locations TO root;


-- public.efiling_role_group_members definition

-- Drop table

-- DROP TABLE public.efiling_role_group_members;

CREATE TABLE public.efiling_role_group_members ( id serial4 NOT NULL, group_id int4 NOT NULL, role_id int4 NOT NULL, CONSTRAINT efiling_role_group_members_group_id_role_id_key UNIQUE (group_id, role_id), CONSTRAINT efiling_role_group_members_pkey PRIMARY KEY (id), CONSTRAINT efiling_role_group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.efiling_role_groups(id) ON DELETE CASCADE, CONSTRAINT efiling_role_group_members_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.efiling_roles(id) ON DELETE CASCADE);

-- Permissions

ALTER TABLE public.efiling_role_group_members OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_role_group_members TO root;


-- public.efiling_role_locations definition

-- Drop table

-- DROP TABLE public.efiling_role_locations;

CREATE TABLE public.efiling_role_locations ( id serial4 NOT NULL, role_id int4 NOT NULL, zone_id int4 NULL, district_id int4 NULL, town_id int4 NULL, division_id int4 NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_role_locations_pkey PRIMARY KEY (id), CONSTRAINT efiling_role_locations_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.district(id), CONSTRAINT efiling_role_locations_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id), CONSTRAINT efiling_role_locations_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.efiling_roles(id) ON DELETE CASCADE, CONSTRAINT efiling_role_locations_town_id_fkey FOREIGN KEY (town_id) REFERENCES public.town(id), CONSTRAINT efiling_role_locations_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.efiling_zones(id));
CREATE INDEX idx_role_locations_role ON public.efiling_role_locations USING btree (role_id);

-- Permissions

ALTER TABLE public.efiling_role_locations OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_role_locations TO root;


-- public.efiling_zone_locations definition

-- Drop table

-- DROP TABLE public.efiling_zone_locations;

CREATE TABLE public.efiling_zone_locations ( id serial4 NOT NULL, zone_id int4 NOT NULL, district_id int4 NULL, town_id int4 NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_zone_locations_pkey PRIMARY KEY (id), CONSTRAINT efiling_zone_locations_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.district(id), CONSTRAINT efiling_zone_locations_town_id_fkey FOREIGN KEY (town_id) REFERENCES public.town(id), CONSTRAINT efiling_zone_locations_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.efiling_zones(id) ON DELETE CASCADE);
CREATE UNIQUE INDEX efiling_zone_locations_zone_id_town_id_idx ON public.efiling_zone_locations USING btree (zone_id, town_id);

-- Permissions

ALTER TABLE public.efiling_zone_locations OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_zone_locations TO root;


-- public.subtown definition

-- Drop table

-- DROP TABLE public.subtown;

CREATE TABLE public.subtown ( id serial4 NOT NULL, town_id int4 NULL, subtown varchar(255) NOT NULL, created_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT subtown_pkey PRIMARY KEY (id), CONSTRAINT subtown_town_id_fkey FOREIGN KEY (town_id) REFERENCES public.town(id));
CREATE INDEX idx_subtown_town_id ON public.subtown USING btree (town_id);

-- Permissions

ALTER TABLE public.subtown OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.subtown TO root;


-- public.ce_user_divisions definition

-- Drop table

-- DROP TABLE public.ce_user_divisions;

CREATE TABLE public.ce_user_divisions ( id serial4 NOT NULL, ce_user_id int4 NOT NULL, division_id int4 NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT ce_user_divisions_pkey PRIMARY KEY (id), CONSTRAINT unique_ce_user_division UNIQUE (ce_user_id, division_id), CONSTRAINT ce_user_divisions_ce_user_id_fkey FOREIGN KEY (ce_user_id) REFERENCES public.ce_users(id) ON DELETE CASCADE, CONSTRAINT ce_user_divisions_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE);
CREATE INDEX idx_ce_user_divisions_ce_user ON public.ce_user_divisions USING btree (ce_user_id);
CREATE INDEX idx_ce_user_divisions_division ON public.ce_user_divisions USING btree (division_id);
COMMENT ON TABLE public.ce_user_divisions IS 'Bridge table linking CE users to divisions';

-- Permissions

ALTER TABLE public.ce_user_divisions OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.ce_user_divisions TO root;


-- public.complaint_types definition

-- Drop table

-- DROP TABLE public.complaint_types;

CREATE TABLE public.complaint_types ( id serial4 NOT NULL, type_name varchar(255) NOT NULL, description text NULL, created_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, efiling_department_id int4 NULL, division_id int4 NULL, CONSTRAINT complaint_types_pkey PRIMARY KEY (id), CONSTRAINT complaint_types_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE SET NULL, CONSTRAINT complaint_types_efiling_department_id_fkey FOREIGN KEY (efiling_department_id) REFERENCES public.efiling_departments(id) ON DELETE SET NULL);

-- Column comments

COMMENT ON COLUMN public.complaint_types.efiling_department_id IS 'Optional link to e-filing department for integration with e-filing system';
COMMENT ON COLUMN public.complaint_types.division_id IS 'Optional link to division. If set, this department is division-based rather than town-based';

-- Permissions

ALTER TABLE public.complaint_types OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.complaint_types TO root;


-- public.efiling_users definition

-- Drop table

-- DROP TABLE public.efiling_users;

CREATE TABLE public.efiling_users ( id serial4 NOT NULL, user_id int4 NULL, employee_id varchar(50) NULL, designation varchar(255) NULL, department_id int4 NULL, efiling_role_id int4 NULL, supervisor_id int4 NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, preferred_signature_method varchar(50) DEFAULT 'SMS_OTP'::character varying NULL, signature_settings jsonb DEFAULT '{"sms_enabled": true, "epen_enabled": true, "google_auth_enabled": true}'::jsonb NULL, approval_level int4 DEFAULT 1 NULL, approval_amount_limit numeric(15, 2) DEFAULT 0.00 NULL, can_sign bool DEFAULT true NULL, can_create_files bool DEFAULT true NULL, can_approve_files bool DEFAULT false NULL, can_reject_files bool DEFAULT false NULL, can_transfer_files bool DEFAULT true NULL, notification_preferences jsonb DEFAULT '{"sms": true, "email": true, "in_app": true}'::jsonb NULL, last_activity_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, is_available bool DEFAULT true NULL, max_concurrent_files int4 DEFAULT 10 NULL, current_file_count int4 DEFAULT 0 NULL, signature_template text DEFAULT 'Best regards,{name}'::text NULL, address text NULL, google_email varchar(255) NULL, is_consultant bool DEFAULT false NOT NULL, district_id int4 NULL, town_id int4 NULL, subtown_id int4 NULL, division_id int4 NULL, CONSTRAINT efiling_users_approval_level_check CHECK (((approval_level >= 1) AND (approval_level <= 5))), CONSTRAINT efiling_users_employee_id_key UNIQUE (employee_id), CONSTRAINT efiling_users_pkey PRIMARY KEY (id), CONSTRAINT efiling_users_preferred_signature_method_check CHECK (((preferred_signature_method)::text = ANY (ARRAY[('SMS_OTP'::character varying)::text, ('GOOGLE_AUTH'::character varying)::text, ('E_PEN'::character varying)::text]))), CONSTRAINT efiling_users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.efiling_departments(id), CONSTRAINT efiling_users_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.district(id), CONSTRAINT efiling_users_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id), CONSTRAINT efiling_users_efiling_role_id_fkey FOREIGN KEY (efiling_role_id) REFERENCES public.efiling_roles(id), CONSTRAINT efiling_users_subtown_id_fkey FOREIGN KEY (subtown_id) REFERENCES public.subtown(id), CONSTRAINT efiling_users_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.efiling_users(id), CONSTRAINT efiling_users_town_id_fkey FOREIGN KEY (town_id) REFERENCES public.town(id), CONSTRAINT efiling_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE);
CREATE INDEX idx_efiling_users_approval_level ON public.efiling_users USING btree (approval_level);
CREATE INDEX idx_efiling_users_available ON public.efiling_users USING btree (is_available, current_file_count);
CREATE INDEX idx_efiling_users_can_approve ON public.efiling_users USING btree (can_approve_files);
CREATE INDEX idx_efiling_users_department ON public.efiling_users USING btree (department_id);
CREATE INDEX idx_efiling_users_department_role ON public.efiling_users USING btree (department_id, efiling_role_id);
CREATE INDEX idx_efiling_users_district ON public.efiling_users USING btree (district_id);
CREATE INDEX idx_efiling_users_division ON public.efiling_users USING btree (division_id);
CREATE INDEX idx_efiling_users_is_consultant ON public.efiling_users USING btree (is_consultant);
CREATE INDEX idx_efiling_users_location ON public.efiling_users USING btree (district_id, town_id, division_id);
CREATE INDEX idx_efiling_users_role ON public.efiling_users USING btree (efiling_role_id);
CREATE INDEX idx_efiling_users_subtown ON public.efiling_users USING btree (subtown_id);
CREATE INDEX idx_efiling_users_town ON public.efiling_users USING btree (town_id);

-- Column comments

COMMENT ON COLUMN public.efiling_users.preferred_signature_method IS 'User preferred e-signature method: SMS_OTP, GOOGLE_AUTH, or E_PEN';
COMMENT ON COLUMN public.efiling_users.signature_settings IS 'JSON object containing signature method preferences and settings';
COMMENT ON COLUMN public.efiling_users.approval_level IS 'User approval level: 1=Junior, 2=Senior, 3=Manager, 4=Director, 5=CEO';
COMMENT ON COLUMN public.efiling_users.approval_amount_limit IS 'Maximum amount user can approve without higher authority';
COMMENT ON COLUMN public.efiling_users.can_approve_files IS 'Whether user can approve files (requires approval_level > 1)';
COMMENT ON COLUMN public.efiling_users.can_reject_files IS 'Whether user can reject files and send back for changes';
COMMENT ON COLUMN public.efiling_users.max_concurrent_files IS 'Maximum number of files user can handle simultaneously';
COMMENT ON COLUMN public.efiling_users.signature_template IS 'Template for user signature with {name} placeholder';
COMMENT ON COLUMN public.efiling_users.address IS 'User address information';
COMMENT ON COLUMN public.efiling_users.is_consultant IS 'Whether the user is a consultant (third party) or KWSC employee';
COMMENT ON COLUMN public.efiling_users.district_id IS 'District assignment for district-based users (Water/Sewerage)';
COMMENT ON COLUMN public.efiling_users.town_id IS 'Town assignment for town-based users';
COMMENT ON COLUMN public.efiling_users.subtown_id IS 'Subtown assignment for subtown-based users';
COMMENT ON COLUMN public.efiling_users.division_id IS 'Division assignment for division-based users (E&M, Bulk Transmission, WTM)';

-- Permissions

ALTER TABLE public.efiling_users OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_users TO root;


-- public.agents definition

-- Drop table

-- DROP TABLE public.agents;

CREATE TABLE public.agents ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, designation varchar(255) NULL, contact_number varchar(50) NULL, address text NULL, department varchar(255) NULL, email varchar(255) NOT NULL, image varchar(250) NULL, "role" int4 NULL, created_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, "password" varchar(255) NOT NULL, town_id int4 NULL, complaint_type_id int4 NULL, session_token varchar(255) NULL, division_id int4 NULL, company_name varchar(255) NULL, CONSTRAINT agents_email_key UNIQUE (email), CONSTRAINT agents_pkey PRIMARY KEY (id), CONSTRAINT agents_complaint_type_id_fkey FOREIGN KEY (complaint_type_id) REFERENCES public.complaint_types(id), CONSTRAINT agents_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id), CONSTRAINT agents_town_id_fkey FOREIGN KEY (town_id) REFERENCES public.town(id));
CREATE INDEX idx_agents_division_id ON public.agents USING btree (division_id);
CREATE INDEX idx_agents_email ON public.agents USING btree (email);
CREATE INDEX idx_agents_role ON public.agents USING btree (role);
CREATE INDEX idx_agents_town_complaint ON public.agents USING btree (town_id, complaint_type_id);

-- Column comments

COMMENT ON COLUMN public.agents.company_name IS 'Company name for contractors (role = 2)';

-- Permissions

ALTER TABLE public.agents OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.agents TO root;


-- public.ce_user_departments definition

-- Drop table

-- DROP TABLE public.ce_user_departments;

CREATE TABLE public.ce_user_departments ( id serial4 NOT NULL, ce_user_id int4 NOT NULL, complaint_type_id int4 NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT ce_user_departments_pkey PRIMARY KEY (id), CONSTRAINT ce_user_departments_unique UNIQUE (ce_user_id, complaint_type_id), CONSTRAINT ce_user_departments_ce_user_id_fkey FOREIGN KEY (ce_user_id) REFERENCES public.ce_users(id) ON DELETE CASCADE, CONSTRAINT ce_user_departments_complaint_type_id_fkey FOREIGN KEY (complaint_type_id) REFERENCES public.complaint_types(id) ON DELETE CASCADE);
CREATE INDEX idx_ce_user_departments_ce_user_id ON public.ce_user_departments USING btree (ce_user_id);
CREATE INDEX idx_ce_user_departments_complaint_type_id ON public.ce_user_departments USING btree (complaint_type_id);
COMMENT ON TABLE public.ce_user_departments IS 'Junction table linking CE users to multiple complaint types (departments)';

-- Permissions

ALTER TABLE public.ce_user_departments OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.ce_user_departments TO root;


-- public.complaint_subtypes definition

-- Drop table

-- DROP TABLE public.complaint_subtypes;

CREATE TABLE public.complaint_subtypes ( id serial4 NOT NULL, subtype_name varchar(255) NOT NULL, complaint_type_id int4 NULL, description text NULL, created_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT complaint_subtypes_pkey PRIMARY KEY (id), CONSTRAINT complaint_subtypes_complaint_type_id_fkey FOREIGN KEY (complaint_type_id) REFERENCES public.complaint_types(id) ON DELETE CASCADE);

-- Permissions

ALTER TABLE public.complaint_subtypes OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.complaint_subtypes TO root;


-- public.complaint_type_divisions definition

-- Drop table

-- DROP TABLE public.complaint_type_divisions;

CREATE TABLE public.complaint_type_divisions ( id serial4 NOT NULL, complaint_type_id int4 NOT NULL, division_id int4 NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT complaint_type_divisions_pkey PRIMARY KEY (id), CONSTRAINT unique_complaint_type_division UNIQUE (complaint_type_id, division_id), CONSTRAINT complaint_type_divisions_complaint_type_id_fkey FOREIGN KEY (complaint_type_id) REFERENCES public.complaint_types(id) ON DELETE CASCADE, CONSTRAINT complaint_type_divisions_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE);
CREATE INDEX idx_complaint_type_divisions_complaint_type ON public.complaint_type_divisions USING btree (complaint_type_id);
CREATE INDEX idx_complaint_type_divisions_division ON public.complaint_type_divisions USING btree (division_id);
COMMENT ON TABLE public.complaint_type_divisions IS 'Bridge table linking complaint types to multiple divisions';

-- Permissions

ALTER TABLE public.complaint_type_divisions OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.complaint_type_divisions TO root;


-- public.efiling_daak definition

-- Drop table

-- DROP TABLE public.efiling_daak;

CREATE TABLE public.efiling_daak ( id serial4 NOT NULL, daak_number varchar(100) NOT NULL, subject varchar(500) NOT NULL, "content" text NOT NULL, category_id int4 NULL, priority varchar(20) DEFAULT 'NORMAL'::character varying NULL, created_by int4 NOT NULL, department_id int4 NULL, role_id int4 NULL, is_urgent bool DEFAULT false NULL, is_public bool DEFAULT false NULL, expires_at timestamp NULL, status varchar(20) DEFAULT 'DRAFT'::character varying NULL, sent_at timestamp NULL, total_recipients int4 DEFAULT 0 NULL, acknowledged_count int4 DEFAULT 0 NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_daak_daak_number_key UNIQUE (daak_number), CONSTRAINT efiling_daak_pkey PRIMARY KEY (id), CONSTRAINT efiling_daak_priority_check CHECK (((priority)::text = ANY ((ARRAY['LOW'::character varying, 'NORMAL'::character varying, 'HIGH'::character varying, 'URGENT'::character varying])::text[]))), CONSTRAINT efiling_daak_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SENT'::character varying, 'CANCELLED'::character varying])::text[]))), CONSTRAINT efiling_daak_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.efiling_daak_categories(id), CONSTRAINT efiling_daak_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.efiling_users(id) ON DELETE RESTRICT, CONSTRAINT efiling_daak_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.efiling_departments(id), CONSTRAINT efiling_daak_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.efiling_roles(id));
CREATE INDEX idx_daak_category ON public.efiling_daak USING btree (category_id);
CREATE INDEX idx_daak_created_at ON public.efiling_daak USING btree (created_at DESC);
CREATE INDEX idx_daak_created_by ON public.efiling_daak USING btree (created_by);
CREATE INDEX idx_daak_expires ON public.efiling_daak USING btree (expires_at) WHERE (expires_at IS NOT NULL);
CREATE INDEX idx_daak_priority ON public.efiling_daak USING btree (priority);
CREATE INDEX idx_daak_public ON public.efiling_daak USING btree (is_public) WHERE (is_public = true);
CREATE INDEX idx_daak_status ON public.efiling_daak USING btree (status);
COMMENT ON TABLE public.efiling_daak IS 'Main table for daak/letters/notifications sent by higher authorities';

-- Column comments

COMMENT ON COLUMN public.efiling_daak.daak_number IS 'Unique auto-generated daak number (e.g., DAAK-2025-001)';
COMMENT ON COLUMN public.efiling_daak.is_public IS 'If true, all users can view this daak even if not in recipients list';
COMMENT ON COLUMN public.efiling_daak.status IS 'DRAFT: Not sent yet, SENT: Sent to recipients, CANCELLED: Cancelled before sending';

-- Table Triggers

create trigger trigger_efiling_daak_updated_at before
update
    on
    public.efiling_daak for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.efiling_daak OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_daak TO root;


-- public.efiling_daak_acknowledgments definition

-- Drop table

-- DROP TABLE public.efiling_daak_acknowledgments;

CREATE TABLE public.efiling_daak_acknowledgments ( id serial4 NOT NULL, daak_id int4 NOT NULL, recipient_id int4 NOT NULL, acknowledgment_text text NULL, acknowledged_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, ip_address varchar(45) NULL, user_agent text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_daak_acknowledgments_pkey PRIMARY KEY (id), CONSTRAINT unique_daak_user_acknowledgment UNIQUE (daak_id, recipient_id), CONSTRAINT efiling_daak_acknowledgments_daak_id_fkey FOREIGN KEY (daak_id) REFERENCES public.efiling_daak(id) ON DELETE CASCADE, CONSTRAINT efiling_daak_acknowledgments_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.efiling_users(id) ON DELETE CASCADE);
CREATE INDEX idx_daak_ack_daak ON public.efiling_daak_acknowledgments USING btree (daak_id);
CREATE INDEX idx_daak_ack_date ON public.efiling_daak_acknowledgments USING btree (acknowledged_at DESC);
CREATE INDEX idx_daak_ack_user ON public.efiling_daak_acknowledgments USING btree (recipient_id);
COMMENT ON TABLE public.efiling_daak_acknowledgments IS 'Acknowledgments from recipients confirming they received the daak';

-- Column comments

COMMENT ON COLUMN public.efiling_daak_acknowledgments.acknowledgment_text IS 'Optional comment from recipient when acknowledging';

-- Permissions

ALTER TABLE public.efiling_daak_acknowledgments OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_daak_acknowledgments TO root;


-- public.efiling_daak_attachments definition

-- Drop table

-- DROP TABLE public.efiling_daak_attachments;

CREATE TABLE public.efiling_daak_attachments ( id serial4 NOT NULL, daak_id int4 NOT NULL, file_name varchar(500) NOT NULL, file_path varchar(1000) NOT NULL, file_size int8 NULL, file_type varchar(100) NULL, uploaded_by int4 NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_daak_attachments_pkey PRIMARY KEY (id), CONSTRAINT efiling_daak_attachments_daak_id_fkey FOREIGN KEY (daak_id) REFERENCES public.efiling_daak(id) ON DELETE CASCADE, CONSTRAINT efiling_daak_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.efiling_users(id) ON DELETE RESTRICT);
CREATE INDEX idx_daak_attachments_daak ON public.efiling_daak_attachments USING btree (daak_id);
CREATE INDEX idx_daak_attachments_uploaded_by ON public.efiling_daak_attachments USING btree (uploaded_by);
COMMENT ON TABLE public.efiling_daak_attachments IS 'File attachments associated with daak';

-- Permissions

ALTER TABLE public.efiling_daak_attachments OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_daak_attachments TO root;


-- public.efiling_daak_recipients definition

-- Drop table

-- DROP TABLE public.efiling_daak_recipients;

CREATE TABLE public.efiling_daak_recipients ( id serial4 NOT NULL, daak_id int4 NOT NULL, recipient_type varchar(20) NOT NULL, recipient_id int4 NULL, efiling_user_id int4 NULL, status varchar(20) DEFAULT 'PENDING'::character varying NULL, received_at timestamp NULL, acknowledged_at timestamp NULL, read_at timestamp NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_daak_recipients_pkey PRIMARY KEY (id), CONSTRAINT efiling_daak_recipients_recipient_type_check CHECK (((recipient_type)::text = ANY ((ARRAY['USER'::character varying, 'ROLE'::character varying, 'ROLE_GROUP'::character varying, 'TEAM'::character varying, 'DEPARTMENT'::character varying, 'EVERYONE'::character varying])::text[]))), CONSTRAINT efiling_daak_recipients_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'SENT'::character varying, 'RECEIVED'::character varying, 'ACKNOWLEDGED'::character varying])::text[]))), CONSTRAINT unique_daak_user_recipient UNIQUE (daak_id, efiling_user_id), CONSTRAINT efiling_daak_recipients_daak_id_fkey FOREIGN KEY (daak_id) REFERENCES public.efiling_daak(id) ON DELETE CASCADE, CONSTRAINT efiling_daak_recipients_efiling_user_id_fkey FOREIGN KEY (efiling_user_id) REFERENCES public.efiling_users(id) ON DELETE CASCADE);
CREATE INDEX idx_daak_recipients_acknowledged ON public.efiling_daak_recipients USING btree (daak_id, acknowledged_at) WHERE (acknowledged_at IS NOT NULL);
CREATE INDEX idx_daak_recipients_daak ON public.efiling_daak_recipients USING btree (daak_id);
CREATE INDEX idx_daak_recipients_status ON public.efiling_daak_recipients USING btree (status);
CREATE INDEX idx_daak_recipients_type ON public.efiling_daak_recipients USING btree (recipient_type, recipient_id);
CREATE INDEX idx_daak_recipients_user ON public.efiling_daak_recipients USING btree (efiling_user_id);
COMMENT ON TABLE public.efiling_daak_recipients IS 'Recipients of daak - can be individual users or expanded from roles/groups/teams/departments';

-- Column comments

COMMENT ON COLUMN public.efiling_daak_recipients.recipient_type IS 'Type of recipient: USER, ROLE, ROLE_GROUP, TEAM, DEPARTMENT, or EVERYONE';
COMMENT ON COLUMN public.efiling_daak_recipients.efiling_user_id IS 'Resolved user ID - for USER type directly, for others expanded from role/group/team';

-- Table Triggers

create trigger trigger_efiling_daak_recipients_updated_at before
update
    on
    public.efiling_daak_recipients for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.efiling_daak_recipients OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_daak_recipients TO root;


-- public.efiling_meeting_settings definition

-- Drop table

-- DROP TABLE public.efiling_meeting_settings;

CREATE TABLE public.efiling_meeting_settings ( id serial4 NOT NULL, setting_key varchar(100) NOT NULL, setting_value jsonb NOT NULL, description text NULL, updated_by int4 NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_meeting_settings_key_key UNIQUE (setting_key), CONSTRAINT efiling_meeting_settings_pkey PRIMARY KEY (id), CONSTRAINT efiling_meeting_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.efiling_users(id));
CREATE INDEX idx_meeting_settings_key ON public.efiling_meeting_settings USING btree (setting_key);
COMMENT ON TABLE public.efiling_meeting_settings IS 'System settings for meeting scheduler (SMTP config, default reminders, timezone, etc.)';

-- Column comments

COMMENT ON COLUMN public.efiling_meeting_settings.setting_value IS 'JSON object containing setting values (e.g., {"smtp_host": "...", "smtp_port": 587})';

-- Table Triggers

create trigger trigger_efiling_meeting_settings_updated_at before
update
    on
    public.efiling_meeting_settings for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.efiling_meeting_settings OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_meeting_settings TO root;


-- public.efiling_meetings definition

-- Drop table

-- DROP TABLE public.efiling_meetings;

CREATE TABLE public.efiling_meetings ( id serial4 NOT NULL, meeting_number varchar(100) NOT NULL, title varchar(500) NOT NULL, description text NULL, agenda text NULL, meeting_type varchar(20) DEFAULT 'IN_PERSON'::character varying NULL, meeting_date date NOT NULL, start_time time NOT NULL, end_time time NOT NULL, duration_minutes int4 NULL, venue_address varchar(500) NULL, meeting_link varchar(1000) NULL, organizer_id int4 NOT NULL, department_id int4 NULL, status varchar(20) DEFAULT 'SCHEDULED'::character varying NULL, is_recurring bool DEFAULT false NULL, recurrence_pattern jsonb NULL, reminder_sent bool DEFAULT false NULL, reminder_sent_at timestamp NULL, total_attendees int4 DEFAULT 0 NULL, accepted_count int4 DEFAULT 0 NULL, present_count int4 DEFAULT 0 NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, started_at timestamp NULL, ended_at timestamp NULL, CONSTRAINT efiling_meetings_meeting_number_key UNIQUE (meeting_number), CONSTRAINT efiling_meetings_meeting_type_check CHECK (((meeting_type)::text = ANY ((ARRAY['IN_PERSON'::character varying, 'VIRTUAL'::character varying, 'HYBRID'::character varying])::text[]))), CONSTRAINT efiling_meetings_pkey PRIMARY KEY (id), CONSTRAINT efiling_meetings_status_check CHECK (((status)::text = ANY ((ARRAY['SCHEDULED'::character varying, 'ONGOING'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying, 'POSTPONED'::character varying])::text[]))), CONSTRAINT efiling_meetings_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.efiling_departments(id), CONSTRAINT efiling_meetings_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.efiling_users(id) ON DELETE RESTRICT);
CREATE INDEX idx_meetings_created_at ON public.efiling_meetings USING btree (created_at DESC);
CREATE INDEX idx_meetings_date ON public.efiling_meetings USING btree (meeting_date, start_time);
CREATE INDEX idx_meetings_organizer ON public.efiling_meetings USING btree (organizer_id);
CREATE INDEX idx_meetings_recurring ON public.efiling_meetings USING btree (is_recurring) WHERE (is_recurring = true);
CREATE INDEX idx_meetings_status ON public.efiling_meetings USING btree (status);
CREATE INDEX idx_meetings_type ON public.efiling_meetings USING btree (meeting_type);
COMMENT ON TABLE public.efiling_meetings IS 'Main table for scheduled meetings - all users can create meetings';

-- Column comments

COMMENT ON COLUMN public.efiling_meetings.meeting_number IS 'Unique auto-generated meeting number (e.g., MEET-2025-001)';
COMMENT ON COLUMN public.efiling_meetings.venue_address IS 'Physical venue/address where meeting is organized (for IN_PERSON or HYBRID meetings)';
COMMENT ON COLUMN public.efiling_meetings.meeting_link IS 'Virtual meeting link - Google Meet, Zoom, or any virtual meeting platform URL (for VIRTUAL or HYBRID meetings)';
COMMENT ON COLUMN public.efiling_meetings.organizer_id IS 'User who created the meeting - all users can create meetings (no role restrictions)';
COMMENT ON COLUMN public.efiling_meetings.recurrence_pattern IS 'JSON object for recurring meetings (frequency, interval, days, end_date, etc.)';

-- Table Triggers

create trigger trigger_efiling_meetings_updated_at before
update
    on
    public.efiling_meetings for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.efiling_meetings OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_meetings TO root;


-- public.efiling_permission_audit_log definition

-- Drop table

-- DROP TABLE public.efiling_permission_audit_log;

CREATE TABLE public.efiling_permission_audit_log ( id serial4 NOT NULL, user_id int4 NOT NULL, "action" varchar(100) NOT NULL, permission_type varchar(100) NOT NULL, target_user_id int4 NULL, target_role_id int4 NULL, permission_details jsonb NULL, ip_address inet NULL, user_agent text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_permission_audit_log_pkey PRIMARY KEY (id), CONSTRAINT efiling_permission_audit_log_target_role_id_fkey FOREIGN KEY (target_role_id) REFERENCES public.efiling_roles(id), CONSTRAINT efiling_permission_audit_log_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES public.efiling_users(id), CONSTRAINT efiling_permission_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.efiling_users(id));
CREATE INDEX idx_efiling_permission_audit_log_created_at ON public.efiling_permission_audit_log USING btree (created_at);
CREATE INDEX idx_efiling_permission_audit_log_user ON public.efiling_permission_audit_log USING btree (user_id);
COMMENT ON TABLE public.efiling_permission_audit_log IS 'Audit log for all permission changes';

-- Permissions

ALTER TABLE public.efiling_permission_audit_log OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_permission_audit_log TO root;


-- public.efiling_role_permissions definition

-- Drop table

-- DROP TABLE public.efiling_role_permissions;

CREATE TABLE public.efiling_role_permissions ( id serial4 NOT NULL, role_id int4 NOT NULL, permission_id int4 NOT NULL, "granted" bool DEFAULT true NULL, conditions jsonb NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, granted_by int4 NULL, CONSTRAINT efiling_role_permissions_pkey PRIMARY KEY (id), CONSTRAINT efiling_role_permissions_unique UNIQUE (role_id, permission_id), CONSTRAINT efiling_role_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.efiling_users(id), CONSTRAINT efiling_role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.efiling_permissions(id) ON DELETE CASCADE, CONSTRAINT efiling_role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.efiling_roles(id) ON DELETE CASCADE);
CREATE INDEX idx_efiling_role_permissions_permission ON public.efiling_role_permissions USING btree (permission_id);
CREATE INDEX idx_efiling_role_permissions_role ON public.efiling_role_permissions USING btree (role_id);
COMMENT ON TABLE public.efiling_role_permissions IS 'Role-based permissions mapping';

-- Permissions

ALTER TABLE public.efiling_role_permissions OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_role_permissions TO root;


-- public.efiling_templates definition

-- Drop table

-- DROP TABLE public.efiling_templates;

CREATE TABLE public.efiling_templates ( id serial4 NOT NULL, "name" varchar(255) NOT NULL, category_id int4 NULL, template_content text NULL, variables jsonb NULL, created_by int4 NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, template_type varchar(50) NULL, title varchar(500) NULL, subject text NULL, main_content text NULL, department_id int4 NULL, role_id int4 NULL, is_system_template bool DEFAULT false NULL, usage_count int4 DEFAULT 0 NULL, last_used_at timestamp NULL, CONSTRAINT check_template_content CHECK ((((title IS NOT NULL) AND ((title)::text <> ''::text)) OR ((subject IS NOT NULL) AND (subject <> ''::text)) OR ((main_content IS NOT NULL) AND (main_content <> ''::text)))), CONSTRAINT efiling_templates_pkey PRIMARY KEY (id), CONSTRAINT efiling_templates_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.efiling_file_categories(id), CONSTRAINT efiling_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.efiling_users(id), CONSTRAINT efiling_templates_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.efiling_departments(id) ON DELETE SET NULL, CONSTRAINT efiling_templates_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.efiling_roles(id) ON DELETE SET NULL);
CREATE INDEX idx_efiling_templates_active ON public.efiling_templates USING btree (is_active) WHERE (is_active = true);
CREATE INDEX idx_efiling_templates_created_by ON public.efiling_templates USING btree (created_by);
CREATE INDEX idx_efiling_templates_department ON public.efiling_templates USING btree (department_id);
CREATE INDEX idx_efiling_templates_department_role ON public.efiling_templates USING btree (department_id, role_id);
CREATE INDEX idx_efiling_templates_role ON public.efiling_templates USING btree (role_id);
CREATE INDEX idx_efiling_templates_type ON public.efiling_templates USING btree (template_type);

-- Column comments

COMMENT ON COLUMN public.efiling_templates.template_type IS 'Type of template: notesheet(I), notesheet(II), letter, memo, etc.';
COMMENT ON COLUMN public.efiling_templates.title IS 'Template title that will populate the title field';
COMMENT ON COLUMN public.efiling_templates.subject IS 'Template subject that will populate the subject field';
COMMENT ON COLUMN public.efiling_templates.main_content IS 'Main document content that will populate the main content field';
COMMENT ON COLUMN public.efiling_templates.department_id IS 'Department this template belongs to (NULL = all departments)';
COMMENT ON COLUMN public.efiling_templates.role_id IS 'Role this template is for (NULL = all roles in department)';
COMMENT ON COLUMN public.efiling_templates.is_system_template IS 'True for admin-created templates, false for user-created templates';
COMMENT ON COLUMN public.efiling_templates.usage_count IS 'Number of times this template has been used';
COMMENT ON COLUMN public.efiling_templates.last_used_at IS 'Last time this template was used';

-- Table Triggers

create trigger trigger_update_efiling_templates_updated_at before
update
    on
    public.efiling_templates for each row execute function update_efiling_templates_updated_at();

-- Permissions

ALTER TABLE public.efiling_templates OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_templates TO root;


-- public.efiling_user_teams definition

-- Drop table

-- DROP TABLE public.efiling_user_teams;

CREATE TABLE public.efiling_user_teams ( id serial4 NOT NULL, manager_id int4 NOT NULL, team_member_id int4 NOT NULL, team_role varchar(50) NOT NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT check_not_self_reference CHECK ((manager_id <> team_member_id)), CONSTRAINT efiling_user_teams_pkey PRIMARY KEY (id), CONSTRAINT unique_team_member UNIQUE (manager_id, team_member_id), CONSTRAINT efiling_user_teams_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.efiling_users(id) ON DELETE CASCADE, CONSTRAINT efiling_user_teams_team_member_id_fkey FOREIGN KEY (team_member_id) REFERENCES public.efiling_users(id) ON DELETE CASCADE);
CREATE INDEX idx_team_active ON public.efiling_user_teams USING btree (manager_id, is_active) WHERE (is_active = true);
CREATE INDEX idx_team_manager ON public.efiling_user_teams USING btree (manager_id);
CREATE INDEX idx_team_member ON public.efiling_user_teams USING btree (team_member_id);
COMMENT ON TABLE public.efiling_user_teams IS 'Links team members (assistants) to their managers (EE/SE/CE)';

-- Column comments

COMMENT ON COLUMN public.efiling_user_teams.team_role IS 'Role in team: DAO, AEE, SUB_ENGINEER, AO, ASSISTANT, SE_ASSISTANT';

-- Table Triggers

create trigger trigger_update_team_updated_at before
update
    on
    public.efiling_user_teams for each row execute function update_team_updated_at();

-- Permissions

ALTER TABLE public.efiling_user_teams OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_user_teams TO root;


-- public.efiling_user_tools definition

-- Drop table

-- DROP TABLE public.efiling_user_tools;

CREATE TABLE public.efiling_user_tools ( id serial4 NOT NULL, user_id int4 NULL, tool_id int4 NULL, can_use bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_user_tools_pkey PRIMARY KEY (id), CONSTRAINT efiling_user_tools_user_id_tool_id_key UNIQUE (user_id, tool_id), CONSTRAINT efiling_user_tools_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.efiling_tools(id), CONSTRAINT efiling_user_tools_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.efiling_users(id));

-- Permissions

ALTER TABLE public.efiling_user_tools OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_user_tools TO root;


-- public.notifications definition

-- Drop table

-- DROP TABLE public.notifications;

CREATE TABLE public.notifications ( id serial4 NOT NULL, user_id int4 NULL, "type" varchar(32) NOT NULL, entity_id int4 NOT NULL, message text NOT NULL, created_at timestamp DEFAULT now() NULL, "read" bool DEFAULT false NULL, agent_id int4 NULL, socialmedia_id int4 NULL, CONSTRAINT notifications_pkey PRIMARY KEY (id), CONSTRAINT fk_notifications_agent FOREIGN KEY (agent_id) REFERENCES public.agents(id), CONSTRAINT fk_notifications_socialmedia FOREIGN KEY (socialmedia_id) REFERENCES public.socialmediaperson(id), CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES public.users(id));
CREATE INDEX idx_notifications_read ON public.notifications USING btree (user_id, read);
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);

-- Permissions

ALTER TABLE public.notifications OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.notifications TO root;


-- public.work_requests definition

-- Drop table

-- DROP TABLE public.work_requests;

CREATE TABLE public.work_requests ( id serial4 NOT NULL, request_date date DEFAULT CURRENT_DATE NOT NULL, town_id int4 NULL, subtown_id int4 NULL, complaint_type_id int4 NOT NULL, complaint_subtype_id int4 NULL, contact_number varchar(20) NOT NULL, address text NOT NULL, description text NOT NULL, applicant_id int4 NULL, status_id int4 DEFAULT 1 NOT NULL, assigned_to int4 NULL, created_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, geo_tag public.geometry NULL, creator_id int4 NULL, creator_type varchar(20) NULL, budget_code varchar(100) NULL, file_type varchar(30) NULL, executive_engineer_id int4 NULL, contractor_id int4 NULL, nature_of_work varchar(255) DEFAULT NULL::character varying NULL, division_id int4 NULL, zone_id int4 NULL, CONSTRAINT chk_file_type CHECK (((file_type)::text = ANY ((ARRAY['SPI'::character varying, 'R&M'::character varying, 'ADP'::character varying])::text[]))), CONSTRAINT work_requests_pkey PRIMARY KEY (id), CONSTRAINT work_requests_town_or_division_chk CHECK ((((town_id IS NOT NULL) AND (division_id IS NULL)) OR ((town_id IS NULL) AND (division_id IS NOT NULL)))), CONSTRAINT work_requests_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.users(id), CONSTRAINT work_requests_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id), CONSTRAINT work_requests_complaint_subtype_id_fkey FOREIGN KEY (complaint_subtype_id) REFERENCES public.complaint_subtypes(id), CONSTRAINT work_requests_complaint_type_id_fkey FOREIGN KEY (complaint_type_id) REFERENCES public.complaint_types(id), CONSTRAINT work_requests_contractor_id_fkey FOREIGN KEY (contractor_id) REFERENCES public.agents(id), CONSTRAINT work_requests_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id), CONSTRAINT work_requests_executive_engineer_id_fkey FOREIGN KEY (executive_engineer_id) REFERENCES public.agents(id), CONSTRAINT work_requests_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.status(id), CONSTRAINT work_requests_subtown_id_fkey FOREIGN KEY (subtown_id) REFERENCES public.subtown(id), CONSTRAINT work_requests_town_id_fkey FOREIGN KEY (town_id) REFERENCES public.town(id), CONSTRAINT work_requests_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.efiling_zones(id));
CREATE INDEX idx_work_requests_assigned_to ON public.work_requests USING btree (assigned_to);
CREATE INDEX idx_work_requests_complaint_subtype_id ON public.work_requests USING btree (complaint_subtype_id);
CREATE INDEX idx_work_requests_complaint_type_id ON public.work_requests USING btree (complaint_type_id);
CREATE INDEX idx_work_requests_contractor ON public.work_requests USING btree (contractor_id);
CREATE INDEX idx_work_requests_creator ON public.work_requests USING btree (creator_id, creator_type);
CREATE INDEX idx_work_requests_division ON public.work_requests USING btree (division_id);
CREATE INDEX idx_work_requests_exec_engineer ON public.work_requests USING btree (executive_engineer_id);
CREATE INDEX idx_work_requests_request_date ON public.work_requests USING btree (request_date);
CREATE INDEX idx_work_requests_status_id ON public.work_requests USING btree (status_id);
CREATE INDEX idx_work_requests_town_id ON public.work_requests USING btree (town_id);
CREATE INDEX idx_work_requests_zone ON public.work_requests USING btree (zone_id);

-- Column comments

COMMENT ON COLUMN public.work_requests.executive_engineer_id IS 'Executive Engineer associated with this request (required if contractor is creator)';
COMMENT ON COLUMN public.work_requests.contractor_id IS 'Contractor associated with this request (optional if executive engineer is creator)';

-- Table Triggers

create trigger refresh_dashboard_on_work_requests_change after
insert
    or
delete
    or
update
    on
    public.work_requests for each statement execute function trigger_refresh_dashboard_view();

-- Permissions

ALTER TABLE public.work_requests OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.work_requests TO root;


-- public.before_content definition

-- Drop table

-- DROP TABLE public.before_content;

CREATE TABLE public.before_content ( id int4 DEFAULT nextval('before_images_id_seq'::regclass) NOT NULL, link text NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, work_request_id int4 NULL, description text NULL, geo_tag public.geometry NULL, creator_id int4 NULL, creator_type varchar(20) NULL, creator_name text NULL, content_type varchar(10) DEFAULT 'image'::character varying NOT NULL, file_name text NULL, file_size int8 NULL, file_type text NULL, division_id int4 NULL, zone_id int4 NULL, CONSTRAINT before_images_pkey PRIMARY KEY (id), CONSTRAINT check_content_type CHECK (((content_type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying])::text[]))), CONSTRAINT before_content_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id), CONSTRAINT before_content_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.efiling_zones(id), CONSTRAINT before_images_work_request_id_fkey FOREIGN KEY (work_request_id) REFERENCES public.work_requests(id) ON DELETE CASCADE);
CREATE INDEX idx_before_content_division_zone ON public.before_content USING btree (division_id, zone_id);
CREATE INDEX idx_before_images_creator ON public.before_content USING btree (creator_id, creator_type);
CREATE INDEX idx_before_images_work_request_id ON public.before_content USING btree (work_request_id);
COMMENT ON TABLE public.before_content IS 'Before images captured by agents, admins, managers, and social media personnel for work requests';

-- Column comments

COMMENT ON COLUMN public.before_content.creator_id IS 'ID of the user who uploaded the before image';
COMMENT ON COLUMN public.before_content.creator_type IS 'Type of creator: user, agent, socialmediaperson';
COMMENT ON COLUMN public.before_content.creator_name IS 'Name of the creator for display purposes';

-- Table Triggers

create trigger refresh_dashboard_on_before_images_change after
insert
    or
delete
    or
update
    on
    public.before_content for each statement execute function trigger_refresh_dashboard_view();

-- Permissions

ALTER TABLE public.before_content OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.before_content TO root;


-- public.efiling_meeting_attachments definition

-- Drop table

-- DROP TABLE public.efiling_meeting_attachments;

CREATE TABLE public.efiling_meeting_attachments ( id serial4 NOT NULL, meeting_id int4 NOT NULL, file_name varchar(500) NOT NULL, file_path varchar(1000) NOT NULL, file_size int8 NULL, file_type varchar(100) NULL, attachment_type varchar(50) DEFAULT 'DOCUMENT'::character varying NULL, uploaded_by int4 NOT NULL, description text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_meeting_attachments_attachment_type_check CHECK (((attachment_type)::text = ANY ((ARRAY['AGENDA'::character varying, 'DOCUMENT'::character varying, 'PRESENTATION'::character varying, 'OTHER'::character varying])::text[]))), CONSTRAINT efiling_meeting_attachments_pkey PRIMARY KEY (id), CONSTRAINT efiling_meeting_attachments_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.efiling_meetings(id) ON DELETE CASCADE, CONSTRAINT efiling_meeting_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.efiling_users(id) ON DELETE RESTRICT);
CREATE INDEX idx_meeting_attachments_meeting ON public.efiling_meeting_attachments USING btree (meeting_id);
CREATE INDEX idx_meeting_attachments_type ON public.efiling_meeting_attachments USING btree (attachment_type);
CREATE INDEX idx_meeting_attachments_uploaded_by ON public.efiling_meeting_attachments USING btree (uploaded_by);
COMMENT ON TABLE public.efiling_meeting_attachments IS 'Files and documents attached to meetings (agenda, presentations, etc.)';

-- Permissions

ALTER TABLE public.efiling_meeting_attachments OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_meeting_attachments TO root;


-- public.efiling_meeting_attendees definition

-- Drop table

-- DROP TABLE public.efiling_meeting_attendees;

CREATE TABLE public.efiling_meeting_attendees ( id serial4 NOT NULL, meeting_id int4 NOT NULL, attendee_id int4 NOT NULL, attendee_type varchar(20) DEFAULT 'USER'::character varying NULL, source_id int4 NULL, response_status varchar(20) DEFAULT 'PENDING'::character varying NULL, attendance_status varchar(20) NULL, responded_at timestamp NULL, attended_at timestamp NULL, left_at timestamp NULL, notes text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_meeting_attendees_attendance_status_check CHECK (((attendance_status)::text = ANY ((ARRAY['PRESENT'::character varying, 'ABSENT'::character varying, 'LATE'::character varying, 'LEFT_EARLY'::character varying])::text[]))), CONSTRAINT efiling_meeting_attendees_attendee_type_check CHECK (((attendee_type)::text = ANY ((ARRAY['USER'::character varying, 'ROLE'::character varying, 'ROLE_GROUP'::character varying, 'TEAM'::character varying])::text[]))), CONSTRAINT efiling_meeting_attendees_pkey PRIMARY KEY (id), CONSTRAINT efiling_meeting_attendees_response_status_check CHECK (((response_status)::text = ANY ((ARRAY['PENDING'::character varying, 'ACCEPTED'::character varying, 'DECLINED'::character varying, 'TENTATIVE'::character varying])::text[]))), CONSTRAINT unique_meeting_user_attendee UNIQUE (meeting_id, attendee_id), CONSTRAINT efiling_meeting_attendees_attendee_id_fkey FOREIGN KEY (attendee_id) REFERENCES public.efiling_users(id) ON DELETE CASCADE, CONSTRAINT efiling_meeting_attendees_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.efiling_meetings(id) ON DELETE CASCADE);
CREATE INDEX idx_meeting_attendees_attendance ON public.efiling_meeting_attendees USING btree (attendance_status);
CREATE INDEX idx_meeting_attendees_meeting ON public.efiling_meeting_attendees USING btree (meeting_id);
CREATE INDEX idx_meeting_attendees_response ON public.efiling_meeting_attendees USING btree (response_status);
CREATE INDEX idx_meeting_attendees_type ON public.efiling_meeting_attendees USING btree (attendee_type, source_id);
CREATE INDEX idx_meeting_attendees_user ON public.efiling_meeting_attendees USING btree (attendee_id);
COMMENT ON TABLE public.efiling_meeting_attendees IS 'Internal attendees (efiling_users) invited to meetings';

-- Column comments

COMMENT ON COLUMN public.efiling_meeting_attendees.attendee_type IS 'How user was invited: directly as USER, or via ROLE/ROLE_GROUP/TEAM';
COMMENT ON COLUMN public.efiling_meeting_attendees.source_id IS 'If invited via role/group/team, this stores the role_id/group_id/team_id';

-- Table Triggers

create trigger trigger_efiling_meeting_attendees_updated_at before
update
    on
    public.efiling_meeting_attendees for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.efiling_meeting_attendees OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_meeting_attendees TO root;


-- public.efiling_meeting_external_attendees definition

-- Drop table

-- DROP TABLE public.efiling_meeting_external_attendees;

CREATE TABLE public.efiling_meeting_external_attendees ( id serial4 NOT NULL, meeting_id int4 NOT NULL, email varchar(255) NOT NULL, "name" varchar(255) NOT NULL, designation varchar(255) NULL, organization varchar(255) NULL, response_status varchar(20) DEFAULT 'PENDING'::character varying NULL, attendance_status varchar(20) NULL, invitation_sent bool DEFAULT false NULL, invitation_sent_at timestamp NULL, email_sent_count int4 DEFAULT 0 NULL, responded_at timestamp NULL, responded_via varchar(20) NULL, response_token varchar(100) NULL, attended_at timestamp NULL, left_at timestamp NULL, notes text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_meeting_external_attendees_attendance_status_check CHECK (((attendance_status)::text = ANY ((ARRAY['PRESENT'::character varying, 'ABSENT'::character varying, 'LATE'::character varying, 'LEFT_EARLY'::character varying])::text[]))), CONSTRAINT efiling_meeting_external_attendees_pkey PRIMARY KEY (id), CONSTRAINT efiling_meeting_external_attendees_responded_via_check CHECK (((responded_via)::text = ANY ((ARRAY['EMAIL_LINK'::character varying, 'EMAIL_REPLY'::character varying])::text[]))), CONSTRAINT efiling_meeting_external_attendees_response_status_check CHECK (((response_status)::text = ANY ((ARRAY['PENDING'::character varying, 'ACCEPTED'::character varying, 'DECLINED'::character varying, 'TENTATIVE'::character varying])::text[]))), CONSTRAINT efiling_meeting_external_attendees_response_token_key UNIQUE (response_token), CONSTRAINT unique_meeting_external_email UNIQUE (meeting_id, email), CONSTRAINT efiling_meeting_external_attendees_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.efiling_meetings(id) ON DELETE CASCADE);
CREATE INDEX idx_meeting_external_email ON public.efiling_meeting_external_attendees USING btree (email);
CREATE INDEX idx_meeting_external_meeting ON public.efiling_meeting_external_attendees USING btree (meeting_id);
CREATE INDEX idx_meeting_external_response ON public.efiling_meeting_external_attendees USING btree (response_status);
CREATE INDEX idx_meeting_external_sent ON public.efiling_meeting_external_attendees USING btree (invitation_sent) WHERE (invitation_sent = true);
CREATE INDEX idx_meeting_external_token ON public.efiling_meeting_external_attendees USING btree (response_token) WHERE (response_token IS NOT NULL);
COMMENT ON TABLE public.efiling_meeting_external_attendees IS 'External attendees (3rd party) invited via email';

-- Column comments

COMMENT ON COLUMN public.efiling_meeting_external_attendees.response_token IS 'Unique token for email response links (accept/decline via email)';

-- Table Triggers

create trigger trigger_efiling_meeting_external_attendees_updated_at before
update
    on
    public.efiling_meeting_external_attendees for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.efiling_meeting_external_attendees OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_meeting_external_attendees TO root;


-- public.efiling_meeting_reminders definition

-- Drop table

-- DROP TABLE public.efiling_meeting_reminders;

CREATE TABLE public.efiling_meeting_reminders ( id serial4 NOT NULL, meeting_id int4 NOT NULL, attendee_id int4 NULL, external_email varchar(255) NULL, reminder_type varchar(20) NOT NULL, reminder_sent_at timestamp NULL, reminder_sent_status varchar(20) NULL, reminder_minutes_before int4 NOT NULL, error_message text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT check_attendee_or_email CHECK ((((attendee_id IS NOT NULL) AND (external_email IS NULL)) OR ((attendee_id IS NULL) AND (external_email IS NOT NULL)))), CONSTRAINT efiling_meeting_reminders_pkey PRIMARY KEY (id), CONSTRAINT efiling_meeting_reminders_reminder_sent_status_check CHECK (((reminder_sent_status)::text = ANY ((ARRAY['SUCCESS'::character varying, 'FAILED'::character varying, 'PENDING'::character varying])::text[]))), CONSTRAINT efiling_meeting_reminders_reminder_type_check CHECK (((reminder_type)::text = ANY ((ARRAY['EMAIL'::character varying, 'SMS'::character varying, 'IN_APP'::character varying])::text[]))), CONSTRAINT efiling_meeting_reminders_attendee_id_fkey FOREIGN KEY (attendee_id) REFERENCES public.efiling_users(id) ON DELETE CASCADE, CONSTRAINT efiling_meeting_reminders_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.efiling_meetings(id) ON DELETE CASCADE);
CREATE INDEX idx_meeting_reminders_attendee ON public.efiling_meeting_reminders USING btree (attendee_id) WHERE (attendee_id IS NOT NULL);
CREATE INDEX idx_meeting_reminders_email ON public.efiling_meeting_reminders USING btree (external_email) WHERE (external_email IS NOT NULL);
CREATE INDEX idx_meeting_reminders_meeting ON public.efiling_meeting_reminders USING btree (meeting_id);
CREATE INDEX idx_meeting_reminders_sent_at ON public.efiling_meeting_reminders USING btree (reminder_sent_at) WHERE (reminder_sent_at IS NOT NULL);
CREATE INDEX idx_meeting_reminders_status ON public.efiling_meeting_reminders USING btree (reminder_sent_status);
COMMENT ON TABLE public.efiling_meeting_reminders IS 'Tracks meeting reminders sent to attendees (internal and external)';

-- Column comments

COMMENT ON COLUMN public.efiling_meeting_reminders.reminder_minutes_before IS 'Minutes before meeting when reminder was sent (15, 30, 60, 1440 for 1 day)';

-- Permissions

ALTER TABLE public.efiling_meeting_reminders OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_meeting_reminders TO root;


-- public.efiling_template_departments definition

-- Drop table

-- DROP TABLE public.efiling_template_departments;

CREATE TABLE public.efiling_template_departments ( id serial4 NOT NULL, template_id int4 NOT NULL, department_id int4 NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_template_departments_pkey PRIMARY KEY (id), CONSTRAINT unique_template_department UNIQUE (template_id, department_id), CONSTRAINT efiling_template_departments_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.efiling_departments(id) ON DELETE CASCADE, CONSTRAINT efiling_template_departments_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.efiling_templates(id) ON DELETE CASCADE);
CREATE INDEX idx_template_departments_department ON public.efiling_template_departments USING btree (department_id);
CREATE INDEX idx_template_departments_template ON public.efiling_template_departments USING btree (template_id);
COMMENT ON TABLE public.efiling_template_departments IS 'Bridge table linking templates to multiple departments';

-- Permissions

ALTER TABLE public.efiling_template_departments OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_template_departments TO root;


-- public.efiling_template_roles definition

-- Drop table

-- DROP TABLE public.efiling_template_roles;

CREATE TABLE public.efiling_template_roles ( id serial4 NOT NULL, template_id int4 NOT NULL, role_id int4 NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_template_roles_pkey PRIMARY KEY (id), CONSTRAINT unique_template_role UNIQUE (template_id, role_id), CONSTRAINT efiling_template_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.efiling_roles(id) ON DELETE CASCADE, CONSTRAINT efiling_template_roles_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.efiling_templates(id) ON DELETE CASCADE);
CREATE INDEX idx_template_roles_role ON public.efiling_template_roles USING btree (role_id);
CREATE INDEX idx_template_roles_template ON public.efiling_template_roles USING btree (template_id);
COMMENT ON TABLE public.efiling_template_roles IS 'Bridge table linking templates to multiple roles';

-- Permissions

ALTER TABLE public.efiling_template_roles OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_template_roles TO root;


-- public.final_videos definition

-- Drop table

-- DROP TABLE public.final_videos;

CREATE TABLE public.final_videos ( id serial4 NOT NULL, link text NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, work_request_id int4 NULL, description text NULL, geo_tag public.geometry NULL, creator_id int4 NULL, creator_type text NULL, creator_name text NULL, file_name text NULL, file_size int8 NULL, file_type text NULL, division_id int4 NULL, zone_id int4 NULL, CONSTRAINT final_videos_pkey PRIMARY KEY (id), CONSTRAINT final_videos_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id), CONSTRAINT final_videos_work_request_id_fkey FOREIGN KEY (work_request_id) REFERENCES public.work_requests(id) ON DELETE CASCADE, CONSTRAINT final_videos_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.efiling_zones(id));
CREATE INDEX idx_final_videos_creator ON public.final_videos USING btree (creator_id, creator_type);
CREATE INDEX idx_final_videos_division_zone ON public.final_videos USING btree (division_id, zone_id);
CREATE INDEX idx_final_videos_work_request_id ON public.final_videos USING btree (work_request_id);
COMMENT ON TABLE public.final_videos IS 'Final videos created by content creators and video editors from multiple source videos';

-- Column comments

COMMENT ON COLUMN public.final_videos.creator_id IS 'ID of the user who created the final video (content creator or video editor)';
COMMENT ON COLUMN public.final_videos.creator_type IS 'Type of creator: content_creator or video_editor';

-- Table Triggers

create trigger refresh_dashboard_on_final_videos_change after
insert
    or
delete
    or
update
    on
    public.final_videos for each statement execute function trigger_refresh_dashboard_view();

-- Permissions

ALTER TABLE public.final_videos OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.final_videos TO root;


-- public.images definition

-- Drop table

-- DROP TABLE public.images;

CREATE TABLE public.images ( id serial4 NOT NULL, link text NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, work_request_id int4 NULL, description text NULL, geo_tag public.geometry NULL, creator_id int4 NULL, creator_type varchar(20) NULL, file_name text NULL, file_size int8 NULL, file_type text NULL, creator_name text NULL, division_id int4 NULL, zone_id int4 NULL, CONSTRAINT images_pkey PRIMARY KEY (id), CONSTRAINT images_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id), CONSTRAINT images_work_request_id_fkey FOREIGN KEY (work_request_id) REFERENCES public.work_requests(id) ON DELETE CASCADE, CONSTRAINT images_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.efiling_zones(id));
CREATE INDEX idx_images_division_zone ON public.images USING btree (division_id, zone_id);
CREATE INDEX idx_images_work_request_id ON public.images USING btree (work_request_id);

-- Table Triggers

create trigger refresh_dashboard_on_images_change after
insert
    or
delete
    or
update
    on
    public.images for each statement execute function trigger_refresh_dashboard_view();

-- Permissions

ALTER TABLE public.images OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.images TO root;


-- public.milestone_content definition

-- Drop table

-- DROP TABLE public.milestone_content;

CREATE TABLE public.milestone_content ( id serial4 NOT NULL, work_request_id int4 NOT NULL, milestone_id int4 NOT NULL, link text NOT NULL, content_type varchar(10) DEFAULT 'image'::character varying NOT NULL, description text NULL, geo_tag public.geometry(point, 4326) NULL, creator_id int4 NULL, creator_type varchar(20) NULL, creator_name text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT check_milestone_content_type CHECK (((content_type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying])::text[]))), CONSTRAINT milestone_content_pkey PRIMARY KEY (id), CONSTRAINT fk_milestone_definition FOREIGN KEY (milestone_id) REFERENCES public.milestone_definitions(id), CONSTRAINT fk_milestone_work_request FOREIGN KEY (work_request_id) REFERENCES public.work_requests(id) ON DELETE CASCADE);
CREATE INDEX idx_milestone_content_creator ON public.milestone_content USING btree (creator_id, creator_type);
CREATE INDEX idx_milestone_content_milestone_id ON public.milestone_content USING btree (milestone_id);
CREATE INDEX idx_milestone_content_work_request ON public.milestone_content USING btree (work_request_id);

-- Table Triggers

create trigger trigger_update_milestone_content_time before
update
    on
    public.milestone_content for each row execute function update_milestone_content_timestamp();

-- Permissions

ALTER TABLE public.milestone_content OWNER TO root;
GRANT ALL ON TABLE public.milestone_content TO root;


-- public.request_assign_agent definition

-- Drop table

-- DROP TABLE public.request_assign_agent;

CREATE TABLE public.request_assign_agent ( id serial4 NOT NULL, work_requests_id int4 NOT NULL, agent_id int4 NOT NULL, status int4 DEFAULT 1 NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT request_assign_agent_pkey PRIMARY KEY (id), CONSTRAINT fk_request_agent_agent FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE, CONSTRAINT fk_request_agent_work_request FOREIGN KEY (work_requests_id) REFERENCES public.work_requests(id) ON DELETE CASCADE);
CREATE INDEX idx_request_assign_agent_agent_id ON public.request_assign_agent USING btree (agent_id);
CREATE INDEX idx_request_assign_agent_work_requests_id ON public.request_assign_agent USING btree (work_requests_id);

-- Permissions

ALTER TABLE public.request_assign_agent OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.request_assign_agent TO root;


-- public.request_assign_smagent definition

-- Drop table

-- DROP TABLE public.request_assign_smagent;

CREATE TABLE public.request_assign_smagent ( id serial4 NOT NULL, work_requests_id int4 NOT NULL, socialmedia_agent_id int4 NOT NULL, status int4 DEFAULT 1 NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT request_assign_smagent_pkey PRIMARY KEY (id), CONSTRAINT fk_request_smagent_socialmedia FOREIGN KEY (socialmedia_agent_id) REFERENCES public.socialmediaperson(id) ON DELETE CASCADE, CONSTRAINT fk_request_smagent_work_request FOREIGN KEY (work_requests_id) REFERENCES public.work_requests(id) ON DELETE CASCADE);
CREATE INDEX idx_request_assign_smagent_smagent_id ON public.request_assign_smagent USING btree (socialmedia_agent_id);
CREATE INDEX idx_request_assign_smagent_work_requests_id ON public.request_assign_smagent USING btree (work_requests_id);

-- Table Triggers

create trigger refresh_dashboard_on_request_assign_smagent_change after
insert
    or
delete
    or
update
    on
    public.request_assign_smagent for each statement execute function trigger_refresh_dashboard_view();

-- Permissions

ALTER TABLE public.request_assign_smagent OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.request_assign_smagent TO root;


-- public.videos definition

-- Drop table

-- DROP TABLE public.videos;

CREATE TABLE public.videos ( id serial4 NOT NULL, link text NOT NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, work_request_id int4 NULL, description text NULL, geo_tag public.geometry NULL, creator_id int4 NULL, creator_type varchar(20) NULL, file_name text NULL, file_size int8 NULL, file_type text NULL, creator_name text NULL, division_id int4 NULL, zone_id int4 NULL, CONSTRAINT videos_pkey PRIMARY KEY (id), CONSTRAINT videos_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id), CONSTRAINT videos_work_request_id_fkey FOREIGN KEY (work_request_id) REFERENCES public.work_requests(id) ON DELETE CASCADE, CONSTRAINT videos_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.efiling_zones(id));
CREATE INDEX idx_videos_division_zone ON public.videos USING btree (division_id, zone_id);
CREATE INDEX idx_videos_work_request_id ON public.videos USING btree (work_request_id);

-- Table Triggers

create trigger refresh_dashboard_on_videos_change after
insert
    or
delete
    or
update
    on
    public.videos for each statement execute function trigger_refresh_dashboard_view();

-- Permissions

ALTER TABLE public.videos OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.videos TO root;


-- public.work definition

-- Drop table

-- DROP TABLE public.work;

CREATE TABLE public.work ( id serial4 NOT NULL, subject varchar(255) NOT NULL, district_id int4 NULL, town_id int4 NULL, site_location text NULL, size_of_pipe varchar(50) NULL, length_of_pipe float8 NULL, allied_items text NULL, associated_work text NULL, survey_date date NULL, completion_date date NULL, geo_tag public.geometry NULL, before_image text NULL, after_image text NULL, assistant_id int4 NULL, shoot_date date NULL, link int4 NULL, expenditure_charge numeric NULL, complaint_type_id int4 NULL, complaint_subtype_id int4 NULL, status int4 NULL, CONSTRAINT work_pkey PRIMARY KEY (id), CONSTRAINT work_assistant_id_fkey FOREIGN KEY (assistant_id) REFERENCES public.users(id), CONSTRAINT work_complaint_subtype_id_fkey FOREIGN KEY (complaint_subtype_id) REFERENCES public.complaint_subtypes(id), CONSTRAINT work_complaint_type_id_fkey FOREIGN KEY (complaint_type_id) REFERENCES public.complaint_types(id), CONSTRAINT work_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.district(id), CONSTRAINT work_link_fkey FOREIGN KEY (link) REFERENCES public.videos(id), CONSTRAINT work_status_fkey FOREIGN KEY (status) REFERENCES public.status(id), CONSTRAINT work_town_id_fkey FOREIGN KEY (town_id) REFERENCES public.town(id));

-- Permissions

ALTER TABLE public.work OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.work TO root;


-- public.work_request_approvals definition

-- Drop table

-- DROP TABLE public.work_request_approvals;

CREATE TABLE public.work_request_approvals ( id serial4 NOT NULL, work_request_id int4 NOT NULL, ceo_id int4 NOT NULL, approval_status varchar(20) DEFAULT 'pending'::character varying NOT NULL, approval_date timestamp NULL, rejection_reason text NULL, ceo_comments text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT chk_approval_status CHECK (((approval_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))), CONSTRAINT work_request_approvals_pkey PRIMARY KEY (id), CONSTRAINT work_request_approvals_ceo_id_fkey FOREIGN KEY (ceo_id) REFERENCES public.users(id) ON DELETE CASCADE, CONSTRAINT work_request_approvals_work_request_id_fkey FOREIGN KEY (work_request_id) REFERENCES public.work_requests(id) ON DELETE CASCADE);
CREATE INDEX idx_work_request_approvals_ceo_id ON public.work_request_approvals USING btree (ceo_id);
CREATE INDEX idx_work_request_approvals_date ON public.work_request_approvals USING btree (approval_date);
CREATE INDEX idx_work_request_approvals_status ON public.work_request_approvals USING btree (approval_status);
CREATE INDEX idx_work_request_approvals_work_request_id ON public.work_request_approvals USING btree (work_request_id);

-- Table Triggers

create trigger refresh_dashboard_on_work_request_approvals_change after
insert
    or
delete
    or
update
    on
    public.work_request_approvals for each statement execute function trigger_refresh_dashboard_view();
create trigger update_work_request_status_trigger after
insert
    or
update
    on
    public.work_request_approvals for each row execute function update_work_request_status_on_approval();

-- Permissions

ALTER TABLE public.work_request_approvals OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.work_request_approvals TO root;


-- public.work_request_locations definition

-- Drop table

-- DROP TABLE public.work_request_locations;

CREATE TABLE public.work_request_locations ( id serial4 NOT NULL, work_request_id int4 NOT NULL, latitude numeric(10, 8) NOT NULL, longitude numeric(11, 8) NOT NULL, description text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT work_request_locations_pkey PRIMARY KEY (id), CONSTRAINT work_request_locations_work_request_id_fkey FOREIGN KEY (work_request_id) REFERENCES public.work_requests(id) ON DELETE CASCADE);
CREATE INDEX idx_work_request_locations_coordinates ON public.work_request_locations USING btree (latitude, longitude);
CREATE INDEX idx_work_request_locations_work_request_id ON public.work_request_locations USING btree (work_request_id);

-- Table Triggers

create trigger refresh_dashboard_on_work_request_locations_change after
insert
    or
delete
    or
update
    on
    public.work_request_locations for each statement execute function trigger_refresh_dashboard_view();

-- Permissions

ALTER TABLE public.work_request_locations OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.work_request_locations TO root;


-- public.work_request_soft_approvals definition

-- Drop table

-- DROP TABLE public.work_request_soft_approvals;

CREATE TABLE public.work_request_soft_approvals ( id serial4 NOT NULL, work_request_id int4 NOT NULL, approver_id int4 NOT NULL, approver_type varchar(20) NOT NULL, approval_status varchar(20) DEFAULT 'pending'::character varying NOT NULL, "comments" text NULL, approved_at timestamp NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT chk_approver_type CHECK (((approver_type)::text = ANY ((ARRAY['ceo'::character varying, 'coo'::character varying, 'ce'::character varying])::text[]))), CONSTRAINT chk_soft_approval_status CHECK (((approval_status)::text = ANY (ARRAY[('pending'::character varying)::text, ('approved'::character varying)::text, ('not_approved'::character varying)::text]))), CONSTRAINT work_request_soft_approvals_pkey PRIMARY KEY (id), CONSTRAINT work_request_soft_approvals_unique UNIQUE (work_request_id, approver_type), CONSTRAINT work_request_soft_approvals_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.users(id) ON DELETE CASCADE, CONSTRAINT work_request_soft_approvals_work_request_id_fkey FOREIGN KEY (work_request_id) REFERENCES public.work_requests(id) ON DELETE CASCADE);
CREATE INDEX idx_work_request_soft_approvals_approver ON public.work_request_soft_approvals USING btree (approver_id, approver_type);
CREATE INDEX idx_work_request_soft_approvals_approver_type ON public.work_request_soft_approvals USING btree (approver_type);
CREATE INDEX idx_work_request_soft_approvals_status ON public.work_request_soft_approvals USING btree (approval_status);
CREATE INDEX idx_work_request_soft_approvals_work_request_id ON public.work_request_soft_approvals USING btree (work_request_id);
COMMENT ON TABLE public.work_request_soft_approvals IS 'Soft approvals from CEO and COO that do not affect workflow but provide e-signature functionality';

-- Column comments

COMMENT ON COLUMN public.work_request_soft_approvals.approver_type IS 'Type of approver: ceo, coo, or ce';
COMMENT ON COLUMN public.work_request_soft_approvals.approval_status IS 'Approval status: pending, approved, not_approved';
COMMENT ON COLUMN public.work_request_soft_approvals."comments" IS 'Comments from the approver';

-- Table Triggers

create trigger update_work_request_soft_approvals_updated_at before
update
    on
    public.work_request_soft_approvals for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.work_request_soft_approvals OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.work_request_soft_approvals TO root;


-- public.work_request_subtowns definition

-- Drop table

-- DROP TABLE public.work_request_subtowns;

CREATE TABLE public.work_request_subtowns ( id serial4 NOT NULL, work_request_id int4 NOT NULL, subtown_id int4 NOT NULL, CONSTRAINT work_request_subtowns_pkey PRIMARY KEY (id), CONSTRAINT work_request_subtowns_work_request_id_subtown_id_key UNIQUE (work_request_id, subtown_id), CONSTRAINT work_request_subtowns_subtown_id_fkey FOREIGN KEY (subtown_id) REFERENCES public.subtown(id) ON DELETE CASCADE, CONSTRAINT work_request_subtowns_work_request_id_fkey FOREIGN KEY (work_request_id) REFERENCES public.work_requests(id) ON DELETE CASCADE);

-- Permissions

ALTER TABLE public.work_request_subtowns OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.work_request_subtowns TO root;


-- public.main definition

-- Drop table

-- DROP TABLE public.main;

CREATE TABLE public.main ( id serial4 NOT NULL, agent_id int4 NULL, social_media_person_id int4 NULL, work_id int4 NULL, CONSTRAINT main_pkey PRIMARY KEY (id), CONSTRAINT main_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id), CONSTRAINT main_social_media_person_id_fkey FOREIGN KEY (social_media_person_id) REFERENCES public.socialmediaperson(id), CONSTRAINT main_work_id_fkey FOREIGN KEY (work_id) REFERENCES public.work(id));

-- Permissions

ALTER TABLE public.main OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.main TO root;


-- public.efiling_comments definition

-- Drop table

-- DROP TABLE public.efiling_comments;

CREATE TABLE public.efiling_comments ( id serial4 NOT NULL, file_id int4 NULL, user_id int4 NULL, "comment" text NOT NULL, is_internal bool DEFAULT false NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_comments_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.efiling_comments OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_comments TO root;


-- public.efiling_document_comments definition

-- Drop table

-- DROP TABLE public.efiling_document_comments;

CREATE TABLE public.efiling_document_comments ( id serial4 NOT NULL, file_id int4 NOT NULL, user_id int4 NOT NULL, user_name varchar(255) NOT NULL, user_role varchar(100) NOT NULL, "text" text NOT NULL, "timestamp" timestamp DEFAULT CURRENT_TIMESTAMP NULL, edited bool DEFAULT false NULL, edited_at timestamp NULL, is_active bool DEFAULT true NULL, CONSTRAINT efiling_document_comments_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.efiling_document_comments OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_document_comments TO root;


-- public.efiling_document_pages definition

-- Drop table

-- DROP TABLE public.efiling_document_pages;

CREATE TABLE public.efiling_document_pages ( id serial4 NOT NULL, file_id int4 NOT NULL, page_number int4 NOT NULL, page_title varchar(255) NULL, page_content text NULL, page_type varchar(50) DEFAULT 'MAIN'::character varying NULL, is_active bool DEFAULT true NULL, created_by int4 NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_document_pages_pkey PRIMARY KEY (id));
CREATE INDEX idx_efiling_document_pages_file ON public.efiling_document_pages USING btree (file_id);
CREATE INDEX idx_efiling_document_pages_number ON public.efiling_document_pages USING btree (file_id, page_number);

-- Permissions

ALTER TABLE public.efiling_document_pages OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_document_pages TO root;


-- public.efiling_document_signatures definition

-- Drop table

-- DROP TABLE public.efiling_document_signatures;

CREATE TABLE public.efiling_document_signatures ( id serial4 NOT NULL, file_id int4 NOT NULL, user_id int4 NOT NULL, user_name varchar(255) NOT NULL, user_role varchar(100) NOT NULL, "type" varchar(50) NOT NULL, "content" text NOT NULL, "position" jsonb NOT NULL, font varchar(100) NULL, "timestamp" timestamp DEFAULT CURRENT_TIMESTAMP NULL, is_active bool DEFAULT true NULL, color varchar(20) DEFAULT 'black'::character varying NULL, user_designation varchar(255) NULL, user_town_id int4 NULL, user_division_id int4 NULL, CONSTRAINT efiling_document_signatures_pkey PRIMARY KEY (id));

-- Column comments

COMMENT ON COLUMN public.efiling_document_signatures.user_designation IS 'Historical designation of the user who signed (at time of signature)';
COMMENT ON COLUMN public.efiling_document_signatures.user_town_id IS 'Historical town assignment of the user who signed (at time of signature)';
COMMENT ON COLUMN public.efiling_document_signatures.user_division_id IS 'Historical division assignment of the user who signed (at time of signature)';

-- Permissions

ALTER TABLE public.efiling_document_signatures OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_document_signatures TO root;


-- public.efiling_documents definition

-- Drop table

-- DROP TABLE public.efiling_documents;

CREATE TABLE public.efiling_documents ( id serial4 NOT NULL, file_id int4 NULL, document_type varchar(100) NOT NULL, title varchar(255) NOT NULL, description text NULL, file_path varchar(500) NULL, file_size int4 NULL, mime_type varchar(100) NULL, uploaded_by int4 NULL, uploaded_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, is_active bool DEFAULT true NULL, CONSTRAINT efiling_documents_pkey PRIMARY KEY (id));
CREATE INDEX idx_efiling_documents_file ON public.efiling_documents USING btree (file_id);

-- Permissions

ALTER TABLE public.efiling_documents OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_documents TO root;


-- public.efiling_file_movements definition

-- Drop table

-- DROP TABLE public.efiling_file_movements;

CREATE TABLE public.efiling_file_movements ( id serial4 NOT NULL, file_id int4 NULL, from_user_id int4 NULL, to_user_id int4 NULL, from_department_id int4 NULL, to_department_id int4 NULL, action_type varchar(50) NOT NULL, remarks text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, is_team_internal bool DEFAULT false NULL, is_return_to_creator bool DEFAULT false NULL, tat_started bool DEFAULT false NULL, from_user_name varchar(255) NULL, from_user_designation varchar(255) NULL, from_user_town_id int4 NULL, from_user_division_id int4 NULL, to_user_name varchar(255) NULL, to_user_designation varchar(255) NULL, to_user_town_id int4 NULL, to_user_division_id int4 NULL, CONSTRAINT efiling_file_movements_pkey PRIMARY KEY (id));
CREATE INDEX idx_efiling_file_movements_file ON public.efiling_file_movements USING btree (file_id);
CREATE INDEX idx_movements_created_at ON public.efiling_file_movements USING btree (created_at);
CREATE INDEX idx_movements_file ON public.efiling_file_movements USING btree (file_id);
CREATE INDEX idx_movements_from_user ON public.efiling_file_movements USING btree (from_user_id);
CREATE INDEX idx_movements_return_to_creator ON public.efiling_file_movements USING btree (is_return_to_creator) WHERE (is_return_to_creator = true);
CREATE INDEX idx_movements_tat_started ON public.efiling_file_movements USING btree (tat_started) WHERE (tat_started = true);
CREATE INDEX idx_movements_team_internal ON public.efiling_file_movements USING btree (is_team_internal) WHERE (is_team_internal = true);
CREATE INDEX idx_movements_to_user ON public.efiling_file_movements USING btree (to_user_id);
COMMENT ON TABLE public.efiling_file_movements IS 'Tracks all file movements/markings between users';

-- Column comments

COMMENT ON COLUMN public.efiling_file_movements.is_team_internal IS 'True if movement is within creator team workflow';
COMMENT ON COLUMN public.efiling_file_movements.is_return_to_creator IS 'True if file is being returned to creator';
COMMENT ON COLUMN public.efiling_file_movements.tat_started IS 'True if TAT timer started with this movement';
COMMENT ON COLUMN public.efiling_file_movements.from_user_name IS 'Historical name of the user who marked the file (at time of action)';
COMMENT ON COLUMN public.efiling_file_movements.from_user_designation IS 'Historical designation of the user who marked the file (at time of action)';
COMMENT ON COLUMN public.efiling_file_movements.from_user_town_id IS 'Historical town assignment of the user who marked the file (at time of action)';
COMMENT ON COLUMN public.efiling_file_movements.from_user_division_id IS 'Historical division assignment of the user who marked the file (at time of action)';
COMMENT ON COLUMN public.efiling_file_movements.to_user_name IS 'Historical name of the user the file was marked to (at time of action)';
COMMENT ON COLUMN public.efiling_file_movements.to_user_designation IS 'Historical designation of the user the file was marked to (at time of action)';
COMMENT ON COLUMN public.efiling_file_movements.to_user_town_id IS 'Historical town assignment of the user the file was marked to (at time of action)';
COMMENT ON COLUMN public.efiling_file_movements.to_user_division_id IS 'Historical division assignment of the user the file was marked to (at time of action)';

-- Table Triggers

create trigger trigger_update_workflow_state after
insert
    on
    public.efiling_file_movements for each row execute function update_workflow_state_on_movement();

-- Permissions

ALTER TABLE public.efiling_file_movements OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_file_movements TO root;


-- public.efiling_file_page_additions definition

-- Drop table

-- DROP TABLE public.efiling_file_page_additions;

CREATE TABLE public.efiling_file_page_additions ( id serial4 NOT NULL, file_id int4 NOT NULL, page_id int4 NOT NULL, added_by int4 NOT NULL, added_by_role_code varchar(50) NULL, addition_type varchar(50) DEFAULT 'CE_PAGE'::character varying NULL, added_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, notes text NULL, CONSTRAINT efiling_file_page_additions_pkey PRIMARY KEY (id));
CREATE INDEX idx_page_additions_file ON public.efiling_file_page_additions USING btree (file_id);
CREATE INDEX idx_page_additions_type ON public.efiling_file_page_additions USING btree (addition_type);
CREATE INDEX idx_page_additions_user ON public.efiling_file_page_additions USING btree (added_by);
COMMENT ON TABLE public.efiling_file_page_additions IS 'Tracks pages added by CE/Assistant for timeline';

-- Column comments

COMMENT ON COLUMN public.efiling_file_page_additions.addition_type IS 'SE_PAGE, CE_PAGE, SE_ASSISTANT_PAGE, or CE_ASSISTANT_PAGE';

-- Permissions

ALTER TABLE public.efiling_file_page_additions OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_file_page_additions TO root;


-- public.efiling_file_workflow_states definition

-- Drop table

-- DROP TABLE public.efiling_file_workflow_states;

CREATE TABLE public.efiling_file_workflow_states ( id serial4 NOT NULL, file_id int4 NOT NULL, current_state varchar(50) DEFAULT 'TEAM_INTERNAL'::character varying NOT NULL, current_assigned_to int4 NULL, creator_id int4 NOT NULL, is_within_team bool DEFAULT true NULL, tat_started bool DEFAULT false NULL, tat_started_at timestamp NULL, last_external_mark_at timestamp NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT check_state_values CHECK (((current_state)::text = ANY ((ARRAY['TEAM_INTERNAL'::character varying, 'EXTERNAL'::character varying, 'RETURNED_TO_CREATOR'::character varying])::text[]))), CONSTRAINT efiling_file_workflow_states_pkey PRIMARY KEY (id), CONSTRAINT unique_file_state UNIQUE (file_id));
CREATE INDEX idx_workflow_state_assigned ON public.efiling_file_workflow_states USING btree (current_assigned_to);
CREATE INDEX idx_workflow_state_creator ON public.efiling_file_workflow_states USING btree (creator_id);
CREATE INDEX idx_workflow_state_file ON public.efiling_file_workflow_states USING btree (file_id);
CREATE INDEX idx_workflow_state_team ON public.efiling_file_workflow_states USING btree (is_within_team) WHERE (is_within_team = true);
CREATE INDEX idx_workflow_state_type ON public.efiling_file_workflow_states USING btree (current_state);
COMMENT ON TABLE public.efiling_file_workflow_states IS 'Tracks file workflow state (internal team vs external)';

-- Column comments

COMMENT ON COLUMN public.efiling_file_workflow_states.current_state IS 'TEAM_INTERNAL, EXTERNAL, or RETURNED_TO_CREATOR';
COMMENT ON COLUMN public.efiling_file_workflow_states.is_within_team IS 'True if file is within creator team workflow';
COMMENT ON COLUMN public.efiling_file_workflow_states.tat_started IS 'True if TAT timer has started';

-- Table Triggers

create trigger trigger_update_workflow_state_updated_at before
update
    on
    public.efiling_file_workflow_states for each row execute function update_team_updated_at();

-- Permissions

ALTER TABLE public.efiling_file_workflow_states OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_file_workflow_states TO root;


-- public.efiling_files definition

-- Drop table

-- DROP TABLE public.efiling_files;

CREATE TABLE public.efiling_files ( id serial4 NOT NULL, file_number varchar(100) NOT NULL, subject varchar(500) NOT NULL, category_id int4 NULL, department_id int4 NULL, status_id int4 NULL, priority varchar(20) DEFAULT 'normal'::character varying NULL, confidentiality_level varchar(20) DEFAULT 'normal'::character varying NULL, work_request_id int4 NULL, created_by int4 NULL, assigned_to int4 NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, closed_at timestamp NULL, remarks text NULL, file_type_id int4 NULL, sla_deadline timestamp NULL, sla_breached bool DEFAULT false NULL, document_content jsonb DEFAULT '{}'::jsonb NULL, page_count int4 DEFAULT 1 NULL, district_id int4 NULL, town_id int4 NULL, division_id int4 NULL, workflow_state_id int4 NULL, sla_paused bool DEFAULT false NULL, sla_paused_at timestamp NULL, sla_accumulated_hours numeric(10, 2) DEFAULT 0 NULL, sla_pause_count int4 DEFAULT 0 NULL, CONSTRAINT efiling_files_file_number_key UNIQUE (file_number), CONSTRAINT efiling_files_pkey PRIMARY KEY (id));
CREATE INDEX idx_efiling_files_assigned_to ON public.efiling_files USING btree (assigned_to);
CREATE INDEX idx_efiling_files_created_by ON public.efiling_files USING btree (created_by);
CREATE INDEX idx_efiling_files_department ON public.efiling_files USING btree (department_id);
CREATE INDEX idx_efiling_files_district ON public.efiling_files USING btree (district_id);
CREATE INDEX idx_efiling_files_division ON public.efiling_files USING btree (division_id);
CREATE INDEX idx_efiling_files_file_type ON public.efiling_files USING btree (file_type_id);
CREATE INDEX idx_efiling_files_location ON public.efiling_files USING btree (district_id, town_id, division_id);
CREATE INDEX idx_efiling_files_sla_deadline ON public.efiling_files USING btree (sla_deadline);
CREATE INDEX idx_efiling_files_status ON public.efiling_files USING btree (status_id);
CREATE INDEX idx_efiling_files_town ON public.efiling_files USING btree (town_id);
CREATE INDEX idx_efiling_files_work_request ON public.efiling_files USING btree (work_request_id);
CREATE INDEX idx_efiling_files_workflow_state ON public.efiling_files USING btree (workflow_state_id);

-- Column comments

COMMENT ON COLUMN public.efiling_files.sla_deadline IS 'Turn Around Time (TAT) deadline for the file. Set when file is marked to higher level (SE/CE/CEO/COO). Calculated from SLA matrix based on from_role and to_role.';
COMMENT ON COLUMN public.efiling_files.district_id IS 'District where file is located/created';
COMMENT ON COLUMN public.efiling_files.town_id IS 'Town where file is located/created';
COMMENT ON COLUMN public.efiling_files.division_id IS 'Division where file is located/created (for division-based files)';
COMMENT ON COLUMN public.efiling_files.sla_paused IS 'TRUE when SLA timer is paused (e.g., file with CEO)';
COMMENT ON COLUMN public.efiling_files.sla_paused_at IS 'Timestamp when SLA was paused';
COMMENT ON COLUMN public.efiling_files.sla_accumulated_hours IS 'Total hours accumulated before pause (excludes pause duration)';
COMMENT ON COLUMN public.efiling_files.sla_pause_count IS 'Number of times SLA has been paused for this file';

-- Permissions

ALTER TABLE public.efiling_files OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_files TO root;


-- public.efiling_files_costing definition

-- Drop table

-- DROP TABLE public.efiling_files_costing;

CREATE TABLE public.efiling_files_costing ( id serial4 NOT NULL, file_id int4 NOT NULL, budget_head_no varchar(100) NULL, proposed_estimated_cost numeric(15, 2) DEFAULT 0.00 NULL, contractor_premium numeric(15, 2) DEFAULT 0.00 NULL, sanctioned_amount numeric(15, 2) DEFAULT 0.00 NULL, revised_estimate_amount numeric(15, 2) DEFAULT 0.00 NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_files_costing_pkey PRIMARY KEY (id));
CREATE INDEX idx_efiling_files_costing_file_id ON public.efiling_files_costing USING btree (file_id);

-- Table Triggers

create trigger trg_update_efiling_files_costing_updated_at before
update
    on
    public.efiling_files_costing for each row execute function update_costing_timestamp();

-- Permissions

ALTER TABLE public.efiling_files_costing OWNER TO root;
GRANT ALL ON TABLE public.efiling_files_costing TO root;


-- public.efiling_notifications definition

-- Drop table

-- DROP TABLE public.efiling_notifications;

CREATE TABLE public.efiling_notifications ( id serial4 NOT NULL, user_id int4 NOT NULL, "type" varchar(100) NOT NULL, file_id int4 NULL, message text NOT NULL, priority varchar(20) DEFAULT 'normal'::character varying NULL, action_required bool DEFAULT false NULL, expires_at timestamp NULL, metadata jsonb DEFAULT '{}'::jsonb NULL, is_read bool DEFAULT false NULL, read_at timestamp NULL, is_dismissed bool DEFAULT false NULL, dismissed_at timestamp NULL, is_deleted bool DEFAULT false NULL, deleted_at timestamp NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_notifications_pkey PRIMARY KEY (id));
CREATE INDEX idx_efiling_notifications_created ON public.efiling_notifications USING btree (created_at);
CREATE INDEX idx_efiling_notifications_expires ON public.efiling_notifications USING btree (expires_at) WHERE (expires_at IS NOT NULL);
CREATE INDEX idx_efiling_notifications_file ON public.efiling_notifications USING btree (file_id);
CREATE INDEX idx_efiling_notifications_priority ON public.efiling_notifications USING btree (priority);
CREATE INDEX idx_efiling_notifications_type ON public.efiling_notifications USING btree (type);
CREATE INDEX idx_efiling_notifications_unread ON public.efiling_notifications USING btree (user_id, is_read) WHERE (is_read = false);
CREATE INDEX idx_efiling_notifications_user ON public.efiling_notifications USING btree (user_id);
COMMENT ON TABLE public.efiling_notifications IS 'Stores all notifications for e-filing users including workflow actions, file assignments, and SLA alerts';

-- Column comments

COMMENT ON COLUMN public.efiling_notifications."type" IS 'Type of notification: file_assigned, workflow_action, sla_alert, file_returned, comment_added, etc.';
COMMENT ON COLUMN public.efiling_notifications.priority IS 'Priority level: low, normal, high, urgent';
COMMENT ON COLUMN public.efiling_notifications.action_required IS 'Whether user action is required for this notification';
COMMENT ON COLUMN public.efiling_notifications.expires_at IS 'When the notification expires (for time-sensitive notifications)';
COMMENT ON COLUMN public.efiling_notifications.metadata IS 'Additional JSON data like workflow stage, SLA details, etc.';

-- Table Triggers

create trigger update_efiling_notifications_updated_at before
update
    on
    public.efiling_notifications for each row execute function update_efiling_notifications_updated_at();

-- Permissions

ALTER TABLE public.efiling_notifications OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_notifications TO root;


-- public.efiling_signatures definition

-- Drop table

-- DROP TABLE public.efiling_signatures;

CREATE TABLE public.efiling_signatures ( id serial4 NOT NULL, file_id int4 NOT NULL, user_id int4 NULL, signature_text text NOT NULL, signature_method varchar(50) NOT NULL, signed_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, status varchar(50) DEFAULT 'SIGNED'::character varying NULL, ip_address inet NULL, user_agent text NULL, CONSTRAINT efiling_signatures_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.efiling_signatures OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_signatures TO root;


-- public.efiling_sla_pause_history definition

-- Drop table

-- DROP TABLE public.efiling_sla_pause_history;

CREATE TABLE public.efiling_sla_pause_history ( id serial4 NOT NULL, file_id int4 NOT NULL, paused_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, resumed_at timestamp NULL, pause_reason varchar(100) DEFAULT 'CEO_REVIEW'::character varying NULL, paused_by_user_id int4 NULL, paused_by_role_id int4 NULL, duration_hours numeric(10, 2) NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_sla_pause_history_pkey PRIMARY KEY (id));
CREATE INDEX idx_sla_pause_history_file ON public.efiling_sla_pause_history USING btree (file_id);
COMMENT ON TABLE public.efiling_sla_pause_history IS 'Tracks all SLA pause/resume events for audit trail';

-- Column comments

COMMENT ON COLUMN public.efiling_sla_pause_history.pause_reason IS 'Reason for pause: CEO_REVIEW, EXTERNAL_DEPENDENCY, etc.';
COMMENT ON COLUMN public.efiling_sla_pause_history.duration_hours IS 'Duration of pause in hours (calculated when resumed)';

-- Table Triggers

create trigger trigger_update_sla_pause_history_updated_at before
update
    on
    public.efiling_sla_pause_history for each row execute function update_sla_pause_history_updated_at();

-- Permissions

ALTER TABLE public.efiling_sla_pause_history OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.efiling_sla_pause_history TO root;


-- public.efiling_tat_logs definition

-- Drop table

-- DROP TABLE public.efiling_tat_logs;

CREATE TABLE public.efiling_tat_logs ( id serial4 NOT NULL, file_id int4 NOT NULL, user_id int4 NOT NULL, event_type varchar(50) NOT NULL, sla_deadline timestamp NULL, time_remaining_hours numeric(10, 2) NULL, message text NULL, notification_sent bool DEFAULT false NULL, notification_method varchar(20) NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT efiling_tat_logs_pkey PRIMARY KEY (id));
CREATE INDEX idx_tat_logs_created_at ON public.efiling_tat_logs USING btree (created_at);
CREATE INDEX idx_tat_logs_deadline ON public.efiling_tat_logs USING btree (sla_deadline);
CREATE INDEX idx_tat_logs_event_type ON public.efiling_tat_logs USING btree (event_type);
CREATE INDEX idx_tat_logs_file_id ON public.efiling_tat_logs USING btree (file_id);
CREATE INDEX idx_tat_logs_user_id ON public.efiling_tat_logs USING btree (user_id);

-- Permissions

ALTER TABLE public.efiling_tat_logs OWNER TO root;
GRANT ALL ON TABLE public.efiling_tat_logs TO root;


-- public.efiling_comments foreign keys

ALTER TABLE public.efiling_comments ADD CONSTRAINT efiling_comments_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.efiling_files(id) ON DELETE CASCADE;
ALTER TABLE public.efiling_comments ADD CONSTRAINT efiling_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.efiling_users(id);


-- public.efiling_document_comments foreign keys

ALTER TABLE public.efiling_document_comments ADD CONSTRAINT efiling_document_comments_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.efiling_files(id);
ALTER TABLE public.efiling_document_comments ADD CONSTRAINT efiling_document_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- public.efiling_document_pages foreign keys

ALTER TABLE public.efiling_document_pages ADD CONSTRAINT efiling_document_pages_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.efiling_users(id);
ALTER TABLE public.efiling_document_pages ADD CONSTRAINT efiling_document_pages_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.efiling_files(id) ON DELETE CASCADE;


-- public.efiling_document_signatures foreign keys

ALTER TABLE public.efiling_document_signatures ADD CONSTRAINT efiling_document_signatures_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.efiling_files(id);
ALTER TABLE public.efiling_document_signatures ADD CONSTRAINT efiling_document_signatures_user_division_id_fkey FOREIGN KEY (user_division_id) REFERENCES public.divisions(id);
ALTER TABLE public.efiling_document_signatures ADD CONSTRAINT efiling_document_signatures_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.efiling_document_signatures ADD CONSTRAINT efiling_document_signatures_user_town_id_fkey FOREIGN KEY (user_town_id) REFERENCES public.town(id);


-- public.efiling_documents foreign keys

ALTER TABLE public.efiling_documents ADD CONSTRAINT efiling_documents_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.efiling_files(id) ON DELETE CASCADE;
ALTER TABLE public.efiling_documents ADD CONSTRAINT efiling_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.efiling_users(id);


-- public.efiling_file_movements foreign keys

ALTER TABLE public.efiling_file_movements ADD CONSTRAINT efiling_file_movements_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.efiling_files(id) ON DELETE CASCADE;
ALTER TABLE public.efiling_file_movements ADD CONSTRAINT efiling_file_movements_from_department_id_fkey FOREIGN KEY (from_department_id) REFERENCES public.efiling_departments(id);
ALTER TABLE public.efiling_file_movements ADD CONSTRAINT efiling_file_movements_from_user_division_id_fkey FOREIGN KEY (from_user_division_id) REFERENCES public.divisions(id);
ALTER TABLE public.efiling_file_movements ADD CONSTRAINT efiling_file_movements_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.efiling_users(id);
ALTER TABLE public.efiling_file_movements ADD CONSTRAINT efiling_file_movements_from_user_town_id_fkey FOREIGN KEY (from_user_town_id) REFERENCES public.town(id);
ALTER TABLE public.efiling_file_movements ADD CONSTRAINT efiling_file_movements_to_department_id_fkey FOREIGN KEY (to_department_id) REFERENCES public.efiling_departments(id);
ALTER TABLE public.efiling_file_movements ADD CONSTRAINT efiling_file_movements_to_user_division_id_fkey FOREIGN KEY (to_user_division_id) REFERENCES public.divisions(id);
ALTER TABLE public.efiling_file_movements ADD CONSTRAINT efiling_file_movements_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES public.efiling_users(id);
ALTER TABLE public.efiling_file_movements ADD CONSTRAINT efiling_file_movements_to_user_town_id_fkey FOREIGN KEY (to_user_town_id) REFERENCES public.town(id);


-- public.efiling_file_page_additions foreign keys

ALTER TABLE public.efiling_file_page_additions ADD CONSTRAINT efiling_file_page_additions_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.efiling_users(id);
ALTER TABLE public.efiling_file_page_additions ADD CONSTRAINT efiling_file_page_additions_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.efiling_files(id) ON DELETE CASCADE;
ALTER TABLE public.efiling_file_page_additions ADD CONSTRAINT efiling_file_page_additions_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.efiling_document_pages(id) ON DELETE CASCADE;


-- public.efiling_file_workflow_states foreign keys

ALTER TABLE public.efiling_file_workflow_states ADD CONSTRAINT efiling_file_workflow_states_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.efiling_users(id);
ALTER TABLE public.efiling_file_workflow_states ADD CONSTRAINT efiling_file_workflow_states_current_assigned_to_fkey FOREIGN KEY (current_assigned_to) REFERENCES public.efiling_users(id);
ALTER TABLE public.efiling_file_workflow_states ADD CONSTRAINT efiling_file_workflow_states_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.efiling_files(id) ON DELETE CASCADE;


-- public.efiling_files foreign keys

ALTER TABLE public.efiling_files ADD CONSTRAINT efiling_files_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.efiling_users(id);
ALTER TABLE public.efiling_files ADD CONSTRAINT efiling_files_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.efiling_file_categories(id);
ALTER TABLE public.efiling_files ADD CONSTRAINT efiling_files_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.efiling_users(id);
ALTER TABLE public.efiling_files ADD CONSTRAINT efiling_files_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.efiling_departments(id);
ALTER TABLE public.efiling_files ADD CONSTRAINT efiling_files_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.district(id);
ALTER TABLE public.efiling_files ADD CONSTRAINT efiling_files_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id);
ALTER TABLE public.efiling_files ADD CONSTRAINT efiling_files_file_type_id_fkey FOREIGN KEY (file_type_id) REFERENCES public.efiling_file_types(id);
ALTER TABLE public.efiling_files ADD CONSTRAINT efiling_files_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.efiling_file_status(id);
ALTER TABLE public.efiling_files ADD CONSTRAINT efiling_files_town_id_fkey FOREIGN KEY (town_id) REFERENCES public.town(id);
ALTER TABLE public.efiling_files ADD CONSTRAINT efiling_files_work_request_id_fkey FOREIGN KEY (work_request_id) REFERENCES public.work_requests(id);
ALTER TABLE public.efiling_files ADD CONSTRAINT efiling_files_workflow_state_id_fkey FOREIGN KEY (workflow_state_id) REFERENCES public.efiling_file_workflow_states(id);


-- public.efiling_files_costing foreign keys

ALTER TABLE public.efiling_files_costing ADD CONSTRAINT efiling_files_costing_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.efiling_files(id) ON DELETE CASCADE;


-- public.efiling_notifications foreign keys

ALTER TABLE public.efiling_notifications ADD CONSTRAINT efiling_notifications_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.efiling_files(id) ON DELETE CASCADE;
ALTER TABLE public.efiling_notifications ADD CONSTRAINT efiling_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.efiling_users(id) ON DELETE CASCADE;


-- public.efiling_signatures foreign keys

ALTER TABLE public.efiling_signatures ADD CONSTRAINT efiling_signatures_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.efiling_files(id) ON DELETE CASCADE;


-- public.efiling_sla_pause_history foreign keys

ALTER TABLE public.efiling_sla_pause_history ADD CONSTRAINT efiling_sla_pause_history_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.efiling_files(id) ON DELETE CASCADE;
ALTER TABLE public.efiling_sla_pause_history ADD CONSTRAINT efiling_sla_pause_history_paused_by_role_id_fkey FOREIGN KEY (paused_by_role_id) REFERENCES public.efiling_roles(id);
ALTER TABLE public.efiling_sla_pause_history ADD CONSTRAINT efiling_sla_pause_history_paused_by_user_id_fkey FOREIGN KEY (paused_by_user_id) REFERENCES public.efiling_users(id);


-- public.efiling_tat_logs foreign keys

ALTER TABLE public.efiling_tat_logs ADD CONSTRAINT efiling_tat_logs_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.efiling_files(id) ON DELETE CASCADE;
ALTER TABLE public.efiling_tat_logs ADD CONSTRAINT efiling_tat_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.efiling_users(id) ON DELETE CASCADE;


-- public.dashboard_requests_view source

CREATE MATERIALIZED VIEW public.dashboard_requests_view
TABLESPACE pg_default
AS SELECT wr.id,
    wr.request_date,
    wr.contact_number,
    wr.address,
    wr.description,
    wr.budget_code,
    wr.file_type,
    wr.nature_of_work,
    wr.created_date,
    wr.updated_date,
    st_y(wr.geo_tag) AS latitude,
    st_x(wr.geo_tag) AS longitude,
    t.town AS town_name,
    t.id AS town_id,
    d.title AS district_name,
    d.id AS district_id,
    st.subtown AS subtown_name,
    st.id AS subtown_id,
    ct.type_name AS complaint_type,
    ct.id AS complaint_type_id,
    cst.subtype_name AS complaint_subtype,
    cst.id AS complaint_subtype_id,
    s.name AS status_name,
    s.id AS status_id,
    wr.creator_id,
    wr.creator_type,
    COALESCE(u.name, ag.name, sm.name) AS creator_name,
    wr.executive_engineer_id,
    exen.name AS executive_engineer_name,
    wr.contractor_id,
    contractor.name AS contractor_name,
    ( SELECT json_agg(json_build_object('id', wrl.id, 'latitude', wrl.latitude, 'longitude', wrl.longitude, 'description', wrl.description)) AS json_agg
           FROM work_request_locations wrl
          WHERE wrl.work_request_id = wr.id) AS additional_locations,
    ( SELECT count(*) AS count
           FROM images img
          WHERE img.work_request_id = wr.id) AS image_count,
    ( SELECT count(*) AS count
           FROM videos vid
          WHERE vid.work_request_id = wr.id) AS video_count,
    ( SELECT count(*) AS count
           FROM final_videos fv
          WHERE fv.work_request_id = wr.id) AS final_video_count,
    ( SELECT count(*) AS count
           FROM request_assign_smagent ras
          WHERE ras.work_requests_id = wr.id) AS assigned_sm_agents_count
   FROM work_requests wr
     LEFT JOIN town t ON wr.town_id = t.id
     LEFT JOIN district d ON t.district_id = d.id
     LEFT JOIN subtown st ON wr.subtown_id = st.id
     LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
     LEFT JOIN complaint_subtypes cst ON wr.complaint_subtype_id = cst.id
     LEFT JOIN status s ON wr.status_id = s.id
     LEFT JOIN users u ON wr.creator_type::text = 'user'::text AND wr.creator_id = u.id
     LEFT JOIN agents ag ON wr.creator_type::text = 'agent'::text AND wr.creator_id = ag.id
     LEFT JOIN socialmediaperson sm ON wr.creator_type::text = 'socialmedia'::text AND wr.creator_id = sm.id
     LEFT JOIN agents exen ON wr.executive_engineer_id = exen.id
     LEFT JOIN agents contractor ON wr.contractor_id = contractor.id
WITH DATA;

-- View indexes:
CREATE INDEX idx_dashboard_requests_view_complaint_subtype ON public.dashboard_requests_view USING btree (complaint_subtype_id);
CREATE INDEX idx_dashboard_requests_view_complaint_type ON public.dashboard_requests_view USING btree (complaint_type_id);
CREATE INDEX idx_dashboard_requests_view_creator ON public.dashboard_requests_view USING btree (creator_type, creator_id);
CREATE INDEX idx_dashboard_requests_view_date ON public.dashboard_requests_view USING btree (request_date);
CREATE INDEX idx_dashboard_requests_view_district ON public.dashboard_requests_view USING btree (district_id);
CREATE INDEX idx_dashboard_requests_view_location ON public.dashboard_requests_view USING btree (latitude, longitude) WHERE ((latitude IS NOT NULL) AND (longitude IS NOT NULL));
CREATE INDEX idx_dashboard_requests_view_status ON public.dashboard_requests_view USING btree (status_id);
CREATE INDEX idx_dashboard_requests_view_subtown ON public.dashboard_requests_view USING btree (subtown_id);
CREATE INDEX idx_dashboard_requests_view_town ON public.dashboard_requests_view USING btree (town_id);


-- Permissions

ALTER TABLE public.dashboard_requests_view OWNER TO root;
GRANT UPDATE, DELETE, TRIGGER, REFERENCES, INSERT, SELECT, TRUNCATE ON TABLE public.dashboard_requests_view TO root;


-- public.efiling_users_capabilities source

CREATE OR REPLACE VIEW public.efiling_users_capabilities
AS SELECT eu.id,
    eu.employee_id,
    eu.designation,
    eu.department_id,
    ed.name AS department_name,
    eu.efiling_role_id,
    er.name AS role_name,
    er.code AS role_code,
    eu.supervisor_id,
    su.employee_id AS supervisor_employee_id,
    su.designation AS supervisor_designation,
    eu.preferred_signature_method,
    eu.approval_level,
    eu.approval_amount_limit,
    eu.can_sign,
    eu.can_create_files,
    eu.can_approve_files,
    eu.can_reject_files,
    eu.can_transfer_files,
    eu.is_available,
    eu.max_concurrent_files,
    eu.current_file_count,
    eu.signature_template,
    eu.is_active,
    eu.created_at,
    eu.updated_at
   FROM efiling_users eu
     LEFT JOIN efiling_departments ed ON eu.department_id = ed.id
     LEFT JOIN efiling_roles er ON eu.efiling_role_id = er.id
     LEFT JOIN efiling_users su ON eu.supervisor_id = su.id
  WHERE eu.is_active = true;

-- Permissions

ALTER TABLE public.efiling_users_capabilities OWNER TO root;
GRANT ALL ON TABLE public.efiling_users_capabilities TO root;


-- public.geography_columns source

CREATE OR REPLACE VIEW public.geography_columns
AS SELECT current_database() AS f_table_catalog,
    n.nspname AS f_table_schema,
    c.relname AS f_table_name,
    a.attname AS f_geography_column,
    postgis_typmod_dims(a.atttypmod) AS coord_dimension,
    postgis_typmod_srid(a.atttypmod) AS srid,
    postgis_typmod_type(a.atttypmod) AS type
   FROM pg_class c,
    pg_attribute a,
    pg_type t,
    pg_namespace n
  WHERE t.typname = 'geography'::name AND a.attisdropped = false AND a.atttypid = t.oid AND a.attrelid = c.oid AND c.relnamespace = n.oid AND (c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND NOT pg_is_other_temp_schema(c.relnamespace) AND has_table_privilege(c.oid, 'SELECT'::text);

-- Permissions

ALTER TABLE public.geography_columns OWNER TO postgres;
GRANT ALL ON TABLE public.geography_columns TO postgres;
GRANT SELECT ON TABLE public.geography_columns TO public;
GRANT ALL ON TABLE public.geography_columns TO root;


-- public.geometry_columns source

CREATE OR REPLACE VIEW public.geometry_columns
AS SELECT current_database()::character varying(256) AS f_table_catalog,
    n.nspname AS f_table_schema,
    c.relname AS f_table_name,
    a.attname AS f_geometry_column,
    COALESCE(postgis_typmod_dims(a.atttypmod), 2) AS coord_dimension,
    COALESCE(NULLIF(postgis_typmod_srid(a.atttypmod), 0), 0) AS srid,
    replace(replace(COALESCE(NULLIF(upper(postgis_typmod_type(a.atttypmod)), 'GEOMETRY'::text), 'GEOMETRY'::text), 'ZM'::text, ''::text), 'Z'::text, ''::text)::character varying(30) AS type
   FROM pg_class c
     JOIN pg_attribute a ON a.attrelid = c.oid AND NOT a.attisdropped
     JOIN pg_namespace n ON c.relnamespace = n.oid
     JOIN pg_type t ON a.atttypid = t.oid
  WHERE (c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND NOT c.relname = 'raster_columns'::name AND t.typname = 'geometry'::name AND NOT pg_is_other_temp_schema(c.relnamespace) AND has_table_privilege(c.oid, 'SELECT'::text);

-- Permissions

ALTER TABLE public.geometry_columns OWNER TO postgres;
GRANT ALL ON TABLE public.geometry_columns TO postgres;
GRANT SELECT ON TABLE public.geometry_columns TO public;
GRANT ALL ON TABLE public.geometry_columns TO root;


-- public.performa_details_view source

CREATE OR REPLACE VIEW public.performa_details_view
AS SELECT w.id,
    w.subject,
    t.town,
    d.title AS district_title,
    w.site_location,
    to_char(w.survey_date::timestamp with time zone, 'YYYY-MM-DD'::text) AS survey_date,
    to_char(w.completion_date::timestamp with time zone, 'YYYY-MM-DD'::text) AS completion_date,
    w.geo_tag,
    a.name AS assistant_name,
    a.department,
    a.contact_number,
    s.name AS socialmedia_name,
    w.shoot_date,
    w.link,
    w.expenditure_charge,
    ct.type_name,
    cs.subtype_name,
    w.status
   FROM work w
     LEFT JOIN district d ON w.district_id = d.id
     LEFT JOIN town t ON w.town_id = t.id
     LEFT JOIN complaint_types ct ON ct.id = w.complaint_type_id
     LEFT JOIN complaint_subtypes cs ON cs.id = w.complaint_subtype_id
     LEFT JOIN agents a ON a.id = w.assistant_id
     LEFT JOIN socialmediaperson s ON s.id = s.id;

-- Permissions

ALTER TABLE public.performa_details_view OWNER TO root;
GRANT ALL ON TABLE public.performa_details_view TO root;


-- public.v_efiling_team_hierarchy source

CREATE OR REPLACE VIEW public.v_efiling_team_hierarchy
AS SELECT t.id,
    t.manager_id,
    m.id AS manager_efiling_id,
    u_m.name AS manager_name,
    u_m.email AS manager_email,
    m.efiling_role_id AS manager_role_id,
    mr.code AS manager_role_code,
    mr.name AS manager_role_name,
    t.team_member_id,
    tm.id AS team_member_efiling_id,
    u_tm.name AS team_member_name,
    u_tm.email AS team_member_email,
    tm.efiling_role_id AS team_member_role_id,
    tmr.code AS team_member_role_code,
    tmr.name AS team_member_role_name,
    t.team_role,
    t.is_active,
    t.created_at,
    t.updated_at
   FROM efiling_user_teams t
     JOIN efiling_users m ON t.manager_id = m.id
     JOIN efiling_users tm ON t.team_member_id = tm.id
     JOIN users u_m ON m.user_id = u_m.id
     JOIN users u_tm ON tm.user_id = u_tm.id
     LEFT JOIN efiling_roles mr ON m.efiling_role_id = mr.id
     LEFT JOIN efiling_roles tmr ON tm.efiling_role_id = tmr.id
  WHERE t.is_active = true;

COMMENT ON VIEW public.v_efiling_team_hierarchy IS 'View showing team hierarchy with manager and team member details';

-- Permissions

ALTER TABLE public.v_efiling_team_hierarchy OWNER TO root;
GRANT ALL ON TABLE public.v_efiling_team_hierarchy TO root;


-- public.v_efiling_templates_filtered source

CREATE OR REPLACE VIEW public.v_efiling_templates_filtered
AS SELECT t.id,
    t.name,
    t.template_type,
    t.title,
    t.subject,
    t.main_content,
    t.category_id,
    t.department_id,
    d.name AS department_name,
    t.role_id,
    r.name AS role_name,
    r.code AS role_code,
    t.created_by,
    u.name AS created_by_name,
    t.is_system_template,
    t.is_active,
    t.usage_count,
    t.last_used_at,
    t.created_at,
    t.updated_at
   FROM efiling_templates t
     LEFT JOIN efiling_departments d ON t.department_id = d.id
     LEFT JOIN efiling_roles r ON t.role_id = r.id
     LEFT JOIN efiling_users eu ON t.created_by = eu.id
     LEFT JOIN users u ON eu.user_id = u.id
  WHERE t.is_active = true;

COMMENT ON VIEW public.v_efiling_templates_filtered IS 'Filtered view of active templates with department and role information';

-- Permissions

ALTER TABLE public.v_efiling_templates_filtered OWNER TO root;
GRANT ALL ON TABLE public.v_efiling_templates_filtered TO root;


-- public.v_efiling_templates_with_assignments source

CREATE OR REPLACE VIEW public.v_efiling_templates_with_assignments
AS SELECT t.id,
    t.name,
    t.template_type,
    t.title,
    t.subject,
    t.main_content,
    t.category_id,
    t.created_by,
    t.is_system_template,
    t.is_active,
    t.usage_count,
    t.last_used_at,
    t.created_at,
    t.updated_at,
    t.department_id AS single_department_id,
    t.role_id AS single_role_id,
    COALESCE(json_agg(DISTINCT jsonb_build_object('id', td.department_id, 'name', d.name)) FILTER (WHERE td.department_id IS NOT NULL), '[]'::json) AS departments,
    COALESCE(json_agg(DISTINCT jsonb_build_object('id', tr.role_id, 'name', r.name, 'code', r.code)) FILTER (WHERE tr.role_id IS NOT NULL), '[]'::json) AS roles
   FROM efiling_templates t
     LEFT JOIN efiling_template_departments td ON t.id = td.template_id
     LEFT JOIN efiling_departments d ON td.department_id = d.id
     LEFT JOIN efiling_template_roles tr ON t.id = tr.template_id
     LEFT JOIN efiling_roles r ON tr.role_id = r.id
  WHERE t.is_active = true
  GROUP BY t.id;

COMMENT ON VIEW public.v_efiling_templates_with_assignments IS 'View showing templates with their multiple department and role assignments';

-- Permissions

ALTER TABLE public.v_efiling_templates_with_assignments OWNER TO root;
GRANT ALL ON TABLE public.v_efiling_templates_with_assignments TO root;


-- public.v_efiling_users_by_location source

CREATE OR REPLACE VIEW public.v_efiling_users_by_location
AS SELECT u.id AS efiling_user_id,
    u.user_id,
    u.efiling_role_id,
    r.code AS role_code,
    r.name AS role_name,
    u.district_id,
    d.title AS district_name,
    u.town_id,
    t.town AS town_name,
    u.subtown_id,
    st.subtown AS subtown_name,
    u.division_id,
    div.name AS division_name,
    div.ce_type AS division_type,
    dept.department_type,
    u.department_id,
    dept.name AS department_name,
    u.is_active
   FROM efiling_users u
     LEFT JOIN efiling_roles r ON u.efiling_role_id = r.id
     LEFT JOIN district d ON u.district_id = d.id
     LEFT JOIN town t ON u.town_id = t.id
     LEFT JOIN subtown st ON u.subtown_id = st.id
     LEFT JOIN divisions div ON u.division_id = div.id
     LEFT JOIN efiling_departments dept ON u.department_id = dept.id
  WHERE u.is_active = true;

COMMENT ON VIEW public.v_efiling_users_by_location IS 'View showing all active e-filing users with their geographic assignments for routing purposes';

-- Permissions

ALTER TABLE public.v_efiling_users_by_location OWNER TO root;
GRANT ALL ON TABLE public.v_efiling_users_by_location TO root;


-- public.work_details_view source

CREATE OR REPLACE VIEW public.work_details_view
AS SELECT w.id,
    w.subject,
    d.title AS district_title,
    t.town,
    w.site_location,
    w.size_of_pipe,
    w.length_of_pipe,
    w.allied_items,
    w.associated_work,
    w.survey_date,
    w.completion_date,
    w.geo_tag,
    w.before_image,
    w.after_image,
    a.name AS assistant_name,
    w.shoot_date,
    w.link,
    w.expenditure_charge,
    ct.type_name AS complaint_type,
    cs.subtype_name AS complaint_subtype,
    w.status
   FROM work w
     LEFT JOIN district d ON w.district_id = d.id
     LEFT JOIN town t ON w.town_id = t.id
     LEFT JOIN complaint_types ct ON ct.id = w.complaint_type_id
     LEFT JOIN complaint_subtypes cs ON cs.id = w.complaint_subtype_id
     LEFT JOIN agents a ON a.id = w.assistant_id;

-- Permissions

ALTER TABLE public.work_details_view OWNER TO root;
GRANT ALL ON TABLE public.work_details_view TO root;



-- DROP FUNCTION public._postgis_deprecate(text, text, text);

CREATE OR REPLACE FUNCTION public._postgis_deprecate(oldname text, newname text, version text)
 RETURNS void
 LANGUAGE plpgsql
 IMMUTABLE STRICT COST 250
AS $function$
DECLARE
  curver_text text;
BEGIN
  --
  -- Raises a NOTICE if it was deprecated in this version,
  -- a WARNING if in a previous version (only up to minor version checked)
  --
	curver_text := '3.6.0';
	IF pg_catalog.split_part(curver_text,'.',1)::int > pg_catalog.split_part(version,'.',1)::int OR
	   ( pg_catalog.split_part(curver_text,'.',1) = pg_catalog.split_part(version,'.',1) AND
		 pg_catalog.split_part(curver_text,'.',2) != split_part(version,'.',2) )
	THEN
	  RAISE WARNING '% signature was deprecated in %. Please use %', oldname, version, newname;
	ELSE
	  RAISE DEBUG '% signature was deprecated in %. Please use %', oldname, version, newname;
	END IF;
END;
$function$
;

-- Permissions

ALTER FUNCTION public._postgis_deprecate(text, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public._postgis_deprecate(text, text, text) TO postgres;

-- DROP FUNCTION public._postgis_index_extent(regclass, text);

CREATE OR REPLACE FUNCTION public._postgis_index_extent(tbl regclass, col text)
 RETURNS box2d
 LANGUAGE c
 STABLE STRICT
AS '$libdir/postgis-3', $function$_postgis_gserialized_index_extent$function$
;

-- Permissions

ALTER FUNCTION public._postgis_index_extent(regclass, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public._postgis_index_extent(regclass, text) TO postgres;

-- DROP FUNCTION public._postgis_join_selectivity(regclass, text, regclass, text, text);

CREATE OR REPLACE FUNCTION public._postgis_join_selectivity(regclass, text, regclass, text, text DEFAULT '2'::text)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$_postgis_gserialized_joinsel$function$
;

-- Permissions

ALTER FUNCTION public._postgis_join_selectivity(regclass, text, regclass, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public._postgis_join_selectivity(regclass, text, regclass, text, text) TO postgres;

-- DROP FUNCTION public._postgis_pgsql_version();

CREATE OR REPLACE FUNCTION public._postgis_pgsql_version()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
	SELECT CASE WHEN pg_catalog.split_part(s,'.',1)::integer > 9 THEN pg_catalog.split_part(s,'.',1) || '0'
	ELSE pg_catalog.split_part(s,'.', 1) || pg_catalog.split_part(s,'.', 2) END AS v
	FROM pg_catalog.substring(version(), E'PostgreSQL ([0-9\\.]+)') AS s;
$function$
;

-- Permissions

ALTER FUNCTION public._postgis_pgsql_version() OWNER TO postgres;
GRANT ALL ON FUNCTION public._postgis_pgsql_version() TO postgres;

-- DROP FUNCTION public._postgis_scripts_pgsql_version();

CREATE OR REPLACE FUNCTION public._postgis_scripts_pgsql_version()
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$SELECT '160'::text AS version$function$
;

-- Permissions

ALTER FUNCTION public._postgis_scripts_pgsql_version() OWNER TO postgres;
GRANT ALL ON FUNCTION public._postgis_scripts_pgsql_version() TO postgres;

-- DROP FUNCTION public._postgis_selectivity(regclass, text, geometry, text);

CREATE OR REPLACE FUNCTION public._postgis_selectivity(tbl regclass, att_name text, geom geometry, mode text DEFAULT '2'::text)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$_postgis_gserialized_sel$function$
;

-- Permissions

ALTER FUNCTION public._postgis_selectivity(regclass, text, geometry, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public._postgis_selectivity(regclass, text, geometry, text) TO postgres;

-- DROP FUNCTION public._postgis_stats(regclass, text, text);

CREATE OR REPLACE FUNCTION public._postgis_stats(tbl regclass, att_name text, text DEFAULT '2'::text)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$_postgis_gserialized_stats$function$
;

-- Permissions

ALTER FUNCTION public._postgis_stats(regclass, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public._postgis_stats(regclass, text, text) TO postgres;

-- DROP FUNCTION public._st_3ddfullywithin(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public._st_3ddfullywithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$LWGEOM_dfullywithin3d$function$
;

-- Permissions

ALTER FUNCTION public._st_3ddfullywithin(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_3ddfullywithin(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public._st_3ddwithin(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public._st_3ddwithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$LWGEOM_dwithin3d$function$
;

-- Permissions

ALTER FUNCTION public._st_3ddwithin(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_3ddwithin(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public._st_3dintersects(geometry, geometry);

CREATE OR REPLACE FUNCTION public._st_3dintersects(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_3DIntersects$function$
;

-- Permissions

ALTER FUNCTION public._st_3dintersects(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_3dintersects(geometry, geometry) TO postgres;

-- DROP FUNCTION public._st_asgml(int4, geometry, int4, int4, text, text);

CREATE OR REPLACE FUNCTION public._st_asgml(integer, geometry, integer, integer, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asGML$function$
;

-- Permissions

ALTER FUNCTION public._st_asgml(int4, geometry, int4, int4, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_asgml(int4, geometry, int4, int4, text, text) TO postgres;

-- DROP FUNCTION public._st_asx3d(int4, geometry, int4, int4, text);

CREATE OR REPLACE FUNCTION public._st_asx3d(integer, geometry, integer, integer, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asX3D$function$
;

-- Permissions

ALTER FUNCTION public._st_asx3d(int4, geometry, int4, int4, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_asx3d(int4, geometry, int4, int4, text) TO postgres;

-- DROP FUNCTION public._st_bestsrid(geography, geography);

CREATE OR REPLACE FUNCTION public._st_bestsrid(geography, geography)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$geography_bestsrid$function$
;

-- Permissions

ALTER FUNCTION public._st_bestsrid(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_bestsrid(geography, geography) TO postgres;

-- DROP FUNCTION public._st_bestsrid(geography);

CREATE OR REPLACE FUNCTION public._st_bestsrid(geography)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$geography_bestsrid$function$
;

-- Permissions

ALTER FUNCTION public._st_bestsrid(geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_bestsrid(geography) TO postgres;

-- DROP FUNCTION public._st_contains(geometry, geometry);

CREATE OR REPLACE FUNCTION public._st_contains(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$contains$function$
;

-- Permissions

ALTER FUNCTION public._st_contains(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_contains(geometry, geometry) TO postgres;

-- DROP FUNCTION public._st_containsproperly(geometry, geometry);

CREATE OR REPLACE FUNCTION public._st_containsproperly(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$containsproperly$function$
;

-- Permissions

ALTER FUNCTION public._st_containsproperly(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_containsproperly(geometry, geometry) TO postgres;

-- DROP FUNCTION public._st_coveredby(geometry, geometry);

CREATE OR REPLACE FUNCTION public._st_coveredby(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$coveredby$function$
;

-- Permissions

ALTER FUNCTION public._st_coveredby(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_coveredby(geometry, geometry) TO postgres;

-- DROP FUNCTION public._st_coveredby(geography, geography);

CREATE OR REPLACE FUNCTION public._st_coveredby(geog1 geography, geog2 geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$geography_coveredby$function$
;

-- Permissions

ALTER FUNCTION public._st_coveredby(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_coveredby(geography, geography) TO postgres;

-- DROP FUNCTION public._st_covers(geometry, geometry);

CREATE OR REPLACE FUNCTION public._st_covers(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$covers$function$
;

-- Permissions

ALTER FUNCTION public._st_covers(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_covers(geometry, geometry) TO postgres;

-- DROP FUNCTION public._st_covers(geography, geography);

CREATE OR REPLACE FUNCTION public._st_covers(geog1 geography, geog2 geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$geography_covers$function$
;

-- Permissions

ALTER FUNCTION public._st_covers(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_covers(geography, geography) TO postgres;

-- DROP FUNCTION public._st_crosses(geometry, geometry);

CREATE OR REPLACE FUNCTION public._st_crosses(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$crosses$function$
;

-- Permissions

ALTER FUNCTION public._st_crosses(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_crosses(geometry, geometry) TO postgres;

-- DROP FUNCTION public._st_dfullywithin(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public._st_dfullywithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$LWGEOM_dfullywithin$function$
;

-- Permissions

ALTER FUNCTION public._st_dfullywithin(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_dfullywithin(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public._st_distancetree(geography, geography, float8, bool);

CREATE OR REPLACE FUNCTION public._st_distancetree(geography, geography, double precision, boolean)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE STRICT COST 5000
AS '$libdir/postgis-3', $function$geography_distance_tree$function$
;

-- Permissions

ALTER FUNCTION public._st_distancetree(geography, geography, float8, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_distancetree(geography, geography, float8, bool) TO postgres;

-- DROP FUNCTION public._st_distancetree(geography, geography);

CREATE OR REPLACE FUNCTION public._st_distancetree(geography, geography)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$SELECT public._ST_DistanceTree($1, $2, 0.0, true)$function$
;

-- Permissions

ALTER FUNCTION public._st_distancetree(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_distancetree(geography, geography) TO postgres;

-- DROP FUNCTION public._st_distanceuncached(geography, geography);

CREATE OR REPLACE FUNCTION public._st_distanceuncached(geography, geography)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$SELECT public._ST_DistanceUnCached($1, $2, 0.0, true)$function$
;

-- Permissions

ALTER FUNCTION public._st_distanceuncached(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_distanceuncached(geography, geography) TO postgres;

-- DROP FUNCTION public._st_distanceuncached(geography, geography, bool);

CREATE OR REPLACE FUNCTION public._st_distanceuncached(geography, geography, boolean)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$SELECT public._ST_DistanceUnCached($1, $2, 0.0, $3)$function$
;

-- Permissions

ALTER FUNCTION public._st_distanceuncached(geography, geography, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_distanceuncached(geography, geography, bool) TO postgres;

-- DROP FUNCTION public._st_distanceuncached(geography, geography, float8, bool);

CREATE OR REPLACE FUNCTION public._st_distanceuncached(geography, geography, double precision, boolean)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE STRICT COST 5000
AS '$libdir/postgis-3', $function$geography_distance_uncached$function$
;

-- Permissions

ALTER FUNCTION public._st_distanceuncached(geography, geography, float8, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_distanceuncached(geography, geography, float8, bool) TO postgres;

-- DROP FUNCTION public._st_dwithin(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public._st_dwithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$LWGEOM_dwithin$function$
;

-- Permissions

ALTER FUNCTION public._st_dwithin(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_dwithin(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public._st_dwithin(geography, geography, float8, bool);

CREATE OR REPLACE FUNCTION public._st_dwithin(geog1 geography, geog2 geography, tolerance double precision, use_spheroid boolean DEFAULT true)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$geography_dwithin$function$
;

-- Permissions

ALTER FUNCTION public._st_dwithin(geography, geography, float8, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_dwithin(geography, geography, float8, bool) TO postgres;

-- DROP FUNCTION public._st_dwithinuncached(geography, geography, float8);

CREATE OR REPLACE FUNCTION public._st_dwithinuncached(geography, geography, double precision)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
AS $function$SELECT $1 OPERATOR(public.&&) public._ST_Expand($2,$3) AND $2 OPERATOR(public.&&) public._ST_Expand($1,$3) AND public._ST_DWithinUnCached($1, $2, $3, true)$function$
;

-- Permissions

ALTER FUNCTION public._st_dwithinuncached(geography, geography, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_dwithinuncached(geography, geography, float8) TO postgres;

-- DROP FUNCTION public._st_dwithinuncached(geography, geography, float8, bool);

CREATE OR REPLACE FUNCTION public._st_dwithinuncached(geography, geography, double precision, boolean)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE STRICT COST 5000
AS '$libdir/postgis-3', $function$geography_dwithin_uncached$function$
;

-- Permissions

ALTER FUNCTION public._st_dwithinuncached(geography, geography, float8, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_dwithinuncached(geography, geography, float8, bool) TO postgres;

-- DROP FUNCTION public._st_equals(geometry, geometry);

CREATE OR REPLACE FUNCTION public._st_equals(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_Equals$function$
;

-- Permissions

ALTER FUNCTION public._st_equals(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_equals(geometry, geometry) TO postgres;

-- DROP FUNCTION public._st_expand(geography, float8);

CREATE OR REPLACE FUNCTION public._st_expand(geography, double precision)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$geography_expand$function$
;

-- Permissions

ALTER FUNCTION public._st_expand(geography, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_expand(geography, float8) TO postgres;

-- DROP FUNCTION public._st_geomfromgml(text, int4);

CREATE OR REPLACE FUNCTION public._st_geomfromgml(text, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$geom_from_gml$function$
;

-- Permissions

ALTER FUNCTION public._st_geomfromgml(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_geomfromgml(text, int4) TO postgres;

-- DROP FUNCTION public._st_intersects(geometry, geometry);

CREATE OR REPLACE FUNCTION public._st_intersects(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_Intersects$function$
;

-- Permissions

ALTER FUNCTION public._st_intersects(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_intersects(geometry, geometry) TO postgres;

-- DROP FUNCTION public._st_linecrossingdirection(geometry, geometry);

CREATE OR REPLACE FUNCTION public._st_linecrossingdirection(line1 geometry, line2 geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_LineCrossingDirection$function$
;

-- Permissions

ALTER FUNCTION public._st_linecrossingdirection(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_linecrossingdirection(geometry, geometry) TO postgres;

-- DROP FUNCTION public._st_longestline(geometry, geometry);

CREATE OR REPLACE FUNCTION public._st_longestline(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_longestline2d$function$
;

-- Permissions

ALTER FUNCTION public._st_longestline(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_longestline(geometry, geometry) TO postgres;

-- DROP FUNCTION public._st_maxdistance(geometry, geometry);

CREATE OR REPLACE FUNCTION public._st_maxdistance(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_maxdistance2d_linestring$function$
;

-- Permissions

ALTER FUNCTION public._st_maxdistance(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_maxdistance(geometry, geometry) TO postgres;

-- DROP FUNCTION public._st_orderingequals(geometry, geometry);

CREATE OR REPLACE FUNCTION public._st_orderingequals(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$LWGEOM_same$function$
;

-- Permissions

ALTER FUNCTION public._st_orderingequals(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_orderingequals(geometry, geometry) TO postgres;

-- DROP FUNCTION public._st_overlaps(geometry, geometry);

CREATE OR REPLACE FUNCTION public._st_overlaps(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$overlaps$function$
;

-- Permissions

ALTER FUNCTION public._st_overlaps(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_overlaps(geometry, geometry) TO postgres;

-- DROP FUNCTION public._st_pointoutside(geography);

CREATE OR REPLACE FUNCTION public._st_pointoutside(geography)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/postgis-3', $function$geography_point_outside$function$
;

-- Permissions

ALTER FUNCTION public._st_pointoutside(geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_pointoutside(geography) TO postgres;

-- DROP FUNCTION public._st_sortablehash(geometry);

CREATE OR REPLACE FUNCTION public._st_sortablehash(geom geometry)
 RETURNS bigint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$_ST_SortableHash$function$
;

-- Permissions

ALTER FUNCTION public._st_sortablehash(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_sortablehash(geometry) TO postgres;

-- DROP FUNCTION public._st_touches(geometry, geometry);

CREATE OR REPLACE FUNCTION public._st_touches(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$touches$function$
;

-- Permissions

ALTER FUNCTION public._st_touches(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_touches(geometry, geometry) TO postgres;

-- DROP FUNCTION public._st_voronoi(geometry, geometry, float8, bool);

CREATE OR REPLACE FUNCTION public._st_voronoi(g1 geometry, clip geometry DEFAULT NULL::geometry, tolerance double precision DEFAULT 0.0, return_polygons boolean DEFAULT true)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 5000
AS '$libdir/postgis-3', $function$ST_Voronoi$function$
;

-- Permissions

ALTER FUNCTION public._st_voronoi(geometry, geometry, float8, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_voronoi(geometry, geometry, float8, bool) TO postgres;

-- DROP FUNCTION public._st_within(geometry, geometry);

CREATE OR REPLACE FUNCTION public._st_within(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$SELECT public._ST_Contains($2,$1)$function$
;

-- Permissions

ALTER FUNCTION public._st_within(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public._st_within(geometry, geometry) TO postgres;

-- DROP FUNCTION public.addgeometrycolumn(varchar, varchar, int4, varchar, int4, bool);

CREATE OR REPLACE FUNCTION public.addgeometrycolumn(table_name character varying, column_name character varying, new_srid integer, new_type character varying, new_dim integer, use_typmod boolean DEFAULT true)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret  text;
BEGIN
	SELECT public.AddGeometryColumn('','',$1,$2,$3,$4,$5, $6) into ret;
	RETURN ret;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.addgeometrycolumn(varchar, varchar, int4, varchar, int4, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.addgeometrycolumn(varchar, varchar, int4, varchar, int4, bool) TO postgres;

-- DROP FUNCTION public.addgeometrycolumn(varchar, varchar, varchar, varchar, int4, varchar, int4, bool);

CREATE OR REPLACE FUNCTION public.addgeometrycolumn(catalog_name character varying, schema_name character varying, table_name character varying, column_name character varying, new_srid_in integer, new_type character varying, new_dim integer, use_typmod boolean DEFAULT true)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	rec RECORD;
	sr varchar;
	real_schema name;
	sql text;
	new_srid integer;

BEGIN

	-- Verify geometry type
	IF (postgis_type_name(new_type,new_dim) IS NULL )
	THEN
		RAISE EXCEPTION 'Invalid type name "%(%)" - valid ones are:
	POINT, MULTIPOINT,
	LINESTRING, MULTILINESTRING,
	POLYGON, MULTIPOLYGON,
	CIRCULARSTRING, COMPOUNDCURVE, MULTICURVE,
	CURVEPOLYGON, MULTISURFACE,
	GEOMETRY, GEOMETRYCOLLECTION,
	POINTM, MULTIPOINTM,
	LINESTRINGM, MULTILINESTRINGM,
	POLYGONM, MULTIPOLYGONM,
	CIRCULARSTRINGM, COMPOUNDCURVEM, MULTICURVEM
	CURVEPOLYGONM, MULTISURFACEM, TRIANGLE, TRIANGLEM,
	POLYHEDRALSURFACE, POLYHEDRALSURFACEM, TIN, TINM
	or GEOMETRYCOLLECTIONM', new_type, new_dim;
		RETURN 'fail';
	END IF;

	-- Verify dimension
	IF ( (new_dim >4) OR (new_dim <2) ) THEN
		RAISE EXCEPTION 'invalid dimension';
		RETURN 'fail';
	END IF;

	IF ( (new_type LIKE '%M') AND (new_dim!=3) ) THEN
		RAISE EXCEPTION 'TypeM needs 3 dimensions';
		RETURN 'fail';
	END IF;

	-- Verify SRID
	IF ( new_srid_in > 0 ) THEN
		IF new_srid_in > 998999 THEN
			RAISE EXCEPTION 'AddGeometryColumn() - SRID must be <= %', 998999;
		END IF;
		new_srid := new_srid_in;
		SELECT SRID INTO sr FROM public.spatial_ref_sys WHERE SRID = new_srid;
		IF NOT FOUND THEN
			RAISE EXCEPTION 'AddGeometryColumn() - invalid SRID';
			RETURN 'fail';
		END IF;
	ELSE
		new_srid := public.ST_SRID('POINT EMPTY'::public.geometry);
		IF ( new_srid_in != new_srid ) THEN
			RAISE NOTICE 'SRID value % converted to the officially unknown SRID value %', new_srid_in, new_srid;
		END IF;
	END IF;

	-- Verify schema
	IF ( schema_name IS NOT NULL AND schema_name != '' ) THEN
		sql := 'SELECT nspname FROM pg_namespace ' ||
			'WHERE text(nspname) = ' || quote_literal(schema_name) ||
			'LIMIT 1';
		RAISE DEBUG '%', sql;
		EXECUTE sql INTO real_schema;

		IF ( real_schema IS NULL ) THEN
			RAISE EXCEPTION 'Schema % is not a valid schemaname', quote_literal(schema_name);
			RETURN 'fail';
		END IF;
	END IF;

	IF ( real_schema IS NULL ) THEN
		RAISE DEBUG 'Detecting schema';
		sql := 'SELECT n.nspname AS schemaname ' ||
			'FROM pg_catalog.pg_class c ' ||
			  'JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace ' ||
			'WHERE c.relkind = ' || quote_literal('r') ||
			' AND n.nspname NOT IN (' || quote_literal('pg_catalog') || ', ' || quote_literal('pg_toast') || ')' ||
			' AND pg_catalog.pg_table_is_visible(c.oid)' ||
			' AND c.relname = ' || quote_literal(table_name);
		RAISE DEBUG '%', sql;
		EXECUTE sql INTO real_schema;

		IF ( real_schema IS NULL ) THEN
			RAISE EXCEPTION 'Table % does not occur in the search_path', quote_literal(table_name);
			RETURN 'fail';
		END IF;
	END IF;

	-- Add geometry column to table
	IF use_typmod THEN
		 sql := 'ALTER TABLE ' ||
			quote_ident(real_schema) || '.' || quote_ident(table_name)
			|| ' ADD COLUMN ' || quote_ident(column_name) ||
			' geometry(' || public.postgis_type_name(new_type, new_dim) || ', ' || new_srid::text || ')';
		RAISE DEBUG '%', sql;
	ELSE
		sql := 'ALTER TABLE ' ||
			quote_ident(real_schema) || '.' || quote_ident(table_name)
			|| ' ADD COLUMN ' || quote_ident(column_name) ||
			' geometry ';
		RAISE DEBUG '%', sql;
	END IF;
	EXECUTE sql;

	IF NOT use_typmod THEN
		-- Add table CHECKs
		sql := 'ALTER TABLE ' ||
			quote_ident(real_schema) || '.' || quote_ident(table_name)
			|| ' ADD CONSTRAINT '
			|| quote_ident('enforce_srid_' || column_name)
			|| ' CHECK (st_srid(' || quote_ident(column_name) ||
			') = ' || new_srid::text || ')' ;
		RAISE DEBUG '%', sql;
		EXECUTE sql;

		sql := 'ALTER TABLE ' ||
			quote_ident(real_schema) || '.' || quote_ident(table_name)
			|| ' ADD CONSTRAINT '
			|| quote_ident('enforce_dims_' || column_name)
			|| ' CHECK (st_ndims(' || quote_ident(column_name) ||
			') = ' || new_dim::text || ')' ;
		RAISE DEBUG '%', sql;
		EXECUTE sql;

		IF ( NOT (new_type = 'GEOMETRY')) THEN
			sql := 'ALTER TABLE ' ||
				quote_ident(real_schema) || '.' || quote_ident(table_name) || ' ADD CONSTRAINT ' ||
				quote_ident('enforce_geotype_' || column_name) ||
				' CHECK (GeometryType(' ||
				quote_ident(column_name) || ')=' ||
				quote_literal(new_type) || ' OR (' ||
				quote_ident(column_name) || ') is null)';
			RAISE DEBUG '%', sql;
			EXECUTE sql;
		END IF;
	END IF;

	RETURN
		real_schema || '.' ||
		table_name || '.' || column_name ||
		' SRID:' || new_srid::text ||
		' TYPE:' || new_type ||
		' DIMS:' || new_dim::text || ' ';
END;
$function$
;

-- Permissions

ALTER FUNCTION public.addgeometrycolumn(varchar, varchar, varchar, varchar, int4, varchar, int4, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.addgeometrycolumn(varchar, varchar, varchar, varchar, int4, varchar, int4, bool) TO postgres;

-- DROP FUNCTION public.addgeometrycolumn(varchar, varchar, varchar, int4, varchar, int4, bool);

CREATE OR REPLACE FUNCTION public.addgeometrycolumn(schema_name character varying, table_name character varying, column_name character varying, new_srid integer, new_type character varying, new_dim integer, use_typmod boolean DEFAULT true)
 RETURNS text
 LANGUAGE plpgsql
 STABLE STRICT
AS $function$
DECLARE
	ret  text;
BEGIN
	SELECT public.AddGeometryColumn('',$1,$2,$3,$4,$5,$6,$7) into ret;
	RETURN ret;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.addgeometrycolumn(varchar, varchar, varchar, int4, varchar, int4, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.addgeometrycolumn(varchar, varchar, varchar, int4, varchar, int4, bool) TO postgres;

-- DROP FUNCTION public.box(box3d);

CREATE OR REPLACE FUNCTION public.box(box3d)
 RETURNS box
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_to_BOX$function$
;

-- Permissions

ALTER FUNCTION public.box(box3d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.box(box3d) TO postgres;

-- DROP FUNCTION public.box(geometry);

CREATE OR REPLACE FUNCTION public.box(geometry)
 RETURNS box
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_BOX$function$
;

-- Permissions

ALTER FUNCTION public.box(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.box(geometry) TO postgres;

-- DROP FUNCTION public.box2d(geometry);

CREATE OR REPLACE FUNCTION public.box2d(geometry)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_BOX2D$function$
;

-- Permissions

ALTER FUNCTION public.box2d(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.box2d(geometry) TO postgres;

-- DROP FUNCTION public.box2d(box3d);

CREATE OR REPLACE FUNCTION public.box2d(box3d)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_to_BOX2D$function$
;

-- Permissions

ALTER FUNCTION public.box2d(box3d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.box2d(box3d) TO postgres;

-- DROP FUNCTION public.box2d_in(cstring);

CREATE OR REPLACE FUNCTION public.box2d_in(cstring)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX2D_in$function$
;

-- Permissions

ALTER FUNCTION public.box2d_in(cstring) OWNER TO postgres;
GRANT ALL ON FUNCTION public.box2d_in(cstring) TO postgres;

-- DROP FUNCTION public.box2d_out(box2d);

CREATE OR REPLACE FUNCTION public.box2d_out(box2d)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX2D_out$function$
;

-- Permissions

ALTER FUNCTION public.box2d_out(box2d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.box2d_out(box2d) TO postgres;

-- DROP FUNCTION public.box2df_in(cstring);

CREATE OR REPLACE FUNCTION public.box2df_in(cstring)
 RETURNS box2df
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$box2df_in$function$
;

-- Permissions

ALTER FUNCTION public.box2df_in(cstring) OWNER TO postgres;
GRANT ALL ON FUNCTION public.box2df_in(cstring) TO postgres;

-- DROP FUNCTION public.box2df_out(box2df);

CREATE OR REPLACE FUNCTION public.box2df_out(box2df)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$box2df_out$function$
;

-- Permissions

ALTER FUNCTION public.box2df_out(box2df) OWNER TO postgres;
GRANT ALL ON FUNCTION public.box2df_out(box2df) TO postgres;

-- DROP FUNCTION public.box3d(geometry);

CREATE OR REPLACE FUNCTION public.box3d(geometry)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_BOX3D$function$
;

-- Permissions

ALTER FUNCTION public.box3d(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.box3d(geometry) TO postgres;

-- DROP FUNCTION public.box3d(box2d);

CREATE OR REPLACE FUNCTION public.box3d(box2d)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX2D_to_BOX3D$function$
;

-- Permissions

ALTER FUNCTION public.box3d(box2d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.box3d(box2d) TO postgres;

-- DROP FUNCTION public.box3d_in(cstring);

CREATE OR REPLACE FUNCTION public.box3d_in(cstring)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_in$function$
;

-- Permissions

ALTER FUNCTION public.box3d_in(cstring) OWNER TO postgres;
GRANT ALL ON FUNCTION public.box3d_in(cstring) TO postgres;

-- DROP FUNCTION public.box3d_out(box3d);

CREATE OR REPLACE FUNCTION public.box3d_out(box3d)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_out$function$
;

-- Permissions

ALTER FUNCTION public.box3d_out(box3d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.box3d_out(box3d) TO postgres;

-- DROP FUNCTION public.box3dtobox(box3d);

CREATE OR REPLACE FUNCTION public.box3dtobox(box3d)
 RETURNS box
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_to_BOX$function$
;

-- Permissions

ALTER FUNCTION public.box3dtobox(box3d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.box3dtobox(box3d) TO postgres;

-- DROP FUNCTION public."bytea"(geometry);

CREATE OR REPLACE FUNCTION public.bytea(geometry)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_bytea$function$
;

-- Permissions

ALTER FUNCTION public."bytea"(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public."bytea"(geometry) TO postgres;

-- DROP FUNCTION public."bytea"(geography);

CREATE OR REPLACE FUNCTION public.bytea(geography)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_to_bytea$function$
;

-- Permissions

ALTER FUNCTION public."bytea"(geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public."bytea"(geography) TO postgres;

-- DROP FUNCTION public.check_rate_limit(varchar, varchar, int4, int4);

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier character varying, p_rate_limit_type character varying, p_max_requests integer, p_window_ms integer)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_current_count INTEGER;
    v_is_allowed BOOLEAN;
    v_remaining INTEGER;
    v_window_start TIMESTAMP;
BEGIN
    -- Calculate window start
    v_window_start := CURRENT_TIMESTAMP - (p_window_ms || ' milliseconds')::INTERVAL;
    
    -- Get current request count in window
    SELECT COALESCE(SUM(request_count), 0)
    INTO v_current_count
    FROM public.rate_limiting
    WHERE identifier = p_identifier 
      AND rate_limit_type = p_rate_limit_type
      AND window_start >= v_window_start;
    
    -- Check if allowed
    v_is_allowed := v_current_count < p_max_requests;
    v_remaining := GREATEST(0, p_max_requests - v_current_count);
    
    -- Log the request
    INSERT INTO public.rate_limiting (
        identifier, rate_limit_type, request_count, 
        window_start, last_request
    ) VALUES (
        p_identifier, p_rate_limit_type, 1, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (identifier, rate_limit_type, window_start) 
    DO UPDATE SET 
        request_count = rate_limiting.request_count + 1,
        last_request = CURRENT_TIMESTAMP;
    
    RETURN jsonb_build_object(
        'allowed', v_is_allowed,
        'remaining', v_remaining,
        'current_count', v_current_count + 1,
        'window_start', v_window_start
    );
END;
$function$
;

-- Permissions

ALTER FUNCTION public.check_rate_limit(varchar, varchar, int4, int4) OWNER TO root;
GRANT ALL ON FUNCTION public.check_rate_limit(varchar, varchar, int4, int4) TO root;

-- DROP FUNCTION public.contains_2d(box2df, geometry);

CREATE OR REPLACE FUNCTION public.contains_2d(box2df, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_box2df_geom_2d$function$
;

-- Permissions

ALTER FUNCTION public.contains_2d(box2df, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.contains_2d(box2df, geometry) TO postgres;

-- DROP FUNCTION public.contains_2d(box2df, box2df);

CREATE OR REPLACE FUNCTION public.contains_2d(box2df, box2df)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_box2df_box2df_2d$function$
;

-- Permissions

ALTER FUNCTION public.contains_2d(box2df, box2df) OWNER TO postgres;
GRANT ALL ON FUNCTION public.contains_2d(box2df, box2df) TO postgres;

-- DROP FUNCTION public.contains_2d(geometry, box2df);

CREATE OR REPLACE FUNCTION public.contains_2d(geometry, box2df)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
AS $function$SELECT $2 OPERATOR(public.@) $1;$function$
;

-- Permissions

ALTER FUNCTION public.contains_2d(geometry, box2df) OWNER TO postgres;
GRANT ALL ON FUNCTION public.contains_2d(geometry, box2df) TO postgres;

-- DROP FUNCTION public.dropgeometrycolumn(varchar, varchar, varchar);

CREATE OR REPLACE FUNCTION public.dropgeometrycolumn(schema_name character varying, table_name character varying, column_name character varying)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret text;
BEGIN
	SELECT public.DropGeometryColumn('',$1,$2,$3) into ret;
	RETURN ret;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.dropgeometrycolumn(varchar, varchar, varchar) OWNER TO postgres;
GRANT ALL ON FUNCTION public.dropgeometrycolumn(varchar, varchar, varchar) TO postgres;

-- DROP FUNCTION public.dropgeometrycolumn(varchar, varchar, varchar, varchar);

CREATE OR REPLACE FUNCTION public.dropgeometrycolumn(catalog_name character varying, schema_name character varying, table_name character varying, column_name character varying)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	myrec RECORD;
	okay boolean;
	real_schema name;

BEGIN

	-- Find, check or fix schema_name
	IF ( schema_name != '' ) THEN
		okay = false;

		FOR myrec IN SELECT nspname FROM pg_namespace WHERE text(nspname) = schema_name LOOP
			okay := true;
		END LOOP;

		IF ( okay <>  true ) THEN
			RAISE NOTICE 'Invalid schema name - using current_schema()';
			SELECT current_schema() into real_schema;
		ELSE
			real_schema = schema_name;
		END IF;
	ELSE
		SELECT current_schema() into real_schema;
	END IF;

	-- Find out if the column is in the geometry_columns table
	okay = false;
	FOR myrec IN SELECT * from public.geometry_columns where f_table_schema = text(real_schema) and f_table_name = table_name and f_geometry_column = column_name LOOP
		okay := true;
	END LOOP;
	IF (okay <> true) THEN
		RAISE EXCEPTION 'column not found in geometry_columns table';
		RETURN false;
	END IF;

	-- Remove table column
	EXECUTE 'ALTER TABLE ' || quote_ident(real_schema) || '.' ||
		quote_ident(table_name) || ' DROP COLUMN ' ||
		quote_ident(column_name);

	RETURN real_schema || '.' || table_name || '.' || column_name ||' effectively removed.';

END;
$function$
;

-- Permissions

ALTER FUNCTION public.dropgeometrycolumn(varchar, varchar, varchar, varchar) OWNER TO postgres;
GRANT ALL ON FUNCTION public.dropgeometrycolumn(varchar, varchar, varchar, varchar) TO postgres;

-- DROP FUNCTION public.dropgeometrycolumn(varchar, varchar);

CREATE OR REPLACE FUNCTION public.dropgeometrycolumn(table_name character varying, column_name character varying)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret text;
BEGIN
	SELECT public.DropGeometryColumn('','',$1,$2) into ret;
	RETURN ret;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.dropgeometrycolumn(varchar, varchar) OWNER TO postgres;
GRANT ALL ON FUNCTION public.dropgeometrycolumn(varchar, varchar) TO postgres;

-- DROP FUNCTION public.dropgeometrytable(varchar, varchar, varchar);

CREATE OR REPLACE FUNCTION public.dropgeometrytable(catalog_name character varying, schema_name character varying, table_name character varying)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	real_schema name;

BEGIN

	IF ( schema_name = '' ) THEN
		SELECT current_schema() into real_schema;
	ELSE
		real_schema = schema_name;
	END IF;

	-- TODO: Should we warn if table doesn't exist probably instead just saying dropped
	-- Remove table
	EXECUTE 'DROP TABLE IF EXISTS '
		|| quote_ident(real_schema) || '.' ||
		quote_ident(table_name) || ' RESTRICT';

	RETURN
		real_schema || '.' ||
		table_name ||' dropped.';

END;
$function$
;

-- Permissions

ALTER FUNCTION public.dropgeometrytable(varchar, varchar, varchar) OWNER TO postgres;
GRANT ALL ON FUNCTION public.dropgeometrytable(varchar, varchar, varchar) TO postgres;

-- DROP FUNCTION public.dropgeometrytable(varchar);

CREATE OR REPLACE FUNCTION public.dropgeometrytable(table_name character varying)
 RETURNS text
 LANGUAGE sql
 STRICT
AS $function$ SELECT public.DropGeometryTable('','',$1) $function$
;

-- Permissions

ALTER FUNCTION public.dropgeometrytable(varchar) OWNER TO postgres;
GRANT ALL ON FUNCTION public.dropgeometrytable(varchar) TO postgres;

-- DROP FUNCTION public.dropgeometrytable(varchar, varchar);

CREATE OR REPLACE FUNCTION public.dropgeometrytable(schema_name character varying, table_name character varying)
 RETURNS text
 LANGUAGE sql
 STRICT
AS $function$ SELECT public.DropGeometryTable('',$1,$2) $function$
;

-- Permissions

ALTER FUNCTION public.dropgeometrytable(varchar, varchar) OWNER TO postgres;
GRANT ALL ON FUNCTION public.dropgeometrytable(varchar, varchar) TO postgres;

-- DROP FUNCTION public."equals"(geometry, geometry);

CREATE OR REPLACE FUNCTION public.equals(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_Equals$function$
;

-- Permissions

ALTER FUNCTION public."equals"(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public."equals"(geometry, geometry) TO postgres;

-- DROP FUNCTION public.find_srid(varchar, varchar, varchar);

CREATE OR REPLACE FUNCTION public.find_srid(character varying, character varying, character varying)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE PARALLEL SAFE STRICT
AS $function$
DECLARE
	schem varchar =  $1;
	tabl varchar = $2;
	sr int4;
BEGIN
-- if the table contains a . and the schema is empty
-- split the table into a schema and a table
-- otherwise drop through to default behavior
	IF ( schem = '' and strpos(tabl,'.') > 0 ) THEN
	 schem = substr(tabl,1,strpos(tabl,'.')-1);
	 tabl = substr(tabl,length(schem)+2);
	END IF;

	select SRID into sr from public.geometry_columns where (f_table_schema = schem or schem = '') and f_table_name = tabl and f_geometry_column = $3;
	IF NOT FOUND THEN
	   RAISE EXCEPTION 'find_srid() - could not find the corresponding SRID - is the geometry registered in the GEOMETRY_COLUMNS table?  Is there an uppercase/lowercase mismatch?';
	END IF;
	return sr;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.find_srid(varchar, varchar, varchar) OWNER TO postgres;
GRANT ALL ON FUNCTION public.find_srid(varchar, varchar, varchar) TO postgres;

-- DROP FUNCTION public.geog_brin_inclusion_add_value(internal, internal, internal, internal);

CREATE OR REPLACE FUNCTION public.geog_brin_inclusion_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$geog_brin_inclusion_add_value$function$
;

-- Permissions

ALTER FUNCTION public.geog_brin_inclusion_add_value(internal, internal, internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geog_brin_inclusion_add_value(internal, internal, internal, internal) TO postgres;

-- DROP FUNCTION public.geog_brin_inclusion_merge(internal, internal);

CREATE OR REPLACE FUNCTION public.geog_brin_inclusion_merge(internal, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$geog_brin_inclusion_merge$function$
;

-- Permissions

ALTER FUNCTION public.geog_brin_inclusion_merge(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geog_brin_inclusion_merge(internal, internal) TO postgres;

-- DROP FUNCTION public.geography(geography, int4, bool);

CREATE OR REPLACE FUNCTION public.geography(geography, integer, boolean)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_enforce_typmod$function$
;

-- Permissions

ALTER FUNCTION public.geography(geography, int4, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography(geography, int4, bool) TO postgres;

-- DROP FUNCTION public.geography(bytea);

CREATE OR REPLACE FUNCTION public.geography(bytea)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_from_binary$function$
;

-- Permissions

ALTER FUNCTION public.geography(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography(bytea) TO postgres;

-- DROP FUNCTION public.geography(geometry);

CREATE OR REPLACE FUNCTION public.geography(geometry)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_from_geometry$function$
;

-- Permissions

ALTER FUNCTION public.geography(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography(geometry) TO postgres;

-- DROP FUNCTION public.geography_analyze(internal);

CREATE OR REPLACE FUNCTION public.geography_analyze(internal)
 RETURNS boolean
 LANGUAGE c
 STRICT
AS '$libdir/postgis-3', $function$gserialized_analyze_nd$function$
;

-- Permissions

ALTER FUNCTION public.geography_analyze(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_analyze(internal) TO postgres;

-- DROP FUNCTION public.geography_cmp(geography, geography);

CREATE OR REPLACE FUNCTION public.geography_cmp(geography, geography)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_cmp$function$
;

-- Permissions

ALTER FUNCTION public.geography_cmp(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_cmp(geography, geography) TO postgres;

-- DROP FUNCTION public.geography_distance_knn(geography, geography);

CREATE OR REPLACE FUNCTION public.geography_distance_knn(geography, geography)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 100
AS '$libdir/postgis-3', $function$geography_distance_knn$function$
;

-- Permissions

ALTER FUNCTION public.geography_distance_knn(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_distance_knn(geography, geography) TO postgres;

-- DROP FUNCTION public.geography_eq(geography, geography);

CREATE OR REPLACE FUNCTION public.geography_eq(geography, geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_eq$function$
;

-- Permissions

ALTER FUNCTION public.geography_eq(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_eq(geography, geography) TO postgres;

-- DROP FUNCTION public.geography_ge(geography, geography);

CREATE OR REPLACE FUNCTION public.geography_ge(geography, geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_ge$function$
;

-- Permissions

ALTER FUNCTION public.geography_ge(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_ge(geography, geography) TO postgres;

-- DROP FUNCTION public.geography_gist_compress(internal);

CREATE OR REPLACE FUNCTION public.geography_gist_compress(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_compress$function$
;

-- Permissions

ALTER FUNCTION public.geography_gist_compress(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_gist_compress(internal) TO postgres;

-- DROP FUNCTION public.geography_gist_consistent(internal, geography, int4);

CREATE OR REPLACE FUNCTION public.geography_gist_consistent(internal, geography, integer)
 RETURNS boolean
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_consistent$function$
;

-- Permissions

ALTER FUNCTION public.geography_gist_consistent(internal, geography, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_gist_consistent(internal, geography, int4) TO postgres;

-- DROP FUNCTION public.geography_gist_decompress(internal);

CREATE OR REPLACE FUNCTION public.geography_gist_decompress(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_decompress$function$
;

-- Permissions

ALTER FUNCTION public.geography_gist_decompress(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_gist_decompress(internal) TO postgres;

-- DROP FUNCTION public.geography_gist_distance(internal, geography, int4);

CREATE OR REPLACE FUNCTION public.geography_gist_distance(internal, geography, integer)
 RETURNS double precision
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_geog_distance$function$
;

-- Permissions

ALTER FUNCTION public.geography_gist_distance(internal, geography, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_gist_distance(internal, geography, int4) TO postgres;

-- DROP FUNCTION public.geography_gist_penalty(internal, internal, internal);

CREATE OR REPLACE FUNCTION public.geography_gist_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_penalty$function$
;

-- Permissions

ALTER FUNCTION public.geography_gist_penalty(internal, internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_gist_penalty(internal, internal, internal) TO postgres;

-- DROP FUNCTION public.geography_gist_picksplit(internal, internal);

CREATE OR REPLACE FUNCTION public.geography_gist_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_picksplit$function$
;

-- Permissions

ALTER FUNCTION public.geography_gist_picksplit(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_gist_picksplit(internal, internal) TO postgres;

-- DROP FUNCTION public.geography_gist_same(box2d, box2d, internal);

CREATE OR REPLACE FUNCTION public.geography_gist_same(box2d, box2d, internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_same$function$
;

-- Permissions

ALTER FUNCTION public.geography_gist_same(box2d, box2d, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_gist_same(box2d, box2d, internal) TO postgres;

-- DROP FUNCTION public.geography_gist_union(bytea, internal);

CREATE OR REPLACE FUNCTION public.geography_gist_union(bytea, internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_union$function$
;

-- Permissions

ALTER FUNCTION public.geography_gist_union(bytea, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_gist_union(bytea, internal) TO postgres;

-- DROP FUNCTION public.geography_gt(geography, geography);

CREATE OR REPLACE FUNCTION public.geography_gt(geography, geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_gt$function$
;

-- Permissions

ALTER FUNCTION public.geography_gt(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_gt(geography, geography) TO postgres;

-- DROP FUNCTION public.geography_in(cstring, oid, int4);

CREATE OR REPLACE FUNCTION public.geography_in(cstring, oid, integer)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_in$function$
;

-- Permissions

ALTER FUNCTION public.geography_in(cstring, oid, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_in(cstring, oid, int4) TO postgres;

-- DROP FUNCTION public.geography_le(geography, geography);

CREATE OR REPLACE FUNCTION public.geography_le(geography, geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_le$function$
;

-- Permissions

ALTER FUNCTION public.geography_le(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_le(geography, geography) TO postgres;

-- DROP FUNCTION public.geography_lt(geography, geography);

CREATE OR REPLACE FUNCTION public.geography_lt(geography, geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_lt$function$
;

-- Permissions

ALTER FUNCTION public.geography_lt(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_lt(geography, geography) TO postgres;

-- DROP FUNCTION public.geography_out(geography);

CREATE OR REPLACE FUNCTION public.geography_out(geography)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_out$function$
;

-- Permissions

ALTER FUNCTION public.geography_out(geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_out(geography) TO postgres;

-- DROP FUNCTION public.geography_overlaps(geography, geography);

CREATE OR REPLACE FUNCTION public.geography_overlaps(geography, geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overlaps$function$
;

-- Permissions

ALTER FUNCTION public.geography_overlaps(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_overlaps(geography, geography) TO postgres;

-- DROP FUNCTION public.geography_recv(internal, oid, int4);

CREATE OR REPLACE FUNCTION public.geography_recv(internal, oid, integer)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_recv$function$
;

-- Permissions

ALTER FUNCTION public.geography_recv(internal, oid, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_recv(internal, oid, int4) TO postgres;

-- DROP FUNCTION public.geography_send(geography);

CREATE OR REPLACE FUNCTION public.geography_send(geography)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_send$function$
;

-- Permissions

ALTER FUNCTION public.geography_send(geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_send(geography) TO postgres;

-- DROP FUNCTION public.geography_spgist_choose_nd(internal, internal);

CREATE OR REPLACE FUNCTION public.geography_spgist_choose_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_choose_nd$function$
;

-- Permissions

ALTER FUNCTION public.geography_spgist_choose_nd(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_spgist_choose_nd(internal, internal) TO postgres;

-- DROP FUNCTION public.geography_spgist_compress_nd(internal);

CREATE OR REPLACE FUNCTION public.geography_spgist_compress_nd(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_compress_nd$function$
;

-- Permissions

ALTER FUNCTION public.geography_spgist_compress_nd(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_spgist_compress_nd(internal) TO postgres;

-- DROP FUNCTION public.geography_spgist_config_nd(internal, internal);

CREATE OR REPLACE FUNCTION public.geography_spgist_config_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_config_nd$function$
;

-- Permissions

ALTER FUNCTION public.geography_spgist_config_nd(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_spgist_config_nd(internal, internal) TO postgres;

-- DROP FUNCTION public.geography_spgist_inner_consistent_nd(internal, internal);

CREATE OR REPLACE FUNCTION public.geography_spgist_inner_consistent_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_inner_consistent_nd$function$
;

-- Permissions

ALTER FUNCTION public.geography_spgist_inner_consistent_nd(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_spgist_inner_consistent_nd(internal, internal) TO postgres;

-- DROP FUNCTION public.geography_spgist_leaf_consistent_nd(internal, internal);

CREATE OR REPLACE FUNCTION public.geography_spgist_leaf_consistent_nd(internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_leaf_consistent_nd$function$
;

-- Permissions

ALTER FUNCTION public.geography_spgist_leaf_consistent_nd(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_spgist_leaf_consistent_nd(internal, internal) TO postgres;

-- DROP FUNCTION public.geography_spgist_picksplit_nd(internal, internal);

CREATE OR REPLACE FUNCTION public.geography_spgist_picksplit_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_picksplit_nd$function$
;

-- Permissions

ALTER FUNCTION public.geography_spgist_picksplit_nd(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_spgist_picksplit_nd(internal, internal) TO postgres;

-- DROP FUNCTION public.geography_typmod_in(_cstring);

CREATE OR REPLACE FUNCTION public.geography_typmod_in(cstring[])
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_typmod_in$function$
;

-- Permissions

ALTER FUNCTION public.geography_typmod_in(_cstring) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_typmod_in(_cstring) TO postgres;

-- DROP FUNCTION public.geography_typmod_out(int4);

CREATE OR REPLACE FUNCTION public.geography_typmod_out(integer)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_typmod_out$function$
;

-- Permissions

ALTER FUNCTION public.geography_typmod_out(int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geography_typmod_out(int4) TO postgres;

-- DROP FUNCTION public.geom2d_brin_inclusion_add_value(internal, internal, internal, internal);

CREATE OR REPLACE FUNCTION public.geom2d_brin_inclusion_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$geom2d_brin_inclusion_add_value$function$
;

-- Permissions

ALTER FUNCTION public.geom2d_brin_inclusion_add_value(internal, internal, internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geom2d_brin_inclusion_add_value(internal, internal, internal, internal) TO postgres;

-- DROP FUNCTION public.geom2d_brin_inclusion_merge(internal, internal);

CREATE OR REPLACE FUNCTION public.geom2d_brin_inclusion_merge(internal, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$geom2d_brin_inclusion_merge$function$
;

-- Permissions

ALTER FUNCTION public.geom2d_brin_inclusion_merge(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geom2d_brin_inclusion_merge(internal, internal) TO postgres;

-- DROP FUNCTION public.geom3d_brin_inclusion_add_value(internal, internal, internal, internal);

CREATE OR REPLACE FUNCTION public.geom3d_brin_inclusion_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$geom3d_brin_inclusion_add_value$function$
;

-- Permissions

ALTER FUNCTION public.geom3d_brin_inclusion_add_value(internal, internal, internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geom3d_brin_inclusion_add_value(internal, internal, internal, internal) TO postgres;

-- DROP FUNCTION public.geom3d_brin_inclusion_merge(internal, internal);

CREATE OR REPLACE FUNCTION public.geom3d_brin_inclusion_merge(internal, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$geom3d_brin_inclusion_merge$function$
;

-- Permissions

ALTER FUNCTION public.geom3d_brin_inclusion_merge(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geom3d_brin_inclusion_merge(internal, internal) TO postgres;

-- DROP FUNCTION public.geom4d_brin_inclusion_add_value(internal, internal, internal, internal);

CREATE OR REPLACE FUNCTION public.geom4d_brin_inclusion_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$geom4d_brin_inclusion_add_value$function$
;

-- Permissions

ALTER FUNCTION public.geom4d_brin_inclusion_add_value(internal, internal, internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geom4d_brin_inclusion_add_value(internal, internal, internal, internal) TO postgres;

-- DROP FUNCTION public.geom4d_brin_inclusion_merge(internal, internal);

CREATE OR REPLACE FUNCTION public.geom4d_brin_inclusion_merge(internal, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$geom4d_brin_inclusion_merge$function$
;

-- Permissions

ALTER FUNCTION public.geom4d_brin_inclusion_merge(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geom4d_brin_inclusion_merge(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry(bytea);

CREATE OR REPLACE FUNCTION public.geometry(bytea)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_from_bytea$function$
;

-- Permissions

ALTER FUNCTION public.geometry(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry(bytea) TO postgres;

-- DROP FUNCTION public.geometry(geometry, int4, bool);

CREATE OR REPLACE FUNCTION public.geometry(geometry, integer, boolean)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_enforce_typmod$function$
;

-- Permissions

ALTER FUNCTION public.geometry(geometry, int4, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry(geometry, int4, bool) TO postgres;

-- DROP FUNCTION public.geometry(polygon);

CREATE OR REPLACE FUNCTION public.geometry(polygon)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$polygon_to_geometry$function$
;

-- Permissions

ALTER FUNCTION public.geometry(polygon) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry(polygon) TO postgres;

-- DROP FUNCTION public.geometry(box2d);

CREATE OR REPLACE FUNCTION public.geometry(box2d)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX2D_to_LWGEOM$function$
;

-- Permissions

ALTER FUNCTION public.geometry(box2d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry(box2d) TO postgres;

-- DROP FUNCTION public.geometry(text);

CREATE OR REPLACE FUNCTION public.geometry(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$parse_WKT_lwgeom$function$
;

-- Permissions

ALTER FUNCTION public.geometry(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry(text) TO postgres;

-- DROP FUNCTION public.geometry(path);

CREATE OR REPLACE FUNCTION public.geometry(path)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$path_to_geometry$function$
;

-- Permissions

ALTER FUNCTION public.geometry(path) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry(path) TO postgres;

-- DROP FUNCTION public.geometry(box3d);

CREATE OR REPLACE FUNCTION public.geometry(box3d)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_to_LWGEOM$function$
;

-- Permissions

ALTER FUNCTION public.geometry(box3d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry(box3d) TO postgres;

-- DROP FUNCTION public.geometry(point);

CREATE OR REPLACE FUNCTION public.geometry(point)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$point_to_geometry$function$
;

-- Permissions

ALTER FUNCTION public.geometry(point) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry(point) TO postgres;

-- DROP FUNCTION public.geometry(geography);

CREATE OR REPLACE FUNCTION public.geometry(geography)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_from_geography$function$
;

-- Permissions

ALTER FUNCTION public.geometry(geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry(geography) TO postgres;

-- DROP FUNCTION public.geometry_above(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_above(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_above_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_above(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_above(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_analyze(internal);

CREATE OR REPLACE FUNCTION public.geometry_analyze(internal)
 RETURNS boolean
 LANGUAGE c
 STRICT
AS '$libdir/postgis-3', $function$gserialized_analyze_nd$function$
;

-- Permissions

ALTER FUNCTION public.geometry_analyze(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_analyze(internal) TO postgres;

-- DROP FUNCTION public.geometry_below(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_below(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_below_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_below(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_below(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_cmp(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_cmp(geom1 geometry, geom2 geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_cmp$function$
;

-- Permissions

ALTER FUNCTION public.geometry_cmp(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_cmp(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_contained_3d(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_contained_3d(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contained_3d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_contained_3d(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_contained_3d(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_contains(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_contains(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_contains(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_contains(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_contains_3d(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_contains_3d(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_3d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_contains_3d(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_contains_3d(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_contains_nd(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_contains_nd(geometry, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains$function$
;

-- Permissions

ALTER FUNCTION public.geometry_contains_nd(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_contains_nd(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_distance_box(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_distance_box(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_distance_box_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_distance_box(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_distance_box(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_distance_centroid(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_distance_centroid(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_Distance$function$
;

-- Permissions

ALTER FUNCTION public.geometry_distance_centroid(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_distance_centroid(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_distance_centroid_nd(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_distance_centroid_nd(geometry, geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_distance_nd$function$
;

-- Permissions

ALTER FUNCTION public.geometry_distance_centroid_nd(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_distance_centroid_nd(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_distance_cpa(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_distance_cpa(geometry, geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_DistanceCPA$function$
;

-- Permissions

ALTER FUNCTION public.geometry_distance_cpa(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_distance_cpa(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_eq(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_eq(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_eq$function$
;

-- Permissions

ALTER FUNCTION public.geometry_eq(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_eq(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_ge(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_ge(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_ge$function$
;

-- Permissions

ALTER FUNCTION public.geometry_ge(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_ge(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_gist_compress_2d(internal);

CREATE OR REPLACE FUNCTION public.geometry_gist_compress_2d(internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_compress_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_compress_2d(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_compress_2d(internal) TO postgres;

-- DROP FUNCTION public.geometry_gist_compress_nd(internal);

CREATE OR REPLACE FUNCTION public.geometry_gist_compress_nd(internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_compress$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_compress_nd(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_compress_nd(internal) TO postgres;

-- DROP FUNCTION public.geometry_gist_consistent_2d(internal, geometry, int4);

CREATE OR REPLACE FUNCTION public.geometry_gist_consistent_2d(internal, geometry, integer)
 RETURNS boolean
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_consistent_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_consistent_2d(internal, geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_consistent_2d(internal, geometry, int4) TO postgres;

-- DROP FUNCTION public.geometry_gist_consistent_nd(internal, geometry, int4);

CREATE OR REPLACE FUNCTION public.geometry_gist_consistent_nd(internal, geometry, integer)
 RETURNS boolean
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_consistent$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_consistent_nd(internal, geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_consistent_nd(internal, geometry, int4) TO postgres;

-- DROP FUNCTION public.geometry_gist_decompress_2d(internal);

CREATE OR REPLACE FUNCTION public.geometry_gist_decompress_2d(internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_decompress_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_decompress_2d(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_decompress_2d(internal) TO postgres;

-- DROP FUNCTION public.geometry_gist_decompress_nd(internal);

CREATE OR REPLACE FUNCTION public.geometry_gist_decompress_nd(internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_decompress$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_decompress_nd(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_decompress_nd(internal) TO postgres;

-- DROP FUNCTION public.geometry_gist_distance_2d(internal, geometry, int4);

CREATE OR REPLACE FUNCTION public.geometry_gist_distance_2d(internal, geometry, integer)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_distance_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_distance_2d(internal, geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_distance_2d(internal, geometry, int4) TO postgres;

-- DROP FUNCTION public.geometry_gist_distance_nd(internal, geometry, int4);

CREATE OR REPLACE FUNCTION public.geometry_gist_distance_nd(internal, geometry, integer)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_distance$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_distance_nd(internal, geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_distance_nd(internal, geometry, int4) TO postgres;

-- DROP FUNCTION public.geometry_gist_penalty_2d(internal, internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_gist_penalty_2d(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_penalty_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_penalty_2d(internal, internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_penalty_2d(internal, internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_gist_penalty_nd(internal, internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_gist_penalty_nd(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_penalty$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_penalty_nd(internal, internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_penalty_nd(internal, internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_gist_picksplit_2d(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_gist_picksplit_2d(internal, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_picksplit_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_picksplit_2d(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_picksplit_2d(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_gist_picksplit_nd(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_gist_picksplit_nd(internal, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_picksplit$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_picksplit_nd(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_picksplit_nd(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_gist_same_2d(geometry, geometry, internal);

CREATE OR REPLACE FUNCTION public.geometry_gist_same_2d(geom1 geometry, geom2 geometry, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_same_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_same_2d(geometry, geometry, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_same_2d(geometry, geometry, internal) TO postgres;

-- DROP FUNCTION public.geometry_gist_same_nd(geometry, geometry, internal);

CREATE OR REPLACE FUNCTION public.geometry_gist_same_nd(geometry, geometry, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_same$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_same_nd(geometry, geometry, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_same_nd(geometry, geometry, internal) TO postgres;

-- DROP FUNCTION public.geometry_gist_sortsupport_2d(internal);

CREATE OR REPLACE FUNCTION public.geometry_gist_sortsupport_2d(internal)
 RETURNS void
 LANGUAGE c
 STRICT
AS '$libdir/postgis-3', $function$gserialized_gist_sortsupport_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_sortsupport_2d(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_sortsupport_2d(internal) TO postgres;

-- DROP FUNCTION public.geometry_gist_union_2d(bytea, internal);

CREATE OR REPLACE FUNCTION public.geometry_gist_union_2d(bytea, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_union_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_union_2d(bytea, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_union_2d(bytea, internal) TO postgres;

-- DROP FUNCTION public.geometry_gist_union_nd(bytea, internal);

CREATE OR REPLACE FUNCTION public.geometry_gist_union_nd(bytea, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_union$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gist_union_nd(bytea, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gist_union_nd(bytea, internal) TO postgres;

-- DROP FUNCTION public.geometry_gt(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_gt(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_gt$function$
;

-- Permissions

ALTER FUNCTION public.geometry_gt(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_gt(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_hash(geometry);

CREATE OR REPLACE FUNCTION public.geometry_hash(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_hash$function$
;

-- Permissions

ALTER FUNCTION public.geometry_hash(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_hash(geometry) TO postgres;

-- DROP FUNCTION public.geometry_in(cstring);

CREATE OR REPLACE FUNCTION public.geometry_in(cstring)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_in$function$
;

-- Permissions

ALTER FUNCTION public.geometry_in(cstring) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_in(cstring) TO postgres;

-- DROP FUNCTION public.geometry_le(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_le(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_le$function$
;

-- Permissions

ALTER FUNCTION public.geometry_le(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_le(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_left(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_left(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_left_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_left(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_left(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_lt(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_lt(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_lt$function$
;

-- Permissions

ALTER FUNCTION public.geometry_lt(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_lt(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_neq(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_neq(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_neq$function$
;

-- Permissions

ALTER FUNCTION public.geometry_neq(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_neq(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_out(geometry);

CREATE OR REPLACE FUNCTION public.geometry_out(geometry)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_out$function$
;

-- Permissions

ALTER FUNCTION public.geometry_out(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_out(geometry) TO postgres;

-- DROP FUNCTION public.geometry_overabove(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_overabove(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overabove_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_overabove(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_overabove(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_overbelow(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_overbelow(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overbelow_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_overbelow(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_overbelow(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_overlaps(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_overlaps(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overlaps_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_overlaps(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_overlaps(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_overlaps_3d(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_overlaps_3d(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overlaps_3d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_overlaps_3d(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_overlaps_3d(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_overlaps_nd(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_overlaps_nd(geometry, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overlaps$function$
;

-- Permissions

ALTER FUNCTION public.geometry_overlaps_nd(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_overlaps_nd(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_overleft(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_overleft(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overleft_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_overleft(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_overleft(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_overright(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_overright(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overright_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_overright(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_overright(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_recv(internal);

CREATE OR REPLACE FUNCTION public.geometry_recv(internal)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_recv$function$
;

-- Permissions

ALTER FUNCTION public.geometry_recv(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_recv(internal) TO postgres;

-- DROP FUNCTION public.geometry_right(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_right(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_right_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_right(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_right(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_same(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_same(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_same_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_same(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_same(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_same_3d(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_same_3d(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_same_3d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_same_3d(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_same_3d(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_same_nd(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_same_nd(geometry, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_same$function$
;

-- Permissions

ALTER FUNCTION public.geometry_same_nd(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_same_nd(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_send(geometry);

CREATE OR REPLACE FUNCTION public.geometry_send(geometry)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_send$function$
;

-- Permissions

ALTER FUNCTION public.geometry_send(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_send(geometry) TO postgres;

-- DROP FUNCTION public.geometry_sortsupport(internal);

CREATE OR REPLACE FUNCTION public.geometry_sortsupport(internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_sortsupport$function$
;

-- Permissions

ALTER FUNCTION public.geometry_sortsupport(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_sortsupport(internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_choose_2d(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_choose_2d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_choose_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_choose_2d(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_choose_2d(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_choose_3d(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_choose_3d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_choose_3d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_choose_3d(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_choose_3d(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_choose_nd(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_choose_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_choose_nd$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_choose_nd(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_choose_nd(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_compress_2d(internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_compress_2d(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_compress_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_compress_2d(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_compress_2d(internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_compress_3d(internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_compress_3d(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_compress_3d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_compress_3d(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_compress_3d(internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_compress_nd(internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_compress_nd(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_compress_nd$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_compress_nd(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_compress_nd(internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_config_2d(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_config_2d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_config_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_config_2d(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_config_2d(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_config_3d(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_config_3d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_config_3d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_config_3d(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_config_3d(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_config_nd(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_config_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_config_nd$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_config_nd(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_config_nd(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_inner_consistent_2d(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_inner_consistent_2d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_inner_consistent_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_inner_consistent_2d(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_inner_consistent_2d(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_inner_consistent_3d(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_inner_consistent_3d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_inner_consistent_3d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_inner_consistent_3d(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_inner_consistent_3d(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_inner_consistent_nd(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_inner_consistent_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_inner_consistent_nd$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_inner_consistent_nd(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_inner_consistent_nd(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_leaf_consistent_2d(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_leaf_consistent_2d(internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_leaf_consistent_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_leaf_consistent_2d(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_leaf_consistent_2d(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_leaf_consistent_3d(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_leaf_consistent_3d(internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_leaf_consistent_3d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_leaf_consistent_3d(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_leaf_consistent_3d(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_leaf_consistent_nd(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_leaf_consistent_nd(internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_leaf_consistent_nd$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_leaf_consistent_nd(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_leaf_consistent_nd(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_picksplit_2d(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_picksplit_2d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_picksplit_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_picksplit_2d(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_picksplit_2d(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_picksplit_3d(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_picksplit_3d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_picksplit_3d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_picksplit_3d(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_picksplit_3d(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_spgist_picksplit_nd(internal, internal);

CREATE OR REPLACE FUNCTION public.geometry_spgist_picksplit_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_picksplit_nd$function$
;

-- Permissions

ALTER FUNCTION public.geometry_spgist_picksplit_nd(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_spgist_picksplit_nd(internal, internal) TO postgres;

-- DROP FUNCTION public.geometry_typmod_in(_cstring);

CREATE OR REPLACE FUNCTION public.geometry_typmod_in(cstring[])
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_typmod_in$function$
;

-- Permissions

ALTER FUNCTION public.geometry_typmod_in(_cstring) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_typmod_in(_cstring) TO postgres;

-- DROP FUNCTION public.geometry_typmod_out(int4);

CREATE OR REPLACE FUNCTION public.geometry_typmod_out(integer)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_typmod_out$function$
;

-- Permissions

ALTER FUNCTION public.geometry_typmod_out(int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_typmod_out(int4) TO postgres;

-- DROP FUNCTION public.geometry_within(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_within(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_within_2d$function$
;

-- Permissions

ALTER FUNCTION public.geometry_within(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_within(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometry_within_nd(geometry, geometry);

CREATE OR REPLACE FUNCTION public.geometry_within_nd(geometry, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_within$function$
;

-- Permissions

ALTER FUNCTION public.geometry_within_nd(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometry_within_nd(geometry, geometry) TO postgres;

-- DROP FUNCTION public.geometrytype(geometry);

CREATE OR REPLACE FUNCTION public.geometrytype(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_getTYPE$function$
;

-- Permissions

ALTER FUNCTION public.geometrytype(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometrytype(geometry) TO postgres;

-- DROP FUNCTION public.geometrytype(geography);

CREATE OR REPLACE FUNCTION public.geometrytype(geography)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_getTYPE$function$
;

-- Permissions

ALTER FUNCTION public.geometrytype(geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geometrytype(geography) TO postgres;

-- DROP FUNCTION public.geomfromewkb(bytea);

CREATE OR REPLACE FUNCTION public.geomfromewkb(bytea)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOMFromEWKB$function$
;

-- Permissions

ALTER FUNCTION public.geomfromewkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geomfromewkb(bytea) TO postgres;

-- DROP FUNCTION public.geomfromewkt(text);

CREATE OR REPLACE FUNCTION public.geomfromewkt(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$parse_WKT_lwgeom$function$
;

-- Permissions

ALTER FUNCTION public.geomfromewkt(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.geomfromewkt(text) TO postgres;

-- DROP FUNCTION public.get_manager_for_user(int4);

CREATE OR REPLACE FUNCTION public.get_manager_for_user(p_user_id integer)
 RETURNS TABLE(manager_id integer, manager_name character varying, manager_role_code character varying)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        t.manager_id,
        u.name,
        r.code
    FROM efiling_user_teams t
    JOIN efiling_users eu ON t.manager_id = eu.id
    JOIN users u ON eu.user_id = u.id
    LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
    WHERE t.team_member_id = p_user_id 
    AND t.is_active = true
    AND eu.is_active = true
    LIMIT 1;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.get_manager_for_user(int4) OWNER TO root;
GRANT ALL ON FUNCTION public.get_manager_for_user(int4) TO public;
GRANT ALL ON FUNCTION public.get_manager_for_user(int4) TO root;

-- DROP FUNCTION public.get_proj4_from_srid(int4);

CREATE OR REPLACE FUNCTION public.get_proj4_from_srid(integer)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
	BEGIN
	RETURN proj4text::text FROM public.spatial_ref_sys WHERE srid= $1;
	END;
	$function$
;

-- Permissions

ALTER FUNCTION public.get_proj4_from_srid(int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_proj4_from_srid(int4) TO postgres;

-- DROP FUNCTION public.get_team_members(int4);

CREATE OR REPLACE FUNCTION public.get_team_members(p_manager_id integer)
 RETURNS TABLE(team_member_id integer, team_member_name character varying, team_role character varying, role_code character varying)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        t.team_member_id,
        u.name,
        t.team_role,
        r.code
    FROM efiling_user_teams t
    JOIN efiling_users eu ON t.team_member_id = eu.id
    JOIN users u ON eu.user_id = u.id
    LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
    WHERE t.manager_id = p_manager_id 
    AND t.is_active = true
    AND eu.is_active = true;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.get_team_members(int4) OWNER TO root;
GRANT ALL ON FUNCTION public.get_team_members(int4) TO public;
GRANT ALL ON FUNCTION public.get_team_members(int4) TO root;

-- DROP FUNCTION public.gidx_in(cstring);

CREATE OR REPLACE FUNCTION public.gidx_in(cstring)
 RETURNS gidx
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gidx_in$function$
;

-- Permissions

ALTER FUNCTION public.gidx_in(cstring) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gidx_in(cstring) TO postgres;

-- DROP FUNCTION public.gidx_out(gidx);

CREATE OR REPLACE FUNCTION public.gidx_out(gidx)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gidx_out$function$
;

-- Permissions

ALTER FUNCTION public.gidx_out(gidx) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gidx_out(gidx) TO postgres;

-- DROP FUNCTION public.gserialized_gist_joinsel_2d(internal, oid, internal, int2);

CREATE OR REPLACE FUNCTION public.gserialized_gist_joinsel_2d(internal, oid, internal, smallint)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_joinsel_2d$function$
;

-- Permissions

ALTER FUNCTION public.gserialized_gist_joinsel_2d(internal, oid, internal, int2) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gserialized_gist_joinsel_2d(internal, oid, internal, int2) TO postgres;

-- DROP FUNCTION public.gserialized_gist_joinsel_nd(internal, oid, internal, int2);

CREATE OR REPLACE FUNCTION public.gserialized_gist_joinsel_nd(internal, oid, internal, smallint)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_joinsel_nd$function$
;

-- Permissions

ALTER FUNCTION public.gserialized_gist_joinsel_nd(internal, oid, internal, int2) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gserialized_gist_joinsel_nd(internal, oid, internal, int2) TO postgres;

-- DROP FUNCTION public.gserialized_gist_sel_2d(internal, oid, internal, int4);

CREATE OR REPLACE FUNCTION public.gserialized_gist_sel_2d(internal, oid, internal, integer)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_sel_2d$function$
;

-- Permissions

ALTER FUNCTION public.gserialized_gist_sel_2d(internal, oid, internal, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gserialized_gist_sel_2d(internal, oid, internal, int4) TO postgres;

-- DROP FUNCTION public.gserialized_gist_sel_nd(internal, oid, internal, int4);

CREATE OR REPLACE FUNCTION public.gserialized_gist_sel_nd(internal, oid, internal, integer)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_sel_nd$function$
;

-- Permissions

ALTER FUNCTION public.gserialized_gist_sel_nd(internal, oid, internal, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gserialized_gist_sel_nd(internal, oid, internal, int4) TO postgres;

-- DROP FUNCTION public.increment_template_usage(int4);

CREATE OR REPLACE FUNCTION public.increment_template_usage(p_template_id integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE public.efiling_templates
    SET usage_count = COALESCE(usage_count, 0) + 1,
        last_used_at = CURRENT_TIMESTAMP
    WHERE id = p_template_id;
END;
$function$
;

COMMENT ON FUNCTION public.increment_template_usage(int4) IS 'Increments usage count and updates last_used_at when a template is used';

-- Permissions

ALTER FUNCTION public.increment_template_usage(int4) OWNER TO root;
GRANT ALL ON FUNCTION public.increment_template_usage(int4) TO root;

-- DROP FUNCTION public.initialize_existing_file_states();

CREATE OR REPLACE FUNCTION public.initialize_existing_file_states()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    file_record RECORD;
    state_id INTEGER;
    creator_id_val INTEGER;
BEGIN
    FOR file_record IN 
        SELECT id, created_by, assigned_to 
        FROM efiling_files 
        WHERE workflow_state_id IS NULL
    LOOP
        -- Skip files without creator or assigned_to
        IF file_record.created_by IS NULL AND file_record.assigned_to IS NULL THEN
            CONTINUE;
        END IF;
        
        -- Use created_by if available, otherwise use assigned_to as creator
        creator_id_val := COALESCE(file_record.created_by, file_record.assigned_to);
        
        INSERT INTO efiling_file_workflow_states (
            file_id, 
            creator_id, 
            current_assigned_to,
            current_state,
            is_within_team,
            tat_started
        ) VALUES (
            file_record.id,
            creator_id_val,
            COALESCE(file_record.assigned_to, creator_id_val),
            'TEAM_INTERNAL',
            true,
            false
        )
        ON CONFLICT (file_id) DO NOTHING
        RETURNING id INTO state_id;
        
        IF state_id IS NOT NULL THEN
            UPDATE efiling_files
            SET workflow_state_id = state_id
            WHERE id = file_record.id;
        END IF;
    END LOOP;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.initialize_existing_file_states() OWNER TO root;
GRANT ALL ON FUNCTION public.initialize_existing_file_states() TO root;

-- DROP FUNCTION public.is_contained_2d(box2df, geometry);

CREATE OR REPLACE FUNCTION public.is_contained_2d(box2df, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_within_box2df_geom_2d$function$
;

-- Permissions

ALTER FUNCTION public.is_contained_2d(box2df, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.is_contained_2d(box2df, geometry) TO postgres;

-- DROP FUNCTION public.is_contained_2d(geometry, box2df);

CREATE OR REPLACE FUNCTION public.is_contained_2d(geometry, box2df)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
AS $function$SELECT $2 OPERATOR(public.~) $1;$function$
;

-- Permissions

ALTER FUNCTION public.is_contained_2d(geometry, box2df) OWNER TO postgres;
GRANT ALL ON FUNCTION public.is_contained_2d(geometry, box2df) TO postgres;

-- DROP FUNCTION public.is_contained_2d(box2df, box2df);

CREATE OR REPLACE FUNCTION public.is_contained_2d(box2df, box2df)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_box2df_box2df_2d$function$
;

-- Permissions

ALTER FUNCTION public.is_contained_2d(box2df, box2df) OWNER TO postgres;
GRANT ALL ON FUNCTION public.is_contained_2d(box2df, box2df) TO postgres;

-- DROP FUNCTION public.is_team_member(int4, int4);

CREATE OR REPLACE FUNCTION public.is_team_member(p_manager_id integer, p_user_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM efiling_user_teams 
        WHERE manager_id = p_manager_id 
        AND team_member_id = p_user_id 
        AND is_active = true
    );
END;
$function$
;

-- Permissions

ALTER FUNCTION public.is_team_member(int4, int4) OWNER TO root;
GRANT ALL ON FUNCTION public.is_team_member(int4, int4) TO public;
GRANT ALL ON FUNCTION public.is_team_member(int4, int4) TO root;

-- DROP FUNCTION public."json"(geometry);

CREATE OR REPLACE FUNCTION public.json(geometry)
 RETURNS json
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geometry_to_json$function$
;

-- Permissions

ALTER FUNCTION public."json"(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public."json"(geometry) TO postgres;

-- DROP FUNCTION public."jsonb"(geometry);

CREATE OR REPLACE FUNCTION public.jsonb(geometry)
 RETURNS jsonb
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geometry_to_jsonb$function$
;

-- Permissions

ALTER FUNCTION public."jsonb"(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public."jsonb"(geometry) TO postgres;

-- DROP FUNCTION public.log_security_event(varchar, int4, inet, jsonb, varchar, text, varchar);

CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type character varying, p_user_id integer, p_ip_address inet, p_details jsonb, p_severity character varying DEFAULT 'INFO'::character varying, p_user_agent text DEFAULT NULL::text, p_session_id character varying DEFAULT NULL::character varying)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_event_id INTEGER;
BEGIN
    INSERT INTO public.security_events (
        event_type, user_id, ip_address, details, severity, 
        user_agent, session_id, timestamp
    ) VALUES (
        p_event_type, p_user_id, p_ip_address, p_details, p_severity,
        p_user_agent, p_session_id, CURRENT_TIMESTAMP
    ) RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.log_security_event(varchar, int4, inet, jsonb, varchar, text, varchar) OWNER TO root;
GRANT ALL ON FUNCTION public.log_security_event(varchar, int4, inet, jsonb, varchar, text, varchar) TO root;

-- DROP FUNCTION public.overlaps_2d(box2df, box2df);

CREATE OR REPLACE FUNCTION public.overlaps_2d(box2df, box2df)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_box2df_box2df_2d$function$
;

-- Permissions

ALTER FUNCTION public.overlaps_2d(box2df, box2df) OWNER TO postgres;
GRANT ALL ON FUNCTION public.overlaps_2d(box2df, box2df) TO postgres;

-- DROP FUNCTION public.overlaps_2d(geometry, box2df);

CREATE OR REPLACE FUNCTION public.overlaps_2d(geometry, box2df)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
AS $function$SELECT $2 OPERATOR(public.&&) $1;$function$
;

-- Permissions

ALTER FUNCTION public.overlaps_2d(geometry, box2df) OWNER TO postgres;
GRANT ALL ON FUNCTION public.overlaps_2d(geometry, box2df) TO postgres;

-- DROP FUNCTION public.overlaps_2d(box2df, geometry);

CREATE OR REPLACE FUNCTION public.overlaps_2d(box2df, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overlaps_box2df_geom_2d$function$
;

-- Permissions

ALTER FUNCTION public.overlaps_2d(box2df, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.overlaps_2d(box2df, geometry) TO postgres;

-- DROP FUNCTION public.overlaps_geog(gidx, gidx);

CREATE OR REPLACE FUNCTION public.overlaps_geog(gidx, gidx)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/postgis-3', $function$gserialized_gidx_gidx_overlaps$function$
;

-- Permissions

ALTER FUNCTION public.overlaps_geog(gidx, gidx) OWNER TO postgres;
GRANT ALL ON FUNCTION public.overlaps_geog(gidx, gidx) TO postgres;

-- DROP FUNCTION public.overlaps_geog(gidx, geography);

CREATE OR REPLACE FUNCTION public.overlaps_geog(gidx, geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/postgis-3', $function$gserialized_gidx_geog_overlaps$function$
;

-- Permissions

ALTER FUNCTION public.overlaps_geog(gidx, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.overlaps_geog(gidx, geography) TO postgres;

-- DROP FUNCTION public.overlaps_geog(geography, gidx);

CREATE OR REPLACE FUNCTION public.overlaps_geog(geography, gidx)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$SELECT $2 OPERATOR(public.&&) $1;$function$
;

-- Permissions

ALTER FUNCTION public.overlaps_geog(geography, gidx) OWNER TO postgres;
GRANT ALL ON FUNCTION public.overlaps_geog(geography, gidx) TO postgres;

-- DROP FUNCTION public.overlaps_nd(gidx, geometry);

CREATE OR REPLACE FUNCTION public.overlaps_nd(gidx, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_gidx_geom_overlaps$function$
;

-- Permissions

ALTER FUNCTION public.overlaps_nd(gidx, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.overlaps_nd(gidx, geometry) TO postgres;

-- DROP FUNCTION public.overlaps_nd(geometry, gidx);

CREATE OR REPLACE FUNCTION public.overlaps_nd(geometry, gidx)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
AS $function$SELECT $2 OPERATOR(public.&&&) $1;$function$
;

-- Permissions

ALTER FUNCTION public.overlaps_nd(geometry, gidx) OWNER TO postgres;
GRANT ALL ON FUNCTION public.overlaps_nd(geometry, gidx) TO postgres;

-- DROP FUNCTION public.overlaps_nd(gidx, gidx);

CREATE OR REPLACE FUNCTION public.overlaps_nd(gidx, gidx)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_gidx_gidx_overlaps$function$
;

-- Permissions

ALTER FUNCTION public.overlaps_nd(gidx, gidx) OWNER TO postgres;
GRANT ALL ON FUNCTION public.overlaps_nd(gidx, gidx) TO postgres;

-- DROP FUNCTION public."path"(geometry);

CREATE OR REPLACE FUNCTION public.path(geometry)
 RETURNS path
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_to_path$function$
;

-- Permissions

ALTER FUNCTION public."path"(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public."path"(geometry) TO postgres;

-- DROP FUNCTION public.pgis_asflatgeobuf_finalfn(internal);

CREATE OR REPLACE FUNCTION public.pgis_asflatgeobuf_finalfn(internal)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_asflatgeobuf_finalfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asflatgeobuf_finalfn(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asflatgeobuf_finalfn(internal) TO postgres;

-- DROP FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement);

CREATE OR REPLACE FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_asflatgeobuf_transfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement) TO postgres;

-- DROP FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement, bool);

CREATE OR REPLACE FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement, boolean)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_asflatgeobuf_transfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement, bool) TO postgres;

-- DROP FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement, bool, text);

CREATE OR REPLACE FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement, boolean, text)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_asflatgeobuf_transfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement, bool, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement, bool, text) TO postgres;

-- DROP FUNCTION public.pgis_asgeobuf_finalfn(internal);

CREATE OR REPLACE FUNCTION public.pgis_asgeobuf_finalfn(internal)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_asgeobuf_finalfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asgeobuf_finalfn(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asgeobuf_finalfn(internal) TO postgres;

-- DROP FUNCTION public.pgis_asgeobuf_transfn(internal, anyelement);

CREATE OR REPLACE FUNCTION public.pgis_asgeobuf_transfn(internal, anyelement)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_asgeobuf_transfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asgeobuf_transfn(internal, anyelement) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asgeobuf_transfn(internal, anyelement) TO postgres;

-- DROP FUNCTION public.pgis_asgeobuf_transfn(internal, anyelement, text);

CREATE OR REPLACE FUNCTION public.pgis_asgeobuf_transfn(internal, anyelement, text)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_asgeobuf_transfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asgeobuf_transfn(internal, anyelement, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asgeobuf_transfn(internal, anyelement, text) TO postgres;

-- DROP FUNCTION public.pgis_asmvt_combinefn(internal, internal);

CREATE OR REPLACE FUNCTION public.pgis_asmvt_combinefn(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_asmvt_combinefn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asmvt_combinefn(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asmvt_combinefn(internal, internal) TO postgres;

-- DROP FUNCTION public.pgis_asmvt_deserialfn(bytea, internal);

CREATE OR REPLACE FUNCTION public.pgis_asmvt_deserialfn(bytea, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_asmvt_deserialfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asmvt_deserialfn(bytea, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asmvt_deserialfn(bytea, internal) TO postgres;

-- DROP FUNCTION public.pgis_asmvt_finalfn(internal);

CREATE OR REPLACE FUNCTION public.pgis_asmvt_finalfn(internal)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_asmvt_finalfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asmvt_finalfn(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asmvt_finalfn(internal) TO postgres;

-- DROP FUNCTION public.pgis_asmvt_serialfn(internal);

CREATE OR REPLACE FUNCTION public.pgis_asmvt_serialfn(internal)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_asmvt_serialfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asmvt_serialfn(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asmvt_serialfn(internal) TO postgres;

-- DROP FUNCTION public.pgis_asmvt_transfn(internal, anyelement);

CREATE OR REPLACE FUNCTION public.pgis_asmvt_transfn(internal, anyelement)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_asmvt_transfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asmvt_transfn(internal, anyelement) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asmvt_transfn(internal, anyelement) TO postgres;

-- DROP FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, int4, text);

CREATE OR REPLACE FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, integer, text)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_asmvt_transfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, int4, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, int4, text) TO postgres;

-- DROP FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, int4);

CREATE OR REPLACE FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, integer)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_asmvt_transfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, int4) TO postgres;

-- DROP FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, int4, text, text);

CREATE OR REPLACE FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, integer, text, text)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_asmvt_transfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, int4, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, int4, text, text) TO postgres;

-- DROP FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text);

CREATE OR REPLACE FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_asmvt_transfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text) TO postgres;

-- DROP FUNCTION public.pgis_geometry_accum_transfn(internal, geometry);

CREATE OR REPLACE FUNCTION public.pgis_geometry_accum_transfn(internal, geometry)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_geometry_accum_transfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_geometry_accum_transfn(internal, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_geometry_accum_transfn(internal, geometry) TO postgres;

-- DROP FUNCTION public.pgis_geometry_accum_transfn(internal, geometry, float8, int4);

CREATE OR REPLACE FUNCTION public.pgis_geometry_accum_transfn(internal, geometry, double precision, integer)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_geometry_accum_transfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_geometry_accum_transfn(internal, geometry, float8, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_geometry_accum_transfn(internal, geometry, float8, int4) TO postgres;

-- DROP FUNCTION public.pgis_geometry_accum_transfn(internal, geometry, float8);

CREATE OR REPLACE FUNCTION public.pgis_geometry_accum_transfn(internal, geometry, double precision)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_geometry_accum_transfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_geometry_accum_transfn(internal, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_geometry_accum_transfn(internal, geometry, float8) TO postgres;

-- DROP FUNCTION public.pgis_geometry_clusterintersecting_finalfn(internal);

CREATE OR REPLACE FUNCTION public.pgis_geometry_clusterintersecting_finalfn(internal)
 RETURNS geometry[]
 LANGUAGE c
 PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_geometry_clusterintersecting_finalfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_geometry_clusterintersecting_finalfn(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_geometry_clusterintersecting_finalfn(internal) TO postgres;

-- DROP FUNCTION public.pgis_geometry_clusterwithin_finalfn(internal);

CREATE OR REPLACE FUNCTION public.pgis_geometry_clusterwithin_finalfn(internal)
 RETURNS geometry[]
 LANGUAGE c
 PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_geometry_clusterwithin_finalfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_geometry_clusterwithin_finalfn(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_geometry_clusterwithin_finalfn(internal) TO postgres;

-- DROP FUNCTION public.pgis_geometry_collect_finalfn(internal);

CREATE OR REPLACE FUNCTION public.pgis_geometry_collect_finalfn(internal)
 RETURNS geometry
 LANGUAGE c
 PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_geometry_collect_finalfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_geometry_collect_finalfn(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_geometry_collect_finalfn(internal) TO postgres;

-- DROP FUNCTION public.pgis_geometry_coverageunion_finalfn(internal);

CREATE OR REPLACE FUNCTION public.pgis_geometry_coverageunion_finalfn(internal)
 RETURNS geometry
 LANGUAGE c
 PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_geometry_coverageunion_finalfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_geometry_coverageunion_finalfn(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_geometry_coverageunion_finalfn(internal) TO postgres;

-- DROP FUNCTION public.pgis_geometry_makeline_finalfn(internal);

CREATE OR REPLACE FUNCTION public.pgis_geometry_makeline_finalfn(internal)
 RETURNS geometry
 LANGUAGE c
 PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_geometry_makeline_finalfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_geometry_makeline_finalfn(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_geometry_makeline_finalfn(internal) TO postgres;

-- DROP FUNCTION public.pgis_geometry_polygonize_finalfn(internal);

CREATE OR REPLACE FUNCTION public.pgis_geometry_polygonize_finalfn(internal)
 RETURNS geometry
 LANGUAGE c
 PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_geometry_polygonize_finalfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_geometry_polygonize_finalfn(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_geometry_polygonize_finalfn(internal) TO postgres;

-- DROP FUNCTION public.pgis_geometry_union_parallel_combinefn(internal, internal);

CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_combinefn(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_combinefn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_geometry_union_parallel_combinefn(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_geometry_union_parallel_combinefn(internal, internal) TO postgres;

-- DROP FUNCTION public.pgis_geometry_union_parallel_deserialfn(bytea, internal);

CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_deserialfn(bytea, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_deserialfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_geometry_union_parallel_deserialfn(bytea, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_geometry_union_parallel_deserialfn(bytea, internal) TO postgres;

-- DROP FUNCTION public.pgis_geometry_union_parallel_finalfn(internal);

CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_finalfn(internal)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_finalfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_geometry_union_parallel_finalfn(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_geometry_union_parallel_finalfn(internal) TO postgres;

-- DROP FUNCTION public.pgis_geometry_union_parallel_serialfn(internal);

CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_serialfn(internal)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_serialfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_geometry_union_parallel_serialfn(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_geometry_union_parallel_serialfn(internal) TO postgres;

-- DROP FUNCTION public.pgis_geometry_union_parallel_transfn(internal, geometry);

CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_transfn(internal, geometry)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_transfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_geometry_union_parallel_transfn(internal, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_geometry_union_parallel_transfn(internal, geometry) TO postgres;

-- DROP FUNCTION public.pgis_geometry_union_parallel_transfn(internal, geometry, float8);

CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_transfn(internal, geometry, double precision)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_transfn$function$
;

-- Permissions

ALTER FUNCTION public.pgis_geometry_union_parallel_transfn(internal, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgis_geometry_union_parallel_transfn(internal, geometry, float8) TO postgres;

-- DROP FUNCTION public.point(geometry);

CREATE OR REPLACE FUNCTION public.point(geometry)
 RETURNS point
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_to_point$function$
;

-- Permissions

ALTER FUNCTION public.point(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.point(geometry) TO postgres;

-- DROP FUNCTION public.polygon(geometry);

CREATE OR REPLACE FUNCTION public.polygon(geometry)
 RETURNS polygon
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_to_polygon$function$
;

-- Permissions

ALTER FUNCTION public.polygon(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.polygon(geometry) TO postgres;

-- DROP FUNCTION public.populate_geometry_columns(oid, bool);

CREATE OR REPLACE FUNCTION public.populate_geometry_columns(tbl_oid oid, use_typmod boolean DEFAULT true)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
	gcs		 RECORD;
	gc		  RECORD;
	gc_old	  RECORD;
	gsrid	   integer;
	gndims	  integer;
	gtype	   text;
	query	   text;
	gc_is_valid boolean;
	inserted	integer;
	constraint_successful boolean := false;

BEGIN
	inserted := 0;

	-- Iterate through all geometry columns in this table
	FOR gcs IN
	SELECT n.nspname, c.relname, a.attname, c.relkind
		FROM pg_class c,
			 pg_attribute a,
			 pg_type t,
			 pg_namespace n
		WHERE c.relkind IN('r', 'f', 'p')
		AND t.typname = 'geometry'
		AND a.attisdropped = false
		AND a.atttypid = t.oid
		AND a.attrelid = c.oid
		AND c.relnamespace = n.oid
		AND n.nspname NOT ILIKE 'pg_temp%'
		AND c.oid = tbl_oid
	LOOP

		RAISE DEBUG 'Processing column %.%.%', gcs.nspname, gcs.relname, gcs.attname;

		gc_is_valid := true;
		-- Find the srid, coord_dimension, and type of current geometry
		-- in geometry_columns -- which is now a view

		SELECT type, srid, coord_dimension, gcs.relkind INTO gc_old
			FROM geometry_columns
			WHERE f_table_schema = gcs.nspname AND f_table_name = gcs.relname AND f_geometry_column = gcs.attname;

		IF upper(gc_old.type) = 'GEOMETRY' THEN
		-- This is an unconstrained geometry we need to do something
		-- We need to figure out what to set the type by inspecting the data
			EXECUTE 'SELECT public.ST_srid(' || quote_ident(gcs.attname) || ') As srid, public.GeometryType(' || quote_ident(gcs.attname) || ') As type, public.ST_NDims(' || quote_ident(gcs.attname) || ') As dims ' ||
					 ' FROM ONLY ' || quote_ident(gcs.nspname) || '.' || quote_ident(gcs.relname) ||
					 ' WHERE ' || quote_ident(gcs.attname) || ' IS NOT NULL LIMIT 1;'
				INTO gc;
			IF gc IS NULL THEN -- there is no data so we can not determine geometry type
				RAISE WARNING 'No data in table %.%, so no information to determine geometry type and srid', gcs.nspname, gcs.relname;
				RETURN 0;
			END IF;
			gsrid := gc.srid; gtype := gc.type; gndims := gc.dims;

			IF use_typmod THEN
				BEGIN
					EXECUTE 'ALTER TABLE ' || quote_ident(gcs.nspname) || '.' || quote_ident(gcs.relname) || ' ALTER COLUMN ' || quote_ident(gcs.attname) ||
						' TYPE geometry(' || postgis_type_name(gtype, gndims, true) || ', ' || gsrid::text  || ') ';
					inserted := inserted + 1;
				EXCEPTION
						WHEN invalid_parameter_value OR feature_not_supported THEN
						RAISE WARNING 'Could not convert ''%'' in ''%.%'' to use typmod with srid %, type %: %', quote_ident(gcs.attname), quote_ident(gcs.nspname), quote_ident(gcs.relname), gsrid, postgis_type_name(gtype, gndims, true), SQLERRM;
							gc_is_valid := false;
				END;

			ELSE
				-- Try to apply srid check to column
				constraint_successful = false;
				IF (gsrid > 0 AND postgis_constraint_srid(gcs.nspname, gcs.relname,gcs.attname) IS NULL ) THEN
					BEGIN
						EXECUTE 'ALTER TABLE ONLY ' || quote_ident(gcs.nspname) || '.' || quote_ident(gcs.relname) ||
								 ' ADD CONSTRAINT ' || quote_ident('enforce_srid_' || gcs.attname) ||
								 ' CHECK (ST_srid(' || quote_ident(gcs.attname) || ') = ' || gsrid || ')';
						constraint_successful := true;
					EXCEPTION
						WHEN check_violation THEN
							RAISE WARNING 'Not inserting ''%'' in ''%.%'' into geometry_columns: could not apply constraint CHECK (st_srid(%) = %)', quote_ident(gcs.attname), quote_ident(gcs.nspname), quote_ident(gcs.relname), quote_ident(gcs.attname), gsrid;
							gc_is_valid := false;
					END;
				END IF;

				-- Try to apply ndims check to column
				IF (gndims IS NOT NULL AND postgis_constraint_dims(gcs.nspname, gcs.relname,gcs.attname) IS NULL ) THEN
					BEGIN
						EXECUTE 'ALTER TABLE ONLY ' || quote_ident(gcs.nspname) || '.' || quote_ident(gcs.relname) || '
								 ADD CONSTRAINT ' || quote_ident('enforce_dims_' || gcs.attname) || '
								 CHECK (st_ndims(' || quote_ident(gcs.attname) || ') = '||gndims||')';
						constraint_successful := true;
					EXCEPTION
						WHEN check_violation THEN
							RAISE WARNING 'Not inserting ''%'' in ''%.%'' into geometry_columns: could not apply constraint CHECK (st_ndims(%) = %)', quote_ident(gcs.attname), quote_ident(gcs.nspname), quote_ident(gcs.relname), quote_ident(gcs.attname), gndims;
							gc_is_valid := false;
					END;
				END IF;

				-- Try to apply geometrytype check to column
				IF (gtype IS NOT NULL AND postgis_constraint_type(gcs.nspname, gcs.relname,gcs.attname) IS NULL ) THEN
					BEGIN
						EXECUTE 'ALTER TABLE ONLY ' || quote_ident(gcs.nspname) || '.' || quote_ident(gcs.relname) || '
						ADD CONSTRAINT ' || quote_ident('enforce_geotype_' || gcs.attname) || '
						CHECK (geometrytype(' || quote_ident(gcs.attname) || ') = ' || quote_literal(gtype) || ')';
						constraint_successful := true;
					EXCEPTION
						WHEN check_violation THEN
							-- No geometry check can be applied. This column contains a number of geometry types.
							RAISE WARNING 'Could not add geometry type check (%) to table column: %.%.%', gtype, quote_ident(gcs.nspname),quote_ident(gcs.relname),quote_ident(gcs.attname);
					END;
				END IF;
				 --only count if we were successful in applying at least one constraint
				IF constraint_successful THEN
					inserted := inserted + 1;
				END IF;
			END IF;
		END IF;

	END LOOP;

	RETURN inserted;
END

$function$
;

-- Permissions

ALTER FUNCTION public.populate_geometry_columns(oid, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.populate_geometry_columns(oid, bool) TO postgres;

-- DROP FUNCTION public.populate_geometry_columns(bool);

CREATE OR REPLACE FUNCTION public.populate_geometry_columns(use_typmod boolean DEFAULT true)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
	inserted	integer;
	oldcount	integer;
	probed	  integer;
	stale	   integer;
	gcs		 RECORD;
	gc		  RECORD;
	gsrid	   integer;
	gndims	  integer;
	gtype	   text;
	query	   text;
	gc_is_valid boolean;

BEGIN
	SELECT count(*) INTO oldcount FROM public.geometry_columns;
	inserted := 0;

	-- Count the number of geometry columns in all tables and views
	SELECT count(DISTINCT c.oid) INTO probed
	FROM pg_class c,
		 pg_attribute a,
		 pg_type t,
		 pg_namespace n
	WHERE c.relkind IN('r','v','f', 'p')
		AND t.typname = 'geometry'
		AND a.attisdropped = false
		AND a.atttypid = t.oid
		AND a.attrelid = c.oid
		AND c.relnamespace = n.oid
		AND n.nspname NOT ILIKE 'pg_temp%' AND c.relname != 'raster_columns' ;

	-- Iterate through all non-dropped geometry columns
	RAISE DEBUG 'Processing Tables.....';

	FOR gcs IN
	SELECT DISTINCT ON (c.oid) c.oid, n.nspname, c.relname
		FROM pg_class c,
			 pg_attribute a,
			 pg_type t,
			 pg_namespace n
		WHERE c.relkind IN( 'r', 'f', 'p')
		AND t.typname = 'geometry'
		AND a.attisdropped = false
		AND a.atttypid = t.oid
		AND a.attrelid = c.oid
		AND c.relnamespace = n.oid
		AND n.nspname NOT ILIKE 'pg_temp%' AND c.relname != 'raster_columns'
	LOOP

		inserted := inserted + public.populate_geometry_columns(gcs.oid, use_typmod);
	END LOOP;

	IF oldcount > inserted THEN
		stale = oldcount-inserted;
	ELSE
		stale = 0;
	END IF;

	RETURN 'probed:' ||probed|| ' inserted:'||inserted;
END

$function$
;

-- Permissions

ALTER FUNCTION public.populate_geometry_columns(bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.populate_geometry_columns(bool) TO postgres;

-- DROP FUNCTION public.postgis_addbbox(geometry);

CREATE OR REPLACE FUNCTION public.postgis_addbbox(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_addBBOX$function$
;

-- Permissions

ALTER FUNCTION public.postgis_addbbox(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_addbbox(geometry) TO postgres;

-- DROP FUNCTION public.postgis_cache_bbox();

CREATE OR REPLACE FUNCTION public.postgis_cache_bbox()
 RETURNS trigger
 LANGUAGE c
AS '$libdir/postgis-3', $function$cache_bbox$function$
;

-- Permissions

ALTER FUNCTION public.postgis_cache_bbox() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_cache_bbox() TO postgres;

-- DROP FUNCTION public.postgis_constraint_dims(text, text, text);

CREATE OR REPLACE FUNCTION public.postgis_constraint_dims(geomschema text, geomtable text, geomcolumn text)
 RETURNS integer
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT COST 250
AS $function$
SELECT  replace(split_part(s.consrc, ' = ', 2), ')', '')::integer
		 FROM pg_class c, pg_namespace n, pg_attribute a
		 , (SELECT connamespace, conrelid, conkey, pg_get_constraintdef(oid) As consrc
			FROM pg_constraint) AS s
		 WHERE n.nspname = $1
		 AND c.relname = $2
		 AND a.attname = $3
		 AND a.attrelid = c.oid
		 AND s.connamespace = n.oid
		 AND s.conrelid = c.oid
		 AND a.attnum = ANY (s.conkey)
		 AND s.consrc LIKE '%ndims(% = %';
$function$
;

-- Permissions

ALTER FUNCTION public.postgis_constraint_dims(text, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_constraint_dims(text, text, text) TO postgres;

-- DROP FUNCTION public.postgis_constraint_srid(text, text, text);

CREATE OR REPLACE FUNCTION public.postgis_constraint_srid(geomschema text, geomtable text, geomcolumn text)
 RETURNS integer
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT COST 250
AS $function$
SELECT replace(replace(split_part(s.consrc, ' = ', 2), ')', ''), '(', '')::integer
		 FROM pg_class c, pg_namespace n, pg_attribute a
		 , (SELECT connamespace, conrelid, conkey, pg_get_constraintdef(oid) As consrc
			FROM pg_constraint) AS s
		 WHERE n.nspname = $1
		 AND c.relname = $2
		 AND a.attname = $3
		 AND a.attrelid = c.oid
		 AND s.connamespace = n.oid
		 AND s.conrelid = c.oid
		 AND a.attnum = ANY (s.conkey)
		 AND s.consrc LIKE '%srid(% = %';
$function$
;

-- Permissions

ALTER FUNCTION public.postgis_constraint_srid(text, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_constraint_srid(text, text, text) TO postgres;

-- DROP FUNCTION public.postgis_constraint_type(text, text, text);

CREATE OR REPLACE FUNCTION public.postgis_constraint_type(geomschema text, geomtable text, geomcolumn text)
 RETURNS character varying
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT COST 250
AS $function$
SELECT  replace(split_part(s.consrc, '''', 2), ')', '')::varchar
		 FROM pg_class c, pg_namespace n, pg_attribute a
		 , (SELECT connamespace, conrelid, conkey, pg_get_constraintdef(oid) As consrc
			FROM pg_constraint) AS s
		 WHERE n.nspname = $1
		 AND c.relname = $2
		 AND a.attname = $3
		 AND a.attrelid = c.oid
		 AND s.connamespace = n.oid
		 AND s.conrelid = c.oid
		 AND a.attnum = ANY (s.conkey)
		 AND s.consrc LIKE '%geometrytype(% = %';
$function$
;

-- Permissions

ALTER FUNCTION public.postgis_constraint_type(text, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_constraint_type(text, text, text) TO postgres;

-- DROP FUNCTION public.postgis_dropbbox(geometry);

CREATE OR REPLACE FUNCTION public.postgis_dropbbox(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_dropBBOX$function$
;

-- Permissions

ALTER FUNCTION public.postgis_dropbbox(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_dropbbox(geometry) TO postgres;

-- DROP FUNCTION public.postgis_extensions_upgrade(text);

CREATE OR REPLACE FUNCTION public.postgis_extensions_upgrade(target_version text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
	rec record;
	sql text;
	var_schema text;
BEGIN

	FOR rec IN
		SELECT name, default_version, installed_version
		FROM pg_catalog.pg_available_extensions
		WHERE name IN (
			'postgis',
			'postgis_raster',
			'postgis_sfcgal',
			'postgis_topology',
			'postgis_tiger_geocoder'
		)
		ORDER BY length(name) -- this is to make sure 'postgis' is first !
	LOOP --{

		IF target_version IS NULL THEN
			target_version := rec.default_version;
		END IF;

		IF rec.installed_version IS NULL THEN --{
			-- If the support installed by available extension
			-- is found unpackaged, we package it
			IF --{
				 -- PostGIS is always available (this function is part of it)
				 rec.name = 'postgis'

				 -- PostGIS raster is available if type 'raster' exists
				 OR ( rec.name = 'postgis_raster' AND EXISTS (
							SELECT 1 FROM pg_catalog.pg_type
							WHERE typname = 'raster' ) )

				 -- PostGIS SFCGAL is available if
				 -- 'postgis_sfcgal_version' function exists
				 OR ( rec.name = 'postgis_sfcgal' AND EXISTS (
							SELECT 1 FROM pg_catalog.pg_proc
							WHERE proname = 'postgis_sfcgal_version' ) )

				 -- PostGIS Topology is available if
				 -- 'topology.topology' table exists
				 -- NOTE: watch out for https://trac.osgeo.org/postgis/ticket/2503
				 OR ( rec.name = 'postgis_topology' AND EXISTS (
							SELECT 1 FROM pg_catalog.pg_class c
							JOIN pg_catalog.pg_namespace n ON (c.relnamespace = n.oid )
							WHERE n.nspname = 'topology' AND c.relname = 'topology') )

				 OR ( rec.name = 'postgis_tiger_geocoder' AND EXISTS (
							SELECT 1 FROM pg_catalog.pg_class c
							JOIN pg_catalog.pg_namespace n ON (c.relnamespace = n.oid )
							WHERE n.nspname = 'tiger' AND c.relname = 'geocode_settings') )
			THEN --}{ -- the code is unpackaged
				-- Force install in same schema as postgis
				SELECT INTO var_schema n.nspname
				  FROM pg_namespace n, pg_proc p
				  WHERE p.proname = 'postgis_full_version'
					AND n.oid = p.pronamespace
				  LIMIT 1;
				IF rec.name NOT IN('postgis_topology', 'postgis_tiger_geocoder')
				THEN
					sql := format(
							  'CREATE EXTENSION %1$I SCHEMA %2$I VERSION unpackaged;'
							  'ALTER EXTENSION %1$I UPDATE TO %3$I',
							  rec.name, var_schema, target_version);
				ELSE
					sql := format(
							 'CREATE EXTENSION %1$I VERSION unpackaged;'
							 'ALTER EXTENSION %1$I UPDATE TO %2$I',
							 rec.name, target_version);
				END IF;
				RAISE NOTICE 'Packaging and updating %', rec.name;
				RAISE DEBUG '%', sql;
				EXECUTE sql;
			ELSE
				RAISE DEBUG 'Skipping % (not in use)', rec.name;
			END IF; --}
		ELSE -- The code is already packaged, upgrade it --}{
			sql = format(
				'ALTER EXTENSION %1$I UPDATE TO "ANY";'
				'ALTER EXTENSION %1$I UPDATE TO %2$I',
				rec.name, target_version
				);
			RAISE NOTICE 'Updating extension % %', rec.name, rec.installed_version;
			RAISE DEBUG '%', sql;
			EXECUTE sql;
		END IF; --}

	END LOOP; --}

	RETURN format(
		'Upgrade to version %s completed, run SELECT postgis_full_version(); for details',
		target_version
	);


END
$function$
;

-- Permissions

ALTER FUNCTION public.postgis_extensions_upgrade(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_extensions_upgrade(text) TO postgres;

-- DROP FUNCTION public.postgis_full_version();

CREATE OR REPLACE FUNCTION public.postgis_full_version()
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
DECLARE
	libver text;
	librev text;
	projver text;
	projver_compiled text;
	geosver text;
	geosver_compiled text;
	sfcgalver text;
	gdalver text := NULL;
	libxmlver text;
	liblwgeomver text;
	dbproc text;
	relproc text;
	fullver text;
	rast_lib_ver text := NULL;
	rast_scr_ver text := NULL;
	topo_scr_ver text := NULL;
	json_lib_ver text;
	protobuf_lib_ver text;
	wagyu_lib_ver text;
	sfcgal_lib_ver text;
	sfcgal_scr_ver text;
	pgsql_scr_ver text;
	pgsql_ver text;
	core_is_extension bool;
BEGIN
	SELECT public.postgis_lib_version() INTO libver;
	SELECT public.postgis_proj_version() INTO projver;
	SELECT public.postgis_geos_version() INTO geosver;
	SELECT public.postgis_geos_compiled_version() INTO geosver_compiled;
	SELECT public.postgis_proj_compiled_version() INTO projver_compiled;
	SELECT public.postgis_libjson_version() INTO json_lib_ver;
	SELECT public.postgis_libprotobuf_version() INTO protobuf_lib_ver;
	SELECT public.postgis_wagyu_version() INTO wagyu_lib_ver;
	SELECT public._postgis_scripts_pgsql_version() INTO pgsql_scr_ver;
	SELECT public._postgis_pgsql_version() INTO pgsql_ver;
	BEGIN
		SELECT public.postgis_gdal_version() INTO gdalver;
	EXCEPTION
		WHEN undefined_function THEN
			RAISE DEBUG 'Function postgis_gdal_version() not found.  Is raster support enabled and rtpostgis.sql installed?';
	END;
	BEGIN
		SELECT public.postgis_sfcgal_full_version() INTO sfcgalver;
		BEGIN
			SELECT public.postgis_sfcgal_scripts_installed() INTO sfcgal_scr_ver;
		EXCEPTION
			WHEN undefined_function THEN
				sfcgal_scr_ver := 'missing';
		END;
	EXCEPTION
		WHEN undefined_function THEN
			RAISE DEBUG 'Function postgis_sfcgal_scripts_installed() not found. Is sfcgal support enabled and sfcgal.sql installed?';
	END;
	SELECT public.postgis_liblwgeom_version() INTO liblwgeomver;
	SELECT public.postgis_libxml_version() INTO libxmlver;
	SELECT public.postgis_scripts_installed() INTO dbproc;
	SELECT public.postgis_scripts_released() INTO relproc;
	SELECT public.postgis_lib_revision() INTO librev;
	BEGIN
		SELECT topology.postgis_topology_scripts_installed() INTO topo_scr_ver;
	EXCEPTION
		WHEN undefined_function OR invalid_schema_name THEN
			RAISE DEBUG 'Function postgis_topology_scripts_installed() not found. Is topology support enabled and topology.sql installed?';
		WHEN insufficient_privilege THEN
			RAISE NOTICE 'Topology support cannot be inspected. Is current user granted USAGE on schema "topology" ?';
		WHEN OTHERS THEN
			RAISE NOTICE 'Function postgis_topology_scripts_installed() could not be called: % (%)', SQLERRM, SQLSTATE;
	END;

	BEGIN
		SELECT postgis_raster_scripts_installed() INTO rast_scr_ver;
	EXCEPTION
		WHEN undefined_function THEN
			RAISE DEBUG 'Function postgis_raster_scripts_installed() not found. Is raster support enabled and rtpostgis.sql installed?';
		WHEN OTHERS THEN
			RAISE NOTICE 'Function postgis_raster_scripts_installed() could not be called: % (%)', SQLERRM, SQLSTATE;
	END;

	BEGIN
		SELECT public.postgis_raster_lib_version() INTO rast_lib_ver;
	EXCEPTION
		WHEN undefined_function THEN
			RAISE DEBUG 'Function postgis_raster_lib_version() not found. Is raster support enabled and rtpostgis.sql installed?';
		WHEN OTHERS THEN
			RAISE NOTICE 'Function postgis_raster_lib_version() could not be called: % (%)', SQLERRM, SQLSTATE;
	END;

	fullver = 'POSTGIS="' || libver;

	IF  librev IS NOT NULL THEN
		fullver = fullver || ' ' || librev;
	END IF;

	fullver = fullver || '"';

	IF EXISTS (
		SELECT * FROM pg_catalog.pg_extension
		WHERE extname = 'postgis')
	THEN
			fullver = fullver || ' [EXTENSION]';
			core_is_extension := true;
	ELSE
			core_is_extension := false;
	END IF;

	IF liblwgeomver != relproc THEN
		fullver = fullver || ' (liblwgeom version mismatch: "' || liblwgeomver || '")';
	END IF;

	fullver = fullver || ' PGSQL="' || pgsql_scr_ver || '"';
	IF pgsql_scr_ver != pgsql_ver THEN
		fullver = fullver || ' (procs need upgrade for use with PostgreSQL "' || pgsql_ver || '")';
	END IF;

	IF  geosver IS NOT NULL THEN
		fullver = fullver || ' GEOS="' || geosver || '"';
		IF (string_to_array(geosver, '.'))[1:2] != (string_to_array(geosver_compiled, '.'))[1:2]
		THEN
			fullver = format('%s (compiled against GEOS %s)', fullver, geosver_compiled);
		END IF;
	END IF;

	IF  sfcgalver IS NOT NULL THEN
		fullver = fullver || ' SFCGAL="' || sfcgalver || '"';
	END IF;

	IF  projver IS NOT NULL THEN
		fullver = fullver || ' PROJ="' || projver || '"';
		IF (string_to_array(projver, '.'))[1:3] != (string_to_array(projver_compiled, '.'))[1:3]
		THEN
			fullver = format('%s (compiled against PROJ %s)', fullver, projver_compiled);
		END IF;
	END IF;

	IF  gdalver IS NOT NULL THEN
		fullver = fullver || ' GDAL="' || gdalver || '"';
	END IF;

	IF  libxmlver IS NOT NULL THEN
		fullver = fullver || ' LIBXML="' || libxmlver || '"';
	END IF;

	IF json_lib_ver IS NOT NULL THEN
		fullver = fullver || ' LIBJSON="' || json_lib_ver || '"';
	END IF;

	IF protobuf_lib_ver IS NOT NULL THEN
		fullver = fullver || ' LIBPROTOBUF="' || protobuf_lib_ver || '"';
	END IF;

	IF wagyu_lib_ver IS NOT NULL THEN
		fullver = fullver || ' WAGYU="' || wagyu_lib_ver || '"';
	END IF;

	IF dbproc != relproc THEN
		fullver = fullver || ' (core procs from "' || dbproc || '" need upgrade)';
	END IF;

	IF topo_scr_ver IS NOT NULL THEN
		fullver = fullver || ' TOPOLOGY';
		IF topo_scr_ver != relproc THEN
			fullver = fullver || ' (topology procs from "' || topo_scr_ver || '" need upgrade)';
		END IF;
		IF core_is_extension AND NOT EXISTS (
			SELECT * FROM pg_catalog.pg_extension
			WHERE extname = 'postgis_topology')
		THEN
				fullver = fullver || ' [UNPACKAGED!]';
		END IF;
	END IF;

	IF rast_lib_ver IS NOT NULL THEN
		fullver = fullver || ' RASTER';
		IF rast_lib_ver != relproc THEN
			fullver = fullver || ' (raster lib from "' || rast_lib_ver || '" need upgrade)';
		END IF;
		IF core_is_extension AND NOT EXISTS (
			SELECT * FROM pg_catalog.pg_extension
			WHERE extname = 'postgis_raster')
		THEN
				fullver = fullver || ' [UNPACKAGED!]';
		END IF;
	END IF;

	IF rast_scr_ver IS NOT NULL AND rast_scr_ver != relproc THEN
		fullver = fullver || ' (raster procs from "' || rast_scr_ver || '" need upgrade)';
	END IF;

	IF sfcgal_scr_ver IS NOT NULL AND sfcgal_scr_ver != relproc THEN
		fullver = fullver || ' (sfcgal procs from "' || sfcgal_scr_ver || '" need upgrade)';
	END IF;

	-- Check for the presence of deprecated functions
	IF EXISTS ( SELECT oid FROM pg_catalog.pg_proc WHERE proname LIKE '%_deprecated_by_postgis_%' )
	THEN
		fullver = fullver || ' (deprecated functions exist, upgrade is not complete)';
	END IF;

	RETURN fullver;
END
$function$
;

-- Permissions

ALTER FUNCTION public.postgis_full_version() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_full_version() TO postgres;

-- DROP FUNCTION public.postgis_geos_compiled_version();

CREATE OR REPLACE FUNCTION public.postgis_geos_compiled_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_geos_compiled_version$function$
;

-- Permissions

ALTER FUNCTION public.postgis_geos_compiled_version() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_geos_compiled_version() TO postgres;

-- DROP FUNCTION public.postgis_geos_noop(geometry);

CREATE OR REPLACE FUNCTION public.postgis_geos_noop(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$GEOSnoop$function$
;

-- Permissions

ALTER FUNCTION public.postgis_geos_noop(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_geos_noop(geometry) TO postgres;

-- DROP FUNCTION public.postgis_geos_version();

CREATE OR REPLACE FUNCTION public.postgis_geos_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_geos_version$function$
;

-- Permissions

ALTER FUNCTION public.postgis_geos_version() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_geos_version() TO postgres;

-- DROP FUNCTION public.postgis_getbbox(geometry);

CREATE OR REPLACE FUNCTION public.postgis_getbbox(geometry)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_to_BOX2DF$function$
;

-- Permissions

ALTER FUNCTION public.postgis_getbbox(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_getbbox(geometry) TO postgres;

-- DROP FUNCTION public.postgis_hasbbox(geometry);

CREATE OR REPLACE FUNCTION public.postgis_hasbbox(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_hasBBOX$function$
;

-- Permissions

ALTER FUNCTION public.postgis_hasbbox(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_hasbbox(geometry) TO postgres;

-- DROP FUNCTION public.postgis_index_supportfn(internal);

CREATE OR REPLACE FUNCTION public.postgis_index_supportfn(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/postgis-3', $function$postgis_index_supportfn$function$
;

-- Permissions

ALTER FUNCTION public.postgis_index_supportfn(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_index_supportfn(internal) TO postgres;

-- DROP FUNCTION public.postgis_lib_build_date();

CREATE OR REPLACE FUNCTION public.postgis_lib_build_date()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_lib_build_date$function$
;

-- Permissions

ALTER FUNCTION public.postgis_lib_build_date() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_lib_build_date() TO postgres;

-- DROP FUNCTION public.postgis_lib_revision();

CREATE OR REPLACE FUNCTION public.postgis_lib_revision()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_lib_revision$function$
;

-- Permissions

ALTER FUNCTION public.postgis_lib_revision() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_lib_revision() TO postgres;

-- DROP FUNCTION public.postgis_lib_version();

CREATE OR REPLACE FUNCTION public.postgis_lib_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_lib_version$function$
;

-- Permissions

ALTER FUNCTION public.postgis_lib_version() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_lib_version() TO postgres;

-- DROP FUNCTION public.postgis_libjson_version();

CREATE OR REPLACE FUNCTION public.postgis_libjson_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_libjson_version$function$
;

-- Permissions

ALTER FUNCTION public.postgis_libjson_version() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_libjson_version() TO postgres;

-- DROP FUNCTION public.postgis_liblwgeom_version();

CREATE OR REPLACE FUNCTION public.postgis_liblwgeom_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_liblwgeom_version$function$
;

-- Permissions

ALTER FUNCTION public.postgis_liblwgeom_version() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_liblwgeom_version() TO postgres;

-- DROP FUNCTION public.postgis_libprotobuf_version();

CREATE OR REPLACE FUNCTION public.postgis_libprotobuf_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/postgis-3', $function$postgis_libprotobuf_version$function$
;

-- Permissions

ALTER FUNCTION public.postgis_libprotobuf_version() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_libprotobuf_version() TO postgres;

-- DROP FUNCTION public.postgis_libxml_version();

CREATE OR REPLACE FUNCTION public.postgis_libxml_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_libxml_version$function$
;

-- Permissions

ALTER FUNCTION public.postgis_libxml_version() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_libxml_version() TO postgres;

-- DROP FUNCTION public.postgis_noop(geometry);

CREATE OR REPLACE FUNCTION public.postgis_noop(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_noop$function$
;

-- Permissions

ALTER FUNCTION public.postgis_noop(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_noop(geometry) TO postgres;

-- DROP FUNCTION public.postgis_proj_compiled_version();

CREATE OR REPLACE FUNCTION public.postgis_proj_compiled_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_proj_compiled_version$function$
;

-- Permissions

ALTER FUNCTION public.postgis_proj_compiled_version() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_proj_compiled_version() TO postgres;

-- DROP FUNCTION public.postgis_proj_version();

CREATE OR REPLACE FUNCTION public.postgis_proj_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_proj_version$function$
;

-- Permissions

ALTER FUNCTION public.postgis_proj_version() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_proj_version() TO postgres;

-- DROP FUNCTION public.postgis_scripts_build_date();

CREATE OR REPLACE FUNCTION public.postgis_scripts_build_date()
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$SELECT '2025-09-02 00:00:00'::text AS version$function$
;

-- Permissions

ALTER FUNCTION public.postgis_scripts_build_date() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_scripts_build_date() TO postgres;

-- DROP FUNCTION public.postgis_scripts_installed();

CREATE OR REPLACE FUNCTION public.postgis_scripts_installed()
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$ SELECT trim('3.6.0'::text || $rev$ 4c1967d $rev$) AS version $function$
;

-- Permissions

ALTER FUNCTION public.postgis_scripts_installed() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_scripts_installed() TO postgres;

-- DROP FUNCTION public.postgis_scripts_released();

CREATE OR REPLACE FUNCTION public.postgis_scripts_released()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_scripts_released$function$
;

-- Permissions

ALTER FUNCTION public.postgis_scripts_released() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_scripts_released() TO postgres;

-- DROP FUNCTION public.postgis_srs(text, text);

CREATE OR REPLACE FUNCTION public.postgis_srs(auth_name text, auth_srid text)
 RETURNS TABLE(auth_name text, auth_srid text, srname text, srtext text, proj4text text, point_sw geometry, point_ne geometry)
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$postgis_srs_entry$function$
;

-- Permissions

ALTER FUNCTION public.postgis_srs(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_srs(text, text) TO postgres;

-- DROP FUNCTION public.postgis_srs_all();

CREATE OR REPLACE FUNCTION public.postgis_srs_all()
 RETURNS TABLE(auth_name text, auth_srid text, srname text, srtext text, proj4text text, point_sw geometry, point_ne geometry)
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$postgis_srs_entry_all$function$
;

-- Permissions

ALTER FUNCTION public.postgis_srs_all() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_srs_all() TO postgres;

-- DROP FUNCTION public.postgis_srs_codes(text);

CREATE OR REPLACE FUNCTION public.postgis_srs_codes(auth_name text)
 RETURNS SETOF text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$postgis_srs_codes$function$
;

-- Permissions

ALTER FUNCTION public.postgis_srs_codes(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_srs_codes(text) TO postgres;

-- DROP FUNCTION public.postgis_srs_search(geometry, text);

CREATE OR REPLACE FUNCTION public.postgis_srs_search(bounds geometry, authname text DEFAULT 'EPSG'::text)
 RETURNS TABLE(auth_name text, auth_srid text, srname text, srtext text, proj4text text, point_sw geometry, point_ne geometry)
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$postgis_srs_search$function$
;

-- Permissions

ALTER FUNCTION public.postgis_srs_search(geometry, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_srs_search(geometry, text) TO postgres;

-- DROP FUNCTION public.postgis_svn_version();

CREATE OR REPLACE FUNCTION public.postgis_svn_version()
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
	SELECT public._postgis_deprecate(
		'postgis_svn_version', 'postgis_lib_revision', '3.1.0');
	SELECT public.postgis_lib_revision();
$function$
;

-- Permissions

ALTER FUNCTION public.postgis_svn_version() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_svn_version() TO postgres;

-- DROP FUNCTION public.postgis_transform_geometry(geometry, text, text, int4);

CREATE OR REPLACE FUNCTION public.postgis_transform_geometry(geom geometry, text, text, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$transform_geom$function$
;

-- Permissions

ALTER FUNCTION public.postgis_transform_geometry(geometry, text, text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_transform_geometry(geometry, text, text, int4) TO postgres;

-- DROP FUNCTION public.postgis_transform_pipeline_geometry(geometry, text, bool, int4);

CREATE OR REPLACE FUNCTION public.postgis_transform_pipeline_geometry(geom geometry, pipeline text, forward boolean, to_srid integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$transform_pipeline_geom$function$
;

-- Permissions

ALTER FUNCTION public.postgis_transform_pipeline_geometry(geometry, text, bool, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_transform_pipeline_geometry(geometry, text, bool, int4) TO postgres;

-- DROP FUNCTION public.postgis_type_name(varchar, int4, bool);

CREATE OR REPLACE FUNCTION public.postgis_type_name(geomname character varying, coord_dimension integer, use_new_name boolean DEFAULT true)
 RETURNS character varying
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS $function$
	SELECT CASE WHEN $3 THEN new_name ELSE old_name END As geomname
	FROM
	( VALUES
			('GEOMETRY', 'Geometry', 2),
			('GEOMETRY', 'GeometryZ', 3),
			('GEOMETRYM', 'GeometryM', 3),
			('GEOMETRY', 'GeometryZM', 4),

			('GEOMETRYCOLLECTION', 'GeometryCollection', 2),
			('GEOMETRYCOLLECTION', 'GeometryCollectionZ', 3),
			('GEOMETRYCOLLECTIONM', 'GeometryCollectionM', 3),
			('GEOMETRYCOLLECTION', 'GeometryCollectionZM', 4),

			('POINT', 'Point', 2),
			('POINT', 'PointZ', 3),
			('POINTM','PointM', 3),
			('POINT', 'PointZM', 4),

			('MULTIPOINT','MultiPoint', 2),
			('MULTIPOINT','MultiPointZ', 3),
			('MULTIPOINTM','MultiPointM', 3),
			('MULTIPOINT','MultiPointZM', 4),

			('POLYGON', 'Polygon', 2),
			('POLYGON', 'PolygonZ', 3),
			('POLYGONM', 'PolygonM', 3),
			('POLYGON', 'PolygonZM', 4),

			('MULTIPOLYGON', 'MultiPolygon', 2),
			('MULTIPOLYGON', 'MultiPolygonZ', 3),
			('MULTIPOLYGONM', 'MultiPolygonM', 3),
			('MULTIPOLYGON', 'MultiPolygonZM', 4),

			('MULTILINESTRING', 'MultiLineString', 2),
			('MULTILINESTRING', 'MultiLineStringZ', 3),
			('MULTILINESTRINGM', 'MultiLineStringM', 3),
			('MULTILINESTRING', 'MultiLineStringZM', 4),

			('LINESTRING', 'LineString', 2),
			('LINESTRING', 'LineStringZ', 3),
			('LINESTRINGM', 'LineStringM', 3),
			('LINESTRING', 'LineStringZM', 4),

			('CIRCULARSTRING', 'CircularString', 2),
			('CIRCULARSTRING', 'CircularStringZ', 3),
			('CIRCULARSTRINGM', 'CircularStringM' ,3),
			('CIRCULARSTRING', 'CircularStringZM', 4),

			('COMPOUNDCURVE', 'CompoundCurve', 2),
			('COMPOUNDCURVE', 'CompoundCurveZ', 3),
			('COMPOUNDCURVEM', 'CompoundCurveM', 3),
			('COMPOUNDCURVE', 'CompoundCurveZM', 4),

			('CURVEPOLYGON', 'CurvePolygon', 2),
			('CURVEPOLYGON', 'CurvePolygonZ', 3),
			('CURVEPOLYGONM', 'CurvePolygonM', 3),
			('CURVEPOLYGON', 'CurvePolygonZM', 4),

			('MULTICURVE', 'MultiCurve', 2),
			('MULTICURVE', 'MultiCurveZ', 3),
			('MULTICURVEM', 'MultiCurveM', 3),
			('MULTICURVE', 'MultiCurveZM', 4),

			('MULTISURFACE', 'MultiSurface', 2),
			('MULTISURFACE', 'MultiSurfaceZ', 3),
			('MULTISURFACEM', 'MultiSurfaceM', 3),
			('MULTISURFACE', 'MultiSurfaceZM', 4),

			('POLYHEDRALSURFACE', 'PolyhedralSurface', 2),
			('POLYHEDRALSURFACE', 'PolyhedralSurfaceZ', 3),
			('POLYHEDRALSURFACEM', 'PolyhedralSurfaceM', 3),
			('POLYHEDRALSURFACE', 'PolyhedralSurfaceZM', 4),

			('TRIANGLE', 'Triangle', 2),
			('TRIANGLE', 'TriangleZ', 3),
			('TRIANGLEM', 'TriangleM', 3),
			('TRIANGLE', 'TriangleZM', 4),

			('TIN', 'Tin', 2),
			('TIN', 'TinZ', 3),
			('TINM', 'TinM', 3),
			('TIN', 'TinZM', 4) )
			 As g(old_name, new_name, coord_dimension)
	WHERE (upper(old_name) = upper($1) OR upper(new_name) = upper($1))
		AND coord_dimension = $2;
$function$
;

-- Permissions

ALTER FUNCTION public.postgis_type_name(varchar, int4, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_type_name(varchar, int4, bool) TO postgres;

-- DROP FUNCTION public.postgis_typmod_dims(int4);

CREATE OR REPLACE FUNCTION public.postgis_typmod_dims(integer)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_typmod_dims$function$
;

-- Permissions

ALTER FUNCTION public.postgis_typmod_dims(int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_typmod_dims(int4) TO postgres;

-- DROP FUNCTION public.postgis_typmod_srid(int4);

CREATE OR REPLACE FUNCTION public.postgis_typmod_srid(integer)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_typmod_srid$function$
;

-- Permissions

ALTER FUNCTION public.postgis_typmod_srid(int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_typmod_srid(int4) TO postgres;

-- DROP FUNCTION public.postgis_typmod_type(int4);

CREATE OR REPLACE FUNCTION public.postgis_typmod_type(integer)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_typmod_type$function$
;

-- Permissions

ALTER FUNCTION public.postgis_typmod_type(int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_typmod_type(int4) TO postgres;

-- DROP FUNCTION public.postgis_version();

CREATE OR REPLACE FUNCTION public.postgis_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_version$function$
;

-- Permissions

ALTER FUNCTION public.postgis_version() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_version() TO postgres;

-- DROP FUNCTION public.postgis_wagyu_version();

CREATE OR REPLACE FUNCTION public.postgis_wagyu_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_wagyu_version$function$
;

-- Permissions

ALTER FUNCTION public.postgis_wagyu_version() OWNER TO postgres;
GRANT ALL ON FUNCTION public.postgis_wagyu_version() TO postgres;

-- DROP FUNCTION public.refresh_dashboard_requests_view();

CREATE OR REPLACE FUNCTION public.refresh_dashboard_requests_view()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_requests_view;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.refresh_dashboard_requests_view() OWNER TO root;
GRANT ALL ON FUNCTION public.refresh_dashboard_requests_view() TO root;

-- DROP FUNCTION public.spheroid_in(cstring);

CREATE OR REPLACE FUNCTION public.spheroid_in(cstring)
 RETURNS spheroid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$ellipsoid_in$function$
;

-- Permissions

ALTER FUNCTION public.spheroid_in(cstring) OWNER TO postgres;
GRANT ALL ON FUNCTION public.spheroid_in(cstring) TO postgres;

-- DROP FUNCTION public.spheroid_out(spheroid);

CREATE OR REPLACE FUNCTION public.spheroid_out(spheroid)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$ellipsoid_out$function$
;

-- Permissions

ALTER FUNCTION public.spheroid_out(spheroid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.spheroid_out(spheroid) TO postgres;

-- DROP FUNCTION public.st_3dclosestpoint(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_3dclosestpoint(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_closestpoint3d$function$
;

-- Permissions

ALTER FUNCTION public.st_3dclosestpoint(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_3dclosestpoint(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_3ddfullywithin(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public.st_3ddfullywithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$LWGEOM_dfullywithin3d$function$
;

-- Permissions

ALTER FUNCTION public.st_3ddfullywithin(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_3ddfullywithin(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public.st_3ddistance(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_3ddistance(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_3DDistance$function$
;

-- Permissions

ALTER FUNCTION public.st_3ddistance(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_3ddistance(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_3ddwithin(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public.st_3ddwithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$LWGEOM_dwithin3d$function$
;

-- Permissions

ALTER FUNCTION public.st_3ddwithin(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_3ddwithin(geometry, geometry, float8) TO postgres;

-- DROP AGGREGATE public.st_3dextent(geometry);

CREATE OR REPLACE AGGREGATE public.st_3dextent(public.geometry) (
	SFUNC = public.st_combinebbox,
	STYPE = box3d
);

-- Permissions

ALTER AGGREGATE public.st_3dextent(geometry) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_3dextent(geometry) TO postgres;

-- DROP FUNCTION public.st_3dintersects(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_3dintersects(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$ST_3DIntersects$function$
;

-- Permissions

ALTER FUNCTION public.st_3dintersects(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_3dintersects(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_3dlength(geometry);

CREATE OR REPLACE FUNCTION public.st_3dlength(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_length_linestring$function$
;

-- Permissions

ALTER FUNCTION public.st_3dlength(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_3dlength(geometry) TO postgres;

-- DROP FUNCTION public.st_3dlineinterpolatepoint(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_3dlineinterpolatepoint(geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_3DLineInterpolatePoint$function$
;

-- Permissions

ALTER FUNCTION public.st_3dlineinterpolatepoint(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_3dlineinterpolatepoint(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_3dlongestline(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_3dlongestline(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_longestline3d$function$
;

-- Permissions

ALTER FUNCTION public.st_3dlongestline(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_3dlongestline(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_3dmakebox(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_3dmakebox(geom1 geometry, geom2 geometry)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_construct$function$
;

-- Permissions

ALTER FUNCTION public.st_3dmakebox(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_3dmakebox(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_3dmaxdistance(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_3dmaxdistance(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_maxdistance3d$function$
;

-- Permissions

ALTER FUNCTION public.st_3dmaxdistance(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_3dmaxdistance(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_3dperimeter(geometry);

CREATE OR REPLACE FUNCTION public.st_3dperimeter(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_perimeter_poly$function$
;

-- Permissions

ALTER FUNCTION public.st_3dperimeter(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_3dperimeter(geometry) TO postgres;

-- DROP FUNCTION public.st_3dshortestline(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_3dshortestline(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_shortestline3d$function$
;

-- Permissions

ALTER FUNCTION public.st_3dshortestline(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_3dshortestline(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_addmeasure(geometry, float8, float8);

CREATE OR REPLACE FUNCTION public.st_addmeasure(geometry, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_AddMeasure$function$
;

-- Permissions

ALTER FUNCTION public.st_addmeasure(geometry, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_addmeasure(geometry, float8, float8) TO postgres;

-- DROP FUNCTION public.st_addpoint(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_addpoint(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_addpoint$function$
;

-- Permissions

ALTER FUNCTION public.st_addpoint(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_addpoint(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_addpoint(geometry, geometry, int4);

CREATE OR REPLACE FUNCTION public.st_addpoint(geom1 geometry, geom2 geometry, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_addpoint$function$
;

-- Permissions

ALTER FUNCTION public.st_addpoint(geometry, geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_addpoint(geometry, geometry, int4) TO postgres;

-- DROP FUNCTION public.st_affine(geometry, float8, float8, float8, float8, float8, float8, float8, float8, float8, float8, float8, float8);

CREATE OR REPLACE FUNCTION public.st_affine(geometry, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_affine$function$
;

-- Permissions

ALTER FUNCTION public.st_affine(geometry, float8, float8, float8, float8, float8, float8, float8, float8, float8, float8, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_affine(geometry, float8, float8, float8, float8, float8, float8, float8, float8, float8, float8, float8, float8) TO postgres;

-- DROP FUNCTION public.st_affine(geometry, float8, float8, float8, float8, float8, float8);

CREATE OR REPLACE FUNCTION public.st_affine(geometry, double precision, double precision, double precision, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1,  $2, $3, 0,  $4, $5, 0,  0, 0, 1,  $6, $7, 0)$function$
;

-- Permissions

ALTER FUNCTION public.st_affine(geometry, float8, float8, float8, float8, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_affine(geometry, float8, float8, float8, float8, float8, float8) TO postgres;

-- DROP FUNCTION public.st_angle(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_angle(line1 geometry, line2 geometry)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Angle(public.St_StartPoint($1), public.ST_EndPoint($1), public.ST_StartPoint($2), public.ST_EndPoint($2))$function$
;

-- Permissions

ALTER FUNCTION public.st_angle(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_angle(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_angle(geometry, geometry, geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_angle(pt1 geometry, pt2 geometry, pt3 geometry, pt4 geometry DEFAULT '0101000000000000000000F87F000000000000F87F'::geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_angle$function$
;

-- Permissions

ALTER FUNCTION public.st_angle(geometry, geometry, geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_angle(geometry, geometry, geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_area(geography, bool);

CREATE OR REPLACE FUNCTION public.st_area(geog geography, use_spheroid boolean DEFAULT true)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$geography_area$function$
;

-- Permissions

ALTER FUNCTION public.st_area(geography, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_area(geography, bool) TO postgres;

-- DROP FUNCTION public.st_area(geometry);

CREATE OR REPLACE FUNCTION public.st_area(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Area$function$
;

-- Permissions

ALTER FUNCTION public.st_area(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_area(geometry) TO postgres;

-- DROP FUNCTION public.st_area(text);

CREATE OR REPLACE FUNCTION public.st_area(text)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ SELECT public.ST_Area($1::public.geometry);  $function$
;

-- Permissions

ALTER FUNCTION public.st_area(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_area(text) TO postgres;

-- DROP FUNCTION public.st_area2d(geometry);

CREATE OR REPLACE FUNCTION public.st_area2d(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Area$function$
;

-- Permissions

ALTER FUNCTION public.st_area2d(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_area2d(geometry) TO postgres;

-- DROP FUNCTION public.st_asbinary(geometry);

CREATE OR REPLACE FUNCTION public.st_asbinary(geometry)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_asBinary$function$
;

-- Permissions

ALTER FUNCTION public.st_asbinary(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asbinary(geometry) TO postgres;

-- DROP FUNCTION public.st_asbinary(geometry, text);

CREATE OR REPLACE FUNCTION public.st_asbinary(geometry, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_asBinary$function$
;

-- Permissions

ALTER FUNCTION public.st_asbinary(geometry, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asbinary(geometry, text) TO postgres;

-- DROP FUNCTION public.st_asbinary(geography, text);

CREATE OR REPLACE FUNCTION public.st_asbinary(geography, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$LWGEOM_asBinary$function$
;

-- Permissions

ALTER FUNCTION public.st_asbinary(geography, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asbinary(geography, text) TO postgres;

-- DROP FUNCTION public.st_asbinary(geography);

CREATE OR REPLACE FUNCTION public.st_asbinary(geography)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_asBinary$function$
;

-- Permissions

ALTER FUNCTION public.st_asbinary(geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asbinary(geography) TO postgres;

-- DROP FUNCTION public.st_asencodedpolyline(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_asencodedpolyline(geom geometry, nprecision integer DEFAULT 5)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asEncodedPolyline$function$
;

-- Permissions

ALTER FUNCTION public.st_asencodedpolyline(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asencodedpolyline(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_asewkb(geometry);

CREATE OR REPLACE FUNCTION public.st_asewkb(geometry)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$WKBFromLWGEOM$function$
;

-- Permissions

ALTER FUNCTION public.st_asewkb(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asewkb(geometry) TO postgres;

-- DROP FUNCTION public.st_asewkb(geometry, text);

CREATE OR REPLACE FUNCTION public.st_asewkb(geometry, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$WKBFromLWGEOM$function$
;

-- Permissions

ALTER FUNCTION public.st_asewkb(geometry, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asewkb(geometry, text) TO postgres;

-- DROP FUNCTION public.st_asewkt(geography, int4);

CREATE OR REPLACE FUNCTION public.st_asewkt(geography, integer)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asEWKT$function$
;

-- Permissions

ALTER FUNCTION public.st_asewkt(geography, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asewkt(geography, int4) TO postgres;

-- DROP FUNCTION public.st_asewkt(geography);

CREATE OR REPLACE FUNCTION public.st_asewkt(geography)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asEWKT$function$
;

-- Permissions

ALTER FUNCTION public.st_asewkt(geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asewkt(geography) TO postgres;

-- DROP FUNCTION public.st_asewkt(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_asewkt(geometry, integer)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asEWKT$function$
;

-- Permissions

ALTER FUNCTION public.st_asewkt(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asewkt(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_asewkt(geometry);

CREATE OR REPLACE FUNCTION public.st_asewkt(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asEWKT$function$
;

-- Permissions

ALTER FUNCTION public.st_asewkt(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asewkt(geometry) TO postgres;

-- DROP FUNCTION public.st_asewkt(text);

CREATE OR REPLACE FUNCTION public.st_asewkt(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$ SELECT public.ST_AsEWKT($1::public.geometry);  $function$
;

-- Permissions

ALTER FUNCTION public.st_asewkt(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asewkt(text) TO postgres;

-- DROP AGGREGATE public.st_asflatgeobuf(anyelement);

-- Aggregate function public.st_asflatgeobuf(anyelement)
-- ERROR: more than one function named "public.st_asflatgeobuf";

-- Permissions

ALTER AGGREGATE public.st_asflatgeobuf(anyelement) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_asflatgeobuf(anyelement) TO postgres;

-- DROP AGGREGATE public.st_asflatgeobuf(anyelement, bool);

-- Aggregate function public.st_asflatgeobuf(anyelement, bool)
-- ERROR: more than one function named "public.st_asflatgeobuf";

-- Permissions

ALTER AGGREGATE public.st_asflatgeobuf(anyelement, bool) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_asflatgeobuf(anyelement, bool) TO postgres;

-- DROP AGGREGATE public.st_asflatgeobuf(anyelement, bool, text);

-- Aggregate function public.st_asflatgeobuf(anyelement, bool, text)
-- ERROR: more than one function named "public.st_asflatgeobuf";

-- Permissions

ALTER AGGREGATE public.st_asflatgeobuf(anyelement, bool, text) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_asflatgeobuf(anyelement, bool, text) TO postgres;

-- DROP AGGREGATE public.st_asgeobuf(anyelement, text);

-- Aggregate function public.st_asgeobuf(anyelement, text)
-- ERROR: more than one function named "public.st_asgeobuf";

-- Permissions

ALTER AGGREGATE public.st_asgeobuf(anyelement, text) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_asgeobuf(anyelement, text) TO postgres;

-- DROP AGGREGATE public.st_asgeobuf(anyelement);

-- Aggregate function public.st_asgeobuf(anyelement)
-- ERROR: more than one function named "public.st_asgeobuf";

-- Permissions

ALTER AGGREGATE public.st_asgeobuf(anyelement) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_asgeobuf(anyelement) TO postgres;

-- DROP FUNCTION public.st_asgeojson(record, text, int4, bool, text);

CREATE OR REPLACE FUNCTION public.st_asgeojson(r record, geom_column text DEFAULT ''::text, maxdecimaldigits integer DEFAULT 9, pretty_bool boolean DEFAULT false, id_column text DEFAULT ''::text)
 RETURNS text
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_AsGeoJsonRow$function$
;

-- Permissions

ALTER FUNCTION public.st_asgeojson(record, text, int4, bool, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asgeojson(record, text, int4, bool, text) TO postgres;

-- DROP FUNCTION public.st_asgeojson(geography, int4, int4);

CREATE OR REPLACE FUNCTION public.st_asgeojson(geog geography, maxdecimaldigits integer DEFAULT 9, options integer DEFAULT 0)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geography_as_geojson$function$
;

-- Permissions

ALTER FUNCTION public.st_asgeojson(geography, int4, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asgeojson(geography, int4, int4) TO postgres;

-- DROP FUNCTION public.st_asgeojson(geometry, int4, int4);

CREATE OR REPLACE FUNCTION public.st_asgeojson(geom geometry, maxdecimaldigits integer DEFAULT 9, options integer DEFAULT 8)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asGeoJson$function$
;

-- Permissions

ALTER FUNCTION public.st_asgeojson(geometry, int4, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asgeojson(geometry, int4, int4) TO postgres;

-- DROP FUNCTION public.st_asgeojson(text);

CREATE OR REPLACE FUNCTION public.st_asgeojson(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$ SELECT public.ST_AsGeoJson($1::public.geometry, 9, 0);  $function$
;

-- Permissions

ALTER FUNCTION public.st_asgeojson(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asgeojson(text) TO postgres;

-- DROP FUNCTION public.st_asgml(int4, geography, int4, int4, text, text);

CREATE OR REPLACE FUNCTION public.st_asgml(version integer, geog geography, maxdecimaldigits integer DEFAULT 15, options integer DEFAULT 0, nprefix text DEFAULT 'gml'::text, id text DEFAULT ''::text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geography_as_gml$function$
;

-- Permissions

ALTER FUNCTION public.st_asgml(int4, geography, int4, int4, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asgml(int4, geography, int4, int4, text, text) TO postgres;

-- DROP FUNCTION public.st_asgml(int4, geometry, int4, int4, text, text);

CREATE OR REPLACE FUNCTION public.st_asgml(version integer, geom geometry, maxdecimaldigits integer DEFAULT 15, options integer DEFAULT 0, nprefix text DEFAULT NULL::text, id text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asGML$function$
;

-- Permissions

ALTER FUNCTION public.st_asgml(int4, geometry, int4, int4, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asgml(int4, geometry, int4, int4, text, text) TO postgres;

-- DROP FUNCTION public.st_asgml(geometry, int4, int4);

CREATE OR REPLACE FUNCTION public.st_asgml(geom geometry, maxdecimaldigits integer DEFAULT 15, options integer DEFAULT 0)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asGML$function$
;

-- Permissions

ALTER FUNCTION public.st_asgml(geometry, int4, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asgml(geometry, int4, int4) TO postgres;

-- DROP FUNCTION public.st_asgml(text);

CREATE OR REPLACE FUNCTION public.st_asgml(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$ SELECT public._ST_AsGML(2,$1::public.geometry,15,0, NULL, NULL);  $function$
;

-- Permissions

ALTER FUNCTION public.st_asgml(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asgml(text) TO postgres;

-- DROP FUNCTION public.st_asgml(geography, int4, int4, text, text);

CREATE OR REPLACE FUNCTION public.st_asgml(geog geography, maxdecimaldigits integer DEFAULT 15, options integer DEFAULT 0, nprefix text DEFAULT 'gml'::text, id text DEFAULT ''::text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geography_as_gml$function$
;

-- Permissions

ALTER FUNCTION public.st_asgml(geography, int4, int4, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asgml(geography, int4, int4, text, text) TO postgres;

-- DROP FUNCTION public.st_ashexewkb(geometry, text);

CREATE OR REPLACE FUNCTION public.st_ashexewkb(geometry, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_asHEXEWKB$function$
;

-- Permissions

ALTER FUNCTION public.st_ashexewkb(geometry, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_ashexewkb(geometry, text) TO postgres;

-- DROP FUNCTION public.st_ashexewkb(geometry);

CREATE OR REPLACE FUNCTION public.st_ashexewkb(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_asHEXEWKB$function$
;

-- Permissions

ALTER FUNCTION public.st_ashexewkb(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_ashexewkb(geometry) TO postgres;

-- DROP FUNCTION public.st_askml(geography, int4, text);

CREATE OR REPLACE FUNCTION public.st_askml(geog geography, maxdecimaldigits integer DEFAULT 15, nprefix text DEFAULT ''::text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geography_as_kml$function$
;

-- Permissions

ALTER FUNCTION public.st_askml(geography, int4, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_askml(geography, int4, text) TO postgres;

-- DROP FUNCTION public.st_askml(text);

CREATE OR REPLACE FUNCTION public.st_askml(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$ SELECT public.ST_AsKML($1::public.geometry, 15);  $function$
;

-- Permissions

ALTER FUNCTION public.st_askml(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_askml(text) TO postgres;

-- DROP FUNCTION public.st_askml(geometry, int4, text);

CREATE OR REPLACE FUNCTION public.st_askml(geom geometry, maxdecimaldigits integer DEFAULT 15, nprefix text DEFAULT ''::text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asKML$function$
;

-- Permissions

ALTER FUNCTION public.st_askml(geometry, int4, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_askml(geometry, int4, text) TO postgres;

-- DROP FUNCTION public.st_aslatlontext(geometry, text);

CREATE OR REPLACE FUNCTION public.st_aslatlontext(geom geometry, tmpl text DEFAULT ''::text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_latlon$function$
;

-- Permissions

ALTER FUNCTION public.st_aslatlontext(geometry, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_aslatlontext(geometry, text) TO postgres;

-- DROP FUNCTION public.st_asmarc21(geometry, text);

CREATE OR REPLACE FUNCTION public.st_asmarc21(geom geometry, format text DEFAULT 'hdddmmss'::text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_AsMARC21$function$
;

-- Permissions

ALTER FUNCTION public.st_asmarc21(geometry, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asmarc21(geometry, text) TO postgres;

-- DROP AGGREGATE public.st_asmvt(anyelement, text, int4);

-- Aggregate function public.st_asmvt(anyelement, text, int4)
-- ERROR: more than one function named "public.st_asmvt";

-- Permissions

ALTER AGGREGATE public.st_asmvt(anyelement, text, int4) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_asmvt(anyelement, text, int4) TO postgres;

-- DROP AGGREGATE public.st_asmvt(anyelement, text, int4, text, text);

-- Aggregate function public.st_asmvt(anyelement, text, int4, text, text)
-- ERROR: more than one function named "public.st_asmvt";

-- Permissions

ALTER AGGREGATE public.st_asmvt(anyelement, text, int4, text, text) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_asmvt(anyelement, text, int4, text, text) TO postgres;

-- DROP AGGREGATE public.st_asmvt(anyelement);

-- Aggregate function public.st_asmvt(anyelement)
-- ERROR: more than one function named "public.st_asmvt";

-- Permissions

ALTER AGGREGATE public.st_asmvt(anyelement) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_asmvt(anyelement) TO postgres;

-- DROP AGGREGATE public.st_asmvt(anyelement, text);

-- Aggregate function public.st_asmvt(anyelement, text)
-- ERROR: more than one function named "public.st_asmvt";

-- Permissions

ALTER AGGREGATE public.st_asmvt(anyelement, text) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_asmvt(anyelement, text) TO postgres;

-- DROP AGGREGATE public.st_asmvt(anyelement, text, int4, text);

-- Aggregate function public.st_asmvt(anyelement, text, int4, text)
-- ERROR: more than one function named "public.st_asmvt";

-- Permissions

ALTER AGGREGATE public.st_asmvt(anyelement, text, int4, text) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_asmvt(anyelement, text, int4, text) TO postgres;

-- DROP FUNCTION public.st_asmvtgeom(geometry, box2d, int4, int4, bool);

CREATE OR REPLACE FUNCTION public.st_asmvtgeom(geom geometry, bounds box2d, extent integer DEFAULT 4096, buffer integer DEFAULT 256, clip_geom boolean DEFAULT true)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$ST_AsMVTGeom$function$
;

-- Permissions

ALTER FUNCTION public.st_asmvtgeom(geometry, box2d, int4, int4, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asmvtgeom(geometry, box2d, int4, int4, bool) TO postgres;

-- DROP FUNCTION public.st_assvg(text);

CREATE OR REPLACE FUNCTION public.st_assvg(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$ SELECT public.ST_AsSVG($1::public.geometry,0,15);  $function$
;

-- Permissions

ALTER FUNCTION public.st_assvg(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_assvg(text) TO postgres;

-- DROP FUNCTION public.st_assvg(geometry, int4, int4);

CREATE OR REPLACE FUNCTION public.st_assvg(geom geometry, rel integer DEFAULT 0, maxdecimaldigits integer DEFAULT 15)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asSVG$function$
;

-- Permissions

ALTER FUNCTION public.st_assvg(geometry, int4, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_assvg(geometry, int4, int4) TO postgres;

-- DROP FUNCTION public.st_assvg(geography, int4, int4);

CREATE OR REPLACE FUNCTION public.st_assvg(geog geography, rel integer DEFAULT 0, maxdecimaldigits integer DEFAULT 15)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geography_as_svg$function$
;

-- Permissions

ALTER FUNCTION public.st_assvg(geography, int4, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_assvg(geography, int4, int4) TO postgres;

-- DROP FUNCTION public.st_astext(geometry);

CREATE OR REPLACE FUNCTION public.st_astext(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asText$function$
;

-- Permissions

ALTER FUNCTION public.st_astext(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_astext(geometry) TO postgres;

-- DROP FUNCTION public.st_astext(text);

CREATE OR REPLACE FUNCTION public.st_astext(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$ SELECT public.ST_AsText($1::public.geometry);  $function$
;

-- Permissions

ALTER FUNCTION public.st_astext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_astext(text) TO postgres;

-- DROP FUNCTION public.st_astext(geography);

CREATE OR REPLACE FUNCTION public.st_astext(geography)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asText$function$
;

-- Permissions

ALTER FUNCTION public.st_astext(geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_astext(geography) TO postgres;

-- DROP FUNCTION public.st_astext(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_astext(geometry, integer)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asText$function$
;

-- Permissions

ALTER FUNCTION public.st_astext(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_astext(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_astext(geography, int4);

CREATE OR REPLACE FUNCTION public.st_astext(geography, integer)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_asText$function$
;

-- Permissions

ALTER FUNCTION public.st_astext(geography, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_astext(geography, int4) TO postgres;

-- DROP FUNCTION public.st_astwkb(geometry, int4, int4, int4, bool, bool);

CREATE OR REPLACE FUNCTION public.st_astwkb(geom geometry, prec integer DEFAULT NULL::integer, prec_z integer DEFAULT NULL::integer, prec_m integer DEFAULT NULL::integer, with_sizes boolean DEFAULT NULL::boolean, with_boxes boolean DEFAULT NULL::boolean)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$TWKBFromLWGEOM$function$
;

-- Permissions

ALTER FUNCTION public.st_astwkb(geometry, int4, int4, int4, bool, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_astwkb(geometry, int4, int4, int4, bool, bool) TO postgres;

-- DROP FUNCTION public.st_astwkb(_geometry, _int8, int4, int4, int4, bool, bool);

CREATE OR REPLACE FUNCTION public.st_astwkb(geom geometry[], ids bigint[], prec integer DEFAULT NULL::integer, prec_z integer DEFAULT NULL::integer, prec_m integer DEFAULT NULL::integer, with_sizes boolean DEFAULT NULL::boolean, with_boxes boolean DEFAULT NULL::boolean)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$TWKBFromLWGEOMArray$function$
;

-- Permissions

ALTER FUNCTION public.st_astwkb(_geometry, _int8, int4, int4, int4, bool, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_astwkb(_geometry, _int8, int4, int4, int4, bool, bool) TO postgres;

-- DROP FUNCTION public.st_asx3d(geometry, int4, int4);

CREATE OR REPLACE FUNCTION public.st_asx3d(geom geometry, maxdecimaldigits integer DEFAULT 15, options integer DEFAULT 0)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE COST 250
AS $function$SELECT public._ST_AsX3D(3,$1,$2,$3,'');$function$
;

-- Permissions

ALTER FUNCTION public.st_asx3d(geometry, int4, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_asx3d(geometry, int4, int4) TO postgres;

-- DROP FUNCTION public.st_azimuth(geography, geography);

CREATE OR REPLACE FUNCTION public.st_azimuth(geog1 geography, geog2 geography)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geography_azimuth$function$
;

-- Permissions

ALTER FUNCTION public.st_azimuth(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_azimuth(geography, geography) TO postgres;

-- DROP FUNCTION public.st_azimuth(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_azimuth(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_azimuth$function$
;

-- Permissions

ALTER FUNCTION public.st_azimuth(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_azimuth(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_bdmpolyfromtext(text, int4);

CREATE OR REPLACE FUNCTION public.st_bdmpolyfromtext(text, integer)
 RETURNS geometry
 LANGUAGE plpgsql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
DECLARE
	geomtext alias for $1;
	srid alias for $2;
	mline public.geometry;
	geom public.geometry;
BEGIN
	mline := public.ST_MultiLineStringFromText(geomtext, srid);

	IF mline IS NULL
	THEN
		RAISE EXCEPTION 'Input is not a MultiLinestring';
	END IF;

	geom := public.ST_Multi(public.ST_BuildArea(mline));

	RETURN geom;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.st_bdmpolyfromtext(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_bdmpolyfromtext(text, int4) TO postgres;

-- DROP FUNCTION public.st_bdpolyfromtext(text, int4);

CREATE OR REPLACE FUNCTION public.st_bdpolyfromtext(text, integer)
 RETURNS geometry
 LANGUAGE plpgsql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
DECLARE
	geomtext alias for $1;
	srid alias for $2;
	mline public.geometry;
	geom public.geometry;
BEGIN
	mline := public.ST_MultiLineStringFromText(geomtext, srid);

	IF mline IS NULL
	THEN
		RAISE EXCEPTION 'Input is not a MultiLinestring';
	END IF;

	geom := public.ST_BuildArea(mline);

	IF public.ST_GeometryType(geom) != 'ST_Polygon'
	THEN
		RAISE EXCEPTION 'Input returns more then a single polygon, try using BdMPolyFromText instead';
	END IF;

	RETURN geom;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.st_bdpolyfromtext(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_bdpolyfromtext(text, int4) TO postgres;

-- DROP FUNCTION public.st_boundary(geometry);

CREATE OR REPLACE FUNCTION public.st_boundary(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$boundary$function$
;

-- Permissions

ALTER FUNCTION public.st_boundary(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_boundary(geometry) TO postgres;

-- DROP FUNCTION public.st_boundingdiagonal(geometry, bool);

CREATE OR REPLACE FUNCTION public.st_boundingdiagonal(geom geometry, fits boolean DEFAULT false)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$ST_BoundingDiagonal$function$
;

-- Permissions

ALTER FUNCTION public.st_boundingdiagonal(geometry, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_boundingdiagonal(geometry, bool) TO postgres;

-- DROP FUNCTION public.st_box2dfromgeohash(text, int4);

CREATE OR REPLACE FUNCTION public.st_box2dfromgeohash(text, integer DEFAULT NULL::integer)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$box2d_from_geohash$function$
;

-- Permissions

ALTER FUNCTION public.st_box2dfromgeohash(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_box2dfromgeohash(text, int4) TO postgres;

-- DROP FUNCTION public.st_buffer(geometry, float8, int4);

CREATE OR REPLACE FUNCTION public.st_buffer(geom geometry, radius double precision, quadsegs integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS $function$ SELECT public.ST_Buffer($1, $2, CAST('quad_segs='||CAST($3 AS text) as text)) $function$
;

-- Permissions

ALTER FUNCTION public.st_buffer(geometry, float8, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_buffer(geometry, float8, int4) TO postgres;

-- DROP FUNCTION public.st_buffer(text, float8, text);

CREATE OR REPLACE FUNCTION public.st_buffer(text, double precision, text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ SELECT public.ST_Buffer($1::public.geometry, $2, $3);  $function$
;

-- Permissions

ALTER FUNCTION public.st_buffer(text, float8, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_buffer(text, float8, text) TO postgres;

-- DROP FUNCTION public.st_buffer(geography, float8, text);

CREATE OR REPLACE FUNCTION public.st_buffer(geography, double precision, text)
 RETURNS geography
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$SELECT public.geography(public.ST_Transform(public.ST_Buffer(public.ST_Transform(public.geometry($1), public._ST_BestSRID($1)), $2, $3), public.ST_SRID($1)))$function$
;

-- Permissions

ALTER FUNCTION public.st_buffer(geography, float8, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_buffer(geography, float8, text) TO postgres;

-- DROP FUNCTION public.st_buffer(text, float8);

CREATE OR REPLACE FUNCTION public.st_buffer(text, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ SELECT public.ST_Buffer($1::public.geometry, $2);  $function$
;

-- Permissions

ALTER FUNCTION public.st_buffer(text, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_buffer(text, float8) TO postgres;

-- DROP FUNCTION public.st_buffer(geography, float8, int4);

CREATE OR REPLACE FUNCTION public.st_buffer(geography, double precision, integer)
 RETURNS geography
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$SELECT public.geography(public.ST_Transform(public.ST_Buffer(public.ST_Transform(public.geometry($1), public._ST_BestSRID($1)), $2, $3), public.ST_SRID($1)))$function$
;

-- Permissions

ALTER FUNCTION public.st_buffer(geography, float8, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_buffer(geography, float8, int4) TO postgres;

-- DROP FUNCTION public.st_buffer(geography, float8);

CREATE OR REPLACE FUNCTION public.st_buffer(geography, double precision)
 RETURNS geography
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$SELECT public.geography(public.ST_Transform(public.ST_Buffer(public.ST_Transform(public.geometry($1), public._ST_BestSRID($1)), $2), public.ST_SRID($1)))$function$
;

-- Permissions

ALTER FUNCTION public.st_buffer(geography, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_buffer(geography, float8) TO postgres;

-- DROP FUNCTION public.st_buffer(text, float8, int4);

CREATE OR REPLACE FUNCTION public.st_buffer(text, double precision, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ SELECT public.ST_Buffer($1::public.geometry, $2, $3);  $function$
;

-- Permissions

ALTER FUNCTION public.st_buffer(text, float8, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_buffer(text, float8, int4) TO postgres;

-- DROP FUNCTION public.st_buffer(geometry, float8, text);

CREATE OR REPLACE FUNCTION public.st_buffer(geom geometry, radius double precision, options text DEFAULT ''::text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$buffer$function$
;

-- Permissions

ALTER FUNCTION public.st_buffer(geometry, float8, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_buffer(geometry, float8, text) TO postgres;

-- DROP FUNCTION public.st_buildarea(geometry);

CREATE OR REPLACE FUNCTION public.st_buildarea(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_BuildArea$function$
;

-- Permissions

ALTER FUNCTION public.st_buildarea(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_buildarea(geometry) TO postgres;

-- DROP FUNCTION public.st_centroid(geography, bool);

CREATE OR REPLACE FUNCTION public.st_centroid(geography, use_spheroid boolean DEFAULT true)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geography_centroid$function$
;

-- Permissions

ALTER FUNCTION public.st_centroid(geography, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_centroid(geography, bool) TO postgres;

-- DROP FUNCTION public.st_centroid(text);

CREATE OR REPLACE FUNCTION public.st_centroid(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ SELECT public.ST_Centroid($1::public.geometry);  $function$
;

-- Permissions

ALTER FUNCTION public.st_centroid(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_centroid(text) TO postgres;

-- DROP FUNCTION public.st_centroid(geometry);

CREATE OR REPLACE FUNCTION public.st_centroid(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$centroid$function$
;

-- Permissions

ALTER FUNCTION public.st_centroid(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_centroid(geometry) TO postgres;

-- DROP FUNCTION public.st_chaikinsmoothing(geometry, int4, bool);

CREATE OR REPLACE FUNCTION public.st_chaikinsmoothing(geometry, integer DEFAULT 1, boolean DEFAULT false)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_ChaikinSmoothing$function$
;

-- Permissions

ALTER FUNCTION public.st_chaikinsmoothing(geometry, int4, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_chaikinsmoothing(geometry, int4, bool) TO postgres;

-- DROP FUNCTION public.st_cleangeometry(geometry);

CREATE OR REPLACE FUNCTION public.st_cleangeometry(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_CleanGeometry$function$
;

-- Permissions

ALTER FUNCTION public.st_cleangeometry(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_cleangeometry(geometry) TO postgres;

-- DROP FUNCTION public.st_clipbybox2d(geometry, box2d);

CREATE OR REPLACE FUNCTION public.st_clipbybox2d(geom geometry, box box2d)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_ClipByBox2d$function$
;

-- Permissions

ALTER FUNCTION public.st_clipbybox2d(geometry, box2d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_clipbybox2d(geometry, box2d) TO postgres;

-- DROP FUNCTION public.st_closestpoint(text, text);

CREATE OR REPLACE FUNCTION public.st_closestpoint(text, text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public.ST_ClosestPoint($1::public.geometry, $2::public.geometry);  $function$
;

-- Permissions

ALTER FUNCTION public.st_closestpoint(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_closestpoint(text, text) TO postgres;

-- DROP FUNCTION public.st_closestpoint(geography, geography, bool);

CREATE OR REPLACE FUNCTION public.st_closestpoint(geography, geography, use_spheroid boolean DEFAULT true)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_closestpoint$function$
;

-- Permissions

ALTER FUNCTION public.st_closestpoint(geography, geography, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_closestpoint(geography, geography, bool) TO postgres;

-- DROP FUNCTION public.st_closestpoint(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_closestpoint(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_closestpoint$function$
;

-- Permissions

ALTER FUNCTION public.st_closestpoint(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_closestpoint(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_closestpointofapproach(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_closestpointofapproach(geometry, geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_ClosestPointOfApproach$function$
;

-- Permissions

ALTER FUNCTION public.st_closestpointofapproach(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_closestpointofapproach(geometry, geometry) TO postgres;

-- DROP WINDOW public.st_clusterdbscan(geometry, float8, int4);

CREATE OR REPLACE FUNCTION public.st_clusterdbscan(geometry, eps double precision, minpoints integer)
 RETURNS integer
 LANGUAGE c
 WINDOW IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_ClusterDBSCAN$function$
;

-- Permissions

ALTER WINDOW public.st_clusterdbscan(geometry, float8, int4) OWNER TO postgres;
GRANT ALL ON WINDOW public.st_clusterdbscan(geometry, float8, int4) TO postgres;

-- DROP FUNCTION public.st_clusterintersecting(_geometry);

CREATE OR REPLACE FUNCTION public.st_clusterintersecting(geometry[])
 RETURNS geometry[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$clusterintersecting_garray$function$
;

-- Permissions

ALTER FUNCTION public.st_clusterintersecting(_geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_clusterintersecting(_geometry) TO postgres;

-- DROP AGGREGATE public.st_clusterintersecting(geometry);

-- Aggregate function public.st_clusterintersecting(geometry)
-- ERROR: more than one function named "public.st_clusterintersecting";

-- Permissions

ALTER AGGREGATE public.st_clusterintersecting(geometry) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_clusterintersecting(geometry) TO postgres;

-- DROP WINDOW public.st_clusterintersectingwin(geometry);

CREATE OR REPLACE FUNCTION public.st_clusterintersectingwin(geometry)
 RETURNS integer
 LANGUAGE c
 WINDOW IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_ClusterIntersectingWin$function$
;

-- Permissions

ALTER WINDOW public.st_clusterintersectingwin(geometry) OWNER TO postgres;
GRANT ALL ON WINDOW public.st_clusterintersectingwin(geometry) TO postgres;

-- DROP WINDOW public.st_clusterkmeans(geometry, int4, float8);

CREATE OR REPLACE FUNCTION public.st_clusterkmeans(geom geometry, k integer, max_radius double precision DEFAULT NULL::double precision)
 RETURNS integer
 LANGUAGE c
 WINDOW STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_ClusterKMeans$function$
;

-- Permissions

ALTER WINDOW public.st_clusterkmeans(geometry, int4, float8) OWNER TO postgres;
GRANT ALL ON WINDOW public.st_clusterkmeans(geometry, int4, float8) TO postgres;

-- DROP FUNCTION public.st_clusterwithin(_geometry, float8);

CREATE OR REPLACE FUNCTION public.st_clusterwithin(geometry[], double precision)
 RETURNS geometry[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$cluster_within_distance_garray$function$
;

-- Permissions

ALTER FUNCTION public.st_clusterwithin(_geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_clusterwithin(_geometry, float8) TO postgres;

-- DROP AGGREGATE public.st_clusterwithin(geometry, float8);

-- Aggregate function public.st_clusterwithin(geometry, float8)
-- ERROR: more than one function named "public.st_clusterwithin";

-- Permissions

ALTER AGGREGATE public.st_clusterwithin(geometry, float8) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_clusterwithin(geometry, float8) TO postgres;

-- DROP WINDOW public.st_clusterwithinwin(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_clusterwithinwin(geometry, distance double precision)
 RETURNS integer
 LANGUAGE c
 WINDOW IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_ClusterWithinWin$function$
;

-- Permissions

ALTER WINDOW public.st_clusterwithinwin(geometry, float8) OWNER TO postgres;
GRANT ALL ON WINDOW public.st_clusterwithinwin(geometry, float8) TO postgres;

-- DROP AGGREGATE public.st_collect(geometry);

-- Aggregate function public.st_collect(geometry)
-- ERROR: more than one function named "public.st_collect";

-- Permissions

ALTER AGGREGATE public.st_collect(geometry) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_collect(geometry) TO postgres;

-- DROP FUNCTION public.st_collect(_geometry);

CREATE OR REPLACE FUNCTION public.st_collect(geometry[])
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_collect_garray$function$
;

-- Permissions

ALTER FUNCTION public.st_collect(_geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_collect(_geometry) TO postgres;

-- DROP FUNCTION public.st_collect(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_collect(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$LWGEOM_collect$function$
;

-- Permissions

ALTER FUNCTION public.st_collect(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_collect(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_collectionextract(geometry);

CREATE OR REPLACE FUNCTION public.st_collectionextract(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_CollectionExtract$function$
;

-- Permissions

ALTER FUNCTION public.st_collectionextract(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_collectionextract(geometry) TO postgres;

-- DROP FUNCTION public.st_collectionextract(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_collectionextract(geometry, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_CollectionExtract$function$
;

-- Permissions

ALTER FUNCTION public.st_collectionextract(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_collectionextract(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_collectionhomogenize(geometry);

CREATE OR REPLACE FUNCTION public.st_collectionhomogenize(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_CollectionHomogenize$function$
;

-- Permissions

ALTER FUNCTION public.st_collectionhomogenize(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_collectionhomogenize(geometry) TO postgres;

-- DROP FUNCTION public.st_combinebbox(box3d, geometry);

CREATE OR REPLACE FUNCTION public.st_combinebbox(box3d, geometry)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$BOX3D_combine$function$
;

-- Permissions

ALTER FUNCTION public.st_combinebbox(box3d, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_combinebbox(box3d, geometry) TO postgres;

-- DROP FUNCTION public.st_combinebbox(box3d, box3d);

CREATE OR REPLACE FUNCTION public.st_combinebbox(box3d, box3d)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$BOX3D_combine_BOX3D$function$
;

-- Permissions

ALTER FUNCTION public.st_combinebbox(box3d, box3d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_combinebbox(box3d, box3d) TO postgres;

-- DROP FUNCTION public.st_combinebbox(box2d, geometry);

CREATE OR REPLACE FUNCTION public.st_combinebbox(box2d, geometry)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/postgis-3', $function$BOX2D_combine$function$
;

-- Permissions

ALTER FUNCTION public.st_combinebbox(box2d, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_combinebbox(box2d, geometry) TO postgres;

-- DROP FUNCTION public.st_concavehull(geometry, float8, bool);

CREATE OR REPLACE FUNCTION public.st_concavehull(param_geom geometry, param_pctconvex double precision, param_allow_holes boolean DEFAULT false)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_ConcaveHull$function$
;

-- Permissions

ALTER FUNCTION public.st_concavehull(geometry, float8, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_concavehull(geometry, float8, bool) TO postgres;

-- DROP FUNCTION public.st_contains(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_contains(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$contains$function$
;

-- Permissions

ALTER FUNCTION public.st_contains(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_contains(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_containsproperly(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_containsproperly(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$containsproperly$function$
;

-- Permissions

ALTER FUNCTION public.st_containsproperly(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_containsproperly(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_convexhull(geometry);

CREATE OR REPLACE FUNCTION public.st_convexhull(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$convexhull$function$
;

-- Permissions

ALTER FUNCTION public.st_convexhull(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_convexhull(geometry) TO postgres;

-- DROP FUNCTION public.st_coorddim(geometry);

CREATE OR REPLACE FUNCTION public.st_coorddim(geometry geometry)
 RETURNS smallint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_ndims$function$
;

-- Permissions

ALTER FUNCTION public.st_coorddim(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_coorddim(geometry) TO postgres;

-- DROP WINDOW public.st_coverageclean(geometry, float8, float8, text);

CREATE OR REPLACE FUNCTION public.st_coverageclean(geom geometry, gapmaximumwidth double precision DEFAULT 0.0, snappingdistance double precision DEFAULT '-1.0'::numeric, overlapmergestrategy text DEFAULT 'MERGE_LONGEST_BORDER'::text)
 RETURNS geometry
 LANGUAGE c
 WINDOW IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_CoverageClean$function$
;

-- Permissions

ALTER WINDOW public.st_coverageclean(geometry, float8, float8, text) OWNER TO postgres;
GRANT ALL ON WINDOW public.st_coverageclean(geometry, float8, float8, text) TO postgres;

-- DROP WINDOW public.st_coverageinvalidedges(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_coverageinvalidedges(geom geometry, tolerance double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 WINDOW IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_CoverageInvalidEdges$function$
;

-- Permissions

ALTER WINDOW public.st_coverageinvalidedges(geometry, float8) OWNER TO postgres;
GRANT ALL ON WINDOW public.st_coverageinvalidedges(geometry, float8) TO postgres;

-- DROP WINDOW public.st_coveragesimplify(geometry, float8, bool);

CREATE OR REPLACE FUNCTION public.st_coveragesimplify(geom geometry, tolerance double precision, simplifyboundary boolean DEFAULT true)
 RETURNS geometry
 LANGUAGE c
 WINDOW IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_CoverageSimplify$function$
;

-- Permissions

ALTER WINDOW public.st_coveragesimplify(geometry, float8, bool) OWNER TO postgres;
GRANT ALL ON WINDOW public.st_coveragesimplify(geometry, float8, bool) TO postgres;

-- DROP FUNCTION public.st_coverageunion(_geometry);

CREATE OR REPLACE FUNCTION public.st_coverageunion(geometry[])
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_CoverageUnion$function$
;

-- Permissions

ALTER FUNCTION public.st_coverageunion(_geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_coverageunion(_geometry) TO postgres;

-- DROP AGGREGATE public.st_coverageunion(geometry);

-- Aggregate function public.st_coverageunion(geometry)
-- ERROR: more than one function named "public.st_coverageunion";

-- Permissions

ALTER AGGREGATE public.st_coverageunion(geometry) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_coverageunion(geometry) TO postgres;

-- DROP FUNCTION public.st_coveredby(text, text);

CREATE OR REPLACE FUNCTION public.st_coveredby(text, text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public.ST_CoveredBy($1::public.geometry, $2::public.geometry);  $function$
;

-- Permissions

ALTER FUNCTION public.st_coveredby(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_coveredby(text, text) TO postgres;

-- DROP FUNCTION public.st_coveredby(geography, geography);

CREATE OR REPLACE FUNCTION public.st_coveredby(geog1 geography, geog2 geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$geography_coveredby$function$
;

-- Permissions

ALTER FUNCTION public.st_coveredby(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_coveredby(geography, geography) TO postgres;

-- DROP FUNCTION public.st_coveredby(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_coveredby(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$coveredby$function$
;

-- Permissions

ALTER FUNCTION public.st_coveredby(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_coveredby(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_covers(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_covers(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$covers$function$
;

-- Permissions

ALTER FUNCTION public.st_covers(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_covers(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_covers(geography, geography);

CREATE OR REPLACE FUNCTION public.st_covers(geog1 geography, geog2 geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$geography_covers$function$
;

-- Permissions

ALTER FUNCTION public.st_covers(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_covers(geography, geography) TO postgres;

-- DROP FUNCTION public.st_covers(text, text);

CREATE OR REPLACE FUNCTION public.st_covers(text, text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public.ST_Covers($1::public.geometry, $2::public.geometry);  $function$
;

-- Permissions

ALTER FUNCTION public.st_covers(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_covers(text, text) TO postgres;

-- DROP FUNCTION public.st_cpawithin(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public.st_cpawithin(geometry, geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_CPAWithin$function$
;

-- Permissions

ALTER FUNCTION public.st_cpawithin(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_cpawithin(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public.st_crosses(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_crosses(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$crosses$function$
;

-- Permissions

ALTER FUNCTION public.st_crosses(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_crosses(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_curven(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_curven(geometry geometry, i integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_CurveN$function$
;

-- Permissions

ALTER FUNCTION public.st_curven(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_curven(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_curvetoline(geometry, float8, int4, int4);

CREATE OR REPLACE FUNCTION public.st_curvetoline(geom geometry, tol double precision DEFAULT 32, toltype integer DEFAULT 0, flags integer DEFAULT 0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_CurveToLine$function$
;

-- Permissions

ALTER FUNCTION public.st_curvetoline(geometry, float8, int4, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_curvetoline(geometry, float8, int4, int4) TO postgres;

-- DROP FUNCTION public.st_delaunaytriangles(geometry, float8, int4);

CREATE OR REPLACE FUNCTION public.st_delaunaytriangles(g1 geometry, tolerance double precision DEFAULT 0.0, flags integer DEFAULT 0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_DelaunayTriangles$function$
;

-- Permissions

ALTER FUNCTION public.st_delaunaytriangles(geometry, float8, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_delaunaytriangles(geometry, float8, int4) TO postgres;

-- DROP FUNCTION public.st_dfullywithin(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public.st_dfullywithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$LWGEOM_dfullywithin$function$
;

-- Permissions

ALTER FUNCTION public.st_dfullywithin(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_dfullywithin(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public.st_difference(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public.st_difference(geom1 geometry, geom2 geometry, gridsize double precision DEFAULT '-1.0'::numeric)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_Difference$function$
;

-- Permissions

ALTER FUNCTION public.st_difference(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_difference(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public.st_dimension(geometry);

CREATE OR REPLACE FUNCTION public.st_dimension(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_dimension$function$
;

-- Permissions

ALTER FUNCTION public.st_dimension(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_dimension(geometry) TO postgres;

-- DROP FUNCTION public.st_disjoint(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_disjoint(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$disjoint$function$
;

-- Permissions

ALTER FUNCTION public.st_disjoint(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_disjoint(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_distance(text, text);

CREATE OR REPLACE FUNCTION public.st_distance(text, text)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ SELECT public.ST_Distance($1::public.geometry, $2::public.geometry);  $function$
;

-- Permissions

ALTER FUNCTION public.st_distance(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_distance(text, text) TO postgres;

-- DROP FUNCTION public.st_distance(geography, geography, bool);

CREATE OR REPLACE FUNCTION public.st_distance(geog1 geography, geog2 geography, use_spheroid boolean DEFAULT true)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$geography_distance$function$
;

-- Permissions

ALTER FUNCTION public.st_distance(geography, geography, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_distance(geography, geography, bool) TO postgres;

-- DROP FUNCTION public.st_distance(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_distance(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_Distance$function$
;

-- Permissions

ALTER FUNCTION public.st_distance(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_distance(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_distancecpa(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_distancecpa(geometry, geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_DistanceCPA$function$
;

-- Permissions

ALTER FUNCTION public.st_distancecpa(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_distancecpa(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_distancesphere(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public.st_distancesphere(geom1 geometry, geom2 geometry, radius double precision)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE STRICT COST 5000
AS '$libdir/postgis-3', $function$LWGEOM_distance_sphere$function$
;

-- Permissions

ALTER FUNCTION public.st_distancesphere(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_distancesphere(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public.st_distancesphere(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_distancesphere(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$select public.ST_distance( public.geography($1), public.geography($2),false)$function$
;

-- Permissions

ALTER FUNCTION public.st_distancesphere(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_distancesphere(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_distancespheroid(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_distancespheroid(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_distance_ellipsoid$function$
;

-- Permissions

ALTER FUNCTION public.st_distancespheroid(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_distancespheroid(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_distancespheroid(geometry, geometry, spheroid);

CREATE OR REPLACE FUNCTION public.st_distancespheroid(geom1 geometry, geom2 geometry, spheroid)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_distance_ellipsoid$function$
;

-- Permissions

ALTER FUNCTION public.st_distancespheroid(geometry, geometry, spheroid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_distancespheroid(geometry, geometry, spheroid) TO postgres;

-- DROP FUNCTION public.st_dump(geometry);

CREATE OR REPLACE FUNCTION public.st_dump(geometry)
 RETURNS SETOF geometry_dump
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_dump$function$
;

-- Permissions

ALTER FUNCTION public.st_dump(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_dump(geometry) TO postgres;

-- DROP FUNCTION public.st_dumppoints(geometry);

CREATE OR REPLACE FUNCTION public.st_dumppoints(geometry)
 RETURNS SETOF geometry_dump
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$LWGEOM_dumppoints$function$
;

-- Permissions

ALTER FUNCTION public.st_dumppoints(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_dumppoints(geometry) TO postgres;

-- DROP FUNCTION public.st_dumprings(geometry);

CREATE OR REPLACE FUNCTION public.st_dumprings(geometry)
 RETURNS SETOF geometry_dump
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_dump_rings$function$
;

-- Permissions

ALTER FUNCTION public.st_dumprings(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_dumprings(geometry) TO postgres;

-- DROP FUNCTION public.st_dumpsegments(geometry);

CREATE OR REPLACE FUNCTION public.st_dumpsegments(geometry)
 RETURNS SETOF geometry_dump
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$LWGEOM_dumpsegments$function$
;

-- Permissions

ALTER FUNCTION public.st_dumpsegments(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_dumpsegments(geometry) TO postgres;

-- DROP FUNCTION public.st_dwithin(geography, geography, float8, bool);

CREATE OR REPLACE FUNCTION public.st_dwithin(geog1 geography, geog2 geography, tolerance double precision, use_spheroid boolean DEFAULT true)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$geography_dwithin$function$
;

-- Permissions

ALTER FUNCTION public.st_dwithin(geography, geography, float8, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_dwithin(geography, geography, float8, bool) TO postgres;

-- DROP FUNCTION public.st_dwithin(text, text, float8);

CREATE OR REPLACE FUNCTION public.st_dwithin(text, text, double precision)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public.ST_DWithin($1::public.geometry, $2::public.geometry, $3);  $function$
;

-- Permissions

ALTER FUNCTION public.st_dwithin(text, text, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_dwithin(text, text, float8) TO postgres;

-- DROP FUNCTION public.st_dwithin(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public.st_dwithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$LWGEOM_dwithin$function$
;

-- Permissions

ALTER FUNCTION public.st_dwithin(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_dwithin(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public.st_endpoint(geometry);

CREATE OR REPLACE FUNCTION public.st_endpoint(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_endpoint_linestring$function$
;

-- Permissions

ALTER FUNCTION public.st_endpoint(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_endpoint(geometry) TO postgres;

-- DROP FUNCTION public.st_envelope(geometry);

CREATE OR REPLACE FUNCTION public.st_envelope(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_envelope$function$
;

-- Permissions

ALTER FUNCTION public.st_envelope(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_envelope(geometry) TO postgres;

-- DROP FUNCTION public.st_equals(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_equals(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$ST_Equals$function$
;

-- Permissions

ALTER FUNCTION public.st_equals(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_equals(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_estimatedextent(text, text);

CREATE OR REPLACE FUNCTION public.st_estimatedextent(text, text)
 RETURNS box2d
 LANGUAGE c
 STABLE STRICT
AS '$libdir/postgis-3', $function$gserialized_estimated_extent$function$
;

-- Permissions

ALTER FUNCTION public.st_estimatedextent(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_estimatedextent(text, text) TO postgres;

-- DROP FUNCTION public.st_estimatedextent(text, text, text);

CREATE OR REPLACE FUNCTION public.st_estimatedextent(text, text, text)
 RETURNS box2d
 LANGUAGE c
 STABLE STRICT
AS '$libdir/postgis-3', $function$gserialized_estimated_extent$function$
;

-- Permissions

ALTER FUNCTION public.st_estimatedextent(text, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_estimatedextent(text, text, text) TO postgres;

-- DROP FUNCTION public.st_estimatedextent(text, text, text, bool);

CREATE OR REPLACE FUNCTION public.st_estimatedextent(text, text, text, boolean)
 RETURNS box2d
 LANGUAGE c
 STABLE STRICT
AS '$libdir/postgis-3', $function$gserialized_estimated_extent$function$
;

-- Permissions

ALTER FUNCTION public.st_estimatedextent(text, text, text, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_estimatedextent(text, text, text, bool) TO postgres;

-- DROP FUNCTION public.st_expand(box3d, float8, float8, float8);

CREATE OR REPLACE FUNCTION public.st_expand(box box3d, dx double precision, dy double precision, dz double precision DEFAULT 0)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_expand$function$
;

-- Permissions

ALTER FUNCTION public.st_expand(box3d, float8, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_expand(box3d, float8, float8, float8) TO postgres;

-- DROP FUNCTION public.st_expand(box2d, float8, float8);

CREATE OR REPLACE FUNCTION public.st_expand(box box2d, dx double precision, dy double precision)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX2D_expand$function$
;

-- Permissions

ALTER FUNCTION public.st_expand(box2d, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_expand(box2d, float8, float8) TO postgres;

-- DROP FUNCTION public.st_expand(geometry, float8, float8, float8, float8);

CREATE OR REPLACE FUNCTION public.st_expand(geom geometry, dx double precision, dy double precision, dz double precision DEFAULT 0, dm double precision DEFAULT 0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_expand$function$
;

-- Permissions

ALTER FUNCTION public.st_expand(geometry, float8, float8, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_expand(geometry, float8, float8, float8, float8) TO postgres;

-- DROP FUNCTION public.st_expand(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_expand(geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_expand$function$
;

-- Permissions

ALTER FUNCTION public.st_expand(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_expand(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_expand(box2d, float8);

CREATE OR REPLACE FUNCTION public.st_expand(box2d, double precision)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX2D_expand$function$
;

-- Permissions

ALTER FUNCTION public.st_expand(box2d, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_expand(box2d, float8) TO postgres;

-- DROP FUNCTION public.st_expand(box3d, float8);

CREATE OR REPLACE FUNCTION public.st_expand(box3d, double precision)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_expand$function$
;

-- Permissions

ALTER FUNCTION public.st_expand(box3d, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_expand(box3d, float8) TO postgres;

-- DROP AGGREGATE public.st_extent(geometry);

CREATE OR REPLACE AGGREGATE public.st_extent(public.geometry) (
	SFUNC = public.st_combinebbox,
	STYPE = box3d,
	FINALFUNC = public.box2d,
	FINALFUNC_MODIFY = READ_ONLY
);

-- Permissions

ALTER AGGREGATE public.st_extent(geometry) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_extent(geometry) TO postgres;

-- DROP FUNCTION public.st_exteriorring(geometry);

CREATE OR REPLACE FUNCTION public.st_exteriorring(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_exteriorring_polygon$function$
;

-- Permissions

ALTER FUNCTION public.st_exteriorring(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_exteriorring(geometry) TO postgres;

-- DROP FUNCTION public.st_filterbym(geometry, float8, float8, bool);

CREATE OR REPLACE FUNCTION public.st_filterbym(geometry, double precision, double precision DEFAULT NULL::double precision, boolean DEFAULT false)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$LWGEOM_FilterByM$function$
;

-- Permissions

ALTER FUNCTION public.st_filterbym(geometry, float8, float8, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_filterbym(geometry, float8, float8, bool) TO postgres;

-- DROP FUNCTION public.st_findextent(text, text);

CREATE OR REPLACE FUNCTION public.st_findextent(text, text)
 RETURNS box2d
 LANGUAGE plpgsql
 STABLE PARALLEL SAFE STRICT
AS $function$
DECLARE
	tablename alias for $1;
	columnname alias for $2;
	myrec RECORD;

BEGIN
	FOR myrec IN EXECUTE 'SELECT public.ST_Extent("' || columnname || '") As extent FROM "' || tablename || '"' LOOP
		return myrec.extent;
	END LOOP;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.st_findextent(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_findextent(text, text) TO postgres;

-- DROP FUNCTION public.st_findextent(text, text, text);

CREATE OR REPLACE FUNCTION public.st_findextent(text, text, text)
 RETURNS box2d
 LANGUAGE plpgsql
 STABLE PARALLEL SAFE STRICT
AS $function$
DECLARE
	schemaname alias for $1;
	tablename alias for $2;
	columnname alias for $3;
	myrec RECORD;
BEGIN
	FOR myrec IN EXECUTE 'SELECT public.ST_Extent("' || columnname || '") As extent FROM "' || schemaname || '"."' || tablename || '"' LOOP
		return myrec.extent;
	END LOOP;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.st_findextent(text, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_findextent(text, text, text) TO postgres;

-- DROP FUNCTION public.st_flipcoordinates(geometry);

CREATE OR REPLACE FUNCTION public.st_flipcoordinates(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_FlipCoordinates$function$
;

-- Permissions

ALTER FUNCTION public.st_flipcoordinates(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_flipcoordinates(geometry) TO postgres;

-- DROP FUNCTION public.st_force2d(geometry);

CREATE OR REPLACE FUNCTION public.st_force2d(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_2d$function$
;

-- Permissions

ALTER FUNCTION public.st_force2d(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_force2d(geometry) TO postgres;

-- DROP FUNCTION public.st_force3d(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_force3d(geom geometry, zvalue double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Force3DZ($1, $2)$function$
;

-- Permissions

ALTER FUNCTION public.st_force3d(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_force3d(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_force3dm(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_force3dm(geom geometry, mvalue double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_3dm$function$
;

-- Permissions

ALTER FUNCTION public.st_force3dm(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_force3dm(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_force3dz(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_force3dz(geom geometry, zvalue double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_3dz$function$
;

-- Permissions

ALTER FUNCTION public.st_force3dz(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_force3dz(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_force4d(geometry, float8, float8);

CREATE OR REPLACE FUNCTION public.st_force4d(geom geometry, zvalue double precision DEFAULT 0.0, mvalue double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_4d$function$
;

-- Permissions

ALTER FUNCTION public.st_force4d(geometry, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_force4d(geometry, float8, float8) TO postgres;

-- DROP FUNCTION public.st_forcecollection(geometry);

CREATE OR REPLACE FUNCTION public.st_forcecollection(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_collection$function$
;

-- Permissions

ALTER FUNCTION public.st_forcecollection(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_forcecollection(geometry) TO postgres;

-- DROP FUNCTION public.st_forcecurve(geometry);

CREATE OR REPLACE FUNCTION public.st_forcecurve(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_force_curve$function$
;

-- Permissions

ALTER FUNCTION public.st_forcecurve(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_forcecurve(geometry) TO postgres;

-- DROP FUNCTION public.st_forcepolygonccw(geometry);

CREATE OR REPLACE FUNCTION public.st_forcepolygonccw(geometry)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$ SELECT public.ST_Reverse(public.ST_ForcePolygonCW($1)) $function$
;

-- Permissions

ALTER FUNCTION public.st_forcepolygonccw(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_forcepolygonccw(geometry) TO postgres;

-- DROP FUNCTION public.st_forcepolygoncw(geometry);

CREATE OR REPLACE FUNCTION public.st_forcepolygoncw(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_clockwise_poly$function$
;

-- Permissions

ALTER FUNCTION public.st_forcepolygoncw(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_forcepolygoncw(geometry) TO postgres;

-- DROP FUNCTION public.st_forcerhr(geometry);

CREATE OR REPLACE FUNCTION public.st_forcerhr(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_clockwise_poly$function$
;

-- Permissions

ALTER FUNCTION public.st_forcerhr(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_forcerhr(geometry) TO postgres;

-- DROP FUNCTION public.st_forcesfs(geometry);

CREATE OR REPLACE FUNCTION public.st_forcesfs(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_force_sfs$function$
;

-- Permissions

ALTER FUNCTION public.st_forcesfs(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_forcesfs(geometry) TO postgres;

-- DROP FUNCTION public.st_forcesfs(geometry, text);

CREATE OR REPLACE FUNCTION public.st_forcesfs(geometry, version text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_force_sfs$function$
;

-- Permissions

ALTER FUNCTION public.st_forcesfs(geometry, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_forcesfs(geometry, text) TO postgres;

-- DROP FUNCTION public.st_frechetdistance(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public.st_frechetdistance(geom1 geometry, geom2 geometry, double precision DEFAULT '-1'::integer)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_FrechetDistance$function$
;

-- Permissions

ALTER FUNCTION public.st_frechetdistance(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_frechetdistance(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public.st_fromflatgeobuf(anyelement, bytea);

CREATE OR REPLACE FUNCTION public.st_fromflatgeobuf(anyelement, bytea)
 RETURNS SETOF anyelement
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$pgis_fromflatgeobuf$function$
;

-- Permissions

ALTER FUNCTION public.st_fromflatgeobuf(anyelement, bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_fromflatgeobuf(anyelement, bytea) TO postgres;

-- DROP FUNCTION public.st_fromflatgeobuftotable(text, text, bytea);

CREATE OR REPLACE FUNCTION public.st_fromflatgeobuftotable(text, text, bytea)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$pgis_tablefromflatgeobuf$function$
;

-- Permissions

ALTER FUNCTION public.st_fromflatgeobuftotable(text, text, bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_fromflatgeobuftotable(text, text, bytea) TO postgres;

-- DROP FUNCTION public.st_generatepoints(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_generatepoints(area geometry, npoints integer)
 RETURNS geometry
 LANGUAGE c
 PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_GeneratePoints$function$
;

-- Permissions

ALTER FUNCTION public.st_generatepoints(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_generatepoints(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_generatepoints(geometry, int4, int4);

CREATE OR REPLACE FUNCTION public.st_generatepoints(area geometry, npoints integer, seed integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_GeneratePoints$function$
;

-- Permissions

ALTER FUNCTION public.st_generatepoints(geometry, int4, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_generatepoints(geometry, int4, int4) TO postgres;

-- DROP FUNCTION public.st_geogfromtext(text);

CREATE OR REPLACE FUNCTION public.st_geogfromtext(text)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geography_from_text$function$
;

-- Permissions

ALTER FUNCTION public.st_geogfromtext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geogfromtext(text) TO postgres;

-- DROP FUNCTION public.st_geogfromwkb(bytea);

CREATE OR REPLACE FUNCTION public.st_geogfromwkb(bytea)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$geography_from_binary$function$
;

-- Permissions

ALTER FUNCTION public.st_geogfromwkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geogfromwkb(bytea) TO postgres;

-- DROP FUNCTION public.st_geographyfromtext(text);

CREATE OR REPLACE FUNCTION public.st_geographyfromtext(text)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geography_from_text$function$
;

-- Permissions

ALTER FUNCTION public.st_geographyfromtext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geographyfromtext(text) TO postgres;

-- DROP FUNCTION public.st_geohash(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_geohash(geom geometry, maxchars integer DEFAULT 0)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_GeoHash$function$
;

-- Permissions

ALTER FUNCTION public.st_geohash(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geohash(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_geohash(geography, int4);

CREATE OR REPLACE FUNCTION public.st_geohash(geog geography, maxchars integer DEFAULT 0)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_GeoHash$function$
;

-- Permissions

ALTER FUNCTION public.st_geohash(geography, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geohash(geography, int4) TO postgres;

-- DROP FUNCTION public.st_geomcollfromtext(text, int4);

CREATE OR REPLACE FUNCTION public.st_geomcollfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$
	SELECT CASE
	WHEN public.ST_GeometryType(public.ST_GeomFromText($1, $2)) = 'ST_GeometryCollection'
	THEN public.ST_GeomFromText($1,$2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_geomcollfromtext(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomcollfromtext(text, int4) TO postgres;

-- DROP FUNCTION public.st_geomcollfromtext(text);

CREATE OR REPLACE FUNCTION public.st_geomcollfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$
	SELECT CASE
	WHEN public.ST_GeometryType(public.ST_GeomFromText($1)) = 'ST_GeometryCollection'
	THEN public.ST_GeomFromText($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_geomcollfromtext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomcollfromtext(text) TO postgres;

-- DROP FUNCTION public.st_geomcollfromwkb(bytea, int4);

CREATE OR REPLACE FUNCTION public.st_geomcollfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE
	WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1, $2)) = 'ST_GeometryCollection'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_geomcollfromwkb(bytea, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomcollfromwkb(bytea, int4) TO postgres;

-- DROP FUNCTION public.st_geomcollfromwkb(bytea);

CREATE OR REPLACE FUNCTION public.st_geomcollfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE
	WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1)) = 'ST_GeometryCollection'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_geomcollfromwkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomcollfromwkb(bytea) TO postgres;

-- DROP FUNCTION public.st_geometricmedian(geometry, float8, int4, bool);

CREATE OR REPLACE FUNCTION public.st_geometricmedian(g geometry, tolerance double precision DEFAULT NULL::double precision, max_iter integer DEFAULT 10000, fail_if_not_converged boolean DEFAULT false)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 5000
AS '$libdir/postgis-3', $function$ST_GeometricMedian$function$
;

-- Permissions

ALTER FUNCTION public.st_geometricmedian(geometry, float8, int4, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geometricmedian(geometry, float8, int4, bool) TO postgres;

-- DROP FUNCTION public.st_geometryfromtext(text);

CREATE OR REPLACE FUNCTION public.st_geometryfromtext(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_from_text$function$
;

-- Permissions

ALTER FUNCTION public.st_geometryfromtext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geometryfromtext(text) TO postgres;

-- DROP FUNCTION public.st_geometryfromtext(text, int4);

CREATE OR REPLACE FUNCTION public.st_geometryfromtext(text, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_from_text$function$
;

-- Permissions

ALTER FUNCTION public.st_geometryfromtext(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geometryfromtext(text, int4) TO postgres;

-- DROP FUNCTION public.st_geometryn(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_geometryn(geometry, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_geometryn_collection$function$
;

-- Permissions

ALTER FUNCTION public.st_geometryn(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geometryn(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_geometrytype(geometry);

CREATE OR REPLACE FUNCTION public.st_geometrytype(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_geometrytype$function$
;

-- Permissions

ALTER FUNCTION public.st_geometrytype(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geometrytype(geometry) TO postgres;

-- DROP FUNCTION public.st_geomfromewkb(bytea);

CREATE OR REPLACE FUNCTION public.st_geomfromewkb(bytea)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOMFromEWKB$function$
;

-- Permissions

ALTER FUNCTION public.st_geomfromewkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomfromewkb(bytea) TO postgres;

-- DROP FUNCTION public.st_geomfromewkt(text);

CREATE OR REPLACE FUNCTION public.st_geomfromewkt(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$parse_WKT_lwgeom$function$
;

-- Permissions

ALTER FUNCTION public.st_geomfromewkt(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomfromewkt(text) TO postgres;

-- DROP FUNCTION public.st_geomfromgeohash(text, int4);

CREATE OR REPLACE FUNCTION public.st_geomfromgeohash(text, integer DEFAULT NULL::integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE COST 50
AS $function$ SELECT CAST(public.ST_Box2dFromGeoHash($1, $2) AS public.geometry); $function$
;

-- Permissions

ALTER FUNCTION public.st_geomfromgeohash(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomfromgeohash(text, int4) TO postgres;

-- DROP FUNCTION public.st_geomfromgeojson(jsonb);

CREATE OR REPLACE FUNCTION public.st_geomfromgeojson(jsonb)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$SELECT public.ST_GeomFromGeoJson($1::text)$function$
;

-- Permissions

ALTER FUNCTION public.st_geomfromgeojson(jsonb) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomfromgeojson(jsonb) TO postgres;

-- DROP FUNCTION public.st_geomfromgeojson(json);

CREATE OR REPLACE FUNCTION public.st_geomfromgeojson(json)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$SELECT public.ST_GeomFromGeoJson($1::text)$function$
;

-- Permissions

ALTER FUNCTION public.st_geomfromgeojson(json) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomfromgeojson(json) TO postgres;

-- DROP FUNCTION public.st_geomfromgeojson(text);

CREATE OR REPLACE FUNCTION public.st_geomfromgeojson(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geom_from_geojson$function$
;

-- Permissions

ALTER FUNCTION public.st_geomfromgeojson(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomfromgeojson(text) TO postgres;

-- DROP FUNCTION public.st_geomfromgml(text, int4);

CREATE OR REPLACE FUNCTION public.st_geomfromgml(text, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geom_from_gml$function$
;

-- Permissions

ALTER FUNCTION public.st_geomfromgml(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomfromgml(text, int4) TO postgres;

-- DROP FUNCTION public.st_geomfromgml(text);

CREATE OR REPLACE FUNCTION public.st_geomfromgml(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$SELECT public._ST_GeomFromGML($1, 0)$function$
;

-- Permissions

ALTER FUNCTION public.st_geomfromgml(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomfromgml(text) TO postgres;

-- DROP FUNCTION public.st_geomfromkml(text);

CREATE OR REPLACE FUNCTION public.st_geomfromkml(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geom_from_kml$function$
;

-- Permissions

ALTER FUNCTION public.st_geomfromkml(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomfromkml(text) TO postgres;

-- DROP FUNCTION public.st_geomfrommarc21(text);

CREATE OR REPLACE FUNCTION public.st_geomfrommarc21(marc21xml text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_GeomFromMARC21$function$
;

-- Permissions

ALTER FUNCTION public.st_geomfrommarc21(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomfrommarc21(text) TO postgres;

-- DROP FUNCTION public.st_geomfromtext(text);

CREATE OR REPLACE FUNCTION public.st_geomfromtext(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_from_text$function$
;

-- Permissions

ALTER FUNCTION public.st_geomfromtext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomfromtext(text) TO postgres;

-- DROP FUNCTION public.st_geomfromtext(text, int4);

CREATE OR REPLACE FUNCTION public.st_geomfromtext(text, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_from_text$function$
;

-- Permissions

ALTER FUNCTION public.st_geomfromtext(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomfromtext(text, int4) TO postgres;

-- DROP FUNCTION public.st_geomfromtwkb(bytea);

CREATE OR REPLACE FUNCTION public.st_geomfromtwkb(bytea)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOMFromTWKB$function$
;

-- Permissions

ALTER FUNCTION public.st_geomfromtwkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomfromtwkb(bytea) TO postgres;

-- DROP FUNCTION public.st_geomfromwkb(bytea, int4);

CREATE OR REPLACE FUNCTION public.st_geomfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_SetSRID(public.ST_GeomFromWKB($1), $2)$function$
;

-- Permissions

ALTER FUNCTION public.st_geomfromwkb(bytea, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomfromwkb(bytea, int4) TO postgres;

-- DROP FUNCTION public.st_geomfromwkb(bytea);

CREATE OR REPLACE FUNCTION public.st_geomfromwkb(bytea)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_from_WKB$function$
;

-- Permissions

ALTER FUNCTION public.st_geomfromwkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_geomfromwkb(bytea) TO postgres;

-- DROP FUNCTION public.st_gmltosql(text, int4);

CREATE OR REPLACE FUNCTION public.st_gmltosql(text, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geom_from_gml$function$
;

-- Permissions

ALTER FUNCTION public.st_gmltosql(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_gmltosql(text, int4) TO postgres;

-- DROP FUNCTION public.st_gmltosql(text);

CREATE OR REPLACE FUNCTION public.st_gmltosql(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$SELECT public._ST_GeomFromGML($1, 0)$function$
;

-- Permissions

ALTER FUNCTION public.st_gmltosql(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_gmltosql(text) TO postgres;

-- DROP FUNCTION public.st_hasarc(geometry);

CREATE OR REPLACE FUNCTION public.st_hasarc(geometry geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_has_arc$function$
;

-- Permissions

ALTER FUNCTION public.st_hasarc(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_hasarc(geometry) TO postgres;

-- DROP FUNCTION public.st_hasm(geometry);

CREATE OR REPLACE FUNCTION public.st_hasm(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_hasm$function$
;

-- Permissions

ALTER FUNCTION public.st_hasm(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_hasm(geometry) TO postgres;

-- DROP FUNCTION public.st_hasz(geometry);

CREATE OR REPLACE FUNCTION public.st_hasz(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_hasz$function$
;

-- Permissions

ALTER FUNCTION public.st_hasz(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_hasz(geometry) TO postgres;

-- DROP FUNCTION public.st_hausdorffdistance(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_hausdorffdistance(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$hausdorffdistance$function$
;

-- Permissions

ALTER FUNCTION public.st_hausdorffdistance(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_hausdorffdistance(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_hausdorffdistance(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public.st_hausdorffdistance(geom1 geometry, geom2 geometry, double precision)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$hausdorffdistancedensify$function$
;

-- Permissions

ALTER FUNCTION public.st_hausdorffdistance(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_hausdorffdistance(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public.st_hexagon(float8, int4, int4, geometry);

CREATE OR REPLACE FUNCTION public.st_hexagon(size double precision, cell_i integer, cell_j integer, origin geometry DEFAULT '010100000000000000000000000000000000000000'::geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Hexagon$function$
;

-- Permissions

ALTER FUNCTION public.st_hexagon(float8, int4, int4, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_hexagon(float8, int4, int4, geometry) TO postgres;

-- DROP FUNCTION public.st_hexagongrid(in float8, in geometry, out geometry, out int4, out int4);

CREATE OR REPLACE FUNCTION public.st_hexagongrid(size double precision, bounds geometry, OUT geom geometry, OUT i integer, OUT j integer)
 RETURNS SETOF record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_ShapeGrid$function$
;

-- Permissions

ALTER FUNCTION public.st_hexagongrid(in float8, in geometry, out geometry, out int4, out int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_hexagongrid(in float8, in geometry, out geometry, out int4, out int4) TO postgres;

-- DROP FUNCTION public.st_interiorringn(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_interiorringn(geometry, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_interiorringn_polygon$function$
;

-- Permissions

ALTER FUNCTION public.st_interiorringn(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_interiorringn(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_interpolatepoint(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_interpolatepoint(line geometry, point geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_InterpolatePoint$function$
;

-- Permissions

ALTER FUNCTION public.st_interpolatepoint(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_interpolatepoint(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_intersection(text, text);

CREATE OR REPLACE FUNCTION public.st_intersection(text, text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS $function$ SELECT public.ST_Intersection($1::public.geometry, $2::public.geometry);  $function$
;

-- Permissions

ALTER FUNCTION public.st_intersection(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_intersection(text, text) TO postgres;

-- DROP FUNCTION public.st_intersection(geography, geography);

CREATE OR REPLACE FUNCTION public.st_intersection(geography, geography)
 RETURNS geography
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$SELECT public.geography(public.ST_Transform(public.ST_Intersection(public.ST_Transform(public.geometry($1), public._ST_BestSRID($1, $2)), public.ST_Transform(public.geometry($2), public._ST_BestSRID($1, $2))), public.ST_SRID($1)))$function$
;

-- Permissions

ALTER FUNCTION public.st_intersection(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_intersection(geography, geography) TO postgres;

-- DROP FUNCTION public.st_intersection(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public.st_intersection(geom1 geometry, geom2 geometry, gridsize double precision DEFAULT '-1'::integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_Intersection$function$
;

-- Permissions

ALTER FUNCTION public.st_intersection(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_intersection(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public.st_intersects(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_intersects(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$ST_Intersects$function$
;

-- Permissions

ALTER FUNCTION public.st_intersects(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_intersects(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_intersects(geography, geography);

CREATE OR REPLACE FUNCTION public.st_intersects(geog1 geography, geog2 geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$geography_intersects$function$
;

-- Permissions

ALTER FUNCTION public.st_intersects(geography, geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_intersects(geography, geography) TO postgres;

-- DROP FUNCTION public.st_intersects(text, text);

CREATE OR REPLACE FUNCTION public.st_intersects(text, text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public.ST_Intersects($1::public.geometry, $2::public.geometry);  $function$
;

-- Permissions

ALTER FUNCTION public.st_intersects(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_intersects(text, text) TO postgres;

-- DROP FUNCTION public.st_inversetransformpipeline(geometry, text, int4);

CREATE OR REPLACE FUNCTION public.st_inversetransformpipeline(geom geometry, pipeline text, to_srid integer DEFAULT 0)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS $function$SELECT public.postgis_transform_pipeline_geometry($1, $2, FALSE, $3)$function$
;

-- Permissions

ALTER FUNCTION public.st_inversetransformpipeline(geometry, text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_inversetransformpipeline(geometry, text, int4) TO postgres;

-- DROP FUNCTION public.st_isclosed(geometry);

CREATE OR REPLACE FUNCTION public.st_isclosed(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_isclosed$function$
;

-- Permissions

ALTER FUNCTION public.st_isclosed(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_isclosed(geometry) TO postgres;

-- DROP FUNCTION public.st_iscollection(geometry);

CREATE OR REPLACE FUNCTION public.st_iscollection(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$ST_IsCollection$function$
;

-- Permissions

ALTER FUNCTION public.st_iscollection(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_iscollection(geometry) TO postgres;

-- DROP FUNCTION public.st_isempty(geometry);

CREATE OR REPLACE FUNCTION public.st_isempty(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_isempty$function$
;

-- Permissions

ALTER FUNCTION public.st_isempty(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_isempty(geometry) TO postgres;

-- DROP FUNCTION public.st_ispolygonccw(geometry);

CREATE OR REPLACE FUNCTION public.st_ispolygonccw(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_IsPolygonCCW$function$
;

-- Permissions

ALTER FUNCTION public.st_ispolygonccw(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_ispolygonccw(geometry) TO postgres;

-- DROP FUNCTION public.st_ispolygoncw(geometry);

CREATE OR REPLACE FUNCTION public.st_ispolygoncw(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_IsPolygonCW$function$
;

-- Permissions

ALTER FUNCTION public.st_ispolygoncw(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_ispolygoncw(geometry) TO postgres;

-- DROP FUNCTION public.st_isring(geometry);

CREATE OR REPLACE FUNCTION public.st_isring(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$isring$function$
;

-- Permissions

ALTER FUNCTION public.st_isring(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_isring(geometry) TO postgres;

-- DROP FUNCTION public.st_issimple(geometry);

CREATE OR REPLACE FUNCTION public.st_issimple(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$issimple$function$
;

-- Permissions

ALTER FUNCTION public.st_issimple(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_issimple(geometry) TO postgres;

-- DROP FUNCTION public.st_isvalid(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_isvalid(geometry, integer)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS $function$SELECT (public.ST_isValidDetail($1, $2)).valid$function$
;

-- Permissions

ALTER FUNCTION public.st_isvalid(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_isvalid(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_isvalid(geometry);

CREATE OR REPLACE FUNCTION public.st_isvalid(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$isvalid$function$
;

-- Permissions

ALTER FUNCTION public.st_isvalid(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_isvalid(geometry) TO postgres;

-- DROP FUNCTION public.st_isvaliddetail(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_isvaliddetail(geom geometry, flags integer DEFAULT 0)
 RETURNS valid_detail
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$isvaliddetail$function$
;

-- Permissions

ALTER FUNCTION public.st_isvaliddetail(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_isvaliddetail(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_isvalidreason(geometry);

CREATE OR REPLACE FUNCTION public.st_isvalidreason(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$isvalidreason$function$
;

-- Permissions

ALTER FUNCTION public.st_isvalidreason(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_isvalidreason(geometry) TO postgres;

-- DROP FUNCTION public.st_isvalidreason(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_isvalidreason(geometry, integer)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS $function$
	SELECT CASE WHEN valid THEN 'Valid Geometry' ELSE reason END FROM (
		SELECT (public.ST_isValidDetail($1, $2)).*
	) foo
	$function$
;

-- Permissions

ALTER FUNCTION public.st_isvalidreason(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_isvalidreason(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_isvalidtrajectory(geometry);

CREATE OR REPLACE FUNCTION public.st_isvalidtrajectory(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_IsValidTrajectory$function$
;

-- Permissions

ALTER FUNCTION public.st_isvalidtrajectory(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_isvalidtrajectory(geometry) TO postgres;

-- DROP FUNCTION public.st_largestemptycircle(in geometry, in float8, in geometry, out geometry, out geometry, out float8);

CREATE OR REPLACE FUNCTION public.st_largestemptycircle(geom geometry, tolerance double precision DEFAULT 0.0, boundary geometry DEFAULT '0101000000000000000000F87F000000000000F87F'::geometry, OUT center geometry, OUT nearest geometry, OUT radius double precision)
 RETURNS record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_LargestEmptyCircle$function$
;

-- Permissions

ALTER FUNCTION public.st_largestemptycircle(in geometry, in float8, in geometry, out geometry, out geometry, out float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_largestemptycircle(in geometry, in float8, in geometry, out geometry, out geometry, out float8) TO postgres;

-- DROP FUNCTION public.st_length(geography, bool);

CREATE OR REPLACE FUNCTION public.st_length(geog geography, use_spheroid boolean DEFAULT true)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geography_length$function$
;

-- Permissions

ALTER FUNCTION public.st_length(geography, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_length(geography, bool) TO postgres;

-- DROP FUNCTION public.st_length(text);

CREATE OR REPLACE FUNCTION public.st_length(text)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ SELECT public.ST_Length($1::public.geometry);  $function$
;

-- Permissions

ALTER FUNCTION public.st_length(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_length(text) TO postgres;

-- DROP FUNCTION public.st_length(geometry);

CREATE OR REPLACE FUNCTION public.st_length(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_length2d_linestring$function$
;

-- Permissions

ALTER FUNCTION public.st_length(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_length(geometry) TO postgres;

-- DROP FUNCTION public.st_length2d(geometry);

CREATE OR REPLACE FUNCTION public.st_length2d(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_length2d_linestring$function$
;

-- Permissions

ALTER FUNCTION public.st_length2d(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_length2d(geometry) TO postgres;

-- DROP FUNCTION public.st_length2dspheroid(geometry, spheroid);

CREATE OR REPLACE FUNCTION public.st_length2dspheroid(geometry, spheroid)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_length2d_ellipsoid$function$
;

-- Permissions

ALTER FUNCTION public.st_length2dspheroid(geometry, spheroid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_length2dspheroid(geometry, spheroid) TO postgres;

-- DROP FUNCTION public.st_lengthspheroid(geometry, spheroid);

CREATE OR REPLACE FUNCTION public.st_lengthspheroid(geometry, spheroid)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_length_ellipsoid_linestring$function$
;

-- Permissions

ALTER FUNCTION public.st_lengthspheroid(geometry, spheroid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_lengthspheroid(geometry, spheroid) TO postgres;

-- DROP FUNCTION public.st_letters(text, json);

CREATE OR REPLACE FUNCTION public.st_letters(letters text, font json DEFAULT NULL::json)
 RETURNS geometry
 LANGUAGE plpgsql
 IMMUTABLE PARALLEL SAFE COST 250
 SET standard_conforming_strings TO 'on'
AS $function$
DECLARE
  letterarray text[];
  letter text;
  geom geometry;
  prevgeom geometry = NULL;
  adjustment float8 = 0.0;
  position float8 = 0.0;
  text_height float8 = 100.0;
  width float8;
  m_width float8;
  spacing float8;
  dist float8;
  wordarr geometry[];
  wordgeom geometry;
  -- geometry has been run through replace(encode(st_astwkb(geom),'base64'), E'\n', '')
  font_default_height float8 = 1000.0;
  font_default json = '{
  "!":"BgACAQhUrgsTFOQCABQAExELiwi5AgAJiggBYQmJCgAOAg4CDAIOBAoEDAYKBgoGCggICAgICAgGCgYKBgoGCgQMBAoECgQMAgoADAIKAAoADAEKAAwBCgMKAQwDCgMKAwoFCAUKBwgHBgcIBwYJBgkECwYJBAsCDQILAg0CDQANAQ0BCwELAwsDCwUJBQkFCQcHBwcHBwcFCQUJBQkFCQMLAwkDCQMLAQkACwEJAAkACwIJAAsCCQQJAgsECQQJBAkGBwYJCAcIBQgHCAUKBQoDDAUKAQwDDgEMAQ4BDg==",
  "&":"BgABAskBygP+BowEAACZAmcAANsCAw0FDwUNBQ0FDQcLBw0HCwcLCQsJCwkLCQkJCwsJCwkLCQ0HCwcNBw8HDQUPBQ8DDwMRAw8DEQERAREBEQERABcAFQIXAhUCEwQVBBMGEwYTBhEIEQgPChEKDwoPDA0MDQwNDgsOCRAJEAkQBxAHEgUSBRQFFAMUAxQBFgEWARgAigEAFAISABICEgQQAhAEEAQQBg4GEAoOCg4MDg4ODgwSDgsMCwoJDAcMBwwFDgUMAw4DDgEOARABDgEQARIBEAASAHgAIAQeBB4GHAgaChoMGA4WDhYQFBISEhISDhQQFAwWDBYKFgoYBhgIGAQYBBgCGgAaABgBGAMYAxYHFgUWCRYJFAsUCxIPEg0SERARDhMOFQwVDBcIGQYbBhsCHQIfAR+dAgAADAAKAQoBCgEIAwgFBgUGBQYHBAUEBwQHAgcCBwIHAAcABwAHAQcBBwMHAwUDBwUFBQUHBQUBBwMJAQkBCQAJAJcBAAUCBQAFAgUEBQIDBAUEAwQDBgMEAQYDBgEGAAgBBgAKSeECAJ8BFi84HUQDQCAAmAKNAQAvExMx",
  "\"":"BgACAQUmwguEAgAAkwSDAgAAlAQBBfACAIACAACTBP8BAACUBA==",
  "''":"BgABAQUmwguEAgAAkwSDAgAAlAQ=",
  "(":"BgABAUOQBNwLDScNKw0rCysLLwsxCTEJMwc1BzcHNwM7AzsDPwE/AEEANwI1AjMEMwIzBjEGLwYvCC0ILQgrCCkKKQonCicMJbkCAAkqCSoHLAksBywFLgcuBS4FMAMwAzADMgEwATQBMgA0ADwCOgI6BDoEOAY4BjYINgg2CjQKMgoyCjIMMAwwDi7AAgA=",
  ")":"BgABAUMQ3Au6AgAOLQwvDC8KMQoxCjEKMwg1CDUGNQY3BDcEOQI5AjkAOwAzATEBMQExAy8DLwMvBS8FLQctBS0HKwktBykJKwkpswIADCYKKAooCioIKggsCC4ILgYwBjAGMgQ0AjQCNAI2ADgAQgFAAz4DPAM8BzgHOAc2CTQJMgsyCzALLg0sDSoNKg==",
  "+":"BgABAQ3IBOwGALcBuAEAANUBtwEAALcB0wEAALgBtwEAANYBuAEAALgB1AEA",
  "/":"BgABAQVCAoIDwAuyAgCFA78LrQIA",
  "4":"BgABAhDkBr4EkgEAEREApwJ/AADxARIR5QIAEhIA9AHdAwAA7ALIA9AG6gIAEREA8QYFqwIAAIIDwwH/AgABxAEA",
  "v":"BgABASDmA5AEPu4CROwBExb6AgAZFdMC0wgUFaECABIU0wLWCBcW+AIAExVE6wEEFQQXBBUEFwQVBBUEFwQVBBUEFwQVBBUEFwQXBBUEFwYA",
  ",":"BgABAWMYpAEADgIOAgwCDgQMBAoGDAYKBgoICAgICAgICAoGCgYKBAoEDAQKBAoCDAIKAgwCCgAKAAwACgEMAQoBCgMMAwoDCgUKBQgFCgUIBwYJCAcGCQYJBAsGCQQLAg0CCwINAg0AAwABAAMAAwADAQMAAwADAAMBBQAFAQcBBwEHAwcBCQMJAQsDCwMLAw0FDQMNBQ8FDwURBxMFEwkTBxcJFwkXswEAIMgBCQYJBgkGBwYJCAcIBQgHCgUKBQoFDAEMAwwBDgEOABA=",
  "-":"BgABAQUq0AMArALEBAAAqwLDBAA=",
  ".":"BgABAWFOrAEADgIOAg4CDgQMBAoGDAYKBgoICAgKCAgIBgoGCgYKBgoEDAQKBAwECgIMAAwCDAAMAAwBCgAMAQoDDAMKAwoDCgUKBQgFCgUIBwgJBgcICQYJBgsGCQQLAg0CDQINAA0ADQENAQ0BCwMNAwkFCwUJBQkHBwcJBwUHBwkFCQUJBQkDCwMJAwsDCQELAAsBCwALAAsCCQALAgkECwQJBAkECQYJBgcGBwgJBgcKBQgHCgUKBQwFCgEOAwwBDgEOAA4=",
  "0":"BgABAoMB+APaCxwAHAEaARoDFgMYBRYFFAcUBxIJEgkQCRALEAsOCwwNDA0MDQoPCg0IDwgPBhEGDwYRBA8EEQIRAhMCEQITABMA4QUAEQETAREBEQMRAxEFEQURBREHDwkPBw8JDwsNCw0LDQ0NDQsNCw8JEQkRCREJEwcTBxUFFQUVAxUDFwEXARkAGQAZAhcCFwQXBBUGEwYTCBMIEQoRCg8KDwoPDA0MDQ4NDgsOCQ4JEAkQBxAHEAUSBRIDEgMSAxIDEgESARQAEgDiBQASAhQCEgISBBIEEgYSBhIGEggQChAIEAoQDBAMDgwODg4ODA4MEgwQChIKEggUCBQIFgYWBBYGGAQYAhgCGgILZIcDHTZBEkMRHTUA4QUeOUITRBIePADiBQ==",
  "2":"BgABAWpUwALUA44GAAoBCAEKAQgDBgMGBQYFBgUEBwQFBAUCBwIHAgUABwAHAAUBBwMFAQcFBQMHBQUHBQcFBwMJAwkBCQELAQsAC68CAAAUAhIAFAISBBQCEgQUBBIEEgYUCBIGEAgSChAKEAoQDBAMDg4ODgwQDBIMEgoSChQIFggWCBgGGAQaAhwCHAIWABQBFgEUARQDFAMSAxQFEgUSBxIHEAkQCRALDgsODQ4NDA8KDwwRCBMKEwgTBhUGFwQXBBcEGwAbABsAHQEftwPJBdIDAACpAhIPzwYAFBIArgI=",
  "1":"BgABARCsBLALAJ0LEhERADcA2QEANwATABQSAOYIpwEAALgCERKEBAASABER",
  "3":"BgABAZ0B/gbEC/sB0QQOAwwBDAMMAwwFCgMKBQoFCgUIBwoFCAcICQgJBgkICQYLCAsECwYLBA0GDwINBA8CDwQRAhECEQITABUCFQAVAH0AEQETAREBEQETAxEDEQURBREFDwcRBw8JDwkNCQ8LDQsNDQsNCw0LDwsPCREJEQcRBxMFFQUVBRUDFwEXARkAGQAZAhkCFwQVBBUEEwYTCBEIEQgRCg0MDwoNDA0OCw4LDgkQCRAHEAkQBRAFEgUSAxIDFAMSAxYBFAEWARYAFqQCAAALAgkCCQQHAgcGBwYHBgUIBQYDCAMIAwYDCAEIAQgACAAIAAgCCAIIAgYCCAQIBAgGBgYEBgQIBAoCCgAKAAwAvAEABgEIAAYBBgMGAwQDBgMEBQQDBAUCBQQFAgUABwIFAJkBAACmAaIB3ALbAgAREQDmAhIRggYA",
  "5":"BgABAaAB0APgBxIAFAESABIBEgMSARADEgMQAxIFEAcOBRAHDgkOCQ4JDgsMCwwLCgsKDQoPCA0IDwgPBhEEEwYTAhMEFwIXABcAiQIAEwETABEBEQMTAxEDDwMRBQ8FDwUPBw8JDQcNCQ0LDQsLCwsNCw0JDwkPCREHEQcTBxMFEwMVAxcDGQEZARkAFwAVAhUCFQQTBBMGEwYRCBEIDwoPCg8KDQwNDA0MCw4LDgkOCRAJEAcOBxAHEgUQBRIDEAMSAxIBEgEUARIAFLgCAAAFAgUABQIFBAUCBQQDBAUEAwYDBgMIAwgBCAEIAQoACAAIAgYACAQGAgQEBgQEBAQGBAQCBgIGAgYCBgIIAAYA4AEABgEIAAYBBgMGAQQDBgMEAwQFBAMCBQQFAgUABwIFAPkBAG+OAQCCBRESAgAAAuYFABMRAK8CjQMAAJ8BNgA=",
  "7":"BgABAQrQBsILhQOvCxQR7wIAEhK+AvYIiwMAAKgCERKwBgA=",
  "6":"BgABAsYBnAOqBxgGFgYYBBYEFgIWABQBFgEUAxQDFAUUBRIFEAcSCRAJEAkOCw4NDgsMDQoPCg8KDwgRCBEGEQYRBBMCEwITAhUAkwIBAAERAREBEQEPAxEFEQMPBREFDwcPBw8HDwkNCQ0LDQsNCwsNCw0LDQkPCQ8JDwcRBxEHEwUTAxMFFQEXAxcBGQAVABUCEwIVBBMEEQYTBhEIEQgPChEKDQoPDA0MDQwNDgsOCxALDgkQCRAHEgcQBxIFEgUSBRIBFAMSARIBFAASAOIFABACEgIQAhIEEAQQBhIGEAYQCBAKEAgOChAMDgwMDA4ODA4MDgwODBAKEAoQChIIEggSBhQGFgYUAhYCGAIYABoAGAEYARYBFgMUBRQFEgUSBxAHEAcQCQ4LDgkMCwwNDA0KDQgPCg0GEQgPBhEEEQQRBBMEEwITAhMCFQIVABWrAgAACgEIAQoBCAEGAwYDBgUGBQQFBAUEBQQFAgUABwIFAAUABwEFAAUBBQMFAwUDBQMFBQMFAwUBBQEHAQkBBwAJAJcBDUbpBDASFi4A4AETLC8SBQAvERUrAN8BFC0yEQQA",
  "8":"BgABA9gB6gPYCxYAFAEUARYBEgMUBRQFEgUSBxIHEAcSCQ4JEAkOCw4LDgsMDQwNCg0KDQoPCg8IDwgPBhEGEQQPBBMCEQIRABMAQwAxAA8BEQEPAREDDwMRAw8FEQUPBxEJDwkPCQ8NDw0PDQ8IBwYHCAcGBwgHBgkGBwYJBgcECQYJBAkGCQQJBAsECwQLBA0CCwINAg8CDwIPAA8AaQATAREBEwERAxEFEQURBREHEQcPBw8JDwkPCw8LDQsNDQ0LCw0LDwsNCQ8JDwcPBw8HEQURAxEFEQMRARMBEwFDABEAEwIRAhEEEQQRBg8GEQgPCA8KDwoPCg0MDQwNDAsOCw4LDgkQCRAJDgkQBxIHEAcSBRADEgMUAxIBFAEUABQAagAOAhAADgIOAg4EDAIOBAwEDAQMBgwECgYMBAoGCAYKBgoGCggKBgoICgYICAoICA0MCwwLDgsOCRAHEAcQBxIFEgUSAxIDEgMSARABEgASADIARAASAhICEgQSAhIGEAYSBhAIEAgQCBAKDgoODA4MDgwMDgwODA4KEAwQCBIKEggSCBQIFAYUBBQEFgQWAhYCGAANT78EFis0EwYANBIYLgC0ARcsMRQFADERGS0AswELogHtAhcuNxA3DRkvALMBGjE6ETYSGDIAtAE=",
  "9":"BgABAsYBpASeBBcFFQUXAxUDFQEVABMCFQITBBMEEwYRBhMGDwgRCg8KDwoNDA0OCwwNDgkQCRAJEAcSBxIFEgUSAxQBFAEUARYAlAICAAISAhICEgQSAhAGEgQQBhIGEAgSCA4IEAoOChAMDAwODAwODA4MEAoOChAKEAgSCBIIFAYUBBQGFgIYBBgCGgAWABYBFAEWAxQDEgUUBRIHEgcQCRIJEAkOCw4LDgsODQwNDA0MDwoPCg8IDwgRCBEGEQYRBhEEEQITAhECEwARAOEFAA8BEQEPAREDDwMPBREFDwUPBw8JDwcNCQ8LDQsLCw0NCw0LDQsNCw8JEQkPCREHEQcTBRMFEwUTARUBFQEXABkAFwIXAhcCFQQTBhMGEQYRCA8IDwgNCg8MCwoLDAsOCQ4JDgkQBxAHEAUQBRIFEgMSAxQDFAEUAxQAFgEWABamAgAACwIJAgkCCQIHBAcEBwYFBgUGAwYDBgMGAQgBBgEIAAgABgIIAgYCBgQGBAYEBgYGBgQIBAgECAIKAgoCCgAMAJgBDUXqBC8RFS0A3wEUKzARBgAwEhYsAOABEy4xEgMA",
  ":":"BgACAWE0rAEADgIOAg4CDgQMBAoGDAYKBgoICAgKCAgIBgoGCgYKBgoEDAQKBAwECgIMAAwCDAAMAAwBCgAMAQoDDAMKAwoDCgUKBQgFCgUIBwgJBgcICQYJBgsGCQQLAg0CDQINAA0ADQENAQ0BCwMNAwkFCwUJBQkHBwcJBwUHBwkFCQUJBQkDCwMJAwsDCQELAAsBCwALAAsCCQALAgkECwQJBAkECQYJBgcGBwgJBgcKBQgHCgUKBQwFCgEOAwwBDgEOAA4BYQDqBAAOAg4CDgIOBAwECgYMBgoGCggICAoICAgGCgYKBgoGCgQMBAoEDAQKAgwADAIMAAwADAEKAAwBCgMMAwoDCgMKBQoFCAUKBQgHCAkGBwgJBgkGCwYJBAsCDQINAg0ADQANAQ0BDQELAw0DCQULBQkFCQcHBwkHBQcHCQUJBQkFCQMLAwkDCwEJAwsACwELAAsACwIJAAsECQILBAkECQQJBgkGBwYHCAkGBwoFCAcKBQoFDAUKAQ4DDAEOAQ4ADg==",
  "x":"BgABARHmAoAJMIMBNLUBNrYBMIQB1AIA9QG/BI4CvwTVAgA5hgFBwAFFxwE1fdUCAI4CwATzAcAE1AIA",
  ";":"BgACAWEslgYADgIOAg4CDgQMBAoGDAYKBgoICAgKCAgIBgoGCgYKBgoEDAQKBAwECgIMAAwCDAAMAAwBCgAMAQoDDAMKAwoDCgUKBQgFCgUIBwgJBgcICQYJBgsGCQQLAg0CDQINAA0ADQENAQ0BCwMNAwkFCwUJBQkHBwcJBwUHBwkFCQUJBQkDCwMJAwsBCQMLAAsBCwALAAsCCQALBAkCCwQJBAkECQYJBgcGBwgJBgcKBQgHCgUKBQwFCgEOAwwBDgEOAA4BYwjxBAAOAg4CDAIOBAwECgYMBgoGCggICAgICAgICgYKBgoECgQMBAoECgIMAgoCDAIKAAoADAAKAQwBCgEKAwwDCgMKBQoFCAUKBQgHBgkIBwYJBgkECwYJBAsCDQILAg0CDQADAAEAAwADAAMBAwADAAMAAwEFAAUBBwEHAQcDBwEJAwkBCwMLAwsDDQUNAw0FDwUPBREHEwUTCRMHFwkXCRezAQAgyAEJBgkGCQYHBgkIBwgFCAcKBQoFCgUMAQwDDAEOAQ4AEA==",
  "=":"BgACAQUawAUA5gHEBAAA5QHDBAABBQC5AgDsAcQEAADrAcMEAA==",
  "B":"BgABA2e2BMQLFgAUARQBFAEUAxIDEgUSBRIFEAcQBxAJDgkOCQ4LDgsMCwwNDA0KDQgNCg0IDwYPBg8GDwQRBBEEEQIRAhMAEwAHAAkABwEHAAkBCQAHAQkBCQEHAQkBCQMJAwcDCQMJAwkFBwUJAwkHCQUHBQkHCQcJBwcHBwkHBwcJBwsHCQUQBQ4FDgcOCQ4JDAkMCwoNCg0IDwgRBhMEFQQXAhcCGwDJAQEvAysFJwklDSMPHREbFRkXFRsTHw8fCyUJJwcrAy0B6wMAEhIAoAsREuYDAAiRAYEElgEAKioSSA1EOR6JAQAA0wEJkAGPBSwSEiwAzAETKikSjwEAAMUCkAEA",
  "A":"BgABAg/KBfIBqQIAN98BEhHzAgAWEuwCngsREvwCABMR8gKdCxIR8QIAFBI54AEFlwGCBk3TA6ABAE3UAwMA",
  "?":"BgACAe4BsgaYCAAZABkBFwEXBRUDEwUTBxEHEQcPCQ8JDQkNCQ0LCwsLCwsLCQsJCwcNBwsHDQcLBQsFDQULAwkFCwMLAwkDCQMBAAABAQABAAEBAQABAAEAAQABAAABAQAAAQEAEwcBAQABAAMBAwADAAUABQAFAAcABwAFAAcABwAFAgcABQAHAAUAW7cCAABcABgBFgAUAhQAFAISAhACEAIQBA4EDgQMBgwGDAYMBgoICgYKCAgKCggICAgKBgoICgYMCAwGDAgOBg4GEAYQBgIAAgIEAAICBAACAgQCBAIKBAoGCAQKBggIBgYICAYIBggGCgQIBAoECAQKAggCCgIKAAgACgAKAAgBCAEKAwgDCAMIAwgFBgMIBQYHBAUGBQQFBAcCBQQHAgcCCQIHAgkCBwAJAgkACQAJAAkBCQAJAQsACQELAQsDCwELAwsDCwMLAwsDCwULAwsFCwMLBV2YAgYECAQKBAwGDAQMBhAIEAYSBhIIEgYUBhIEFgYUBBYEFgQWAhgCFgIYABYAGAAYARgBGAMWBRYHFgcWCRYLFA0IBQYDCAUIBwYFCAcGBwgHBgcICQYJCAkGCQYJCAsGCwYLBgsGDQYNBA0GDQQNBA8EDwQPAg8EEQIRAhEAEQITAWGpBesGAA4CDgIOAg4EDAQKBgwGCgYKCAgICggICAYKBgoGCgYKBAwECgQMBAoCDAAMAgwADAAMAQoADAEKAwwDCgMKAwoFCgUIBQoFCAcICQYHCAkGCQYLBgkECwINAg0CDQANAA0BDQENAQsDDQMJBQsFCQUJBwcHCQcFBwcJBQkFCQUJAwsDCQMLAwkBCwALAQsACwALAgkACwIJBAsECQQJBAkGCQYHBgcICQYHCgUIBwoFCgUMBQoBDgMMAQ4BDgAO",
  "C":"BgABAWmmA4ADAAUCBQAFAgUEBQIDBAUEAwQDBgMEAQYDBgEGAAgBBgDWAgAAwQLVAgATABMCEQITBBEEEQQRBhEIEQgPCA8KDwoNCg0MDQwNDAsOCw4LDgkOCxAHEAkQBxIHEgUSBRIDEgEUARIBFAAUAMIFABQCFAISBBQEEgQSBhIIEggSCBAKEAoQCg4MDgwODA4ODA4MDgwQDA4KEggQChIIEggSBhIGFAQSAhQCEgIUAMYCAADBAsUCAAUABwEFAAUBBQMDAQUDAwMDAwMFAQMDBQEFAAUBBwAFAMEF",
  "L":"BgABAQmcBhISEdkFABIQALQLwgIAAIEJ9AIAAK8C",
  "D":"BgABAkeyBMQLFAAUARIBFAESAxIDEgMSBRIFEAcQBxAHDgkOCQ4LDgsMCwwNDA0KDwoPCg8IDwgRCBEGEwQTBBMEEwIVAhUAFwDBBQAXARcBFwMTAxUDEwUTBxEHEQcPCQ8JDwkNCw0LCwsLDQsNCQ0JDQcPBw8HDwcRBREFEQMRAxEDEwERARMBEwDfAwASEgCgCxES4AMACT6BAxEuKxKLAQAAvwaMAQAsEhIsAMIF",
  "F":"BgABARGABoIJ2QIAAIECsgIAEhIA4QIRErECAACvBBIR5QIAEhIAsgucBQASEgDlAhES",
  "E":"BgABARRkxAuWBQAQEgDlAhES0QIAAP0BtgIAEhIA5wIRFLUCAAD/AfACABISAOUCERLDBQASEgCyCw==",
  "G":"BgABAZsBjgeIAgMNBQ8FDQUNBQ0HCwcNBwsHCwkLCQsJCwsJCwsLCQsJDQkLBw0HDwcNBw8FDwUPAw8DEQMPAxEBEQERARMBEQAXABUCFwIVAhMEFQQTBhMGEwYRCBEIDwoRCg8KDwwNDA0MDQ4LDgkQCRAJEAcQBxIFEgUUBRQDFAMUARYBFgEYAMoFABQCFAASBBQCEgQSBBIEEgYSBhAGEAgQCBAKDgoOCg4MDgwMDgwOChAKEAoSCBIIFAgUBhQEGAYWAhgEGAIaAOoCAAC3AukCAAcABwEFAQUBBQMFAwMFAwUDBQEFAQcBBQEFAQUABwAFAMUFAAUCBwIFAgUCBQQFBAMGBQYDBgUGAwgDBgMIAQgDCAEIAQoBCAEIAAgACgAIAAgCCAIIAggECgQGBAgECAYIBgC6AnEAAJwCmAMAAJcF",
  "H":"BgABARbSB7ILAQAAnwsSEeUCABISAOAE5QEAAN8EEhHlAgASEgCiCxEQ5gIAEREA/QPmAQAAgAQPEOYCABER",
  "I":"BgABAQmuA7ILAJ8LFBHtAgAUEgCgCxMS7gIAExE=",
  "J":"BgABAWuqB7ILALEIABEBEwERAREDEwMRAxEFEQURBw8HEQcPCQ0LDwsNCw0NDQ0LDwsPCxEJEQkTCRMJFQcVBxcFFwMZAxsBGwEbAB8AHQIbAhsEGQYXBhcGFQgTCBMKEwoRDA8KDwwNDA0OCw4LDgkQCRAJEAcQBRIFEgUSAxQDEgESARIBFAESABIAgAEREtoCABERAn8ACQIHBAcEBwYHBgUIBQoDCgMKAwoDDAEKAQwBCgEMAAwACgAMAgoCDAIKBAoECgYKBggGBgYGCAQGBAgCCgAIALIIERLmAgAREQ==",
  "M":"BgACAQRm1gsUABMAAAABE5wIAQDBCxIR5QIAEhIA6gIK5gLVAe0B1wHuAQztAgDhAhIR5QIAEhIAxAsUAPoDtwT4A7YEFgA=",
  "K":"BgABAVXMCRoLBQsDCQMLAwsDCwMLAwsBCwELAQsBCwELAQ0ACwELAAsADQALAg0ACwILAA0CCwILAgsCDQQLBAsECwYNBAsGCwYLCAsGCwgJCgsICQoJCgkMCQwJDAkOCRALEAkQCRKZAdICUQAAiwQSEecCABQSAKALExLoAgAREQC3BEIA+AG4BAEAERKCAwAREdkCzQXGAYUDCA0KDQgJCgkMBwoFDAUMAQwBDgAMAg4CDAQOBAwGDghmlQI=",
  "O":"BgABAoMBsATaCxwAHAEaARoDGgMYBRYFFgcWBxQJEgkSCRILEAsODQ4NDg0MDwoNDA8KDwgPCBEIDwYRBg8GEQQRAhMCEQITABMA0QUAEQETAREBEQMTBREFEQURBxEHDwcRCQ8LDQsPCw0NDQ0NDwsPCw8LEQkTCRMJEwkVBxUHFwUXAxkDGQEbARsAGwAZAhkCGQQXBhcGFQYVCBUIEwoRChEMEQoRDA8MDQ4NDg0OCxAJEAsQCRAHEgcSBxIFFAMSAxIDEgEUARIAEgDSBQASAhQCEgISBBIEEgYSBhIIEggQCBAKEgwODBAMEA4ODg4QDhIMEAwSChQKFAgUCBYIFgYYBBoGGgQcAh4CHgILggGLAylCWxZbFSlBANEFKklcGVwYKkwA0gU=",
  "N":"BgABAQ+YA/oEAOUEEhHVAgASEgC+CxQAwATnBQDIBRMS2AIAExEAzQsRAL8ElgU=",
  "P":"BgABAkqoB5AGABcBFQEVAxMDEwMTBREHEQcRBw8JDwkNCQ0LDQsNCwsNCw0JDQkNCQ8HDwcPBxEFEQURAxEDEQMTAREBEwETAH8AAIMDEhHlAgASEgCgCxES1AMAFAAUARIAFAESAxIDEgMSAxIFEAUQBRAHDgkOCQ4JDgsMCwwNDA0KDQoNCg8IDwgRCBEGEwQTBBUEFQIXAhkAGQCzAgnBAsoCESwrEn8AANUDgAEALBISLgDYAg==",
  "R":"BgABAj9msgsREvYDABQAFAESARQBEgESAxIDEgUSBRAFEAcQBw4JDgkOCQ4LDAsMDQwLCg0KDwoNCA8IDwgPBhEEEwYTAhMEFQIXABcAowIAEwEVARMDEwMTBRMFEQcTBxELEQsRDQ8PDREPEQ0VC8QB/QMSEfkCABQSiQGyA3EAALEDFBHnAgASEgCgCwnCAscFogEALhISLACqAhEsLRKhAQAApQM=",
  "Q":"BgABA4YBvAniAbkB8wGZAYABBQUFAwUFBQUHBQUDBwUFBQcFBQMHBQcDBwUJAwcDCQMJAwkDCQMJAQsDCwMLAQsDCwENAw0BDQEPAA8BDwAPABsAGwIZAhcEGQQXBBUGFQgVCBMIEQoTChEKDwwPDA8ODQ4NDgsQCxAJEAkQBxIHEgUSBRQFFAMUARQDFAEWABYAxgUAEgIUAhICEgQSBBIGEgYSCBIIEAgQChIMDgwQDBAODg4OEA4SDBAMEgoUChQIFAgWCBYGGAQaBhoEHAIeAh4CHAAcARoBGgMaAxgFFgUWBxYHFAkSCRIJEgsQCw4NDg0ODQwPCg0MDwoPCA8IEQgPBhEGDwYRBBECEwIRAhMAEwC7BdgBrwEImQSyAwC6AylAWxZbFSk/AP0BjAK7AQeLAoMCGEc4J0wHVBbvAaYBAEM=",
  "S":"BgABAYMC8gOEBxIFEgUQBxIFEgcSBxIJEgcSCRIJEAkQCRALEAsOCw4NDg0MDQ4PDA0KEQoPChEKEQgRCBMGFQQTBBcCFQAXABkBEwARAREBEQMPAQ8DDwMPAw0DDQUNAw0FCwULBwsFCwUJBwsFCQcHBQkHCQUHBwcHBwUHBwUFBQcHBwUHAwcFEQsRCxMJEwkTBxMFEwUVBRUDFQMVARMBFwEVABUAFQIVAhUCFQQVBBUEEwYVBhMIEwgTCBMIEwgRCBMKEQgRCmK6AgwFDgUMAw4FEAUOBRAFEAUQBRAFEAMSAw4DEAMQAxABEAEOAQ4AEAIMAg4CDgQMBAwGCggKCAoKBgwGDgYQBBACCgAMAAoBCAMKBQgFCAcIBwgJCAsGCQgLCA0IDQgNCA8IDQgPCA8IDwgPChEIDwgPCBEKDwoPDBEMDwwPDg8ODw4NEA0QCxALEgsSCRIHEgcUBRQFGAUYAxgBGgEcAR4CJAYkBiAIIAweDBwQHBAYEhgUFBYUFhQWEBoQGg4aDBwKHAoeBh4GIAQgAiACIgEiASIFIgUiBSAJIgkgCyINZ58CBwQJAgkECwQLAgsECwINBA0CDQQNAg0CDQALAg0ADQANAAsBCwELAQsDCwULBQkFCQcHBwcJBwkFCwMLAw0BDQENAAsCCwQLBAkGCQgJCAkKBwoJCgcMBQoHDAcMBQwF",
  "V":"BgABARG2BM4DXrYEbKwDERL0AgAVEesCnQsSEfsCABQS8QKeCxES8gIAExFuqwNgtQQEAA==",
  "T":"BgABAQskxAv0BgAAtQKVAgAA+wgSEeUCABISAPwImwIAALYC",
  "U":"BgABAW76B7ALAKMIABcBFwMXARUFFQUTBxMHEwkRCREJEQsPDQ0LDw0NDwsPCw8LEQkPCRMJEQcTBxMFEwUVBRUDEwMXARUBFQEXABUAEwIVAhMCFQQTBBUEEwYTBhMIEwgRChEIEQwRDA8MDw4PDg0OCxANEAsSCRIJEgcUBxQHFAMWBRYBGAEYARgApggBAREU9AIAExMAAgClCAALAgkECQQHBAcIBwgHCAUKBQoDCgMKAwwBCgEMAQwADAAMAgoCDAIKAgoECgQKBggGCAYICAYKBAgCCgIMAgwApggAARMU9AIAExM=",
  "X":"BgABARmsCBISEYkDABQSS54BWYICXYkCRZUBEhGJAwAUEtYCzgXVAtIFExKIAwATEVClAVj3AVb0AVKqAREShgMAERHXAtEF2ALNBQ==",
  "W":"BgABARuODcQLERHpAp8LFBHlAgASEnW8A2+7AxIR6wIAFBKNA6ALERKSAwATEdQB7wZigARZ8AIREugCAA8RaKsDYsMDXsoDaqYDExLqAgA=",
  "Y":"BgABARK4BcQLhgMAERHnAvMGAKsEEhHnAgAUEgCsBOkC9AYREoYDABERWOEBUJsCUqICVtwBERI=",
  "Z":"BgABAQmAB8QLnwOBCaADAADBAusGAMgDggmhAwAAwgLGBgA=",
  "`":"BgABAQfqAd4JkQHmAQAOlgJCiAGpAgALiwIA",
  "c":"BgABAW3UA84GBQAFAQUABQEFAwMBBQMDAwMDAwUBAwMFAQUABQEHAAUAnQMABQIFAAUCBQQFAgMEBQQDBAMGAwQBBgMGAQYABgEGAPABABoMAMsCGw7tAQATABMCEwARAhMEEQIPBBEEDwQPBg8IDwYNCA0KDQoNCgsMCwwLDAkOCRAHDgcQBxIFEgUUBRQDFAEWAxgBGAAYAKQDABQCFAISBBQCEgYSBhAGEggQCBAIEAoQCg4MDAwODAwODAwKDgwQCg4IEAgQCBAIEAYSBhIGEgQSAhQCFAIUAOABABwOAM0CGQzbAQA=",
  "a":"BgABApoB8AYCxwF+BwkHCQcJCQkHBwkHBwcJBQkFBwUJBQkFCQMHBQkDCQMJAwcDCQEHAQkBBwEJAQcABwAHAQcABQAHAAUBBQAFABMAEwITAhEEEwQPBBEGDwgPCA0IDwoLCg0KCwwLDAsMCQ4JDgkOBw4HEAcQBRAFEAUSAxADEgESAxIBFAESABQAFAISAhQCEgQSBBIEEgYSBhIIEAgQChAIDgwODA4MDg4MDgwODBAMEAoSCBIKEggUCBQGFgYWBBgEGAIaAhoAcgAADgEMAQoBCgEIAwgDBgUEBQQFBAcCBwIHAgkCCQAJAKsCABcPAMwCHAvCAgAUABYBEgAUARIDFAMQAxIDEAUSBQ4FEAcOCRAJDAkOCwwLDA0MCwoNCg8IDwgPCA8GEQYRBhMEEwIXAhUCFwAZAIMGFwAKmQLqA38ATxchQwgnGiMwD1AMUDYAdg==",
  "b":"BgABAkqmBIIJGAAYARYBFgEUAxQDEgUSBRIFEAcQCQ4HDgkOCw4LDAsMDQoNCg0KDQgPBg8GDwYRBBEEEQQTBBECEwIVAhMAFQD/AgAZARcBFwEXAxUDEwUTBREFEQcPBw8JDwkNCQ0LDQsLCwsNCQ0JDQcPBw8HDwURAxEDEQMTAxMBEwMVARUAFQHPAwAUEgCWCxEY5gIAERkAowKCAQAJOvECESwrEn8AAJsEgAEALBISLgCeAw==",
  "d":"BgABAkryBgDLAXAREQ8NEQ0PDREJDwkRBw8FDwURAw8DDwERAw8BEQEPACMCHwQfCB0MGw4bEhcUFxgVGhEeDSANJAkmBSgDKgEuAIADABYCFAIUAhQCFAQUBBIGEgYSBhAIEAgQCBAKDgoODAwMDAwMDgoOCg4KEAgQCBIGEgYSBhQEFgQWBBYCGAIYAHwAAKQCERrmAgARFwCnCxcADOsCugJGMgDmA3sAKxERLQCfAwolHBUmBSQKBAA=",
  "e":"BgABAqMBigP+AgAJAgkCCQQHBAcGBwYFCAUIBQgDCgMIAQoDCAEKAQoACgAKAAoCCAIKAggECgQIBAgGCAYGBgQIBAoECAIKAAyiAgAAGQEXARcBFwMVBRMFEwURBxEHDwcPCQ8LDQkNCwsNCw0LDQkNBw8JDwcPBQ8FEQURAxEDEwMTAxMBFQAVARcALwIrBCkIJwwlDiESHxQbGBkaFR4TIA0iCyQJKAMqASwAggMAFAIUABIEFAISBBIEEgQSBhIGEAgQCBAIEAoODA4MDgwODgwQDBAKEAoSChIIFAgUCBYGGAQYBhoCGgQcAh4ALgEqAygFJgkkDSANHhEaFRgXFBsSHQ4fDCUIJwQpAi0AGQEXAxcDFQcTBRMJEQkPCw8LDQ0PDQsNDQ8LEQsRCxEJEwkTCRMJEwcTBxUHFQUVBRUHFQUVBRUHFwcVBRUHCs4BkAMfOEUURxEfMwBvbBhAGBwaBiA=",
  "h":"BgABAUHYBJAGAAYBBgAGAQYDBgEEAwYDBAMEBQQDAgUEBQIFAAUCBQB1AAC5BhIT5wIAFhQAlAsRGOYCABEZAKMCeAAYABgBFgEWARQDFAMSBRIFEgUQBxAJDgcOCQ4LDgsMCwwNCg0KDQoNCA8GDwYPBhEEEQQRBBMEEQITAhUCEwAVAO0FFhPnAgAUEgD+BQ==",
  "g":"BgABArkBkAeACQCNCw8ZERkRFxEVExMVERUPFQ8XDRcLGQkZBxsFGwUdAR0BDQALAA0ADQINAAsCDQANAg0CDQILAg0EDQINBA0GDQQNBg0EDQYNCA0GDwgNCA0IDQgPCg0KDwwNDA8MDw4PDqIB7gEQDRALEAkQCQ4JEAcOBw4FDgUOAwwFDgMMAQwBDAEMAQwACgEKAAoACAIIAAgCCAIGAggCBgIGBAYCBgQEAgYEAqIBAQADAAEBAwADAAMABQADAAUAAwAFAAMABQAFAAMABQA3ABMAEwIRAhMCEQQRBBEEEQYRBg8IDwgPCA0KDQoNCg0MCwwLDgsOCQ4JDgkQBxAHEgcSBRIDFAMWAxQBFgEYABgA/gIAFgIWAhQEFgQUBBIGFAgSCBIIEAoSChAKDgwODA4MDg4MDgwODA4KEAgQCBAIEgYSBhIEEgYSBBQCEgIUAhQCOgAQABABDgEQAQ4BEAMOAw4FDgUOBQwFDgcMBQ4HDAkMB4oBUBgACbsCzQYAnAR/AC0RES0AnQMSKy4RgAEA",
  "f":"BgABAUH8A6QJBwAHAAUABwEFAQcBBQEFAwUDBQMDAwMDAwUDAwMFAQUAwQHCAQAWEgDZAhUUwQEAAOMEFhftAgAWFADKCQoSChIKEAoQCg4KDgwOCgwMDAoKDAwMCgwIDAgMCAwIDAYOCAwEDgYMBA4GDAIOBA4CDgQOAg4CDgAOAg4ADgC2AQAcDgDRAhkQowEA",
  "i":"BgACAQlQABISALoIERLqAgAREQC5CBIR6QIAAWELyAoADgIOAgwEDgIKBgwGCgYKCAoGCAgICggIBggGCgYKBAoECgQMBAoCDAIMAgwCDAAMAAwADAEMAQoBDAMKAwoDCgUKBQgFCgUIBwgHCAcICQgJBgkECwQJBA0CCwANAA0ADQELAQ0BCwMJBQsFCQUJBwkFBwcHBwcJBQcFCQUJBQkDCQMLAwkBCwELAQsACwALAAsCCwILAgkCCwIJBAkECQQJBgcGCQYHCAcIBwgHCgUKBQwFCgMMAQwBDgEMAA4=",
  "j":"BgACAWFKyAoADgIOAgwEDgIKBgwGCgYKCAoGCAgICggIBggGCgYKBAoECgQMBAoCDAIMAgwCDAAMAAwADAEMAQoBDAMKAwoDCgUKBQgFCgUIBwgHCAcICQgJBgkECwQJBA0CCwANAA0ADQELAQ0BCwMJBQsFCQUJBwkFBwcHBwcJBQcFCQUJBQkDCQMLAwkBCwELAQsACwALAAsCCwILAgkCCwIJBAkECQQJBgcGCQYHCAcIBwgHCgUKBQwFCgMMAQwBDgEMAA4BO+YCnwwJEQkRCQ8JDwsNCQ0LDQkLCwsJCQsLCQkLBwsHCwcLBwsFCwcNAwsFDQMLBQ0BDQMNAQ0DDQENAQ0ADQENAA0AVwAbDQDSAhoPQgAIAAgABgAIAgYCCAIGAgYEBgQGBAQEBAQEBgQEBAYCBgC4CRES6gIAEREAowo=",
  "k":"BgABARKoA/QFIAC0AYoD5gIAjwK5BJICwwTfAgDDAbIDFwAAnwMSEeUCABISAJILERLmAgAREQCvBQ==",
  "n":"BgABAW1yggmQAU8GBAgEBgQGBgYCCAQGBAYEBgQIAgYECAQGAggEBgIIBAgCCAQIAggCCAIIAgoACAIKAAgCCgAKAgoADAAKAgwAFgAWARQAFAEUAxQDFAMSAxIFEgUQBRIHEAkOBxAJDgsOCwwLDA0MDQoPCA8IEQgRBhEGEwYVBBUEFQIXAhkCGQDtBRQR5QIAFBAA/AUACAEIAQYBCAMGBQQFBgUEBwQFBAcCBwIHAgcCCQIHAAcACQAHAQcABwMHAQUDBwMFAwUFBQUDBQEFAwcBBwAHAPkFEhHjAgASEgDwCBAA",
  "m":"BgABAZoBfoIJigFbDAwMCg4KDggOCA4IDgYQBhAGEAQQBBAEEAISAhACEgAmASQDJAciCyANHhEcFRwXDg4QDBAKEAwQCBAKEggSBhIGEgYSBBQEEgIUAhICFAAUABQBEgEUARIDEgMSAxIFEgUQBxAHEAcQBw4JDgkOCw4LDAsMDQoNCg8KDwgPCBEIEQYRBBMEEwQTAhMCFQAVAP0FEhHlAgASEgCCBgAIAQgBBgEGAwYFBgUEBQQHBAUEBwIHAgcCBwIJAAcABwAJAAcBBwEHAQUBBwMFAwUDBQMDBQMFAwUBBQEHAQcAgQYSEeUCABISAIIGAAgBCAEGAQYDBgUGBQQFBAcEBQQHAgcCBwIHAgkABwAHAAkABwEHAQcBBQEHAwUDBQMFAwMFAwUDBQEFAQcBBwCBBhIR5QIAEhIA8AgYAA==",
  "l":"BgABAQnAAwDrAgASFgDWCxEa6gIAERkA0wsUFw==",
  "y":"BgABAZ8BogeNAg8ZERkRFxEVExMVERUPFQ8XDRcLGQkZBxsFGwUdAR0BDQALAA0ADQINAAsCDQANAg0CDQILAg0EDQINBA0GDQQNBg0EDQYNCA0GDwgNCA0IDQgPCg0KDwwNDA8MDw4PDqIB7gEQDRALEAkQCQ4JEAcOBw4FDgUOAwwFDgMMAQwBDAEMAQwACgEKAAoACAIIAAgCCAIGAggCBgIGBAYCBgQEAgYEAqIBAQADAAEBAwADAAMABQADAAUAAwAFAAMABQAFAAMABQA3ABMAEwIRABECEwQRAg8EEQQPBBEGDwgNCA8IDQgNCg0MDQwLDAkOCw4JDgcQBxAHEgUSBRQFFAMWARgDGAEaABwA9AUTEuQCABEPAP8FAAUCBQAFAgUEBQIDBAUEAwQDBgMEAQYDBgEGAAgBBgCAAQAAvAYREuICABMPAP0K",
  "q":"BgABAmj0A4YJFgAWARQAEgESAxADEAMOAw4FDgUMBQ4HDgcOBwwJDgmeAU4A2QwWGesCABYaAN4DAwADAAMBAwADAAUAAwADAAMABQAFAAUABwAHAQcACQAVABUCFQATAhUCEwQRAhMEEQQRBhEGDwgPCA8IDQoNDA0MCwwLDgkOCRAJEAkQBxIHEgUUBRYDFgMYARoBGgAcAP4CABYCFgIWBBYEFAQSBhQIEggSCBAKEgoQDA4MDgwODg4ODBAMDgwQChIIEAoSCBIGEgYUBhQEFAQWAhYCFgIWAApbkQYSKy4ReAAAjARTEjkRHykJMwDvAg==",
  "p":"BgABAmiCBIYJFgAWARYBFAEWAxQDEgUUBRIFEgcSBxAJEAkQCQ4LDgsOCwwNDA0KDwoPCg8IEQgRCBEGEwQTBhMCFQQVAhUAFQD9AgAbARkBFwMXAxcDEwUTBxMHEQcRCQ8JDQsNCw0LCw0LDQkPCQ0JDwURBxEFEQURAxMDEQMTARUBEwEVARUBFQAJAAcABwAFAAcABQAFAAMAAwADAAUAAwIDAAMAAwIDAADdAxYZ6wIAFhoA2gyeAU0OCgwIDgoMCA4GDgYMBg4GDgQQBBAEEgQUAhQCFgIWAApcoQMJNB8qNxJVEQCLBHgALhISLADwAg==",
  "o":"BgABAoMB8gOICRYAFgEWARQBFgMUAxIDFAUSBRIHEgcQBxAJEAkOCw4LDgsMDQwNCg8KDwoPCg8IEQgRBhMGEwQTBBMCFQIVABcAiwMAFwEVARUDEwMTAxMFEwcRBxEHDwkPCQ8LDQsNCw0NCw0LDwkNCw8HEQkPBxEHEQcRBRMFEwMTAxUDFQEVABUAFQAVAhUCFQITBBMEEwYTBhEGEQgRCA8KDwoPCg0KDQwNDAsOCw4JDgkQCRAJEgcSBxIFFAUUAxQDFgEWARYAFgCMAwAYAhYCFgQUBBQEFAYUCBIIEggQChAKEAwODA4MDg4MDgwQCg4KEgoQChIIEggSBhQGEgYUBBYEFAIWAhYCFgALYv0CHTZBFEMRHTcAjwMcNUITQhIiOACQAw==",
  "r":"BgACAQRigAkQAA8AAAABShAAhAFXDAwODAwKDgoOCBAIDgYQBhAEEAQQBBAEEAISABACEAAQAA4BEAAQARADEAEQAxADEAUSBRIHFAcUCxQLFA0WDVJFsQHzAQsMDQwLCgkICwgLCAkGCQYJBAkGBwIJBAcCBwQHAAcCBwAFAgcABQAHAQUABQEFAQUBBQEDAQUBAwMDAQMDAwEAmwYSEeMCABISAO4IEAA=",
  "u":"BgABAV2KBwGPAVANCQsHDQcNBw0FCwUNBQ0FDQMPAw8DEQMTARMBFQEVABUAFQITABMEEwITBBMEEQQRBhEGDwYRCA8KDQgPCg0MDQwLDAsOCRALDgcQBxIHEgUUBRQFFAMWAxgBGAEYARoA7gUTEuYCABMPAPsFAAcCBwIFBAcCBQYDBgUGAwgDBgMIAQgBCAEIAQoBCAAIAAoACAIIAggCCAIGBAgEBgQGBgYGBAYCBgQIAggACAD6BRES5AIAEREA7wgPAA==",
  "s":"BgABAasC/gLwBQoDCgMMBQ4DDgUOBRAFEAUSBRAHEgcQCRIJEAkSCxALEAsQDRANDg0ODw4PDA8MDwoRChEIEwYTBBcCFQIXABkBGQEXAxcFFQUTBRMHEwcRCREJDwkNCQ8LDQ0LCwsNCw0JDQkPBw8HDwUPBREDEQMRAREDEQETABEBEwARABMADwIRABECEQIRBBMCEwQVBBUEFQYVBhMIFwgVChUKFQxgsAIIAwYDCAMKAQgDCAMKAQoDCgEKAwoBCgMKAQwDCgEKAwoBDAMKAQoBCgEMAQoACgEKAAoBCgAKAQgACgAIAQgABgoECAIKAgoCCgAMAQoBDAUEBwIHBAcEBwIHBAkECQQJBAkECQYLBAkGCwYJBgsGCwYJCAsGCwgJBgsICQgLCAkICwgJCgkKCQoJCgcKCQwHDAcMBwwFDAcMAw4FDAMOAw4BDgMQARAAEAESABIAEgIQAg4CDgIOBA4CDgQMBAwEDAQMBgoECgYKBgoGCgYIBggGCAgIBggGBgYIBgYGBgYGBgYGBAgGBgQIBAYECAQQChIIEggSBhIEEgQSBBQCFAISABQAEgASABIAEgESARIBEAEQAxIDDgMQAxADDgUOBQwDDAMMAwoDCAMIAQYBe6cCAwIDAgUAAwIFAgUCBwIFAgcCBQIHAgUCBwIHAAUCBwIHAgUABwIHAgcABQIHAAcCBwAFAgUABQIFAAUABQIDAAEAAQABAQEAAQEBAQEBAQEBAQEDAQEAAwEBAQMAAwEDAAMBAwADAQMAAwABAQMAAwADAAEAAwIBAAMCAQQDAgE=",
  "t":"BgABAUe8BLACWAAaEADRAhsOaQANAA0ADwINAA0CDQANAg0CDQINBA0CCwYNBA0GCwYNBgsIDQgLCAsKCwgJDAsKCQwJDAkOCQ4HEAcSBxIHEgUUAOAEawAVEQDWAhYTbAAAygIVFOYCABUXAMUCogEAFhQA1QIVEqEBAADzAwIFBAMEBQQDBAMEAwYDBgMGAwYBCAEGAQgBBgEIAAgA",
  "w":"BgABARz8BsAEINYCKNgBERLuAgARD+8B3QgSEc0CABQSW7YCV7UCFBHJAgASEpMC3AgREvACABERmAHxBDDaAVeYAxES7gIAEREo1QE81wIIAA==",
  "z":"BgABAQ6cA9AGuQIAFw8AzAIaC9QFAAAr9wKjBuACABYQAMsCGQyZBgCaA9AG"
   }';
BEGIN

  IF font IS NULL THEN
    font := font_default;
  END IF;

  -- For character spacing, use m as guide size
  geom := ST_GeomFromTWKB(decode(font->>'m', 'base64'));
  m_width := ST_XMax(geom) - ST_XMin(geom);
  spacing := m_width / 12;

  letterarray := regexp_split_to_array(replace(letters, ' ', E'\t'), E'');
  FOREACH letter IN ARRAY letterarray
  LOOP
    geom := ST_GeomFromTWKB(decode(font->>(letter), 'base64'));
    -- Chars are not already zeroed out, so do it now
    geom := ST_Translate(geom, -1 * ST_XMin(geom), 0.0);
    -- unknown characters are treated as spaces
    IF geom IS NULL THEN
      -- spaces are a "quarter m" in width
      width := m_width / 3.5;
    ELSE
      width := (ST_XMax(geom) - ST_XMin(geom));
    END IF;
    geom := ST_Translate(geom, position, 0.0);
    -- Tighten up spacing when characters have a large gap
    -- between them like Yo or To
    adjustment := 0.0;
    IF prevgeom IS NOT NULL AND geom IS NOT NULL THEN
      dist = ST_Distance(prevgeom, geom);
      IF dist > spacing THEN
        adjustment = spacing - dist;
        geom := ST_Translate(geom, adjustment, 0.0);
      END IF;
    END IF;
    prevgeom := geom;
    position := position + width + spacing + adjustment;
    wordarr := array_append(wordarr, geom);
  END LOOP;
  -- apply the start point and scaling options
  wordgeom := ST_CollectionExtract(ST_Collect(wordarr));
  wordgeom := ST_Scale(wordgeom,
                text_height/font_default_height,
                text_height/font_default_height);
  return wordgeom;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.st_letters(text, json) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_letters(text, json) TO postgres;

-- DROP FUNCTION public.st_linecrossingdirection(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_linecrossingdirection(line1 geometry, line2 geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$ST_LineCrossingDirection$function$
;

-- Permissions

ALTER FUNCTION public.st_linecrossingdirection(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linecrossingdirection(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_lineextend(geometry, float8, float8);

CREATE OR REPLACE FUNCTION public.st_lineextend(geom geometry, distance_forward double precision, distance_backward double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$geometry_line_extend$function$
;

-- Permissions

ALTER FUNCTION public.st_lineextend(geometry, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_lineextend(geometry, float8, float8) TO postgres;

-- DROP FUNCTION public.st_linefromencodedpolyline(text, int4);

CREATE OR REPLACE FUNCTION public.st_linefromencodedpolyline(txtin text, nprecision integer DEFAULT 5)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$line_from_encoded_polyline$function$
;

-- Permissions

ALTER FUNCTION public.st_linefromencodedpolyline(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linefromencodedpolyline(text, int4) TO postgres;

-- DROP FUNCTION public.st_linefrommultipoint(geometry);

CREATE OR REPLACE FUNCTION public.st_linefrommultipoint(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_line_from_mpoint$function$
;

-- Permissions

ALTER FUNCTION public.st_linefrommultipoint(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linefrommultipoint(geometry) TO postgres;

-- DROP FUNCTION public.st_linefromtext(text, int4);

CREATE OR REPLACE FUNCTION public.st_linefromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromText($1, $2)) = 'ST_LineString'
	THEN public.ST_GeomFromText($1,$2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_linefromtext(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linefromtext(text, int4) TO postgres;

-- DROP FUNCTION public.st_linefromtext(text);

CREATE OR REPLACE FUNCTION public.st_linefromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromText($1)) = 'ST_LineString'
	THEN public.ST_GeomFromText($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_linefromtext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linefromtext(text) TO postgres;

-- DROP FUNCTION public.st_linefromwkb(bytea, int4);

CREATE OR REPLACE FUNCTION public.st_linefromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1, $2)) = 'ST_LineString'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_linefromwkb(bytea, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linefromwkb(bytea, int4) TO postgres;

-- DROP FUNCTION public.st_linefromwkb(bytea);

CREATE OR REPLACE FUNCTION public.st_linefromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1)) = 'ST_LineString'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_linefromwkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linefromwkb(bytea) TO postgres;

-- DROP FUNCTION public.st_lineinterpolatepoint(geography, float8, bool);

CREATE OR REPLACE FUNCTION public.st_lineinterpolatepoint(geography, double precision, use_spheroid boolean DEFAULT true)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_line_interpolate_point$function$
;

-- Permissions

ALTER FUNCTION public.st_lineinterpolatepoint(geography, float8, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_lineinterpolatepoint(geography, float8, bool) TO postgres;

-- DROP FUNCTION public.st_lineinterpolatepoint(text, float8);

CREATE OR REPLACE FUNCTION public.st_lineinterpolatepoint(text, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public.ST_LineInterpolatePoint($1::public.geometry, $2);  $function$
;

-- Permissions

ALTER FUNCTION public.st_lineinterpolatepoint(text, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_lineinterpolatepoint(text, float8) TO postgres;

-- DROP FUNCTION public.st_lineinterpolatepoint(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_lineinterpolatepoint(geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_line_interpolate_point$function$
;

-- Permissions

ALTER FUNCTION public.st_lineinterpolatepoint(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_lineinterpolatepoint(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_lineinterpolatepoints(text, float8);

CREATE OR REPLACE FUNCTION public.st_lineinterpolatepoints(text, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public.ST_LineInterpolatePoints($1::public.geometry, $2);  $function$
;

-- Permissions

ALTER FUNCTION public.st_lineinterpolatepoints(text, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_lineinterpolatepoints(text, float8) TO postgres;

-- DROP FUNCTION public.st_lineinterpolatepoints(geometry, float8, bool);

CREATE OR REPLACE FUNCTION public.st_lineinterpolatepoints(geometry, double precision, repeat boolean DEFAULT true)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_line_interpolate_point$function$
;

-- Permissions

ALTER FUNCTION public.st_lineinterpolatepoints(geometry, float8, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_lineinterpolatepoints(geometry, float8, bool) TO postgres;

-- DROP FUNCTION public.st_lineinterpolatepoints(geography, float8, bool, bool);

CREATE OR REPLACE FUNCTION public.st_lineinterpolatepoints(geography, double precision, use_spheroid boolean DEFAULT true, repeat boolean DEFAULT true)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_line_interpolate_point$function$
;

-- Permissions

ALTER FUNCTION public.st_lineinterpolatepoints(geography, float8, bool, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_lineinterpolatepoints(geography, float8, bool, bool) TO postgres;

-- DROP FUNCTION public.st_linelocatepoint(geography, geography, bool);

CREATE OR REPLACE FUNCTION public.st_linelocatepoint(geography, geography, use_spheroid boolean DEFAULT true)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_line_locate_point$function$
;

-- Permissions

ALTER FUNCTION public.st_linelocatepoint(geography, geography, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linelocatepoint(geography, geography, bool) TO postgres;

-- DROP FUNCTION public.st_linelocatepoint(text, text);

CREATE OR REPLACE FUNCTION public.st_linelocatepoint(text, text)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public.ST_LineLocatePoint($1::public.geometry, $2::public.geometry);  $function$
;

-- Permissions

ALTER FUNCTION public.st_linelocatepoint(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linelocatepoint(text, text) TO postgres;

-- DROP FUNCTION public.st_linelocatepoint(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_linelocatepoint(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_line_locate_point$function$
;

-- Permissions

ALTER FUNCTION public.st_linelocatepoint(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linelocatepoint(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_linemerge(geometry);

CREATE OR REPLACE FUNCTION public.st_linemerge(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$linemerge$function$
;

-- Permissions

ALTER FUNCTION public.st_linemerge(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linemerge(geometry) TO postgres;

-- DROP FUNCTION public.st_linemerge(geometry, bool);

CREATE OR REPLACE FUNCTION public.st_linemerge(geometry, boolean)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$linemerge$function$
;

-- Permissions

ALTER FUNCTION public.st_linemerge(geometry, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linemerge(geometry, bool) TO postgres;

-- DROP FUNCTION public.st_linestringfromwkb(bytea, int4);

CREATE OR REPLACE FUNCTION public.st_linestringfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1, $2)) = 'ST_LineString'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_linestringfromwkb(bytea, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linestringfromwkb(bytea, int4) TO postgres;

-- DROP FUNCTION public.st_linestringfromwkb(bytea);

CREATE OR REPLACE FUNCTION public.st_linestringfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1)) = 'ST_LineString'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_linestringfromwkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linestringfromwkb(bytea) TO postgres;

-- DROP FUNCTION public.st_linesubstring(geometry, float8, float8);

CREATE OR REPLACE FUNCTION public.st_linesubstring(geometry, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_line_substring$function$
;

-- Permissions

ALTER FUNCTION public.st_linesubstring(geometry, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linesubstring(geometry, float8, float8) TO postgres;

-- DROP FUNCTION public.st_linesubstring(text, float8, float8);

CREATE OR REPLACE FUNCTION public.st_linesubstring(text, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public.ST_LineSubstring($1::public.geometry, $2, $3);  $function$
;

-- Permissions

ALTER FUNCTION public.st_linesubstring(text, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linesubstring(text, float8, float8) TO postgres;

-- DROP FUNCTION public.st_linesubstring(geography, float8, float8);

CREATE OR REPLACE FUNCTION public.st_linesubstring(geography, double precision, double precision)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_line_substring$function$
;

-- Permissions

ALTER FUNCTION public.st_linesubstring(geography, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linesubstring(geography, float8, float8) TO postgres;

-- DROP FUNCTION public.st_linetocurve(geometry);

CREATE OR REPLACE FUNCTION public.st_linetocurve(geometry geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$LWGEOM_line_desegmentize$function$
;

-- Permissions

ALTER FUNCTION public.st_linetocurve(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_linetocurve(geometry) TO postgres;

-- DROP FUNCTION public.st_locatealong(geometry, float8, float8);

CREATE OR REPLACE FUNCTION public.st_locatealong(geometry geometry, measure double precision, leftrightoffset double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_LocateAlong$function$
;

-- Permissions

ALTER FUNCTION public.st_locatealong(geometry, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_locatealong(geometry, float8, float8) TO postgres;

-- DROP FUNCTION public.st_locatebetween(geometry, float8, float8, float8);

CREATE OR REPLACE FUNCTION public.st_locatebetween(geometry geometry, frommeasure double precision, tomeasure double precision, leftrightoffset double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_LocateBetween$function$
;

-- Permissions

ALTER FUNCTION public.st_locatebetween(geometry, float8, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_locatebetween(geometry, float8, float8, float8) TO postgres;

-- DROP FUNCTION public.st_locatebetweenelevations(geometry, float8, float8);

CREATE OR REPLACE FUNCTION public.st_locatebetweenelevations(geometry geometry, fromelevation double precision, toelevation double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_LocateBetweenElevations$function$
;

-- Permissions

ALTER FUNCTION public.st_locatebetweenelevations(geometry, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_locatebetweenelevations(geometry, float8, float8) TO postgres;

-- DROP FUNCTION public.st_longestline(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_longestline(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS $function$SELECT public._ST_LongestLine(public.ST_ConvexHull($1), public.ST_ConvexHull($2))$function$
;

-- Permissions

ALTER FUNCTION public.st_longestline(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_longestline(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_m(geometry);

CREATE OR REPLACE FUNCTION public.st_m(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_m_point$function$
;

-- Permissions

ALTER FUNCTION public.st_m(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_m(geometry) TO postgres;

-- DROP FUNCTION public.st_makebox2d(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_makebox2d(geom1 geometry, geom2 geometry)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX2D_construct$function$
;

-- Permissions

ALTER FUNCTION public.st_makebox2d(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_makebox2d(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_makeenvelope(float8, float8, float8, float8, int4);

CREATE OR REPLACE FUNCTION public.st_makeenvelope(double precision, double precision, double precision, double precision, integer DEFAULT 0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_MakeEnvelope$function$
;

-- Permissions

ALTER FUNCTION public.st_makeenvelope(float8, float8, float8, float8, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_makeenvelope(float8, float8, float8, float8, int4) TO postgres;

-- DROP AGGREGATE public.st_makeline(geometry);

-- Aggregate function public.st_makeline(geometry)
-- ERROR: more than one function named "public.st_makeline";

-- Permissions

ALTER AGGREGATE public.st_makeline(geometry) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_makeline(geometry) TO postgres;

-- DROP FUNCTION public.st_makeline(_geometry);

CREATE OR REPLACE FUNCTION public.st_makeline(geometry[])
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makeline_garray$function$
;

-- Permissions

ALTER FUNCTION public.st_makeline(_geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_makeline(_geometry) TO postgres;

-- DROP FUNCTION public.st_makeline(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_makeline(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makeline$function$
;

-- Permissions

ALTER FUNCTION public.st_makeline(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_makeline(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_makepoint(float8, float8);

CREATE OR REPLACE FUNCTION public.st_makepoint(double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makepoint$function$
;

-- Permissions

ALTER FUNCTION public.st_makepoint(float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_makepoint(float8, float8) TO postgres;

-- DROP FUNCTION public.st_makepoint(float8, float8, float8);

CREATE OR REPLACE FUNCTION public.st_makepoint(double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makepoint$function$
;

-- Permissions

ALTER FUNCTION public.st_makepoint(float8, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_makepoint(float8, float8, float8) TO postgres;

-- DROP FUNCTION public.st_makepoint(float8, float8, float8, float8);

CREATE OR REPLACE FUNCTION public.st_makepoint(double precision, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makepoint$function$
;

-- Permissions

ALTER FUNCTION public.st_makepoint(float8, float8, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_makepoint(float8, float8, float8, float8) TO postgres;

-- DROP FUNCTION public.st_makepointm(float8, float8, float8);

CREATE OR REPLACE FUNCTION public.st_makepointm(double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makepoint3dm$function$
;

-- Permissions

ALTER FUNCTION public.st_makepointm(float8, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_makepointm(float8, float8, float8) TO postgres;

-- DROP FUNCTION public.st_makepolygon(geometry);

CREATE OR REPLACE FUNCTION public.st_makepolygon(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makepoly$function$
;

-- Permissions

ALTER FUNCTION public.st_makepolygon(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_makepolygon(geometry) TO postgres;

-- DROP FUNCTION public.st_makepolygon(geometry, _geometry);

CREATE OR REPLACE FUNCTION public.st_makepolygon(geometry, geometry[])
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makepoly$function$
;

-- Permissions

ALTER FUNCTION public.st_makepolygon(geometry, _geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_makepolygon(geometry, _geometry) TO postgres;

-- DROP FUNCTION public.st_makevalid(geometry, text);

CREATE OR REPLACE FUNCTION public.st_makevalid(geom geometry, params text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_MakeValid$function$
;

-- Permissions

ALTER FUNCTION public.st_makevalid(geometry, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_makevalid(geometry, text) TO postgres;

-- DROP FUNCTION public.st_makevalid(geometry);

CREATE OR REPLACE FUNCTION public.st_makevalid(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_MakeValid$function$
;

-- Permissions

ALTER FUNCTION public.st_makevalid(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_makevalid(geometry) TO postgres;

-- DROP FUNCTION public.st_maxdistance(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_maxdistance(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS $function$SELECT public._ST_MaxDistance(public.ST_ConvexHull($1), public.ST_ConvexHull($2))$function$
;

-- Permissions

ALTER FUNCTION public.st_maxdistance(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_maxdistance(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_maximuminscribedcircle(in geometry, out geometry, out geometry, out float8);

CREATE OR REPLACE FUNCTION public.st_maximuminscribedcircle(geometry, OUT center geometry, OUT nearest geometry, OUT radius double precision)
 RETURNS record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_MaximumInscribedCircle$function$
;

-- Permissions

ALTER FUNCTION public.st_maximuminscribedcircle(in geometry, out geometry, out geometry, out float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_maximuminscribedcircle(in geometry, out geometry, out geometry, out float8) TO postgres;

-- DROP AGGREGATE public.st_memcollect(geometry);

CREATE OR REPLACE AGGREGATE public.st_memcollect(public.geometry) (
	SFUNC = public.st_collect,
	STYPE = geometry
);

-- Permissions

ALTER AGGREGATE public.st_memcollect(geometry) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_memcollect(geometry) TO postgres;

-- DROP FUNCTION public.st_memsize(geometry);

CREATE OR REPLACE FUNCTION public.st_memsize(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_mem_size$function$
;

-- Permissions

ALTER FUNCTION public.st_memsize(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_memsize(geometry) TO postgres;

-- DROP AGGREGATE public.st_memunion(geometry);

CREATE OR REPLACE AGGREGATE public.st_memunion(public.geometry) (
	SFUNC = public.st_union,
	STYPE = geometry
);

-- Permissions

ALTER AGGREGATE public.st_memunion(geometry) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_memunion(geometry) TO postgres;

-- DROP FUNCTION public.st_minimumboundingcircle(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_minimumboundingcircle(inputgeom geometry, segs_per_quarter integer DEFAULT 48)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_MinimumBoundingCircle$function$
;

-- Permissions

ALTER FUNCTION public.st_minimumboundingcircle(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_minimumboundingcircle(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_minimumboundingradius(in geometry, out geometry, out float8);

CREATE OR REPLACE FUNCTION public.st_minimumboundingradius(geometry, OUT center geometry, OUT radius double precision)
 RETURNS record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_MinimumBoundingRadius$function$
;

-- Permissions

ALTER FUNCTION public.st_minimumboundingradius(in geometry, out geometry, out float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_minimumboundingradius(in geometry, out geometry, out float8) TO postgres;

-- DROP FUNCTION public.st_minimumclearance(geometry);

CREATE OR REPLACE FUNCTION public.st_minimumclearance(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_MinimumClearance$function$
;

-- Permissions

ALTER FUNCTION public.st_minimumclearance(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_minimumclearance(geometry) TO postgres;

-- DROP FUNCTION public.st_minimumclearanceline(geometry);

CREATE OR REPLACE FUNCTION public.st_minimumclearanceline(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_MinimumClearanceLine$function$
;

-- Permissions

ALTER FUNCTION public.st_minimumclearanceline(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_minimumclearanceline(geometry) TO postgres;

-- DROP FUNCTION public.st_mlinefromtext(text);

CREATE OR REPLACE FUNCTION public.st_mlinefromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromText($1)) = 'ST_MultiLineString'
	THEN public.ST_GeomFromText($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_mlinefromtext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_mlinefromtext(text) TO postgres;

-- DROP FUNCTION public.st_mlinefromtext(text, int4);

CREATE OR REPLACE FUNCTION public.st_mlinefromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$
	SELECT CASE
	WHEN public.ST_GeometryType(public.ST_GeomFromText($1, $2)) = 'ST_MultiLineString'
	THEN public.ST_GeomFromText($1,$2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_mlinefromtext(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_mlinefromtext(text, int4) TO postgres;

-- DROP FUNCTION public.st_mlinefromwkb(bytea);

CREATE OR REPLACE FUNCTION public.st_mlinefromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1)) = 'ST_MultiLineString'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_mlinefromwkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_mlinefromwkb(bytea) TO postgres;

-- DROP FUNCTION public.st_mlinefromwkb(bytea, int4);

CREATE OR REPLACE FUNCTION public.st_mlinefromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1, $2)) = 'ST_MultiLineString'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_mlinefromwkb(bytea, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_mlinefromwkb(bytea, int4) TO postgres;

-- DROP FUNCTION public.st_mpointfromtext(text);

CREATE OR REPLACE FUNCTION public.st_mpointfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromText($1)) = 'ST_MultiPoint'
	THEN public.ST_GeomFromText($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_mpointfromtext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_mpointfromtext(text) TO postgres;

-- DROP FUNCTION public.st_mpointfromtext(text, int4);

CREATE OR REPLACE FUNCTION public.st_mpointfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromText($1, $2)) = 'ST_MultiPoint'
	THEN ST_GeomFromText($1, $2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_mpointfromtext(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_mpointfromtext(text, int4) TO postgres;

-- DROP FUNCTION public.st_mpointfromwkb(bytea);

CREATE OR REPLACE FUNCTION public.st_mpointfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1)) = 'ST_MultiPoint'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_mpointfromwkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_mpointfromwkb(bytea) TO postgres;

-- DROP FUNCTION public.st_mpointfromwkb(bytea, int4);

CREATE OR REPLACE FUNCTION public.st_mpointfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1, $2)) = 'ST_MultiPoint'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_mpointfromwkb(bytea, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_mpointfromwkb(bytea, int4) TO postgres;

-- DROP FUNCTION public.st_mpolyfromtext(text, int4);

CREATE OR REPLACE FUNCTION public.st_mpolyfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromText($1, $2)) = 'ST_MultiPolygon'
	THEN public.ST_GeomFromText($1,$2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_mpolyfromtext(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_mpolyfromtext(text, int4) TO postgres;

-- DROP FUNCTION public.st_mpolyfromtext(text);

CREATE OR REPLACE FUNCTION public.st_mpolyfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromText($1)) = 'ST_MultiPolygon'
	THEN public.ST_GeomFromText($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_mpolyfromtext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_mpolyfromtext(text) TO postgres;

-- DROP FUNCTION public.st_mpolyfromwkb(bytea);

CREATE OR REPLACE FUNCTION public.st_mpolyfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1)) = 'ST_MultiPolygon'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_mpolyfromwkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_mpolyfromwkb(bytea) TO postgres;

-- DROP FUNCTION public.st_mpolyfromwkb(bytea, int4);

CREATE OR REPLACE FUNCTION public.st_mpolyfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1, $2)) = 'ST_MultiPolygon'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_mpolyfromwkb(bytea, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_mpolyfromwkb(bytea, int4) TO postgres;

-- DROP FUNCTION public.st_multi(geometry);

CREATE OR REPLACE FUNCTION public.st_multi(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_multi$function$
;

-- Permissions

ALTER FUNCTION public.st_multi(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_multi(geometry) TO postgres;

-- DROP FUNCTION public.st_multilinefromwkb(bytea);

CREATE OR REPLACE FUNCTION public.st_multilinefromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1)) = 'ST_MultiLineString'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_multilinefromwkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_multilinefromwkb(bytea) TO postgres;

-- DROP FUNCTION public.st_multilinestringfromtext(text, int4);

CREATE OR REPLACE FUNCTION public.st_multilinestringfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$SELECT public.ST_MLineFromText($1, $2)$function$
;

-- Permissions

ALTER FUNCTION public.st_multilinestringfromtext(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_multilinestringfromtext(text, int4) TO postgres;

-- DROP FUNCTION public.st_multilinestringfromtext(text);

CREATE OR REPLACE FUNCTION public.st_multilinestringfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$SELECT public.ST_MLineFromText($1)$function$
;

-- Permissions

ALTER FUNCTION public.st_multilinestringfromtext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_multilinestringfromtext(text) TO postgres;

-- DROP FUNCTION public.st_multipointfromtext(text);

CREATE OR REPLACE FUNCTION public.st_multipointfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$SELECT public.ST_MPointFromText($1)$function$
;

-- Permissions

ALTER FUNCTION public.st_multipointfromtext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_multipointfromtext(text) TO postgres;

-- DROP FUNCTION public.st_multipointfromwkb(bytea, int4);

CREATE OR REPLACE FUNCTION public.st_multipointfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1,$2)) = 'ST_MultiPoint'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_multipointfromwkb(bytea, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_multipointfromwkb(bytea, int4) TO postgres;

-- DROP FUNCTION public.st_multipointfromwkb(bytea);

CREATE OR REPLACE FUNCTION public.st_multipointfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1)) = 'ST_MultiPoint'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_multipointfromwkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_multipointfromwkb(bytea) TO postgres;

-- DROP FUNCTION public.st_multipolyfromwkb(bytea, int4);

CREATE OR REPLACE FUNCTION public.st_multipolyfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1, $2)) = 'ST_MultiPolygon'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_multipolyfromwkb(bytea, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_multipolyfromwkb(bytea, int4) TO postgres;

-- DROP FUNCTION public.st_multipolyfromwkb(bytea);

CREATE OR REPLACE FUNCTION public.st_multipolyfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1)) = 'ST_MultiPolygon'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_multipolyfromwkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_multipolyfromwkb(bytea) TO postgres;

-- DROP FUNCTION public.st_multipolygonfromtext(text, int4);

CREATE OR REPLACE FUNCTION public.st_multipolygonfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$SELECT public.ST_MPolyFromText($1, $2)$function$
;

-- Permissions

ALTER FUNCTION public.st_multipolygonfromtext(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_multipolygonfromtext(text, int4) TO postgres;

-- DROP FUNCTION public.st_multipolygonfromtext(text);

CREATE OR REPLACE FUNCTION public.st_multipolygonfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$SELECT public.ST_MPolyFromText($1)$function$
;

-- Permissions

ALTER FUNCTION public.st_multipolygonfromtext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_multipolygonfromtext(text) TO postgres;

-- DROP FUNCTION public.st_ndims(geometry);

CREATE OR REPLACE FUNCTION public.st_ndims(geometry)
 RETURNS smallint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_ndims$function$
;

-- Permissions

ALTER FUNCTION public.st_ndims(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_ndims(geometry) TO postgres;

-- DROP FUNCTION public.st_node(geometry);

CREATE OR REPLACE FUNCTION public.st_node(g geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_Node$function$
;

-- Permissions

ALTER FUNCTION public.st_node(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_node(geometry) TO postgres;

-- DROP FUNCTION public.st_normalize(geometry);

CREATE OR REPLACE FUNCTION public.st_normalize(geom geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_Normalize$function$
;

-- Permissions

ALTER FUNCTION public.st_normalize(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_normalize(geometry) TO postgres;

-- DROP FUNCTION public.st_npoints(geometry);

CREATE OR REPLACE FUNCTION public.st_npoints(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_npoints$function$
;

-- Permissions

ALTER FUNCTION public.st_npoints(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_npoints(geometry) TO postgres;

-- DROP FUNCTION public.st_nrings(geometry);

CREATE OR REPLACE FUNCTION public.st_nrings(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_nrings$function$
;

-- Permissions

ALTER FUNCTION public.st_nrings(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_nrings(geometry) TO postgres;

-- DROP FUNCTION public.st_numcurves(geometry);

CREATE OR REPLACE FUNCTION public.st_numcurves(geometry geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_NumCurves$function$
;

-- Permissions

ALTER FUNCTION public.st_numcurves(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_numcurves(geometry) TO postgres;

-- DROP FUNCTION public.st_numgeometries(geometry);

CREATE OR REPLACE FUNCTION public.st_numgeometries(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_numgeometries_collection$function$
;

-- Permissions

ALTER FUNCTION public.st_numgeometries(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_numgeometries(geometry) TO postgres;

-- DROP FUNCTION public.st_numinteriorring(geometry);

CREATE OR REPLACE FUNCTION public.st_numinteriorring(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_numinteriorrings_polygon$function$
;

-- Permissions

ALTER FUNCTION public.st_numinteriorring(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_numinteriorring(geometry) TO postgres;

-- DROP FUNCTION public.st_numinteriorrings(geometry);

CREATE OR REPLACE FUNCTION public.st_numinteriorrings(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_numinteriorrings_polygon$function$
;

-- Permissions

ALTER FUNCTION public.st_numinteriorrings(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_numinteriorrings(geometry) TO postgres;

-- DROP FUNCTION public.st_numpatches(geometry);

CREATE OR REPLACE FUNCTION public.st_numpatches(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_numpatches$function$
;

-- Permissions

ALTER FUNCTION public.st_numpatches(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_numpatches(geometry) TO postgres;

-- DROP FUNCTION public.st_numpoints(geometry);

CREATE OR REPLACE FUNCTION public.st_numpoints(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_numpoints_linestring$function$
;

-- Permissions

ALTER FUNCTION public.st_numpoints(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_numpoints(geometry) TO postgres;

-- DROP FUNCTION public.st_offsetcurve(geometry, float8, text);

CREATE OR REPLACE FUNCTION public.st_offsetcurve(line geometry, distance double precision, params text DEFAULT ''::text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_OffsetCurve$function$
;

-- Permissions

ALTER FUNCTION public.st_offsetcurve(geometry, float8, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_offsetcurve(geometry, float8, text) TO postgres;

-- DROP FUNCTION public.st_orderingequals(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_orderingequals(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$LWGEOM_same$function$
;

-- Permissions

ALTER FUNCTION public.st_orderingequals(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_orderingequals(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_orientedenvelope(geometry);

CREATE OR REPLACE FUNCTION public.st_orientedenvelope(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_OrientedEnvelope$function$
;

-- Permissions

ALTER FUNCTION public.st_orientedenvelope(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_orientedenvelope(geometry) TO postgres;

-- DROP FUNCTION public.st_overlaps(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_overlaps(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$overlaps$function$
;

-- Permissions

ALTER FUNCTION public.st_overlaps(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_overlaps(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_patchn(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_patchn(geometry, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_patchn$function$
;

-- Permissions

ALTER FUNCTION public.st_patchn(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_patchn(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_perimeter(geography, bool);

CREATE OR REPLACE FUNCTION public.st_perimeter(geog geography, use_spheroid boolean DEFAULT true)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geography_perimeter$function$
;

-- Permissions

ALTER FUNCTION public.st_perimeter(geography, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_perimeter(geography, bool) TO postgres;

-- DROP FUNCTION public.st_perimeter(geometry);

CREATE OR REPLACE FUNCTION public.st_perimeter(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_perimeter2d_poly$function$
;

-- Permissions

ALTER FUNCTION public.st_perimeter(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_perimeter(geometry) TO postgres;

-- DROP FUNCTION public.st_perimeter2d(geometry);

CREATE OR REPLACE FUNCTION public.st_perimeter2d(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_perimeter2d_poly$function$
;

-- Permissions

ALTER FUNCTION public.st_perimeter2d(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_perimeter2d(geometry) TO postgres;

-- DROP FUNCTION public.st_point(float8, float8, int4);

CREATE OR REPLACE FUNCTION public.st_point(double precision, double precision, srid integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Point$function$
;

-- Permissions

ALTER FUNCTION public.st_point(float8, float8, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_point(float8, float8, int4) TO postgres;

-- DROP FUNCTION public.st_point(float8, float8);

CREATE OR REPLACE FUNCTION public.st_point(double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makepoint$function$
;

-- Permissions

ALTER FUNCTION public.st_point(float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_point(float8, float8) TO postgres;

-- DROP FUNCTION public.st_pointfromgeohash(text, int4);

CREATE OR REPLACE FUNCTION public.st_pointfromgeohash(text, integer DEFAULT NULL::integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$point_from_geohash$function$
;

-- Permissions

ALTER FUNCTION public.st_pointfromgeohash(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_pointfromgeohash(text, int4) TO postgres;

-- DROP FUNCTION public.st_pointfromtext(text);

CREATE OR REPLACE FUNCTION public.st_pointfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromText($1)) = 'ST_Point'
	THEN public.ST_GeomFromText($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_pointfromtext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_pointfromtext(text) TO postgres;

-- DROP FUNCTION public.st_pointfromtext(text, int4);

CREATE OR REPLACE FUNCTION public.st_pointfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromText($1, $2)) = 'ST_Point'
	THEN public.ST_GeomFromText($1, $2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_pointfromtext(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_pointfromtext(text, int4) TO postgres;

-- DROP FUNCTION public.st_pointfromwkb(bytea);

CREATE OR REPLACE FUNCTION public.st_pointfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1)) = 'ST_Point'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_pointfromwkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_pointfromwkb(bytea) TO postgres;

-- DROP FUNCTION public.st_pointfromwkb(bytea, int4);

CREATE OR REPLACE FUNCTION public.st_pointfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1, $2)) = 'ST_Point'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_pointfromwkb(bytea, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_pointfromwkb(bytea, int4) TO postgres;

-- DROP FUNCTION public.st_pointinsidecircle(geometry, float8, float8, float8);

CREATE OR REPLACE FUNCTION public.st_pointinsidecircle(geometry, double precision, double precision, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_inside_circle_point$function$
;

-- Permissions

ALTER FUNCTION public.st_pointinsidecircle(geometry, float8, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_pointinsidecircle(geometry, float8, float8, float8) TO postgres;

-- DROP FUNCTION public.st_pointm(float8, float8, float8, int4);

CREATE OR REPLACE FUNCTION public.st_pointm(xcoordinate double precision, ycoordinate double precision, mcoordinate double precision, srid integer DEFAULT 0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_PointM$function$
;

-- Permissions

ALTER FUNCTION public.st_pointm(float8, float8, float8, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_pointm(float8, float8, float8, int4) TO postgres;

-- DROP FUNCTION public.st_pointn(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_pointn(geometry, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_pointn_linestring$function$
;

-- Permissions

ALTER FUNCTION public.st_pointn(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_pointn(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_pointonsurface(geometry);

CREATE OR REPLACE FUNCTION public.st_pointonsurface(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$pointonsurface$function$
;

-- Permissions

ALTER FUNCTION public.st_pointonsurface(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_pointonsurface(geometry) TO postgres;

-- DROP FUNCTION public.st_points(geometry);

CREATE OR REPLACE FUNCTION public.st_points(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_Points$function$
;

-- Permissions

ALTER FUNCTION public.st_points(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_points(geometry) TO postgres;

-- DROP FUNCTION public.st_pointz(float8, float8, float8, int4);

CREATE OR REPLACE FUNCTION public.st_pointz(xcoordinate double precision, ycoordinate double precision, zcoordinate double precision, srid integer DEFAULT 0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_PointZ$function$
;

-- Permissions

ALTER FUNCTION public.st_pointz(float8, float8, float8, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_pointz(float8, float8, float8, int4) TO postgres;

-- DROP FUNCTION public.st_pointzm(float8, float8, float8, float8, int4);

CREATE OR REPLACE FUNCTION public.st_pointzm(xcoordinate double precision, ycoordinate double precision, zcoordinate double precision, mcoordinate double precision, srid integer DEFAULT 0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_PointZM$function$
;

-- Permissions

ALTER FUNCTION public.st_pointzm(float8, float8, float8, float8, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_pointzm(float8, float8, float8, float8, int4) TO postgres;

-- DROP FUNCTION public.st_polyfromtext(text, int4);

CREATE OR REPLACE FUNCTION public.st_polyfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromText($1, $2)) = 'ST_Polygon'
	THEN public.ST_GeomFromText($1, $2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_polyfromtext(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_polyfromtext(text, int4) TO postgres;

-- DROP FUNCTION public.st_polyfromtext(text);

CREATE OR REPLACE FUNCTION public.st_polyfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromText($1)) = 'ST_Polygon'
	THEN public.ST_GeomFromText($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_polyfromtext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_polyfromtext(text) TO postgres;

-- DROP FUNCTION public.st_polyfromwkb(bytea, int4);

CREATE OR REPLACE FUNCTION public.st_polyfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1, $2)) = 'ST_Polygon'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_polyfromwkb(bytea, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_polyfromwkb(bytea, int4) TO postgres;

-- DROP FUNCTION public.st_polyfromwkb(bytea);

CREATE OR REPLACE FUNCTION public.st_polyfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1)) = 'ST_Polygon'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_polyfromwkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_polyfromwkb(bytea) TO postgres;

-- DROP FUNCTION public.st_polygon(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_polygon(geometry, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT public.ST_SetSRID(public.ST_MakePolygon($1), $2)
	$function$
;

-- Permissions

ALTER FUNCTION public.st_polygon(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_polygon(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_polygonfromtext(text, int4);

CREATE OR REPLACE FUNCTION public.st_polygonfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$SELECT public.ST_PolyFromText($1, $2)$function$
;

-- Permissions

ALTER FUNCTION public.st_polygonfromtext(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_polygonfromtext(text, int4) TO postgres;

-- DROP FUNCTION public.st_polygonfromtext(text);

CREATE OR REPLACE FUNCTION public.st_polygonfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS $function$SELECT public.ST_PolyFromText($1)$function$
;

-- Permissions

ALTER FUNCTION public.st_polygonfromtext(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_polygonfromtext(text) TO postgres;

-- DROP FUNCTION public.st_polygonfromwkb(bytea);

CREATE OR REPLACE FUNCTION public.st_polygonfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1)) = 'ST_Polygon'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_polygonfromwkb(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_polygonfromwkb(bytea) TO postgres;

-- DROP FUNCTION public.st_polygonfromwkb(bytea, int4);

CREATE OR REPLACE FUNCTION public.st_polygonfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType(public.ST_GeomFromWKB($1,$2)) = 'ST_Polygon'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

-- Permissions

ALTER FUNCTION public.st_polygonfromwkb(bytea, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_polygonfromwkb(bytea, int4) TO postgres;

-- DROP AGGREGATE public.st_polygonize(geometry);

-- Aggregate function public.st_polygonize(geometry)
-- ERROR: more than one function named "public.st_polygonize";

-- Permissions

ALTER AGGREGATE public.st_polygonize(geometry) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_polygonize(geometry) TO postgres;

-- DROP FUNCTION public.st_polygonize(_geometry);

CREATE OR REPLACE FUNCTION public.st_polygonize(geometry[])
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$polygonize_garray$function$
;

-- Permissions

ALTER FUNCTION public.st_polygonize(_geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_polygonize(_geometry) TO postgres;

-- DROP FUNCTION public.st_project(geometry, float8, float8);

CREATE OR REPLACE FUNCTION public.st_project(geom1 geometry, distance double precision, azimuth double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$geometry_project_direction$function$
;

-- Permissions

ALTER FUNCTION public.st_project(geometry, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_project(geometry, float8, float8) TO postgres;

-- DROP FUNCTION public.st_project(geography, float8, float8);

CREATE OR REPLACE FUNCTION public.st_project(geog geography, distance double precision, azimuth double precision)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$geography_project$function$
;

-- Permissions

ALTER FUNCTION public.st_project(geography, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_project(geography, float8, float8) TO postgres;

-- DROP FUNCTION public.st_project(geography, geography, float8);

CREATE OR REPLACE FUNCTION public.st_project(geog_from geography, geog_to geography, distance double precision)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geography_project_geography$function$
;

-- Permissions

ALTER FUNCTION public.st_project(geography, geography, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_project(geography, geography, float8) TO postgres;

-- DROP FUNCTION public.st_project(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public.st_project(geom1 geometry, geom2 geometry, distance double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$geometry_project_geometry$function$
;

-- Permissions

ALTER FUNCTION public.st_project(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_project(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public.st_quantizecoordinates(geometry, int4, int4, int4, int4);

CREATE OR REPLACE FUNCTION public.st_quantizecoordinates(g geometry, prec_x integer, prec_y integer DEFAULT NULL::integer, prec_z integer DEFAULT NULL::integer, prec_m integer DEFAULT NULL::integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 250
AS '$libdir/postgis-3', $function$ST_QuantizeCoordinates$function$
;

-- Permissions

ALTER FUNCTION public.st_quantizecoordinates(geometry, int4, int4, int4, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_quantizecoordinates(geometry, int4, int4, int4, int4) TO postgres;

-- DROP FUNCTION public.st_reduceprecision(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_reduceprecision(geom geometry, gridsize double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_ReducePrecision$function$
;

-- Permissions

ALTER FUNCTION public.st_reduceprecision(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_reduceprecision(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_relate(geometry, geometry, text);

CREATE OR REPLACE FUNCTION public.st_relate(geom1 geometry, geom2 geometry, text)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$relate_pattern$function$
;

-- Permissions

ALTER FUNCTION public.st_relate(geometry, geometry, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_relate(geometry, geometry, text) TO postgres;

-- DROP FUNCTION public.st_relate(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_relate(geom1 geometry, geom2 geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$relate_full$function$
;

-- Permissions

ALTER FUNCTION public.st_relate(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_relate(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_relate(geometry, geometry, int4);

CREATE OR REPLACE FUNCTION public.st_relate(geom1 geometry, geom2 geometry, integer)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$relate_full$function$
;

-- Permissions

ALTER FUNCTION public.st_relate(geometry, geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_relate(geometry, geometry, int4) TO postgres;

-- DROP FUNCTION public.st_relatematch(text, text);

CREATE OR REPLACE FUNCTION public.st_relatematch(text, text)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_RelateMatch$function$
;

-- Permissions

ALTER FUNCTION public.st_relatematch(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_relatematch(text, text) TO postgres;

-- DROP FUNCTION public.st_removeirrelevantpointsforview(geometry, box2d, bool);

CREATE OR REPLACE FUNCTION public.st_removeirrelevantpointsforview(geometry, box2d, boolean DEFAULT false)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_RemoveIrrelevantPointsForView$function$
;

-- Permissions

ALTER FUNCTION public.st_removeirrelevantpointsforview(geometry, box2d, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_removeirrelevantpointsforview(geometry, box2d, bool) TO postgres;

-- DROP FUNCTION public.st_removepoint(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_removepoint(geometry, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_removepoint$function$
;

-- Permissions

ALTER FUNCTION public.st_removepoint(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_removepoint(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_removerepeatedpoints(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_removerepeatedpoints(geom geometry, tolerance double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_RemoveRepeatedPoints$function$
;

-- Permissions

ALTER FUNCTION public.st_removerepeatedpoints(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_removerepeatedpoints(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_removesmallparts(geometry, float8, float8);

CREATE OR REPLACE FUNCTION public.st_removesmallparts(geometry, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_RemoveSmallParts$function$
;

-- Permissions

ALTER FUNCTION public.st_removesmallparts(geometry, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_removesmallparts(geometry, float8, float8) TO postgres;

-- DROP FUNCTION public.st_reverse(geometry);

CREATE OR REPLACE FUNCTION public.st_reverse(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_reverse$function$
;

-- Permissions

ALTER FUNCTION public.st_reverse(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_reverse(geometry) TO postgres;

-- DROP FUNCTION public.st_rotate(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_rotate(geometry, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1,  cos($2), -sin($2), 0,  sin($2), cos($2), 0,  0, 0, 1,  0, 0, 0)$function$
;

-- Permissions

ALTER FUNCTION public.st_rotate(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_rotate(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_rotate(geometry, float8, geometry);

CREATE OR REPLACE FUNCTION public.st_rotate(geometry, double precision, geometry)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1,  cos($2), -sin($2), 0,  sin($2),  cos($2), 0, 0, 0, 1, public.ST_X($3) - cos($2) * public.ST_X($3) + sin($2) * public.ST_Y($3), public.ST_Y($3) - sin($2) * public.ST_X($3) - cos($2) * public.ST_Y($3), 0)$function$
;

-- Permissions

ALTER FUNCTION public.st_rotate(geometry, float8, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_rotate(geometry, float8, geometry) TO postgres;

-- DROP FUNCTION public.st_rotate(geometry, float8, float8, float8);

CREATE OR REPLACE FUNCTION public.st_rotate(geometry, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1,  cos($2), -sin($2), 0,  sin($2),  cos($2), 0, 0, 0, 1,	$3 - cos($2) * $3 + sin($2) * $4, $4 - sin($2) * $3 - cos($2) * $4, 0)$function$
;

-- Permissions

ALTER FUNCTION public.st_rotate(geometry, float8, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_rotate(geometry, float8, float8, float8) TO postgres;

-- DROP FUNCTION public.st_rotatex(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_rotatex(geometry, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1, 1, 0, 0, 0, cos($2), -sin($2), 0, sin($2), cos($2), 0, 0, 0)$function$
;

-- Permissions

ALTER FUNCTION public.st_rotatex(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_rotatex(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_rotatey(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_rotatey(geometry, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1,  cos($2), 0, sin($2),  0, 1, 0,  -sin($2), 0, cos($2), 0,  0, 0)$function$
;

-- Permissions

ALTER FUNCTION public.st_rotatey(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_rotatey(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_rotatez(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_rotatez(geometry, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Rotate($1, $2)$function$
;

-- Permissions

ALTER FUNCTION public.st_rotatez(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_rotatez(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_scale(geometry, geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_scale(geometry, geometry, origin geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Scale$function$
;

-- Permissions

ALTER FUNCTION public.st_scale(geometry, geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_scale(geometry, geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_scale(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_scale(geometry, geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Scale$function$
;

-- Permissions

ALTER FUNCTION public.st_scale(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_scale(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_scale(geometry, float8, float8, float8);

CREATE OR REPLACE FUNCTION public.st_scale(geometry, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Scale($1, public.ST_MakePoint($2, $3, $4))$function$
;

-- Permissions

ALTER FUNCTION public.st_scale(geometry, float8, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_scale(geometry, float8, float8, float8) TO postgres;

-- DROP FUNCTION public.st_scale(geometry, float8, float8);

CREATE OR REPLACE FUNCTION public.st_scale(geometry, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Scale($1, $2, $3, 1)$function$
;

-- Permissions

ALTER FUNCTION public.st_scale(geometry, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_scale(geometry, float8, float8) TO postgres;

-- DROP FUNCTION public.st_scroll(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_scroll(geometry, geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Scroll$function$
;

-- Permissions

ALTER FUNCTION public.st_scroll(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_scroll(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_segmentize(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_segmentize(geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_segmentize2d$function$
;

-- Permissions

ALTER FUNCTION public.st_segmentize(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_segmentize(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_segmentize(geography, float8);

CREATE OR REPLACE FUNCTION public.st_segmentize(geog geography, max_segment_length double precision)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$geography_segmentize$function$
;

-- Permissions

ALTER FUNCTION public.st_segmentize(geography, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_segmentize(geography, float8) TO postgres;

-- DROP FUNCTION public.st_seteffectivearea(geometry, float8, int4);

CREATE OR REPLACE FUNCTION public.st_seteffectivearea(geometry, double precision DEFAULT '-1'::integer, integer DEFAULT 1)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$LWGEOM_SetEffectiveArea$function$
;

-- Permissions

ALTER FUNCTION public.st_seteffectivearea(geometry, float8, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_seteffectivearea(geometry, float8, int4) TO postgres;

-- DROP FUNCTION public.st_setpoint(geometry, int4, geometry);

CREATE OR REPLACE FUNCTION public.st_setpoint(geometry, integer, geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_setpoint_linestring$function$
;

-- Permissions

ALTER FUNCTION public.st_setpoint(geometry, int4, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_setpoint(geometry, int4, geometry) TO postgres;

-- DROP FUNCTION public.st_setsrid(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_setsrid(geom geometry, srid integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_set_srid$function$
;

-- Permissions

ALTER FUNCTION public.st_setsrid(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_setsrid(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_setsrid(geography, int4);

CREATE OR REPLACE FUNCTION public.st_setsrid(geog geography, srid integer)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_set_srid$function$
;

-- Permissions

ALTER FUNCTION public.st_setsrid(geography, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_setsrid(geography, int4) TO postgres;

-- DROP FUNCTION public.st_sharedpaths(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_sharedpaths(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_SharedPaths$function$
;

-- Permissions

ALTER FUNCTION public.st_sharedpaths(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_sharedpaths(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_shiftlongitude(geometry);

CREATE OR REPLACE FUNCTION public.st_shiftlongitude(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_longitude_shift$function$
;

-- Permissions

ALTER FUNCTION public.st_shiftlongitude(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_shiftlongitude(geometry) TO postgres;

-- DROP FUNCTION public.st_shortestline(text, text);

CREATE OR REPLACE FUNCTION public.st_shortestline(text, text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public.ST_ShortestLine($1::public.geometry, $2::public.geometry);  $function$
;

-- Permissions

ALTER FUNCTION public.st_shortestline(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_shortestline(text, text) TO postgres;

-- DROP FUNCTION public.st_shortestline(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_shortestline(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_shortestline2d$function$
;

-- Permissions

ALTER FUNCTION public.st_shortestline(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_shortestline(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_shortestline(geography, geography, bool);

CREATE OR REPLACE FUNCTION public.st_shortestline(geography, geography, use_spheroid boolean DEFAULT true)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_shortestline$function$
;

-- Permissions

ALTER FUNCTION public.st_shortestline(geography, geography, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_shortestline(geography, geography, bool) TO postgres;

-- DROP FUNCTION public.st_simplify(geometry, float8, bool);

CREATE OR REPLACE FUNCTION public.st_simplify(geometry, double precision, boolean)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_simplify2d$function$
;

-- Permissions

ALTER FUNCTION public.st_simplify(geometry, float8, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_simplify(geometry, float8, bool) TO postgres;

-- DROP FUNCTION public.st_simplify(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_simplify(geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_simplify2d$function$
;

-- Permissions

ALTER FUNCTION public.st_simplify(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_simplify(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_simplifypolygonhull(geometry, float8, bool);

CREATE OR REPLACE FUNCTION public.st_simplifypolygonhull(geom geometry, vertex_fraction double precision, is_outer boolean DEFAULT true)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_SimplifyPolygonHull$function$
;

-- Permissions

ALTER FUNCTION public.st_simplifypolygonhull(geometry, float8, bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_simplifypolygonhull(geometry, float8, bool) TO postgres;

-- DROP FUNCTION public.st_simplifypreservetopology(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_simplifypreservetopology(geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$topologypreservesimplify$function$
;

-- Permissions

ALTER FUNCTION public.st_simplifypreservetopology(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_simplifypreservetopology(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_simplifyvw(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_simplifyvw(geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$LWGEOM_SetEffectiveArea$function$
;

-- Permissions

ALTER FUNCTION public.st_simplifyvw(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_simplifyvw(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_snap(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public.st_snap(geom1 geometry, geom2 geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_Snap$function$
;

-- Permissions

ALTER FUNCTION public.st_snap(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_snap(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public.st_snaptogrid(geometry, geometry, float8, float8, float8, float8);

CREATE OR REPLACE FUNCTION public.st_snaptogrid(geom1 geometry, geom2 geometry, double precision, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_snaptogrid_pointoff$function$
;

-- Permissions

ALTER FUNCTION public.st_snaptogrid(geometry, geometry, float8, float8, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_snaptogrid(geometry, geometry, float8, float8, float8, float8) TO postgres;

-- DROP FUNCTION public.st_snaptogrid(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_snaptogrid(geometry, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_SnapToGrid($1, 0, 0, $2, $2)$function$
;

-- Permissions

ALTER FUNCTION public.st_snaptogrid(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_snaptogrid(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_snaptogrid(geometry, float8, float8, float8, float8);

CREATE OR REPLACE FUNCTION public.st_snaptogrid(geometry, double precision, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_snaptogrid$function$
;

-- Permissions

ALTER FUNCTION public.st_snaptogrid(geometry, float8, float8, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_snaptogrid(geometry, float8, float8, float8, float8) TO postgres;

-- DROP FUNCTION public.st_snaptogrid(geometry, float8, float8);

CREATE OR REPLACE FUNCTION public.st_snaptogrid(geometry, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_SnapToGrid($1, 0, 0, $2, $3)$function$
;

-- Permissions

ALTER FUNCTION public.st_snaptogrid(geometry, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_snaptogrid(geometry, float8, float8) TO postgres;

-- DROP FUNCTION public.st_split(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_split(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_Split$function$
;

-- Permissions

ALTER FUNCTION public.st_split(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_split(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_square(float8, int4, int4, geometry);

CREATE OR REPLACE FUNCTION public.st_square(size double precision, cell_i integer, cell_j integer, origin geometry DEFAULT '010100000000000000000000000000000000000000'::geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Square$function$
;

-- Permissions

ALTER FUNCTION public.st_square(float8, int4, int4, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_square(float8, int4, int4, geometry) TO postgres;

-- DROP FUNCTION public.st_squaregrid(in float8, in geometry, out geometry, out int4, out int4);

CREATE OR REPLACE FUNCTION public.st_squaregrid(size double precision, bounds geometry, OUT geom geometry, OUT i integer, OUT j integer)
 RETURNS SETOF record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$ST_ShapeGrid$function$
;

-- Permissions

ALTER FUNCTION public.st_squaregrid(in float8, in geometry, out geometry, out int4, out int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_squaregrid(in float8, in geometry, out geometry, out int4, out int4) TO postgres;

-- DROP FUNCTION public.st_srid(geography);

CREATE OR REPLACE FUNCTION public.st_srid(geog geography)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_get_srid$function$
;

-- Permissions

ALTER FUNCTION public.st_srid(geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_srid(geography) TO postgres;

-- DROP FUNCTION public.st_srid(geometry);

CREATE OR REPLACE FUNCTION public.st_srid(geom geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_get_srid$function$
;

-- Permissions

ALTER FUNCTION public.st_srid(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_srid(geometry) TO postgres;

-- DROP FUNCTION public.st_startpoint(geometry);

CREATE OR REPLACE FUNCTION public.st_startpoint(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_startpoint_linestring$function$
;

-- Permissions

ALTER FUNCTION public.st_startpoint(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_startpoint(geometry) TO postgres;

-- DROP FUNCTION public.st_subdivide(geometry, int4, float8);

CREATE OR REPLACE FUNCTION public.st_subdivide(geom geometry, maxvertices integer DEFAULT 256, gridsize double precision DEFAULT '-1.0'::numeric)
 RETURNS SETOF geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_Subdivide$function$
;

-- Permissions

ALTER FUNCTION public.st_subdivide(geometry, int4, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_subdivide(geometry, int4, float8) TO postgres;

-- DROP FUNCTION public.st_summary(geography);

CREATE OR REPLACE FUNCTION public.st_summary(geography)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_summary$function$
;

-- Permissions

ALTER FUNCTION public.st_summary(geography) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_summary(geography) TO postgres;

-- DROP FUNCTION public.st_summary(geometry);

CREATE OR REPLACE FUNCTION public.st_summary(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_summary$function$
;

-- Permissions

ALTER FUNCTION public.st_summary(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_summary(geometry) TO postgres;

-- DROP FUNCTION public.st_swapordinates(geometry, cstring);

CREATE OR REPLACE FUNCTION public.st_swapordinates(geom geometry, ords cstring)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_SwapOrdinates$function$
;

-- Permissions

ALTER FUNCTION public.st_swapordinates(geometry, cstring) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_swapordinates(geometry, cstring) TO postgres;

-- DROP FUNCTION public.st_symdifference(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public.st_symdifference(geom1 geometry, geom2 geometry, gridsize double precision DEFAULT '-1.0'::numeric)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_SymDifference$function$
;

-- Permissions

ALTER FUNCTION public.st_symdifference(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_symdifference(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public.st_symmetricdifference(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_symmetricdifference(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE sql
AS $function$SELECT public.ST_SymDifference(geom1, geom2, -1.0);$function$
;

-- Permissions

ALTER FUNCTION public.st_symmetricdifference(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_symmetricdifference(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_tileenvelope(int4, int4, int4, geometry, float8);

CREATE OR REPLACE FUNCTION public.st_tileenvelope(zoom integer, x integer, y integer, bounds geometry DEFAULT '0102000020110F00000200000093107C45F81B73C193107C45F81B73C193107C45F81B734193107C45F81B7341'::geometry, margin double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_TileEnvelope$function$
;

-- Permissions

ALTER FUNCTION public.st_tileenvelope(int4, int4, int4, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_tileenvelope(int4, int4, int4, geometry, float8) TO postgres;

-- DROP FUNCTION public.st_touches(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_touches(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$touches$function$
;

-- Permissions

ALTER FUNCTION public.st_touches(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_touches(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_transform(geometry, text, text);

CREATE OR REPLACE FUNCTION public.st_transform(geom geometry, from_proj text, to_proj text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS $function$SELECT public.postgis_transform_geometry($1, $2, $3, 0)$function$
;

-- Permissions

ALTER FUNCTION public.st_transform(geometry, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_transform(geometry, text, text) TO postgres;

-- DROP FUNCTION public.st_transform(geometry, text);

CREATE OR REPLACE FUNCTION public.st_transform(geom geometry, to_proj text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS $function$SELECT public.postgis_transform_geometry($1, proj4text, $2, 0)
	FROM public.spatial_ref_sys WHERE srid=public.ST_SRID($1);$function$
;

-- Permissions

ALTER FUNCTION public.st_transform(geometry, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_transform(geometry, text) TO postgres;

-- DROP FUNCTION public.st_transform(geometry, int4);

CREATE OR REPLACE FUNCTION public.st_transform(geometry, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$transform$function$
;

-- Permissions

ALTER FUNCTION public.st_transform(geometry, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_transform(geometry, int4) TO postgres;

-- DROP FUNCTION public.st_transform(geometry, text, int4);

CREATE OR REPLACE FUNCTION public.st_transform(geom geometry, from_proj text, to_srid integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS $function$SELECT public.postgis_transform_geometry($1, $2, proj4text, $3)
	FROM public.spatial_ref_sys WHERE srid=$3;$function$
;

-- Permissions

ALTER FUNCTION public.st_transform(geometry, text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_transform(geometry, text, int4) TO postgres;

-- DROP FUNCTION public.st_transformpipeline(geometry, text, int4);

CREATE OR REPLACE FUNCTION public.st_transformpipeline(geom geometry, pipeline text, to_srid integer DEFAULT 0)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS $function$SELECT public.postgis_transform_pipeline_geometry($1, $2, TRUE, $3)$function$
;

-- Permissions

ALTER FUNCTION public.st_transformpipeline(geometry, text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_transformpipeline(geometry, text, int4) TO postgres;

-- DROP FUNCTION public.st_translate(geometry, float8, float8);

CREATE OR REPLACE FUNCTION public.st_translate(geometry, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Translate($1, $2, $3, 0)$function$
;

-- Permissions

ALTER FUNCTION public.st_translate(geometry, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_translate(geometry, float8, float8) TO postgres;

-- DROP FUNCTION public.st_translate(geometry, float8, float8, float8);

CREATE OR REPLACE FUNCTION public.st_translate(geometry, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1, 1, 0, 0, 0, 1, 0, 0, 0, 1, $2, $3, $4)$function$
;

-- Permissions

ALTER FUNCTION public.st_translate(geometry, float8, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_translate(geometry, float8, float8, float8) TO postgres;

-- DROP FUNCTION public.st_transscale(geometry, float8, float8, float8, float8);

CREATE OR REPLACE FUNCTION public.st_transscale(geometry, double precision, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1,  $4, 0, 0,  0, $5, 0,
		0, 0, 1,  $2 * $4, $3 * $5, 0)$function$
;

-- Permissions

ALTER FUNCTION public.st_transscale(geometry, float8, float8, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_transscale(geometry, float8, float8, float8, float8) TO postgres;

-- DROP FUNCTION public.st_triangulatepolygon(geometry);

CREATE OR REPLACE FUNCTION public.st_triangulatepolygon(g1 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_TriangulatePolygon$function$
;

-- Permissions

ALTER FUNCTION public.st_triangulatepolygon(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_triangulatepolygon(geometry) TO postgres;

-- DROP FUNCTION public.st_unaryunion(geometry, float8);

CREATE OR REPLACE FUNCTION public.st_unaryunion(geometry, gridsize double precision DEFAULT '-1.0'::numeric)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_UnaryUnion$function$
;

-- Permissions

ALTER FUNCTION public.st_unaryunion(geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_unaryunion(geometry, float8) TO postgres;

-- DROP AGGREGATE public.st_union(geometry);

-- Aggregate function public.st_union(geometry)
-- ERROR: more than one function named "public.st_union";

-- Permissions

ALTER AGGREGATE public.st_union(geometry) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_union(geometry) TO postgres;

-- DROP FUNCTION public.st_union(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_union(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_Union$function$
;

-- Permissions

ALTER FUNCTION public.st_union(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_union(geometry, geometry) TO postgres;

-- DROP AGGREGATE public.st_union(geometry, float8);

-- Aggregate function public.st_union(geometry, float8)
-- ERROR: more than one function named "public.st_union";

-- Permissions

ALTER AGGREGATE public.st_union(geometry, float8) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.st_union(geometry, float8) TO postgres;

-- DROP FUNCTION public.st_union(geometry, geometry, float8);

CREATE OR REPLACE FUNCTION public.st_union(geom1 geometry, geom2 geometry, gridsize double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$ST_Union$function$
;

-- Permissions

ALTER FUNCTION public.st_union(geometry, geometry, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_union(geometry, geometry, float8) TO postgres;

-- DROP FUNCTION public.st_union(_geometry);

CREATE OR REPLACE FUNCTION public.st_union(geometry[])
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000
AS '$libdir/postgis-3', $function$pgis_union_geometry_array$function$
;

-- Permissions

ALTER FUNCTION public.st_union(_geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_union(_geometry) TO postgres;

-- DROP FUNCTION public.st_voronoilines(geometry, float8, geometry);

CREATE OR REPLACE FUNCTION public.st_voronoilines(g1 geometry, tolerance double precision DEFAULT 0.0, extend_to geometry DEFAULT NULL::geometry)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public._ST_Voronoi(g1, extend_to, tolerance, false) $function$
;

-- Permissions

ALTER FUNCTION public.st_voronoilines(geometry, float8, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_voronoilines(geometry, float8, geometry) TO postgres;

-- DROP FUNCTION public.st_voronoipolygons(geometry, float8, geometry);

CREATE OR REPLACE FUNCTION public.st_voronoipolygons(g1 geometry, tolerance double precision DEFAULT 0.0, extend_to geometry DEFAULT NULL::geometry)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public._ST_Voronoi(g1, extend_to, tolerance, true) $function$
;

-- Permissions

ALTER FUNCTION public.st_voronoipolygons(geometry, float8, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_voronoipolygons(geometry, float8, geometry) TO postgres;

-- DROP FUNCTION public.st_within(geometry, geometry);

CREATE OR REPLACE FUNCTION public.st_within(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 5000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$within$function$
;

-- Permissions

ALTER FUNCTION public.st_within(geometry, geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_within(geometry, geometry) TO postgres;

-- DROP FUNCTION public.st_wkbtosql(bytea);

CREATE OR REPLACE FUNCTION public.st_wkbtosql(wkb bytea)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_from_WKB$function$
;

-- Permissions

ALTER FUNCTION public.st_wkbtosql(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_wkbtosql(bytea) TO postgres;

-- DROP FUNCTION public.st_wkttosql(text);

CREATE OR REPLACE FUNCTION public.st_wkttosql(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 250
AS '$libdir/postgis-3', $function$LWGEOM_from_text$function$
;

-- Permissions

ALTER FUNCTION public.st_wkttosql(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_wkttosql(text) TO postgres;

-- DROP FUNCTION public.st_wrapx(geometry, float8, float8);

CREATE OR REPLACE FUNCTION public.st_wrapx(geom geometry, wrap double precision, move double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_WrapX$function$
;

-- Permissions

ALTER FUNCTION public.st_wrapx(geometry, float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_wrapx(geometry, float8, float8) TO postgres;

-- DROP FUNCTION public.st_x(geometry);

CREATE OR REPLACE FUNCTION public.st_x(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_x_point$function$
;

-- Permissions

ALTER FUNCTION public.st_x(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_x(geometry) TO postgres;

-- DROP FUNCTION public.st_xmax(box3d);

CREATE OR REPLACE FUNCTION public.st_xmax(box3d)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_xmax$function$
;

-- Permissions

ALTER FUNCTION public.st_xmax(box3d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_xmax(box3d) TO postgres;

-- DROP FUNCTION public.st_xmin(box3d);

CREATE OR REPLACE FUNCTION public.st_xmin(box3d)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_xmin$function$
;

-- Permissions

ALTER FUNCTION public.st_xmin(box3d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_xmin(box3d) TO postgres;

-- DROP FUNCTION public.st_y(geometry);

CREATE OR REPLACE FUNCTION public.st_y(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_y_point$function$
;

-- Permissions

ALTER FUNCTION public.st_y(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_y(geometry) TO postgres;

-- DROP FUNCTION public.st_ymax(box3d);

CREATE OR REPLACE FUNCTION public.st_ymax(box3d)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_ymax$function$
;

-- Permissions

ALTER FUNCTION public.st_ymax(box3d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_ymax(box3d) TO postgres;

-- DROP FUNCTION public.st_ymin(box3d);

CREATE OR REPLACE FUNCTION public.st_ymin(box3d)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_ymin$function$
;

-- Permissions

ALTER FUNCTION public.st_ymin(box3d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_ymin(box3d) TO postgres;

-- DROP FUNCTION public.st_z(geometry);

CREATE OR REPLACE FUNCTION public.st_z(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_z_point$function$
;

-- Permissions

ALTER FUNCTION public.st_z(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_z(geometry) TO postgres;

-- DROP FUNCTION public.st_zmax(box3d);

CREATE OR REPLACE FUNCTION public.st_zmax(box3d)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_zmax$function$
;

-- Permissions

ALTER FUNCTION public.st_zmax(box3d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_zmax(box3d) TO postgres;

-- DROP FUNCTION public.st_zmflag(geometry);

CREATE OR REPLACE FUNCTION public.st_zmflag(geometry)
 RETURNS smallint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_zmflag$function$
;

-- Permissions

ALTER FUNCTION public.st_zmflag(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_zmflag(geometry) TO postgres;

-- DROP FUNCTION public.st_zmin(box3d);

CREATE OR REPLACE FUNCTION public.st_zmin(box3d)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_zmin$function$
;

-- Permissions

ALTER FUNCTION public.st_zmin(box3d) OWNER TO postgres;
GRANT ALL ON FUNCTION public.st_zmin(box3d) TO postgres;

-- DROP FUNCTION public."text"(geometry);

CREATE OR REPLACE FUNCTION public.text(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_text$function$
;

-- Permissions

ALTER FUNCTION public."text"(geometry) OWNER TO postgres;
GRANT ALL ON FUNCTION public."text"(geometry) TO postgres;

-- DROP FUNCTION public.trigger_refresh_dashboard_view();

CREATE OR REPLACE FUNCTION public.trigger_refresh_dashboard_view()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM refresh_dashboard_requests_view();
    RETURN NULL;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.trigger_refresh_dashboard_view() OWNER TO root;
GRANT ALL ON FUNCTION public.trigger_refresh_dashboard_view() TO root;

-- DROP FUNCTION public.update_costing_timestamp();

CREATE OR REPLACE FUNCTION public.update_costing_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_costing_timestamp() OWNER TO root;
GRANT ALL ON FUNCTION public.update_costing_timestamp() TO root;

-- DROP FUNCTION public.update_efiling_notifications_updated_at();

CREATE OR REPLACE FUNCTION public.update_efiling_notifications_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_efiling_notifications_updated_at() OWNER TO root;
GRANT ALL ON FUNCTION public.update_efiling_notifications_updated_at() TO root;

-- DROP FUNCTION public.update_efiling_templates_updated_at();

CREATE OR REPLACE FUNCTION public.update_efiling_templates_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_efiling_templates_updated_at() OWNER TO root;
GRANT ALL ON FUNCTION public.update_efiling_templates_updated_at() TO root;

-- DROP FUNCTION public.update_efiling_user_actions_updated_at();

CREATE OR REPLACE FUNCTION public.update_efiling_user_actions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_efiling_user_actions_updated_at() OWNER TO root;
GRANT ALL ON FUNCTION public.update_efiling_user_actions_updated_at() TO root;

-- DROP FUNCTION public.update_milestone_content_timestamp();

CREATE OR REPLACE FUNCTION public.update_milestone_content_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_milestone_content_timestamp() OWNER TO root;
GRANT ALL ON FUNCTION public.update_milestone_content_timestamp() TO root;

-- DROP FUNCTION public.update_modified_column();

CREATE OR REPLACE FUNCTION public.update_modified_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_modified_column() OWNER TO root;
GRANT ALL ON FUNCTION public.update_modified_column() TO root;

-- DROP FUNCTION public.update_sla_pause_history_updated_at();

CREATE OR REPLACE FUNCTION public.update_sla_pause_history_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_sla_pause_history_updated_at() OWNER TO root;
GRANT ALL ON FUNCTION public.update_sla_pause_history_updated_at() TO root;

-- DROP FUNCTION public.update_team_updated_at();

CREATE OR REPLACE FUNCTION public.update_team_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_team_updated_at() OWNER TO root;
GRANT ALL ON FUNCTION public.update_team_updated_at() TO root;

-- DROP FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_updated_at_column() OWNER TO root;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO root;

-- DROP FUNCTION public.update_work_request_status_on_approval();

CREATE OR REPLACE FUNCTION public.update_work_request_status_on_approval()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.work_requests 
        SET status_id = CASE 
            WHEN NEW.approval_status = 'approved' THEN 7  -- Approved by CEO
            WHEN NEW.approval_status = 'rejected' THEN 8  -- Rejected by CEO
            WHEN NEW.approval_status = 'pending' THEN 6   -- Pending CEO Approval
            ELSE status_id
        END,
        updated_date = CURRENT_TIMESTAMP
        WHERE id = NEW.work_request_id;
    END IF;
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_work_request_status_on_approval() OWNER TO root;
GRANT ALL ON FUNCTION public.update_work_request_status_on_approval() TO root;

-- DROP FUNCTION public.update_workflow_state_on_movement();

CREATE OR REPLACE FUNCTION public.update_workflow_state_on_movement()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Update workflow state when file is moved
    UPDATE efiling_file_workflow_states
    SET 
        current_assigned_to = NEW.to_user_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE file_id = NEW.file_id;
    
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_workflow_state_on_movement() OWNER TO root;
GRANT ALL ON FUNCTION public.update_workflow_state_on_movement() TO root;

-- DROP FUNCTION public.updategeometrysrid(varchar, varchar, varchar, varchar, int4);

CREATE OR REPLACE FUNCTION public.updategeometrysrid(catalogn_name character varying, schema_name character varying, table_name character varying, column_name character varying, new_srid_in integer)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	myrec RECORD;
	okay boolean;
	cname varchar;
	real_schema name;
	unknown_srid integer;
	new_srid integer := new_srid_in;

BEGIN

	-- Find, check or fix schema_name
	IF ( schema_name != '' ) THEN
		okay = false;

		FOR myrec IN SELECT nspname FROM pg_namespace WHERE text(nspname) = schema_name LOOP
			okay := true;
		END LOOP;

		IF ( okay <> true ) THEN
			RAISE EXCEPTION 'Invalid schema name';
		ELSE
			real_schema = schema_name;
		END IF;
	ELSE
		SELECT INTO real_schema current_schema()::text;
	END IF;

	-- Ensure that column_name is in geometry_columns
	okay = false;
	FOR myrec IN SELECT type, coord_dimension FROM public.geometry_columns WHERE f_table_schema = text(real_schema) and f_table_name = table_name and f_geometry_column = column_name LOOP
		okay := true;
	END LOOP;
	IF (NOT okay) THEN
		RAISE EXCEPTION 'column not found in geometry_columns table';
		RETURN false;
	END IF;

	-- Ensure that new_srid is valid
	IF ( new_srid > 0 ) THEN
		IF ( SELECT count(*) = 0 from public.spatial_ref_sys where srid = new_srid ) THEN
			RAISE EXCEPTION 'invalid SRID: % not found in spatial_ref_sys', new_srid;
			RETURN false;
		END IF;
	ELSE
		unknown_srid := public.ST_SRID('POINT EMPTY'::public.geometry);
		IF ( new_srid != unknown_srid ) THEN
			new_srid := unknown_srid;
			RAISE NOTICE 'SRID value % converted to the officially unknown SRID value %', new_srid_in, new_srid;
		END IF;
	END IF;

	IF postgis_constraint_srid(real_schema, table_name, column_name) IS NOT NULL THEN
	-- srid was enforced with constraints before, keep it that way.
		-- Make up constraint name
		cname = 'enforce_srid_'  || column_name;

		-- Drop enforce_srid constraint
		EXECUTE 'ALTER TABLE ' || quote_ident(real_schema) ||
			'.' || quote_ident(table_name) ||
			' DROP constraint ' || quote_ident(cname);

		-- Update geometries SRID
		EXECUTE 'UPDATE ' || quote_ident(real_schema) ||
			'.' || quote_ident(table_name) ||
			' SET ' || quote_ident(column_name) ||
			' = public.ST_SetSRID(' || quote_ident(column_name) ||
			', ' || new_srid::text || ')';

		-- Reset enforce_srid constraint
		EXECUTE 'ALTER TABLE ' || quote_ident(real_schema) ||
			'.' || quote_ident(table_name) ||
			' ADD constraint ' || quote_ident(cname) ||
			' CHECK (st_srid(' || quote_ident(column_name) ||
			') = ' || new_srid::text || ')';
	ELSE
		-- We will use typmod to enforce if no srid constraints
		-- We are using postgis_type_name to lookup the new name
		-- (in case Paul changes his mind and flips geometry_columns to return old upper case name)
		EXECUTE 'ALTER TABLE ' || quote_ident(real_schema) || '.' || quote_ident(table_name) ||
		' ALTER COLUMN ' || quote_ident(column_name) || ' TYPE  geometry(' || public.postgis_type_name(myrec.type, myrec.coord_dimension, true) || ', ' || new_srid::text || ') USING public.ST_SetSRID(' || quote_ident(column_name) || ',' || new_srid::text || ');' ;
	END IF;

	RETURN real_schema || '.' || table_name || '.' || column_name ||' SRID changed to ' || new_srid::text;

END;
$function$
;

-- Permissions

ALTER FUNCTION public.updategeometrysrid(varchar, varchar, varchar, varchar, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.updategeometrysrid(varchar, varchar, varchar, varchar, int4) TO postgres;

-- DROP FUNCTION public.updategeometrysrid(varchar, varchar, varchar, int4);

CREATE OR REPLACE FUNCTION public.updategeometrysrid(character varying, character varying, character varying, integer)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret  text;
BEGIN
	SELECT public.UpdateGeometrySRID('',$1,$2,$3,$4) into ret;
	RETURN ret;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.updategeometrysrid(varchar, varchar, varchar, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.updategeometrysrid(varchar, varchar, varchar, int4) TO postgres;

-- DROP FUNCTION public.updategeometrysrid(varchar, varchar, int4);

CREATE OR REPLACE FUNCTION public.updategeometrysrid(character varying, character varying, integer)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret  text;
BEGIN
	SELECT public.UpdateGeometrySRID('','',$1,$2,$3) into ret;
	RETURN ret;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.updategeometrysrid(varchar, varchar, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.updategeometrysrid(varchar, varchar, int4) TO postgres;


-- Permissions

GRANT ALL ON SCHEMA public TO pg_database_owner;
GRANT USAGE ON SCHEMA public TO public;
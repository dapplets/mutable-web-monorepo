CREATE DATABASE aigency WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';

\connect aigency

CREATE SCHEMA delivered;
CREATE SCHEMA feedback;
CREATE SCHEMA jobs;
CREATE SCHEMA "near-ai";
CREATE SCHEMA "personal-data";

CREATE TABLE delivered.reddits (
    id integer NOT NULL,
    userid character varying,
    pubdate character varying,
    delivered character varying,
    identifier character varying
);

CREATE SEQUENCE delivered.reddits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE delivered.reddits_id_seq OWNED BY delivered.reddits.id;

CREATE TABLE feedback.feedback (
    id integer NOT NULL,
    userid character varying,
    username character varying,
    feedback character varying,
    datetime timestamp with time zone DEFAULT now()
);

CREATE SEQUENCE feedback.feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE feedback.feedback_id_seq OWNED BY feedback.feedback.id;

CREATE TABLE jobs.reminders (
    id integer NOT NULL,
    username character varying,
    userid character varying NOT NULL,
    description character varying NOT NULL,
    remindertime character varying NOT NULL,
    isdone boolean
);

CREATE SEQUENCE jobs.reminders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE jobs.reminders_id_seq OWNED BY jobs.reminders.id;

CREATE TABLE jobs.subscriptions (
    id integer NOT NULL,
    username character varying,
    userid character varying,
    source character varying,
    link character varying,
    "is-active" boolean DEFAULT true
);

CREATE SEQUENCE jobs.subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE jobs.subscriptions_id_seq OWNED BY jobs.subscriptions.id;

CREATE TABLE jobs.tasks (
    id integer NOT NULL,
    username character varying,
    userid character varying NOT NULL,
    description character varying NOT NULL,
    tasktime character varying NOT NULL,
    isdone boolean,
    ispermanent character varying
);

CREATE SEQUENCE jobs.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE jobs.tasks_id_seq OWNED BY jobs.tasks.id;

CREATE TABLE "near-ai".available (
    id integer NOT NULL,
    name character varying NOT NULL,
    display_name character varying,
    title character varying,
    description character varying,
    version character varying NOT NULL,
    tags character varying,
    stars integer NOT NULL,
    forks integer NOT NULL,
    namespace character varying
);

CREATE SEQUENCE "near-ai".available_forks_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "near-ai".available_forks_seq OWNED BY "near-ai".available.forks;

CREATE SEQUENCE "near-ai".available_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "near-ai".available_id_seq OWNED BY "near-ai".available.id;

CREATE SEQUENCE "near-ai".available_stars_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "near-ai".available_stars_seq OWNED BY "near-ai".available.stars;

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(32) NOT NULL,
    status boolean DEFAULT true NOT NULL,
    near_account_id character varying,
    private_key character varying,
    network_id character varying,
    nearai_token character varying,
    CONSTRAINT users_username_check CHECK (((username)::text ~ '^[a-z0-9]+$'::text))
);

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

ALTER TABLE ONLY delivered.reddits ALTER COLUMN id SET DEFAULT nextval('delivered.reddits_id_seq'::regclass);
ALTER TABLE ONLY feedback.feedback ALTER COLUMN id SET DEFAULT nextval('feedback.feedback_id_seq'::regclass);
ALTER TABLE ONLY jobs.reminders ALTER COLUMN id SET DEFAULT nextval('jobs.reminders_id_seq'::regclass);
ALTER TABLE ONLY jobs.subscriptions ALTER COLUMN id SET DEFAULT nextval('jobs.subscriptions_id_seq'::regclass);
ALTER TABLE ONLY jobs.tasks ALTER COLUMN id SET DEFAULT nextval('jobs.tasks_id_seq'::regclass);
ALTER TABLE ONLY "near-ai".available ALTER COLUMN id SET DEFAULT nextval('"near-ai".available_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

SELECT pg_catalog.setval('delivered.reddits_id_seq', 4, true);
SELECT pg_catalog.setval('feedback.feedback_id_seq', 7, true);
SELECT pg_catalog.setval('jobs.reminders_id_seq', 10, true);
SELECT pg_catalog.setval('jobs.subscriptions_id_seq', 15, true);
SELECT pg_catalog.setval('jobs.tasks_id_seq', 5, true);
SELECT pg_catalog.setval('"near-ai".available_forks_seq', 1, false);
SELECT pg_catalog.setval('"near-ai".available_id_seq', 1, false);
SELECT pg_catalog.setval('"near-ai".available_stars_seq', 1, false);
SELECT pg_catalog.setval('public.users_id_seq', 1, false);

ALTER TABLE ONLY delivered.reddits
    ADD CONSTRAINT reddits_pk PRIMARY KEY (id);

ALTER TABLE ONLY feedback.feedback
    ADD CONSTRAINT feedback_pk PRIMARY KEY (id);

ALTER TABLE ONLY jobs.reminders
    ADD CONSTRAINT reminders_pk PRIMARY KEY (id);

ALTER TABLE ONLY jobs.subscriptions
    ADD CONSTRAINT subscriptions_pk_1 PRIMARY KEY (id);

ALTER TABLE ONLY jobs.tasks
    ADD CONSTRAINT tasks_pk PRIMARY KEY (id);

ALTER TABLE ONLY "near-ai".available
    ADD CONSTRAINT available_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
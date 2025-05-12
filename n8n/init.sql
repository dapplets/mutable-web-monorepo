CREATE DATABASE aigency WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';

\connect aigency

CREATE SCHEMA delivered;
CREATE SCHEMA feedback;
CREATE SCHEMA jobs;
CREATE SCHEMA "near-ai";
CREATE SCHEMA "personal-data";
CREATE SCHEMA environment;
CREATE SCHEMA "default";

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
    isdeveloper boolean DEFAULT false NOT NULL,
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

CREATE TABLE environment.variables (
    type character varying NOT NULL,
    value character varying,
    "default" character varying
);

COPY environment.variables (type, value, "default") FROM stdin;
about	I’m XEN - your personal assistant, here to help you organize your life, get things done, and interact more easily with the world of web3 and beyond.\n\nYou can message me, send voice notes in any language, or share images - and I’ll do my best to proactively support you.\n\nYou’re one of the first users of XEN (wohoo!) and this is a beta version, so if you spot anything strange, please help us improve!\nUse /f to send feedback. The best format is:\nWhat you were doing → What you expected → What actually happened\nThat way, we can find and fix bugs quickly.\n\n⸻\n\nWhat you can do with me right away:\n• Set reminders: “Remind me to pick up my kid at 3pm”\n• Ask questions: “Translate ‘good morning’ into Japanese” or “What’s the weather in Paris?”\n• Track thoughts: “/memo” shows what I’ve remembered for you\n\n⸻\n\nAnd if you connect your NEAR wallet (with /login):\n• Track your wallet: I’ll notify you about transactions or balance changes\n• Use dApps more easily: I’ll guide you through actions like minting NFTs or joining token sales\n• Stay informed: I’ll remind you about DAO votes or ecosystem events\n• Get smart prompts: I’ll help you make the most of your assets without needing to understand every technical detail\n\nWhy NEAR?\nWe’re currently integrated with NEAR because it’s fast, cheap, and friendly for developers. It helps us prototype quickly and offer useful features to early users like you. But XEN is chain-agnostic by design - we’ll expand to other networks over time.\n\n⸻\n\nYou don’t need a wallet to enjoy using me - but connecting one unlocks new features.\nEither way, I’m here to make your day easier and more productive.\n\nLet’s get started!	I’m XEN - your personal assistant, here to help you organize your life, get things done, and interact more easily with the world of web3 and beyond.\n\nYou can message me, send voice notes in any language, or share images - and I’ll do my best to proactively support you.\n\nYou’re one of the first users of XEN (wohoo!) and this is a beta version, so if you spot anything strange, please help us improve!\nUse /f to send feedback. The best format is:\nWhat you were doing → What you expected → What actually happened\nThat way, we can find and fix bugs quickly.\n\n⸻\n\nWhat you can do with me right away:\n• Set reminders: “Remind me to pick up my kid at 3pm”\n• Ask questions: “Translate ‘good morning’ into Japanese” or “What’s the weather in Paris?”\n• Track thoughts: “/memo” shows what I’ve remembered for you\n\n⸻\n\nAnd if you connect your NEAR wallet (with /login):\n• Track your wallet: I’ll notify you about transactions or balance changes\n• Use dApps more easily: I’ll guide you through actions like minting NFTs or joining token sales\n• Stay informed: I’ll remind you about DAO votes or ecosystem events\n• Get smart prompts: I’ll help you make the most of your assets without needing to understand every technical detail\n\nWhy NEAR?\nWe’re currently integrated with NEAR because it’s fast, cheap, and friendly for developers. It helps us prototype quickly and offer useful features to early users like you. But XEN is chain-agnostic by design - we’ll expand to other networks over time.\n\n⸻\n\nYou don’t need a wallet to enjoy using me - but connecting one unlocks new features.\nEither way, I’m here to make your day easier and more productive.\n\nLet’s get started!
\.

ALTER TABLE ONLY environment.variables
    ADD CONSTRAINT variables_pk PRIMARY KEY (type);

CREATE TABLE "default".capability (
    domain character varying NOT NULL,
    name character varying NOT NULL,
    title character varying,
    description character varying
);

CREATE TABLE "default".user_capability (
    username character varying NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    capability_domain character varying NOT NULL,
    capability_name character varying NOT NULL
);

CREATE TABLE "default".warning (
    id uuid NOT NULL,
    username character varying NOT NULL,
    title character varying,
    description character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    hash character varying NOT NULL
);

CREATE TABLE "default".transfer (
    id integer NOT NULL,
    recipient_account_id character varying NOT NULL,
    amount character varying NOT NULL,
    tx_hash character varying NOT NULL,
    notes character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    capability_domain character varying,
    capability_name character varying,
    caller_username character varying,
    execution_input character varying,
    execution_output character varying
);

CREATE SEQUENCE "default".transfer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "default".transfer_id_seq OWNED BY "default".transfer.id;

ALTER TABLE ONLY delivered.reddits ALTER COLUMN id SET DEFAULT nextval('delivered.reddits_id_seq'::regclass);
ALTER TABLE ONLY feedback.feedback ALTER COLUMN id SET DEFAULT nextval('feedback.feedback_id_seq'::regclass);
ALTER TABLE ONLY jobs.reminders ALTER COLUMN id SET DEFAULT nextval('jobs.reminders_id_seq'::regclass);
ALTER TABLE ONLY jobs.subscriptions ALTER COLUMN id SET DEFAULT nextval('jobs.subscriptions_id_seq'::regclass);
ALTER TABLE ONLY jobs.tasks ALTER COLUMN id SET DEFAULT nextval('jobs.tasks_id_seq'::regclass);
ALTER TABLE ONLY "near-ai".available ALTER COLUMN id SET DEFAULT nextval('"near-ai".available_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
ALTER TABLE ONLY "default".transfer ALTER COLUMN id SET DEFAULT nextval('"default".transfer_id_seq'::regclass);

SELECT pg_catalog.setval('delivered.reddits_id_seq', 4, true);
SELECT pg_catalog.setval('feedback.feedback_id_seq', 7, true);
SELECT pg_catalog.setval('jobs.reminders_id_seq', 10, true);
SELECT pg_catalog.setval('jobs.subscriptions_id_seq', 15, true);
SELECT pg_catalog.setval('jobs.tasks_id_seq', 5, true);
SELECT pg_catalog.setval('"near-ai".available_forks_seq', 1, false);
SELECT pg_catalog.setval('"near-ai".available_id_seq', 1, false);
SELECT pg_catalog.setval('"near-ai".available_stars_seq', 1, false);
SELECT pg_catalog.setval('public.users_id_seq', 1, false);
SELECT pg_catalog.setval('"default".transfer_id_seq', 1, false);

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

ALTER TABLE ONLY "default".capability
    ADD CONSTRAINT capability_unique UNIQUE (domain, name);

ALTER TABLE ONLY "default".user_capability
    ADD CONSTRAINT user_capability_unique UNIQUE (username, capability_domain, capability_name);

ALTER TABLE ONLY "default".warning
    ADD CONSTRAINT warning_pk PRIMARY KEY (id);

ALTER TABLE ONLY "default".transfer
    ADD CONSTRAINT reward_transaction_pk PRIMARY KEY (id);

CREATE UNIQUE INDEX capability_domain_idx ON "default".capability USING btree (domain, name);

CREATE TABLE "default".context_node (
    namespace character varying NOT NULL,
    type character varying NOT NULL,
    id character varying NOT NULL,
    content json
);

ALTER TABLE ONLY "default".context_node
    ADD CONSTRAINT context_node_unique UNIQUE (namespace, type, id);

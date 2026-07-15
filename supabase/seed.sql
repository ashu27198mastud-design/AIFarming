-- seed.sql
-- Seed dataset for KisanMitra Predict

-- Clean existing data in dependency order
TRUNCATE TABLE public.pwa_push_subscriptions CASCADE;
TRUNCATE TABLE public.feedback_ratings CASCADE;
TRUNCATE TABLE public.bazaar_bookings CASCADE;
TRUNCATE TABLE public.bazaar_listings CASCADE;
TRUNCATE TABLE public.village_board_messages CASCADE;
TRUNCATE TABLE public.ledger_entries CASCADE;
TRUNCATE TABLE public.schemes_enrollments CASCADE;
TRUNCATE TABLE public.soil_reports CASCADE;
TRUNCATE TABLE public.scans CASCADE;
TRUNCATE TABLE public.inventory CASCADE;
TRUNCATE TABLE public.crop_cycles CASCADE;
TRUNCATE TABLE public.plots CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.mandi_prices CASCADE;
TRUNCATE TABLE public.weather_cache CASCADE;
TRUNCATE TABLE public.retailers CASCADE;
TRUNCATE TABLE public.kvk_officers CASCADE;

-- 1. Insert Demo Profile for Asha Pawar
-- ID corresponds to a dummy supabase auth UUID
INSERT INTO public.profiles (id, name, village, district, state, gps_lat, gps_lng, language, consent_timestamp, created_at)
VALUES (
    'd7b6f68c-dfa2-4aef-aa86-0611a3df3dfb',
    'Asha Pawar',
    'Nashik',
    'Nashik',
    'Maharashtra',
    20.014,
    73.785,
    'hi',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
);

-- 2. Insert Plots for Asha Pawar
INSERT INTO public.plots (id, profile_id, name, crop_type, size_hectares, village, created_at)
VALUES (
    'e9b9f68c-dfa2-4aef-aa86-0611a3df3dfb',
    'd7b6f68c-dfa2-4aef-aa86-0611a3df3dfb',
    'घर के पीछे का खेत (Main Plot)',
    'Onion',
    1.2,
    'Nashik',
    timezone('utc'::text, now())
);

-- 3. Insert Crop Cycle
INSERT INTO public.crop_cycles (id, plot_id, crop_name, stage, sowing_date, harvest_date, created_at)
VALUES (
    'f0b9f68c-dfa2-4aef-aa86-0611a3df3dfb',
    'e9b9f68c-dfa2-4aef-aa86-0611a3df3dfb',
    'Onion',
    'flowering',
    '2026-05-10',
    NULL,
    timezone('utc'::text, now())
);

-- 4. Insert Inventory Items
INSERT INTO public.inventory (id, profile_id, item_name, category, quantity_bags, created_at)
VALUES 
(
    'a1b9f68c-dfa2-4aef-aa86-0611a3df3dfb',
    'd7b6f68c-dfa2-4aef-aa86-0611a3df3dfb',
    'Urea',
    'Nitrogen',
    1,
    timezone('utc'::text, now())
),
(
    'a2b9f68c-dfa2-4aef-aa86-0611a3df3dfb',
    'd7b6f68c-dfa2-4aef-aa86-0611a3df3dfb',
    'DAP',
    'Phosphorus',
    2,
    timezone('utc'::text, now())
);

-- 5. Insert Mandi Prices Cache
INSERT INTO public.mandi_prices (market_name, crop_name, variety, price_min, price_max, price_modal, date, created_at)
VALUES 
('Nashik', 'Onion', 'Red', 1200, 1800, 1500, CURRENT_DATE, timezone('utc'::text, now())),
('Lasalgaon', 'Onion', 'Red', 1300, 1950, 1650, CURRENT_DATE, timezone('utc'::text, now())),
('Pimpalgaon', 'Onion', 'Red', 1250, 1850, 1580, CURRENT_DATE, timezone('utc'::text, now())),
('Nashik', 'Tomato', 'Local', 2000, 3200, 2600, CURRENT_DATE, timezone('utc'::text, now()));

-- 6. Insert KVK Officers
INSERT INTO public.kvk_officers (name, designation, center_name, phone_number, district)
VALUES 
('Dr. Sanjay Patil', 'Senior Agronomist', 'KVK Nashik (YCMOU)', '+91 98765 43210', 'Nashik'),
('Prof. Ramesh Pawar', 'Plant Protection Specialist', 'KVK Lasalgaon', '+91 98765 01234', 'Nashik');

-- 7. Insert Retailers
INSERT INTO public.retailers (name, category, village, contact_number)
VALUES 
('Krishi Seva Kendra Nashik', 'Inputs', 'Nashik', '+91 253 234567'),
('Mahadhan Fertilizer Dealer', 'Fertilizers', 'Lasalgaon', '+91 253 987654'),
('Om Agro Agencies', 'Machinery & Equipment', 'Pimpalgaon', '+91 253 111222');

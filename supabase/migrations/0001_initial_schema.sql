-- 0001_initial_schema.sql
-- Initial Schema for KisanMitra Predict (17 Tables)

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    village TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    gps_lat DOUBLE PRECISION,
    gps_lng DOUBLE PRECISION,
    language TEXT NOT NULL DEFAULT 'hi',
    consent_timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Plots Table
CREATE TABLE IF NOT EXISTS public.plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    crop_type TEXT NOT NULL,
    size_hectares DOUBLE PRECISION NOT NULL,
    village TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Plots
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own plots" ON public.plots FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert own plots" ON public.plots FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update own plots" ON public.plots FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Users can delete own plots" ON public.plots FOR DELETE USING (auth.uid() = profile_id);

-- 3. Crop Cycles Table
CREATE TABLE IF NOT EXISTS public.crop_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('sowing', 'vegetative', 'flowering', 'maturity', 'harvested')),
    sowing_date DATE NOT NULL,
    harvest_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Crop Cycles
ALTER TABLE public.crop_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own crop cycles" ON public.crop_cycles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.plots WHERE plots.id = crop_cycles.plot_id AND plots.profile_id = auth.uid())
);
CREATE POLICY "Users can insert own crop cycles" ON public.crop_cycles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.plots WHERE plots.id = crop_cycles.plot_id AND plots.profile_id = auth.uid())
);
CREATE POLICY "Users can update own crop cycles" ON public.crop_cycles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.plots WHERE plots.id = crop_cycles.plot_id AND plots.profile_id = auth.uid())
);
CREATE POLICY "Users can delete own crop cycles" ON public.crop_cycles FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.plots WHERE plots.id = crop_cycles.plot_id AND plots.profile_id = auth.uid())
);

-- 4. Scans Table (AI Disease scan history)
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    disease_name TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    confidence DOUBLE PRECISION NOT NULL,
    see_officer BOOLEAN NOT NULL DEFAULT FALSE,
    visible_signs TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Scans
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scans" ON public.scans FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert own scans" ON public.scans FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- 5. Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity_bags INTEGER NOT NULL CHECK (quantity_bags >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Inventory
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own inventory" ON public.inventory FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert own inventory" ON public.inventory FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update own inventory" ON public.inventory FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Users can delete own inventory" ON public.inventory FOR DELETE USING (auth.uid() = profile_id);

-- 6. Bazaar Listings
CREATE TABLE IF NOT EXISTS public.bazaar_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('rent_out', 'sell')),
    category TEXT NOT NULL,
    price_rupees DOUBLE PRECISION NOT NULL CHECK (price_rupees >= 0),
    unit TEXT NOT NULL,
    village TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Bazaar Listings
ALTER TABLE public.bazaar_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view bazaar listings" ON public.bazaar_listings FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert own bazaar listings" ON public.bazaar_listings FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update own bazaar listings" ON public.bazaar_listings FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Users can delete own bazaar listings" ON public.bazaar_listings FOR DELETE USING (auth.uid() = profile_id);

-- 7. Bazaar Bookings
CREATE TABLE IF NOT EXISTS public.bazaar_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.bazaar_listings(id) ON DELETE CASCADE,
    renter_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Bazaar Bookings
ALTER TABLE public.bazaar_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings (as renter or owner)" ON public.bazaar_bookings FOR SELECT USING (
    auth.uid() = renter_profile_id OR EXISTS (
        SELECT 1 FROM public.bazaar_listings WHERE bazaar_listings.id = listing_id AND bazaar_listings.profile_id = auth.uid()
    )
);
CREATE POLICY "Users can insert own bookings" ON public.bazaar_bookings FOR INSERT WITH CHECK (auth.uid() = renter_profile_id);
CREATE POLICY "Users can update own bookings" ON public.bazaar_bookings FOR UPDATE USING (
    auth.uid() = renter_profile_id OR EXISTS (
        SELECT 1 FROM public.bazaar_listings WHERE bazaar_listings.id = listing_id AND bazaar_listings.profile_id = auth.uid()
    )
);

-- 8. Feedback Ratings
CREATE TABLE IF NOT EXISTS public.feedback_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bazaar_bookings(id) ON DELETE CASCADE,
    rater_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Feedback Ratings
ALTER TABLE public.feedback_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view feedback ratings" ON public.feedback_ratings FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert own feedback ratings" ON public.feedback_ratings FOR INSERT WITH CHECK (auth.uid() = rater_profile_id);

-- 9. Village Board Messages
CREATE TABLE IF NOT EXISTS public.village_board_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    village TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Village Board Messages
ALTER TABLE public.village_board_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view village board messages" ON public.village_board_messages FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert own village board messages" ON public.village_board_messages FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can delete own village board messages" ON public.village_board_messages FOR DELETE USING (auth.uid() = profile_id);

-- 10. Ledger Entries Table
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL CHECK (category IN ('sales', 'rent_out', 'purchase', 'rent_in', 'labor', 'other')),
    amount_rupees DOUBLE PRECISION NOT NULL CHECK (amount_rupees >= 0),
    reference_id UUID,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Ledger Entries
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ledger entries" ON public.ledger_entries FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert own ledger entries" ON public.ledger_entries FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update own ledger entries" ON public.ledger_entries FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Users can delete own ledger entries" ON public.ledger_entries FOR DELETE USING (auth.uid() = profile_id);

-- 11. Schemes Enrollments
CREATE TABLE IF NOT EXISTS public.schemes_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheme_name TEXT NOT NULL,
    status TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Schemes Enrollments
ALTER TABLE public.schemes_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scheme enrollments" ON public.schemes_enrollments FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert own scheme enrollments" ON public.schemes_enrollments FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update own scheme enrollments" ON public.schemes_enrollments FOR UPDATE USING (auth.uid() = profile_id);

-- 12. Mandi Prices Cache
CREATE TABLE IF NOT EXISTS public.mandi_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_name TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    variety TEXT NOT NULL,
    price_min DOUBLE PRECISION NOT NULL CHECK (price_min >= 0),
    price_max DOUBLE PRECISION NOT NULL CHECK (price_max >= 0),
    price_modal DOUBLE PRECISION NOT NULL CHECK (price_modal >= 0),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Mandi Prices
ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view mandi prices" ON public.mandi_prices FOR SELECT USING (TRUE);

-- 13. Weather Cache
CREATE TABLE IF NOT EXISTS public.weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    forecast_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Weather Cache
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view weather cache" ON public.weather_cache FOR SELECT USING (TRUE);

-- 14. Soil Reports
CREATE TABLE IF NOT EXISTS public.soil_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nitrogen_level TEXT NOT NULL CHECK (nitrogen_level IN ('low', 'medium', 'high')),
    phosphorus_level TEXT NOT NULL CHECK (phosphorus_level IN ('low', 'medium', 'high')),
    potassium_level TEXT NOT NULL CHECK (potassium_level IN ('low', 'medium', 'high')),
    ph DOUBLE PRECISION NOT NULL CHECK (ph >= 0 AND ph <= 14),
    report_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Soil Reports
ALTER TABLE public.soil_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own soil reports" ON public.soil_reports FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert own soil reports" ON public.soil_reports FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- 15. Retailers Directory
CREATE TABLE IF NOT EXISTS public.retailers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    village TEXT NOT NULL,
    contact_number TEXT NOT NULL
);

-- Enable RLS for Retailers
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view retailers" ON public.retailers FOR SELECT USING (TRUE);

-- 16. KVK Officers Directory
CREATE TABLE IF NOT EXISTS public.kvk_officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    center_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    district TEXT NOT NULL
);

-- Enable RLS for KVK Officers
ALTER TABLE public.kvk_officers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view KVK officers" ON public.kvk_officers FOR SELECT USING (TRUE);

-- 17. PWA Push Subscriptions
CREATE TABLE IF NOT EXISTS public.pwa_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for PWA Push Subscriptions
ALTER TABLE public.pwa_push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own subscriptions" ON public.pwa_push_subscriptions FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert own subscriptions" ON public.pwa_push_subscriptions FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can delete own subscriptions" ON public.pwa_push_subscriptions FOR DELETE USING (auth.uid() = profile_id);

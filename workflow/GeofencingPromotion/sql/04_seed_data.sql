------------------------------------------------------------
-- Geofenced Promotion Demo - Seed Data
-- Loads sample promotions, geofences, users, and location events.
-- NOTE: Assumes tables exist.
------------------------------------------------------------

-- Promotions
------------------------------------------------------------
DECLARE
  v_promo_downtown_id NUMBER;
  v_promo_vip_id      NUMBER;
BEGIN
  INSERT INTO promotion (promotion_name, required_tier, start_date, end_date, active_flag, message_text)
  VALUES (
    '10% Off at Downtown Mall',
    'SILVER',
    SYSDATE - 1,
    SYSDATE + 30,
    'Yes',
    'You are near Downtown Mall! Enjoy 10% off today.'
  )
  RETURNING promotion_id INTO v_promo_downtown_id;

  INSERT INTO promotion (promotion_name, required_tier, start_date, end_date, active_flag, message_text)
  VALUES (
    'VIP Gold Lounge Offer',
    'GOLD',
    SYSDATE - 1,
    SYSDATE + 30,
    'Yes',
    'Exclusive Gold member offer unlocked near VIP Lounge.'
  )
  RETURNING promotion_id INTO v_promo_vip_id;

  ------------------------------------------------------------
  -- Geofences
  ------------------------------------------------------------
  INSERT INTO geofence (geofence_name, min_lat, max_lat, min_lon, max_lon, active_flag, promotion_id)
  VALUES ('Downtown Mall Zone', 37.774000, 37.776000, -122.420500, -122.417500, 'Yes', v_promo_downtown_id);

  INSERT INTO geofence (geofence_name, min_lat, max_lat, min_lon, max_lon, active_flag, promotion_id)
  VALUES ('VIP Lounge Zone', 37.777000, 37.778000, -122.416000, -122.414000, 'Yes', v_promo_vip_id);
END;
/

-- Geofences
-- NOTE: Geofences are inserted in the PL/SQL block above using the
-- generated promotion_id values from INSERT ... RETURNING.

------------------------------------------------------------
-- Users
------------------------------------------------------------
INSERT INTO app_user (user_name, loyalty_tier, opted_in_promotions)
VALUES ('Alice', 'SILVER', 'Yes');

INSERT INTO app_user (user_name, loyalty_tier, opted_in_promotions)
VALUES ('Bob', 'BRONZE', 'Yes');

INSERT INTO app_user (user_name, loyalty_tier, opted_in_promotions)
VALUES ('Carol', 'GOLD', 'Yes');

INSERT INTO app_user (user_name, loyalty_tier, opted_in_promotions)
VALUES ('Dave', 'GOLD', 'No');

INSERT INTO app_user (user_name, loyalty_tier, opted_in_promotions)
VALUES ('Emily', 'DIAMOND', 'Yes');

------------------------------------------------------------
-- Sample Location Events
-- Event inside Downtown Mall geofence for Alice (SILVER, opted-in) -> eligible
-- Event inside Downtown Mall geofence for Bob (BRONZE) -> not eligible for SILVER offer
-- Event inside VIP Lounge geofence for Carol (GOLD) -> eligible
-- Event inside VIP Lounge geofence for Dave (GOLD but not opted-in) -> not eligible
-- Event outside all geofences (Alice) -> no geofence match (match_flag = 'No')
------------------------------------------------------------
INSERT INTO location_event (user_id, event_lat, event_lon, source_system)
VALUES (1, 37.775200, -122.419000, 'mobile-app');

INSERT INTO location_event (user_id, event_lat, event_lon, source_system)
VALUES (2, 37.775300, -122.418800, 'mobile-app');

INSERT INTO location_event (user_id, event_lat, event_lon, source_system)
VALUES (3, 37.777500, -122.415000, 'mobile-app');

INSERT INTO location_event (user_id, event_lat, event_lon, source_system)
VALUES (4, 37.777600, -122.415100, 'mobile-app');

-- Event for Emily (DIAMOND, opted-in)
INSERT INTO location_event (user_id, event_lat, event_lon, source_system)
VALUES (5, 37.775500, -122.419500, 'mobile-app');

-- Outside both geofence bounding boxes:
-- Downtown Mall Zone: lat 37.774000-37.776000, lon -122.420500--122.417500
-- VIP Lounge Zone:    lat 37.777000-37.778000, lon -122.416000--122.414000
INSERT INTO location_event (user_id, event_lat, event_lon, source_system)
VALUES (1, 37.780000, -122.430000, 'mobile-app');

COMMIT;

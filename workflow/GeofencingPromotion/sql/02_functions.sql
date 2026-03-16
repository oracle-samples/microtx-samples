------------------------------------------------------------
-- Geofenced Promotion Demo - Functions
-- NOTE: Non-idempotent (no drops). Use cleanup.sql to remove.
------------------------------------------------------------

------------------------------------------------------------
-- FUNCTION: FIND MATCHING GEOFENCE
-- Returns first active geofence whose bounding box contains (lat, lon)
------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_find_matching_geofence (
  p_lat IN NUMBER,
  p_lon IN NUMBER
) RETURN NUMBER
IS
  v_geofence_id NUMBER;
BEGIN
  SELECT geofence_id
    INTO v_geofence_id
    FROM geofence
   WHERE active_flag = 'Yes'
     AND p_lat BETWEEN min_lat AND max_lat
     AND p_lon BETWEEN min_lon AND max_lon
     AND ROWNUM = 1;

  RETURN v_geofence_id;

EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END;
/

------------------------------------------------------------
-- FUNCTION: CALCULATE PROMOTION ELIGIBILITY
-- Eligibility logic:
--  - user must be opted in
--  - promotion must be active
--  - current date must be between start/end
--  - loyalty tier must satisfy required_tier (if any)
------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calculate_promo_eligibility (
  p_user_id       IN NUMBER,
  p_geofence_id   IN NUMBER
) RETURN VARCHAR2
IS
  v_user_tier         app_user.loyalty_tier%TYPE;
  v_opt_in            app_user.opted_in_promotions%TYPE;
  v_promotion_id      geofence.promotion_id%TYPE;
  v_required_tier     promotion.required_tier%TYPE;
  v_start_date        promotion.start_date%TYPE;
  v_end_date          promotion.end_date%TYPE;
  v_active_flag       promotion.active_flag%TYPE;
BEGIN
  SELECT loyalty_tier, opted_in_promotions
    INTO v_user_tier, v_opt_in
    FROM app_user
   WHERE user_id = p_user_id;

  IF v_user_tier NOT IN ('GOLD', 'SILVER', 'BRONZE') THEN
    RAISE_APPLICATION_ERROR(-20002, 'Invalid or unsupported loyalty tier for user');
  END IF;

  SELECT g.promotion_id, p.required_tier, p.start_date, p.end_date, p.active_flag
    INTO v_promotion_id, v_required_tier, v_start_date, v_end_date, v_active_flag
    FROM geofence g
    JOIN promotion p ON p.promotion_id = g.promotion_id
   WHERE g.geofence_id = p_geofence_id;

  IF v_opt_in <> 'Yes' THEN
    RETURN 'No';
  END IF;

  IF v_active_flag <> 'Yes' THEN
    RETURN 'No';
  END IF;

  IF SYSDATE < v_start_date OR SYSDATE > v_end_date THEN
    RETURN 'No';
  END IF;

  IF v_required_tier IS NULL THEN
    RETURN 'Yes';
  END IF;

  IF v_required_tier = 'GOLD' AND v_user_tier <> 'GOLD' THEN
    RETURN 'No';
  ELSIF v_required_tier = 'SILVER' AND v_user_tier NOT IN ('SILVER', 'GOLD') THEN
    RETURN 'No';
  ELSE
    RETURN 'Yes';
  END IF;
END;
/

------------------------------------------------------------
-- FUNCTION: GET LATEST NOTIFICATION JSON
-- Returns the latest notification payload for a user created
-- within the last N seconds; otherwise returns NULL.
------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_latest_notification_json (
  p_user_id       IN NUMBER,
  p_lookback_sec  IN NUMBER DEFAULT 180
) RETURN VARCHAR2
IS
  v_payload_json JSON;
  v_payload_str  VARCHAR2(255);
BEGIN
  SELECT n.payload
    INTO v_payload_json
    FROM notification n
   WHERE n.user_id = p_user_id
     AND n.created_at >= (SYSDATE - (NVL(p_lookback_sec, 60)/86400))
   ORDER BY n.created_at DESC
   FETCH FIRST 1 ROW ONLY;

  SELECT JSON_SERIALIZE(v_payload_json RETURNING VARCHAR2)
    INTO v_payload_str
    FROM dual;

  RETURN v_payload_str;

EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END;
/

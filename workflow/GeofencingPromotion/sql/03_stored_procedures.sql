------------------------------------------------------------
-- Geofenced Promotion Demo - Stored Procedures
-- NOTE: Non-idempotent (no drops). Use cleanup.sql to remove.
------------------------------------------------------------

------------------------------------------------------------
-- PROCEDURE: CHECK GEOFENCE CONTAINMENT
-- Reads the location_event, finds matching active geofence (if any),
-- writes/updates geofence_match_result.
------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_check_geofence_containment (
  p_event_id      IN  NUMBER,
  p_geofence_id   OUT NUMBER,
  p_match_flag    OUT geofence_match_result.match_flag%TYPE
)
IS
  v_lat NUMBER;
  v_lon NUMBER;
BEGIN
  SELECT event_lat, event_lon
    INTO v_lat, v_lon
    FROM location_event
   WHERE event_id = p_event_id;

  p_geofence_id := fn_find_matching_geofence(v_lat, v_lon);

  IF p_geofence_id IS NOT NULL THEN
    p_match_flag := 'Yes';
  ELSE
    p_match_flag := 'No';
  END IF;

  MERGE INTO geofence_match_result gmr
  USING (SELECT p_event_id AS event_id FROM dual) src
  ON (gmr.event_id = src.event_id)
  WHEN MATCHED THEN
    UPDATE SET geofence_id = p_geofence_id,
               match_flag  = p_match_flag,
               matched_at  = SYSDATE
  WHEN NOT MATCHED THEN
    INSERT (event_id, geofence_id, match_flag, matched_at)
    VALUES (p_event_id, p_geofence_id, p_match_flag, SYSDATE);
END;
/

------------------------------------------------------------
-- PROCEDURE: EVALUATE PROMOTION ELIGIBILITY
-- Determines promotion_id from geofence, evaluates eligibility,
-- writes/updates promotion_eligibility_result.
------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_evaluate_promo_eligibility (
  p_event_id            IN  NUMBER,
  p_user_id             IN  NUMBER,
  p_geofence_id         IN  NUMBER,
  p_promotion_id        OUT NUMBER,
  p_eligible_flag       OUT promotion_eligibility_result.eligible_flag%TYPE,
  p_reason              OUT VARCHAR2
)
IS
BEGIN
  SELECT promotion_id
    INTO p_promotion_id
    FROM geofence
   WHERE geofence_id = p_geofence_id;

  p_eligible_flag := fn_calculate_promo_eligibility(p_user_id, p_geofence_id);

  IF p_eligible_flag = 'Yes' THEN
    p_reason := 'User is eligible for promotion';
  ELSE
    p_reason := 'User is not eligible based on opt-in, active dates, or tier';
  END IF;

  MERGE INTO promotion_eligibility_result perr
  USING (SELECT p_event_id AS event_id FROM dual) src
  ON (perr.event_id = src.event_id)
  WHEN MATCHED THEN
    UPDATE SET user_id            = p_user_id,
               promotion_id       = p_promotion_id,
               eligible_flag      = p_eligible_flag,
               eligibility_reason = p_reason,
               evaluated_at       = SYSDATE
  WHEN NOT MATCHED THEN
    INSERT (event_id, user_id, promotion_id, eligible_flag, eligibility_reason, evaluated_at)
    VALUES (p_event_id, p_user_id, p_promotion_id, p_eligible_flag, p_reason, SYSDATE);

END;
/

------------------------------------------------------------
-- PROCEDURE: LOG PROMOTION EVENT
------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_log_promotion_event (
  p_event_id       IN NUMBER,
  p_user_id        IN NUMBER,
  p_geofence_id    IN NUMBER,
  p_promotion_id   IN NUMBER,
  p_action_taken   IN VARCHAR2,
  p_details        IN VARCHAR2
)
IS
BEGIN
  INSERT INTO promotion_event_log (
    event_id,
    user_id,
    geofence_id,
    promotion_id,
    action_taken,
    details,
    created_at
  )
  VALUES (
    p_event_id,
    p_user_id,
    p_geofence_id,
    p_promotion_id,
    p_action_taken,
    p_details,
    SYSDATE
  );
END;
/

------------------------------------------------------------
-- PROCEDURE: LOAD PROMOTION MESSAGE
-- Fetches promotion name and default message text.
------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_load_promotion_message (
  p_promotion_id     IN  NUMBER,
  p_promotion_name   OUT VARCHAR2,
  p_message_text     OUT VARCHAR2
)
IS
BEGIN
  SELECT promotion_name, message_text
    INTO p_promotion_name, p_message_text
    FROM promotion
   WHERE promotion_id = p_promotion_id
     AND active_flag = 'Yes';
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    p_promotion_name := NULL;
    p_message_text   := 'A promotion is available near your location.';
END;
/

------------------------------------------------------------
-- PROCEDURE: LOAD USER PROMOTION CONTEXT
-- Helpful for GenAI personalization.
------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_load_user_promo_context (
  p_user_id         IN  NUMBER,
  p_user_name       OUT VARCHAR2,
  p_loyalty_tier    OUT VARCHAR2,
  p_opted_in        OUT app_user.opted_in_promotions%TYPE
)
IS
BEGIN
  SELECT user_name, loyalty_tier, opted_in_promotions
    INTO p_user_name, p_loyalty_tier, p_opted_in
    FROM app_user
   WHERE user_id = p_user_id;
  
  -- Raise error if loyalty tier is NOT one of BRONZE, GOLD, or SILVER
  IF UPPER(p_loyalty_tier) NOT IN ('BRONZE', 'GOLD', 'SILVER') THEN
    RAISE_APPLICATION_ERROR(-20002, 'Invalid or unsupported loyalty tier for user');
  END IF;
END;
/

------------------------------------------------------------
-- PROCEDURE: STORE NOTIFICATION
-- Stores a notification JSON payload for a given user.
------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_store_notification (
  p_user_id   IN NUMBER,
  p_message   IN VARCHAR2
)
IS
BEGIN
  INSERT INTO notification (
    user_id,
    payload,
    created_at
  )
  VALUES (
    p_user_id,
    JSON_OBJECT(
      'createdTime' VALUE SYSTIMESTAMP,
      'message'     VALUE p_message
    ),
    SYSDATE
  );
END;
/

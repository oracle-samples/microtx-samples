------------------------------------------------------------
-- Geofenced Promotion Demo - Cleanup
-- Drops all objects created by this demo.
-- Run this if you want to reset the schema.
-- NOTE: This script is safe to run even if objects don't exist.
------------------------------------------------------------

DECLARE
  PROCEDURE drop_obj(p_sql IN VARCHAR2) IS
  BEGIN
    EXECUTE IMMEDIATE p_sql;
  EXCEPTION
    WHEN OTHERS THEN
      -- Ignore "does not exist" errors
      IF SQLCODE IN (-942,  -4043) THEN
        NULL;
      ELSE
        RAISE;
      END IF;
  END;
BEGIN
  -- Drop procedures (depend on functions/tables)
  drop_obj('DROP PROCEDURE sp_store_notification');
  drop_obj('DROP PROCEDURE sp_load_user_promo_context');
  drop_obj('DROP PROCEDURE sp_load_promotion_message');
  drop_obj('DROP PROCEDURE sp_log_promotion_event');
  drop_obj('DROP PROCEDURE sp_evaluate_promo_eligibility');
  drop_obj('DROP PROCEDURE sp_check_geofence_containment');

  -- Drop functions
  drop_obj('DROP FUNCTION fn_get_latest_notification_json');
  drop_obj('DROP FUNCTION fn_calculate_promo_eligibility');
  drop_obj('DROP FUNCTION fn_find_matching_geofence');

  -- Drop tables (child -> parent to satisfy FKs)
  drop_obj('DROP TABLE notification');
  drop_obj('DROP TABLE promotion_event_log');
  drop_obj('DROP TABLE promotion_eligibility_result');
  drop_obj('DROP TABLE geofence_match_result');
  drop_obj('DROP TABLE location_event');
  drop_obj('DROP TABLE geofence');
  drop_obj('DROP TABLE promotion');
  drop_obj('DROP TABLE app_user');
END;
/

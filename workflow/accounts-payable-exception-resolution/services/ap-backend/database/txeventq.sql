-- Run once as the AP schema owner after schema.sql.
-- The schema owner requires AQ_USER_ROLE and EXECUTE on DBMS_AQ and DBMS_AQADM.
--
-- Oracle Database 19c exposes CREATE_SHARDED_QUEUE for TxEventQ. Later
-- releases can expose CREATE_TRANSACTIONAL_EVENT_QUEUE instead. Use dynamic
-- PL/SQL so the script compiles on either database version; a direct reference
-- to an unavailable package member would fail at compile time with PLS-00302.

DECLARE
  l_queue_exists NUMBER;
  l_api_exists   NUMBER;
BEGIN
  SELECT COUNT(*)
    INTO l_queue_exists
    FROM user_queues
   WHERE name = 'AP_PAYMENT_SETTLEMENT_EVENTS';

  IF l_queue_exists = 0 THEN
    SELECT COUNT(*)
      INTO l_api_exists
      FROM all_procedures
     WHERE owner = 'SYS'
       AND object_name = 'DBMS_AQADM'
       AND procedure_name = 'CREATE_TRANSACTIONAL_EVENT_QUEUE';

    IF l_api_exists > 0 THEN
      EXECUTE IMMEDIATE q'[
        BEGIN
          DBMS_AQADM.CREATE_TRANSACTIONAL_EVENT_QUEUE(
            queue_name         => 'AP_PAYMENT_SETTLEMENT_EVENTS',
            multiple_consumers => TRUE
          );
        END;]';
    ELSE
      -- Oracle Database 19c / compatible Autonomous Database TxEventQ API.
      EXECUTE IMMEDIATE q'[
        BEGIN
          DBMS_AQADM.CREATE_SHARDED_QUEUE(
            queue_name         => 'AP_PAYMENT_SETTLEMENT_EVENTS',
            multiple_consumers => TRUE
          );
        END;]';
    END IF;
  END IF;
END;
/

DECLARE
  l_queue_started NUMBER;
BEGIN
  SELECT COUNT(*)
    INTO l_queue_started
    FROM user_queues
   WHERE name = 'AP_PAYMENT_SETTLEMENT_EVENTS'
     AND enqueue_enabled = 'YES'
     AND dequeue_enabled = 'YES';

  IF l_queue_started = 0 THEN
    DBMS_AQADM.START_QUEUE(
      queue_name => 'AP_PAYMENT_SETTLEMENT_EVENTS'
    );
  END IF;
END;
/

DECLARE
  l_subscriber_exists NUMBER;
BEGIN
  SELECT COUNT(*)
    INTO l_subscriber_exists
    FROM user_queue_subscribers
   WHERE queue_name = 'AP_PAYMENT_SETTLEMENT_EVENTS'
     AND consumer_name = 'AP_SETTLEMENT_SUBSCRIBER';

  IF l_subscriber_exists = 0 THEN
    DBMS_AQADM.ADD_SUBSCRIBER(
      queue_name => 'AP_PAYMENT_SETTLEMENT_EVENTS',
      subscriber => SYS.AQ$_AGENT('AP_SETTLEMENT_SUBSCRIBER', NULL, NULL)
    );
  END IF;
END;
/

SELECT queue_name, consumer_name
  FROM user_queue_subscribers
 WHERE queue_name = 'AP_PAYMENT_SETTLEMENT_EVENTS';

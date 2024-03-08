--------------TRIGGER-------------
CREATE OR REPLACE TRIGGER CHECKCART 

BEFORE INSERT OR UPDATE ON CART
FOR EACH ROW
DECLARE
	QUANTITY NUMBER:=0;
BEGIN
	SELECT STOCK_QUANTITY INTO QUANTITY FROM PRODUCTS WHERE PRODUCT_ID = :NEW.PRODUCT_ID;
	IF :NEW.QUANTITY > QUANTITY THEN
		RAISE_APPLICATION_ERROR(-20001, 'STOCK OUT');
	END IF;
END;
/


--------------TRIGGER-------------

CREATE OR REPLACE TRIGGER CONFIRMORDER
BEFORE INSERT ON ORDERS
FOR EACH ROW
DECLARE 
	STOCK NUMBER:=0;
	ITEMS NUMBER:=0;
BEGIN

	SELECT QUANTITY INTO ITEMS
        FROM CART
        WHERE CART_ID = :NEW.ORDER_ID
		AND USER_ID = :NEW.USER_ID
        AND PRODUCT_ID = :NEW.PRODUCT_ID;
	SELECT STOCK_QUANTITY INTO STOCK
		FROM PRODUCTS
		WHERE PRODUCT_ID = :NEW.PRODUCT_ID;
	IF STOCK=0 THEN
		RAISE_APPLICATION_ERROR(-20001, 'STOCK NOT AVAILABLE');
	ELSIF ITEMS>STOCK THEN
		ITEMS:= STOCK;
	END IF;
	
		UPDATE PRODUCTS
    SET STOCK_QUANTITY = STOCK_QUANTITY - ITEMS
    WHERE PRODUCT_ID = :NEW.PRODUCT_ID;
END;
/

--------------TRIGGER-------------

CREATE OR REPLACE TRIGGER UPDATE_PROMO_CODE
    BEFORE INSERT ON PRODUCTS
		FOR EACH ROW
    DECLARE
    PROMO VARCHAR2(10);
    DISC_AMOUNT NUMBER;
		N NUMBER;
    BEGIN
    PROMO:= :NEW.PROMO_CODE;
    IF PROMO IS NOT NULL THEN
				DISC_AMOUNT:= TO_NUMBER(SUBSTR(PROMO, LENGTH(PROMO)-1, 2));
        SELECT COUNT(*) INTO N FROM DISCOUNTS WHERE PROMO_CODE= PROMO;
				IF N=0 THEN
						INSERT INTO DISCOUNTS VALUES (PROMO, DISC_AMOUNT,0);
				END IF;
    END IF;
    EXCEPTION
		WHEN NO_DATA_FOUND THEN
				DBMS_OUTPUT.PUT_LINE('ERROR');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR');
    END;
	/


--------------FUNCTION-------------

CREATE OR REPLACE FUNCTION ADDPRODUCT(PNAME IN VARCHAR2, CAT_ID IN NUMBER, PDESCRIPTION IN VARCHAR2, PIMAGE IN VARCHAR2 , PSTOCK IN NUMBER, PPRICE IN NUMBER, PPROMO IN VARCHAR2, PSHOP IN NUMBER) RETURN NUMBER IS
    N_ID NUMBER := 0;
    BEGIN
        SELECT (NVL(MAX(PRODUCT_ID),0)+1) INTO N_ID FROM PRODUCTS;
        INSERT INTO PRODUCTS VALUES (N_ID, PNAME,CAT_ID, PDESCRIPTION, PIMAGE, PSTOCK, PPRICE, PPROMO, PSHOP);

        RETURN N_ID;
    END;
    /

--------------FUNCTION-------------

CREATE OR REPLACE FUNCTION CONFIRM_ORDER(CARTID IN NUMBER, USERID IN NUMBER, PAYTYPE IN VARCHAR2) 
RETURN NUMBER IS
-- RETURN VARCHAR2 IS
INVOICE VARCHAR2(100);
PID NUMBER;
CQUANTITY NUMBER;
N NUMBER:=0;
PPRICE NUMBER:=0;
DISCOUNT NUMBER:=0;
TPRICE NUMBER:=0;
PSTOCK NUMBER:=0;
CDATE DATE;
BEGIN
		
		SELECT COUNT(*) INTO N FROM CART WHERE CART_ID=CARTID AND USER_ID= USERID;
		IF N<1 THEN 
-- 			RETURN '####';
				RETURN -1;
		END IF;
		-- IF CART EXISTS
		FOR PROD IN (SELECT * FROM CART WHERE CART_ID=CARTID AND USER_ID= USERID)
 		LOOP
			TPRICE :=0;
 			DBMS_OUTPUT.PUT_LINE('HOHO');
			--FETCH THE PID AND QUANTITY FROM CART (EXISTS)
      SELECT PRODUCT_ID,QUANTITY INTO PID, CQUANTITY FROM CART WHERE CART_ID=CARTID AND USER_ID= USERID  AND PRODUCT_ID=PROD.PRODUCT_ID;
			--IF PROMO CODE EXISTS 
			SELECT COUNT(*) INTO N FROM PRODUCTS WHERE PRODUCT_ID= PID AND PROMO_CODE IS NOT NULL;
 			IF (N>0) THEN
					DBMS_OUTPUT.PUT_LINE('PROMO CODE WALA '|| N);
          --FETCH DISCOUNT AND PRICE
					SELECT DISCOUNTS.DISCOUNT_AMOUNT, PRODUCTS.PRICE INTO DISCOUNT, PPRICE FROM PRODUCTS JOIN DISCOUNTS ON PRODUCTS.PROMO_CODE= DISCOUNTS.PROMO_CODE WHERE PRODUCT_ID=PID;
					DBMS_OUTPUT.PUT_LINE('DISCOUNT IS ' || DISCOUNT||'  ON '|| PID);
          --CALCULATE TOTAL PRICE
          TPRICE:= TPRICE + (PPRICE * CQUANTITY)*(1-(DISCOUNT/100));
          DBMS_OUTPUT.PUT_LINE('PID CARTQUANTITY PPRICE TOTALPRICE');
          DBMS_OUTPUT.PUT_LINE(PID|| '  '|| CQUANTITY|| '  '|| PPRICE|| '  '|| TPRICE);
          INSERT INTO ORDERS VALUES (CARTID,USERID,PID,SYSDATE, TPRICE,'PROCESSING',PAYTYPE);
          
-- 					SELECT PRODUCT_ID,QUANTITY INTO PID, CQUANTITY FROM CART WHERE CART_ID=CARTID AND USER_ID= USERID  AND PRODUCT_ID=PROD.PRODUCT_ID;
-- 					SELECT PRICE,DISCOUNT_AMOUNT INTO PPRICE, DISCOUNT FROM PRODUCTS JOIN DISCOUNTS ON PRODUCTS.PROMO_CODE=DISCOUNTS.PROMO_CODE WHERE PRODUCT_ID=PID;
 			ELSE
			-- FETCH CART QUANTITY OF PRODUCT
				SELECT PRODUCT_ID,QUANTITY INTO PID, CQUANTITY FROM CART WHERE CART_ID=CARTID AND USER_ID= USERID  AND PRODUCT_ID=PROD.PRODUCT_ID;
				-- FETCH STOCK QUANTITY AND PRICE
				SELECT STOCK_QUANTITY,PRICE INTO PSTOCK,PPRICE FROM PRODUCTS WHERE PRODUCT_ID=PID;
				--EXCEEDS STOCK OR NOT
				IF CQUANTITY> PSTOCK THEN 
						DBMS_OUTPUT.PUT_LINE('NO STOCK');
				ELSE 
					PPRICE := CQUANTITY * PPRICE;
					TPRICE := TPRICE + PPRICE;
					DBMS_OUTPUT.PUT_LINE('PID CARTQUANTITY PPRICE TOTALPRICE');
					DBMS_OUTPUT.PUT_LINE(PID|| '  '|| CQUANTITY|| '  '|| PPRICE|| '  '|| TPRICE);
					DBMS_OUTPUT.PUT_LINE('IN STOCK');
					INSERT INTO ORDERS VALUES (CARTID,USERID,PID,SYSDATE, TPRICE,'PROCESSING',PAYTYPE);
					
				END IF;
			
			END IF;
			
 		END LOOP;
-- 	INVOICE:= 'ARAFAT';
	DBMS_OUTPUT.PUT_LINE('HELLO');
	RETURN N;
END;
/

--------------FUNCTION-------------

CREATE OR REPLACE FUNCTION SHOWCART(UID IN NUMBER) RETURN NUMBER IS
	N_ID NUMBER := 0;
	O_ID NUMBER := 0;
	M_ID NUMBER := 0;
BEGIN
	-- CHECK IF THE USER HAS ANY CART OR NOT
	SELECT COUNT(*) INTO N_ID FROM CART WHERE USER_ID = UID;
	
	-- CHECK IF THE USER HAS ANY ORDERED CART OR NOT
	SELECT COUNT(*) INTO O_ID FROM CART RIGHT JOIN ORDERS ON CART.CART_ID=ORDERS.ORDER_ID AND CART.USER_ID= ORDERS.USER_ID AND
	CART.PRODUCT_ID= ORDERS.PRODUCT_ID;

	IF N_ID=0 THEN
		-- IF THE USER HAS NO CART THEN RETURN 0
		RETURN 0;
	ELSIF O_ID=0 THEN
		-- IF THE USER HAS A CART BUT NO ORDERED CART THEN RETURN THE CART ID
		SELECT MAX(CART_ID) INTO N_ID FROM CART WHERE USER_ID = UID;
		RETURN N_ID;

	ELSE
		SELECT MAX(CART_ID) INTO M_ID FROM CART WHERE USER_ID = UID;
		SELECT COUNT(*) INTO N_ID FROM ORDERS WHERE USER_ID = UID AND ORDER_ID = M_ID;
		IF N_ID=0 THEN
			-- IF THE USER HAS A CART AND AN ORDERED CART THEN RETURN THE CART ID
			RETURN M_ID;
		END IF;
	-- IF THE USER HAS A CART AND AN ORDERED CART THEN RETURN 0

		RETURN 0;
	END IF;
	EXCEPTION
		WHEN OTHERS THEN
			DBMS_OUTPUT.PUT_LINE('ERROR');
	
	
END;
/

--------------PROCEDURE-------------

CREATE OR REPLACE PROCEDURE ADDTOCART(UID IN NUMBER, PID IN NUMBER) IS
		N_ID NUMBER := 0;
		O_ID NUMBER:=0;
    OLD_QUANTITY NUMBER := 0;
	NEW_QUANTITY NUMBER := 0;
    BEGIN
		
		
		SELECT COUNT(*) INTO N_ID FROM CART WHERE USER_ID = UID;
		
		SELECT COUNT(*) INTO O_ID FROM CART RIGHT JOIN ORDERS ON CART.CART_ID=ORDERS.ORDER_ID AND CART.USER_ID= ORDERS.USER_ID AND 
		CART.PRODUCT_ID= ORDERS.PRODUCT_ID;
		
    -- IF NOT THEN CREATE A NEW CART
    IF N_ID=0 THEN
        SELECT (NVL(MAX(CART_ID),0)+1) INTO N_ID FROM CART;
				DBMS_OUTPUT.PUT_LINE(N_ID||'  '|| O_ID);
        INSERT INTO CART VALUES (N_ID, UID, PID, 1, SYSDATE);
				RETURN;
    END IF;
		SELECT (NVL(MAX(CART_ID),0)) INTO N_ID FROM CART WHERE USER_ID=UID;
		
		SELECT COUNT(*) INTO O_ID FROM CART RIGHT JOIN ORDERS ON CART.CART_ID=ORDERS.ORDER_ID AND CART.USER_ID= ORDERS.USER_ID AND 
		CART.PRODUCT_ID= ORDERS.PRODUCT_ID WHERE CART.CART_ID=N_ID;
		DBMS_OUTPUT.PUT_LINE(N_ID||'  '|| O_ID);
		--ORDER EXISTS
		IF O_ID>0 THEN
				SELECT (NVL(MAX(CART_ID),0)+1) INTO N_ID FROM CART;
				DBMS_OUTPUT.PUT_LINE(N_ID||'  '|| O_ID);
        INSERT INTO CART VALUES (N_ID, UID, PID, 1, SYSDATE);
				RETURN;
		END IF;
		
    SELECT COUNT(*) INTO OLD_QUANTITY FROM CART WHERE USER_ID =UID AND PRODUCT_ID =PID AND CART_ID = N_ID;
    IF OLD_QUANTITY=0 THEN
        INSERT INTO CART VALUES (N_ID,UID,PID,1 , SYSDATE);
    ELSE
				SELECT STOCK_QUANTITY INTO OLD_QUANTITY FROM PRODUCTS WHERE PRODUCT_ID = PID ;
				SELECT QUANTITY INTO NEW_QUANTITY FROM CART WHERE USER_ID =UID AND PRODUCT_ID =PID AND CART_ID = N_ID;
				IF OLD_QUANTITY= NEW_QUANTITY THEN
					RAISE_APPLICATION_ERROR(-20001,'STOCK OUT');
				END IF;
        UPDATE CART SET QUANTITY = QUANTITY + 1 WHERE USER_ID =UID AND PRODUCT_ID = PID AND N_ID=CART_ID;
    END IF;
		
		EXCEPTION
			 WHEN OTHERS THEN
					DBMS_OUTPUT.PUT_LINE('HI');
END;
/

--------------PROCEDURE-------------

CREATE OR REPLACE PROCEDURE UPDATECART(UID IN NUMBER, PID IN NUMBER, NQUANTITY IN NUMBER, ADDON NUMBER) IS
		N_ID NUMBER := 0;
	OLD_QUANTITY NUMBER := 0;
	NEW_QUANTITY NUMBER := 0;
	CARTID NUMBER := 0;
BEGIN
	-- ADDON IS EITHER +1 OR -1
	-- NQUANTITY IS THE QUANTITY FROM THE FRONTEND
	-- IF ADDON IS 1 THEN ADD TO CART
	SELECT (NVL(MAX(CART_ID),0)) INTO CARTID FROM CART WHERE USER_ID=UID;
	-- IF ADDON IS -1 THEN CHECK IF IT HAS ONLY 1 QUANTITY OR NOT
	IF ADDON=-1 THEN
		IF NQUANTITY=1 THEN
			DELETE FROM CART WHERE USER_ID =UID AND PRODUCT_ID =PID AND CART_ID = CARTID;
			RETURN;
		ELSE
			UPDATE CART SET QUANTITY = NQUANTITY-1 WHERE USER_ID =UID AND PRODUCT_ID = PID AND CART_ID = CARTID;
			RETURN;
		END IF;
	ELSE
		UPDATE CART SET QUANTITY = NQUANTITY+1 WHERE USER_ID =UID AND PRODUCT_ID = PID AND CART_ID = CARTID;
		RETURN;

	END IF;
	EXCEPTION
		WHEN OTHERS THEN
			DBMS_OUTPUT.PUT_LINE('ERROR');
END;
/

--------------PROCEDURE-------------
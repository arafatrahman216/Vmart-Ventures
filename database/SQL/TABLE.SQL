
DROP TABLE ADDRESS;
DROP TABLE CUSTOMER_USER;
DROP TABLE SELLER_USER;



CREATE TABLE CUSTOMER_USER
(
	USER_ID NUMBER PRIMARY KEY,
	EMAIL VARCHAR2(50) NOT NULL,
	PHONE VARCHAR2(20) NOT NULL,
	NAME VARCHAR2(50) NOT NULL,
	PASSWORD NUMBER NOT NULL,
	PROFILE_PICTURE VARCHAR2(150) ,
	GENDER VARCHAR2(10) NOT NULL,
	DATE_JOINED DATE NOT NULL,
	DATE_OF_BIRTH DATE NOT NULL
);


CREATE TABLE SELLER_USER
(
	SHOP_ID NUMBER PRIMARY KEY,
	EMAIL VARCHAR2(50) NOT NULL,
	PHONE VARCHAR2(20) NOT NULL,
	SHOP_NAME VARCHAR2(50) NOT NULL,
	PASSWORD NUMBER NOT NULL,
	SHOP_LOGO VARCHAR2(150) ,
	DESCRIPTION VARCHAR2(100) ,
	DATE_JOINED DATE NOT NULL,
	TOTAL_REVENUE NUMBER DEFAULT 0
);

CREATE TABLE ADDRESS(
	USER_ID NUMBER PRIMARY KEY,
	STREET_NAME VARCHAR2(100) NOT NULL,
	POSTAL_CODE VARCHAR2(10) NOT NULL,
	CITY VARCHAR2(50) NOT NULL,
	DIVISION VARCHAR2(50) NOT NULL,
	COUNTRY VARCHAR2(50) NOT NULL,
	FOREIGN KEY (USER_ID) REFERENCES CUSTOMER_USER(USER_ID) ON DELETE CASCADE

);


CREATE TABLE CATAGORY (
    CATAGORY_ID NUMBER PRIMARY KEY,
    CATAGORY_NAME VARCHAR2(100)
);


CREATE TABLE DISCOUNTS (
    PROMO_CODE VARCHAR2(100) PRIMARY KEY,
    DISCOUNT_AMOUNT NUMBER(3, 0) CHECK (DISCOUNT_AMOUNT >= 0 AND DISCOUNT_AMOUNT <= 100),
    IS_EXPIRED NUMBER(1) CHECK (IS_EXPIRED IN (0, 1))
);


CREATE TABLE PRODUCTS (
    PRODUCT_ID NUMBER PRIMARY KEY,
    PRODUCT_NAME VARCHAR2(200),
    CATAGORY_ID NUMBER ,
    DESCRIPTION VARCHAR2(1000),
    PRODUCT_IMAGE VARCHAR2(200),
    STOCK_QUANTITY NUMBER,
    PRICE NUMBER(10, 2),
    PROMO_CODE VARCHAR2(100) REFERENCES DISCOUNTS(PROMO_CODE),
		SHOP_ID NUMBER,
		CONSTRAINT SHOP_ID_FK FOREIGN KEY (SHOP_ID) REFERENCES SELLER_USER(SHOP_ID),
    CONSTRAINT fk_catagory FOREIGN KEY (CATAGORY_ID) REFERENCES Catagory(CATAGORY_ID)
);



CREATE TABLE E_WALLET (
    WALLET_ID NUMBER PRIMARY KEY REFERENCES CUSTOMER_USER(USER_ID),
    BALANCE NUMBER(10, 2) DEFAULT 0,
    DATE_OF_OPENING DATE 
);

CREATE TABLE CART (
    CART_ID NUMBER PRIMARY KEY,
    USER_ID NUMBER REFERENCES CUSTOMER_USER(USER_ID),
    PRODUCT_ID NUMBER REFERENCES PRODUCTS(PRODUCT_ID),
    QUANTITY NUMBER(3, 0) CHECK (QUANTITY > 0),
    DATE_TIME DATE DEFAULT SYSDATE
);



CREATE TABLE ORDERS (
    ORDER_ID NUMBER PRIMARY KEY REFERENCES CART(CART_ID),
    CONFIRMATION_TIME DATE DEFAULT SYSDATE,
    TOTAL_PRICE NUMBER(10, 2),
    DELIVERY_STATUS VARCHAR2(100) NOT NULL CHECK (DELIVERY_STATUS IN ('PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    PAYMENT_TYPE VARCHAR2(100)
);


CREATE TABLE WISHLIST(
    USER_ID NUMBER REFERENCES CUSTOMER_USER(USER_ID),
    PRODUCT_ID NUMBER REFERENCES PRODUCTS(PRODUCT_ID),
    CONSTRAINT pk_wishlist PRIMARY KEY (USER_ID, PRODUCT_ID)

);

CREATE TABLE REVIEWS(
    USER_ID NUMBER REFERENCES CUSTOMER_USER(USER_ID),
    PRODUCT_ID NUMBER REFERENCES PRODUCTS(PRODUCT_ID),
    REVIEW_IMAGE VARCHAR2(100),
    DESCRIPTION VARCHAR2(200),
    RATING NUMBER(1, 0) CHECK (RATING >= 0 AND RATING <= 5),
    CONSTRAINT pk_reviews PRIMARY KEY (USER_ID, PRODUCT_ID)

);

COMMIT;





-- Insert data into CUSTOMER_USER table
INSERT INTO "CUSTOMER_USER" ("USER_ID", "EMAIL", "PHONE", "NAME", "PASSWORD", "PROFILE_PICTURE", "GENDER", "DATE_JOINED", "DATE_OF_BIRTH") VALUES ('1', 'arafatrahman219@gmail.com', '01876864853', 'Arafat Rahman', '3788315550', 'profile.jpg', 'Male', TO_DATE('2024-01-11 00:31:45', 'SYYYY-MM-DD HH24:MI:SS'), TO_DATE('2002-12-12 00:00:00', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "CUSTOMER_USER" ("USER_ID", "EMAIL", "PHONE", "NAME", "PASSWORD", "PROFILE_PICTURE", "GENDER", "DATE_JOINED", "DATE_OF_BIRTH") VALUES ('2', 'omi@gmail.com', '9876543210', 'Tahmidul Islam Omi', '3359680195', 'profile.jpg', 'Male', TO_DATE('2024-01-11 00:31:45', 'SYYYY-MM-DD HH24:MI:SS'), TO_DATE('2003-06-06 00:00:00', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "CUSTOMER_USER" ("USER_ID", "EMAIL", "PHONE", "NAME", "PASSWORD", "PROFILE_PICTURE", "GENDER", "DATE_JOINED", "DATE_OF_BIRTH") VALUES ('3', 'abdullah@gmail.com', '1234567890', 'Abdullah', '4209327108', 'profile.jpg', 'Male', TO_DATE('2024-01-11 00:31:45', 'SYYYY-MM-DD HH24:MI:SS'), TO_DATE('1993-12-25 00:00:00', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "CUSTOMER_USER" ("USER_ID", "EMAIL", "PHONE", "NAME", "PASSWORD", "PROFILE_PICTURE", "GENDER", "DATE_JOINED", "DATE_OF_BIRTH") VALUES ('4', 'nazmul@gmail.com', '9876543210', 'Nazmul', '1448412182', 'profile.jpg', 'Male', TO_DATE('2024-01-11 00:31:45', 'SYYYY-MM-DD HH24:MI:SS'), TO_DATE('1994-06-30 00:00:00', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "CUSTOMER_USER" ("USER_ID", "EMAIL", "PHONE", "NAME", "PASSWORD", "PROFILE_PICTURE", "GENDER", "DATE_JOINED", "DATE_OF_BIRTH") VALUES ('5', 'aveerup@gmail.com', '1234567890', 'Aveerup', '3942674472', 'profile.jpg', 'Male', TO_DATE('2024-01-11 00:31:45', 'SYYYY-MM-DD HH24:MI:SS'), TO_DATE('1996-02-20 00:00:00', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "CUSTOMER_USER" ("USER_ID", "EMAIL", "PHONE", "NAME", "PASSWORD", "PROFILE_PICTURE", "GENDER", "DATE_JOINED", "DATE_OF_BIRTH") VALUES ('6', 'hasib@gmail.com', '01856458911', 'Hasib', '1260300866', 'profile.jpg', 'male', TO_DATE('2024-01-11 11:07:10', 'SYYYY-MM-DD HH24:MI:SS'), TO_DATE('2003-07-07 00:00:00', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "CUSTOMER_USER" ("USER_ID", "EMAIL", "PHONE", "NAME", "PASSWORD", "PROFILE_PICTURE", "GENDER", "DATE_JOINED", "DATE_OF_BIRTH") VALUES ('7', 'nayeem@gmail.com', '01306998324', 'Nayeem', '3699015319', 'profile.jpg', 'male', TO_DATE('2024-01-12 15:17:34', 'SYYYY-MM-DD HH24:MI:SS'), TO_DATE('2012-06-12 00:00:00', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "CUSTOMER_USER" ("USER_ID", "EMAIL", "PHONE", "NAME", "PASSWORD", "PROFILE_PICTURE", "GENDER", "DATE_JOINED", "DATE_OF_BIRTH") VALUES ('8', 'tousif@gmail.com', '01306991411', 'Tousif', '1039894777', 'profile.jpg', 'male', TO_DATE('2024-01-12 15:38:46', 'SYYYY-MM-DD HH24:MI:SS'), TO_DATE('2003-04-05 00:00:00', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "CUSTOMER_USER" ("USER_ID", "EMAIL", "PHONE", "NAME", "PASSWORD", "PROFILE_PICTURE", "GENDER", "DATE_JOINED", "DATE_OF_BIRTH") VALUES ('9', 'enamul@gmail.com', '01306888975', 'Enamul Karim Ovi', '3856634112', 'profile.jpg', 'male', TO_DATE('2024-01-12 15:30:27', 'SYYYY-MM-DD HH24:MI:SS'), TO_DATE('2001-12-12 00:00:00', 'SYYYY-MM-DD HH24:MI:SS'));


-- Insert data into ADDRESS table
INSERT INTO "ADDRESS" ("USER_ID", "STREET_NAME", "POSTAL_CODE", "CITY", "DIVISION", "COUNTRY") VALUES ('1', 'Jhaubari,Keraniganj', '1310', 'Dhaka', 'Dhaka', 'Bangladesh');
INSERT INTO "ADDRESS" ("USER_ID", "STREET_NAME", "POSTAL_CODE", "CITY", "DIVISION", "COUNTRY") VALUES ('7', 'Jhaubari,Keraniganj', '1310', 'Dhaka', 'Dhaka', 'Bangladesh');
INSERT INTO "ADDRESS" ("USER_ID", "STREET_NAME", "POSTAL_CODE", "CITY", "DIVISION", "COUNTRY") VALUES ('4', 'Mohammadpur', '1210', 'Dhaka', 'Dhaka', 'Bangladesh');
INSERT INTO "ADDRESS" ("USER_ID", "STREET_NAME", "POSTAL_CODE", "CITY", "DIVISION", "COUNTRY") VALUES ('6', 'Narikelbagh, Keraniganj', '1310', 'Dhaka', 'Dhaka', 'Bangladesh');
INSERT INTO "ADDRESS" ("USER_ID", "STREET_NAME", "POSTAL_CODE", "CITY", "DIVISION", "COUNTRY") VALUES ('9', 'Borishur,Keraniganj', '1310', 'Dhaka', 'Dhaka', 'Bangladesh');
INSERT INTO "ADDRESS" ("USER_ID", "STREET_NAME", "POSTAL_CODE", "CITY", "DIVISION", "COUNTRY") VALUES ('2', 'Buet Hall ,Polashi', '1212', 'Dhaka', 'Dhaka', 'Bangladesh');
INSERT INTO "ADDRESS" ("USER_ID", "STREET_NAME", "POSTAL_CODE", "CITY", "DIVISION", "COUNTRY") VALUES ('3', 'Buet Hall ,Polashi', '1212', 'Dhaka', 'Dhaka', 'Bangladesh');
INSERT INTO "ADDRESS" ("USER_ID", "STREET_NAME", "POSTAL_CODE", "CITY", "DIVISION", "COUNTRY") VALUES ('5', 'Buet Hall ,Polashi', '1212', 'Dhaka', 'Dhaka', 'Bangladesh');
INSERT INTO "ADDRESS" ("USER_ID", "STREET_NAME", "POSTAL_CODE", "CITY", "DIVISION", "COUNTRY") VALUES ('8', 'Buet Hall ,Polashi', '1212', 'Dhaka', 'Dhaka', 'Bangladesh');


-- Insert data into ADDRESS table
-- INSERT INTO ADDRESS (USER_ID, STREET_NAME, POSTAL_CODE, CITY,DIVISION, COUNTRY)
-- SELECT USER_ID, 'Buet Hall ,Polashi', '1212', 'Dhaka', 'Dhaka', 'Bangladesh'
-- FROM CUSTOMER_USER
-- WHERE NAME IN ('Tahmidul Islam Omi', 'Abdullah', 'Tousif', 'Aveerup');




-- Insert data into SELLER_USER table
INSERT INTO SELLER_USER (SHOP_ID, EMAIL, PHONE, SHOP_NAME, PASSWORD, SHOP_LOGO, DESCRIPTION, DATE_JOINED, TOTAL_REVENUE)
VALUES (1, 'startech@gmail.com', '1234567890', 'StarTech', 123456, 'logo.jpg', 'Electronics store', SYSDATE, 0);

INSERT INTO SELLER_USER (SHOP_ID, EMAIL, PHONE, SHOP_NAME, PASSWORD, SHOP_LOGO, DESCRIPTION, DATE_JOINED, TOTAL_REVENUE)
VALUES (2, 'uniliver@gmail.com', '9876543210', 'Uniliver', 654321, 'logo.jpg', 'Consumer goods store', SYSDATE, 0);

INSERT INTO SELLER_USER (SHOP_ID, EMAIL, PHONE, SHOP_NAME, PASSWORD, SHOP_LOGO, DESCRIPTION, DATE_JOINED, TOTAL_REVENUE)
VALUES (3, 'transcend@gmail.com', '1234567890', 'Transcend', 123456, 'logo.jpg', 'Electronics store', SYSDATE, 0);

INSERT INTO SELLER_USER (SHOP_ID, EMAIL, PHONE, SHOP_NAME, PASSWORD, SHOP_LOGO, DESCRIPTION, DATE_JOINED, TOTAL_REVENUE)
VALUES (4, 'ryans@gmail.com', '9876543210', 'Ryans', 654321, 'logo.jpg', 'Electronics store', SYSDATE, 0);

INSERT INTO SELLER_USER (SHOP_ID, EMAIL, PHONE, SHOP_NAME, PASSWORD, SHOP_LOGO, DESCRIPTION, DATE_JOINED, TOTAL_REVENUE)
VALUES (5, 'itpoint@gmail.com', '1234567890', 'IT Point', 123456, 'logo.jpg', 'Electronics store', SYSDATE, 0);

COMMIT;

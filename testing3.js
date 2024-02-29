app.post('/OrderTrack', async (req, res) => {
    const { userId } = req.body;
    console.log(req.body);

    const USER_ID = userId; // No need to assign req.body.userId to USER_ID again

    const query = `SELECT O.ORDER_ID, P.PRODUCT_NAME, (SELECT C.QUANTITY FROM CART C WHERE P.PRODUCT_ID=C.PRODUCT_ID) AS QUANTITY, O.TOTAL_PRICE, O.DELIVERY_STATUS, O.PAYMENT_TYPE
    FROM ORDERS O JOIN PRODUCTS P ON O.PRODUCT_ID = P.PRODUCT_ID
    WHERE O.USER_ID = ? AND O.ORDER_ID = (SELECT MAX(ORDER_ID) FROM ORDERS WHERE USER_ID = ?)`;

    try {
        const [lastOrderTrack] = await db_query(query, [USER_ID, USER_ID]);

        console.log("Last Order Track:", lastOrderTrack);

        res.render('OrderTrack', { OrderTrack: lastOrderTrack, USER_ID: USER_ID });
    } catch (error) {
        console.error("Error fetching last order track:", error);
        res.status(500).send("Error fetching last order track");
    }
});

const oracledb = require('oracledb');

app.post('/addproducts/:shopname/:shopid', async (req, res) => {
    const { productname, productDescrip, productPrice, productQuantity, promoCode } = req.body;
    const shopname = req.params.shopname;
    const shopid = req.params.shopid;

    // Your Oracle database connection configuration
    const dbConfig = {
        user: 'username',
        password: 'password',
        connectString: 'your_connect_string' // e.g., 'localhost:1521/ORCLCDB.localdomain'
    };

    try {
        // Create a connection to the Oracle database
        const connection = await oracledb.getConnection(dbConfig);

        // Get the maximum product_id from the PRODUCTS table
        const maxProductIdQuery = `SELECT MAX(PRODUCT_ID) AS MAX_PRODUCT_ID FROM PRODUCTS`;
        const result = await connection.execute(maxProductIdQuery);

        // Extract the maximum product_id
        const maxProductId = result.rows[0].MAX_PRODUCT_ID || 0;

        // Increment the maximum product_id by 1
        const newProductId = maxProductId + 1;

        // Prepare the SQL statement for insertion
        const sql = `INSERT INTO PRODUCTS (PRODUCT_ID, SHOP_ID, PRODUCT_NAME, PRODUCT_DESCRIPTION, PRODUCT_PRICE, PRODUCT_QUANTITY, PROMO_CODE) 
                     VALUES (:productId, :shopid, :productname, :productDescrip, :productPrice, :productQuantity, :promoCode)`;

        // Bind the values to the SQL statement
        const bindParams = {
            productId: newProductId,
            shopid: shopid,
            productname: productname,
            productDescrip: productDescrip,
            productPrice: productPrice,
            productQuantity: productQuantity,
            promoCode: promoCode
        };

        // Execute the SQL statement
        await connection.execute(sql, bindParams, { autoCommit: true });

        // Release the Oracle database connection
        await connection.close();

        res.status(200).send('Product added successfully.');
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Internal Server Error');
    }
});

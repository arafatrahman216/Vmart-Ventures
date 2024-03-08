app.post('/ShopOwnerSignup', async (req, res) => {

    const procedure = 'SignupInsertion';

    // Convert password to number
    const password = parseInt(req.body.password);

    const query = 
    `BEGIN 
        ${procedure}(:shopname, :email, :phone, :password, :description, :street, :postal_code, :city, :division , :shoplogo);
     END;`;
    
    const params = {
        shopname: req.body.shopname,
        email: req.body.email,
        phone: req.body.phone,
        password: password, // Use the converted password
        description: req.body.description,
        street: req.body.street,
        postal_code: req.body.postal_code,
        city: req.body.city,
        division: req.body.division,
        shoplogo: req.body.shoplogo
    }

    const result = await db_query(query, params);

    res.render('ShopOwnerSignup');

});

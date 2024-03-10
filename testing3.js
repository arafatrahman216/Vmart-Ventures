<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap">
    <title>Product Details</title>

    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-image: url("/../images/home/bg1.jpg");
            background-size: cover;
            font-family: Roboto;
            background-attachment: fixed;
            background-repeat: no-repeat;
        }

        .glass-box {
            display: flex;
            position: relative;
            width: 900px; /* Adjust the width as needed */
            height: 600px; /* Adjust the height as needed */
            background-color: rgb(207, 210, 211);
            box-shadow: 5px 5px 5px 3px rgba(2, 4, 0, 0.1); /* Box shadow for the glass effect */
            backdrop-filter: blur(1000px); /* Blur for the frosted glass effect */
            overflow: hidden; /* Ensure the content does not overflow outside the glass-box */
            border-radius: 10%;
        }

        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 175px;
            height: 100%;
            padding: 20px;
            background-color: black;
            color: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1; /* Ensure the sidebar is above the glass-box content */
        }

        .sidebar-text {
            font-family: Roboto;
            color: white;
            font-weight: bold;
            cursor: pointer;
            margin-top: 20px;
            margin-left: 10px;
            margin-bottom: 10px;
            font-size: 17px;
            display: block;
        }

        .sidebar-text:hover {
            color: blue;
        }

        .HeadLine {
            margin-left: 370px;
            padding: 40px;
        }

        .formContent {
            flex-grow: 1;
            padding: 20px;
            margin-left: 240px;
        }

        .FormAttribute {
            padding: 7px;
        }

        .FormInputBox {
            margin-left: 10px;
        }

        .btn-primary {
            padding: 10px;
            margin-top: 20px;
            margin-left: 90px;
        }

        .btn-success {
            padding: 10px;
            margin-top: 20px;
            margin-left: 90px;
        }

        .sidebar-logo {
            width: 100%; /* Make the image fill the entire width of the sidebar */
            max-height: 100px; /* Set a maximum height for the image */
            margin-bottom: 20px; /* Adjust as needed for spacing */
        }

    </style>
</head>

<body>

    <div class="glass-box">

        <div class="sidebar">
            <img src="../images/SellerProfile/<%= SHOP_LOGO %>"
             alt="Your Logo" class="sidebar-logo">

            <a class="sidebar-text" href="/seller_authorize/<%= SHOP_NAME %>/<%= SHOP_ID %>">Your Profile</a>
            <a class="sidebar-text" href="/products/<%= SHOP_NAME %>/<%= SHOP_ID %>">Your Products</a>
            <a class="sidebar-text" href="/addproducts/<%= SHOP_NAME%>/<%= SHOP_ID%>">Add New Product</a>
            <a class="sidebar-text" href="/pendingOrders/<%= SHOP_NAME%>/<%= SHOP_ID%>">Pending Orders</a>
            <a class="sidebar-text" href="/password/<%= SHOP_NAME %>/<%= SHOP_ID %>">Change Password</a>
            <a class="sidebar-text" href="/login">Logout</a>
        </div>

        <div >
            <h2 class="HeadLine">Product Details</h2>

            <form class="formContent" id="profileForm" action="/product-details/<%= PRODUCT_ID%>" method="post">
                
                <div class="FormAttribute">
                    <label for="productname"><strong>Product Name:</strong></label>
                    <input type="text" class="FormInputBox" id="productname" name = "productname" value="<%= PRODUCT_NAME %>" readonly>
                </div>

                <div class="FormAttribute">
                    <label for="category"><strong>Category Name:</strong></label>
                    <input type="text" class="FormInputBox" id="category" name="category" value="<%= CATEGORY_NAME %>">
                </div>

                <div class="FormAttribute">
                    <label for="description"><strong>Description:</strong></label>
                    <input type="text" class="FormInputBox" id="description" name="description" value="<%= DESCRIPTION %>" readonly>
                </div>

                <div class="FormAttribute">
                    <label for="quantity"><strong>Stock Quantity:</strong></label>
                    <input type="number" class="FormInputBox" id="quantity" name="qunatity" value="<%= STOCK_QUANTITY %>" readonly>
                </div>

                <div class="FormAttribute">
                    <label for="price"><strong>Price:</strong></label>
                    <input type="number" class="FormInputBox" id="price" name="price" value="<%= PRICE %>" readonly>
                </div>

                <div class="FormAttribute">
                    <label for="promocode"><strong>Promo Code:</strong></label>
                    <input type="text" class="FormInputBox" id="promocode" name="promocode" value="<%= PROMO_CODE %>" readonly>
                </div>

                <!-- updating shop logo info will be applied here -->

                <input type="hidden" name="shopId" value="<%= SHOP_ID %>">
    
                <button type="button" class="btn btn-primary" id="editBtn">Update Information</button>
                <button type="submit" class="btn btn-success d-none" id="saveBtn">Save Changes</button>

            </form>

        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
</body>

<script>

    $(document).ready(function () {
        // Edit Information button click event
        $("#editBtn").on("click", function () {
            // Enable editing
            console.log('<%= PRODUCT_NAME %>');
            console.log("Editing...");
            $("input[readonly]").prop("readonly", false);
            
           
            // Show Save Changes button and hide Edit Information button
            $("#saveBtn").removeClass("d-none");
            $(this).addClass("d-none");

        });

        $("#saveBtn").on("click", function () {
            // Submit the form when Save Changes button is clicked
            console.log("Save button clicked");
            $("#profileForm").submit();
        });

        // Save Changes button click event
    });

</script>

</html>

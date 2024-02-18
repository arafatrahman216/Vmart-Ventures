{/* <script>
    function checkPassword() {
        var oldPassword = document.getElementById("oldPassword").value;
        // Assuming you have a variable 'savedPassword' that holds the password saved in the Oracle database
        var savedPassword = "your_saved_password";

        if (oldPassword !== savedPassword) {
            var errorMessage = document.createElement("p");
            errorMessage.innerHTML = "Password doesn't match";
            errorMessage.style.color = "red";
            document.getElementById("passwordMismatch").appendChild(errorMessage);
        }
    }
</script> */}

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap">
    <title>Seller Profile</title>

    <style>
        /* Your existing CSS styles here */
    </style>
</head>

<body>

    <div class="glass-box">

        <div class="sidebar">
            <!-- Your sidebar content -->
        </div>

        <div>
            <h2 class="HeadLine">Change Password</h2>

            <form action="/password/<%= SHOP_NAME %>/<%= SHOP_ID%>" method="post" onsubmit="return validatePassword()">
                <div class="FormAttribute">
                    <label for="oldPassword">Old Password</label>
                    <input type="password" class="FormInputBox" id="oldPassword" name="oldPassword" required>
                </div>

                <div class="FormAttribute">
                    <label for="newPassword">New Password</label>
                    <input type="password" class="FormInputBox" id="newPassword" name="newPassword" required>
                </div>

                <div class="FormAttribute">
                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" class="FormInputBox" id="confirmPassword" name="confirmPassword" required>
                </div>

                <button type="submit" class="btn btn-primary btn-block">Add Product</button>
            </form>
            <p id="passwordMismatchMessage" style="color: red; display: none;">Passwords do not match. Please try again.</p>
        </div>
    </div>

    

    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
</body>

</html>

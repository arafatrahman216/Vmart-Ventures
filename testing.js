{/* <div class="form-group">
    <label for="NewPass"><strong>New Password:</strong></label>
    <input type="password" class="form-control" id="NewPass">
</div>

<div class="form-group">
    <label for="ConfirmPass"><strong>Confirm New Password:</strong></label>
    <input type="password" class="form-control" id="ConfirmPass">
</div>

<!-- Add more form fields as needed -->

<button type="button" class="btn btn-primary" id="saveBtn" onclick="savePassword()">Save Password</button>
<small class="text-success d-none" id="successMessage">Password saved successfully!</small>
<small class="text-danger d-none" id="errorMessage">Passwords do not match!</small>

<script>
    function savePassword() {
        var newPassword = document.getElementById('NewPass').value;
        var confirmNewPassword = document.getElementById('ConfirmPass').value;
        var successMessage = document.getElementById('successMessage');
        var errorMessage = document.getElementById('errorMessage');
        var saveBtn = document.getElementById('saveBtn');

        if (newPassword === confirmNewPassword) {
            // Passwords match, display success message
            successMessage.classList.remove('d-none');
            errorMessage.classList.add('d-none');

            // Reset password fields
            document.getElementById('NewPass').value = '';
            document.getElementById('ConfirmPass').value = '';

            // Hide success message after 3 seconds
            setTimeout(function () {
                successMessage.classList.add('d-none');
            }, 3000);
        } else {
            // Passwords do not match, display error message
            errorMessage.classList.remove('d-none');
            successMessage.classList.add('d-none');

            // Hide error message after 3 seconds
            setTimeout(function () {
                errorMessage.classList.add('d-none');
            }, 3000);
        }
    }
</script> */}

{/* <div class="row">
    <div class="col-md-6">
        <h3>Personal Information</h3>
        <form id="profileForm">
            <div class="form-group">
                <label for="name"><strong>Name:</strong></label>
                <input type="text" class="form-control" id="name" value="<%= name %>" readonly>
            </div>
            <div class="form-group">
                <label for="email"><strong>Email:</strong></label>
                <input type="email" class="form-control" id="email" value="<%= email %>" readonly>
            </div>
            <div class="form-group">
                <label for="phone"><strong>Phone Number:</strong></label>
                <input type="tel" class="form-control" id="phone" value="<%= phone %>" readonly>
            </div>
            <div class="form-group">
                <label for="address"><strong>Address:</strong></label>
                <input type="text" class="form-control" id="address" value="BUET" readonly>
            </div>

            <!-- Add more form fields as needed -->

            <button type="button" class="btn btn-primary" id="editBtn">Edit Information</button>
            <button type="submit" class="btn btn-success d-none" id="saveBtn">Save Changes</button>
        </form>
    </div>
</div>

<script>
    $(document).ready(function () {
        // Edit Information button click event
        $("#editBtn").on("click", function () {
            // Enable editing
            $("input[readonly]").prop("readonly", false);
            
            // Show Save Changes button and hide Edit Information button
            $("#saveBtn").removeClass("d-none");
            $(this).addClass("d-none");
        });
    });
</script> */}



// data was in profile.ejs

$("#profileForm").submit(function (event) {

    event.preventDefault(); // Prevent the default form submission

    // Extract the form data
    var formData = {
        name: $("#name").val(),
        email: $("#email").val(),
        phone: $("#phone").val()
        // Add more fields as needed
    };

    // Send the data to the server using AJAX
    $.ajax({
        type: "POST",
        url: "/user/" + userID, // Replace with your server endpoint
        data: formData,

        success: function (response) {
            // Handle success response from the server
            console.log(response);
        },

        error: function (error) {
            // Handle error response from the server
            console.error(error);
        }
    });
});

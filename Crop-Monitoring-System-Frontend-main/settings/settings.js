import {getToken} from "../home/home.js";

let userEmail = localStorage.getItem('user');
let userRole = null;
let userPassword = null;

initializeSettings();


function initializeSettings() {
    getUserDetails();
    setEmailInSettings();
    getUserDetails();
}

function getUserDetails() {
    $.ajax({
        url: "http://localhost:8082/cms/api/v1/users/" + userEmail,
        type: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: function (response) {
            userRole = response.role;
            document.getElementById('profile').textContent = userRole;
            userPassword = response.password;
            document.getElementById('roleForSettings').value = userRole;

            if (userRole === 'ADMINISTRATIVE') {
                $('#crop_nav').css('display', 'none');
                $('#fields_nav').css('display', 'none');
                $('#log_nav').css('display', 'none');
            }

            if (userRole === 'SCIENTIST') {
                $('#vehicle_nav').css('display', 'none');
                $('#staff_nav').css('display', 'none');
                $('#equipment_nav').css('display', 'none');
            }
        },
        error: function (error) {
            toast.error("cannot fetch user details");
            console.log(error);
        }
    });
}

function setEmailInSettings(){
    document.getElementById('emailForSettings').value = localStorage.getItem('user');
}


$('#saveSettingsBtn').on('click', function (e) {

    const email = document.getElementById('emailForSettings').value;
    const role = document.getElementById('roleForSettings').value;
    const roleCode = document.getElementById('roleCode').value;


    const user = {
        email,
        role,
        roleCode
    };

    $.ajax({
        url: "http://localhost:8082/cms/api/v1/users/" + userEmail,
        type: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken()
        },
        data: JSON.stringify(user),
        success: function (response) {
            initializeSettings();
            swal.fire('Success!', 'User Role updated successfully', 'success');
        },
        error: function (error) {
            console.log(error);
            initializeSettings()
            toast.error("User Role Update Failed!");
        }
    });


});

$('#changePasswordBtn').on('click', function (e) {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert("New password and confirmation do not match!");
    }

    if (newPassword === currentPassword) {
        alert("New password cannot be the same as the current password!");
    }

    const email = userEmail;
    const password = currentPassword;

    const checkUser = {
        email,
        password
    };

    $.ajax({
        url: 'http://localhost:8082/cms/api/v1/auth/signin',
        type: 'POST',
        data: JSON.stringify(checkUser),
        headers: { "Content-Type": "application/json" },
        success: (response) => {
            const password = newPassword;

            const user = {
                email,
                password
            };

            $.ajax({
                url: "http://localhost:8082/cms/api/v1/users/changePassword/" + userEmail,
                type: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + getToken()
                },
                data: JSON.stringify(user),
                success: function (response) {
                    initializeSettings();
                    swal.fire('Success!', 'Password updated successfully', 'success');
                },
                error: function (error) {
                    toast.error("Password Update Failed!");
                    initializeSettings()
                }
            });
        },
        error: (xhr, status, error) => {
            console.log(xhr.responseText);
            swal.fire('Error!', 'Invalid current password', 'error');
        }
    });




});

// Clear Form Inputs (Optional)
document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    document.getElementById('settings-form').reset();
});

document.getElementById('changePasswordBtn').addEventListener('click', () => {
    document.getElementById('change-password-form').reset();
});

$('#deleteAccountBtn').on('click', function (e) {

    const currentPassword = document.getElementById('deletePassword').value;

    const email = userEmail;
    const password = currentPassword;

    const checkUser = {
        email,
        password
    };

    $.ajax({
        url: 'http://localhost:8082/cms/api/v1/auth/signin',
        type: 'POST',
        data: JSON.stringify(checkUser),
        headers: { "Content-Type": "application/json" },
        success: (response) => {

            $.ajax({
                url: "http://localhost:8082/cms/api/v1/users/" + userEmail,
                type: "DELETE",
                headers: {
                    "Authorization": "Bearer " + getToken()
                },
                success: function (response) {
                    swal.fire('Success!', 'Account deleted successfully', 'success');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = "../index.html";
                },
                error: function (error) {
                    toast.error("Account Deletion Failed!");
                    console.log(error);
                }
            });
        },
        error: (xhr, status, error) => {
            console.log(xhr.responseText);
            toast.error("Incorrect Password!");
        }
    });


});
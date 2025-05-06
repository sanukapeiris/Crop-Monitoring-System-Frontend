import {initializeEquipment} from "../equipment/equipment.js";
import {initializeVehicle} from "../vehicle/vehicle.js";
import {getToken} from "../home/home.js";


initializeStaff()

 export function initializeStaff() {
    loadStaffTable()
    loadLogIds()
    loadFieldIds()
    clearStaffForm()
}

function addStaffInOthers(){
    initializeEquipment()
    initializeVehicle()
}

function loadFieldIds() {

    $.ajax({
        url: "http://localhost:8082/cms/api/v1/fields",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            const fieldIds = res.map(field => field.fieldId);
            const fieldIdSelect = document.getElementById('fieldIdOnStaff');
            $('#fieldIdOnStaff').empty();
            $('#fieldIdOnStaff').append('<option selected>Select Field</option>');
            fieldIds.forEach(fieldId => {
                const option = document.createElement('option');
                option.value = fieldId;
                option.text = fieldId;
                fieldIdSelect.appendChild(option);
            });
        },
        error: (res) => {
            toastr.error("cannot load field ids");
            console.error(res);
        }
    });
}


function loadStaffTable() {
    $.ajax({
        url: "http://localhost:8082/cms/api/v1/staffs",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            $('#staff-list').DataTable().destroy();
            $('#staff-list tbody').empty();
            res.forEach(staff => {
                addStaffToTable(staff);
            });
            new DataTable("#staff-list", {paging: true, pageLength: 10, destroy: true});
        },
        error: (res) => {
            toastr.error("cannot load staff table");
            console.error(res);
        }
    });
}

function loadLogIds() {

    $.ajax({
        url: "http://localhost:8082/cms/api/v1/logs",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            const logIds = res.map(log => log.logId);
            const logIdSelect = document.getElementById('logIdStaff');
            $('#logIdStaff').empty();
            $('#logIdStaff').append('<option selected>Select Log</option>');
            logIds.forEach(logId => {
                const option = document.createElement('option');
                option.value = logId;
                option.textContent = logId;
                logIdSelect.appendChild(option);
            });
        },
        error: (res) => {
            console.error(res);
        }
    });
}

document.getElementById('staff-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const designation = document.getElementById('designation').value;
    const gender = document.getElementById('gender').value;
    const joinedDate = document.getElementById('joinedDate').value;
    const dob = document.getElementById('dob').value;
    const buildingNo = document.getElementById('buildingNo').value;
    const lane = document.getElementById('lane').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const postalcode = document.getElementById('postalcode').value;
    const contactNo = document.getElementById('contactNo').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    let logId = document.getElementById('logIdStaff').value;
    let fieldId = document.getElementById('fieldIdOnStaff').value;

    if (/^\d+$/.test(postalcode)) {
    } else {
        toastr.error('Postal code is not a valid number.');
        return
    }

    if (/^(0\d{9}|\+94\d{9})$/.test(contactNo)) {
    } else {
        toastr.error('Invalid contact number. Please enter a valid format.');
        return;
    }

    if (logId === 'Select Log') {
        logId = null
    }

    if (fieldId === 'Select Field') {
        fieldId = null
    }

    const staff = {
        firstName,
        lastName,
        designation,
        gender,
        joinedDate,
        dob,
        buildingNo,
        lane,
        city,
        state,
        postalcode,
        contactNo,
        email,
        role,
        logId
    };

    $.ajax({
        url: "http://localhost:8082/cms/api/v1/staffs",
        type: "POST",
        data: JSON.stringify(staff),
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            if (fieldId != null) {
                saveStaffAndField(res.staffId, fieldId)
            }
            initializeStaff()
            addStaffInOthers()
            swal.fire('Success', 'Staff saved successfully', 'success');
        },
        error: (res) => {
            console.error(res);
            initializeStaff()
            toastr.error("cannot save staff");
        }
    });


});

function saveStaffAndField(staffId, fieldId) {
    const formData = new FormData();

    formData.append('staffId', staffId);
    formData.append('fieldId', fieldId);

    $.ajax({
        url: "http://localhost:8082/cms/api/v1/staffs",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            toastr.success("Staff and field saved successfully");
            console.log(res);
        },
        error: (res) => {
            toastr.error("cannot save staff and field");
            console.error(res);
        }
    });
}

function addStaffToTable(staff) {
    const tableBody = document.querySelector('#staff-list tbody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${staff.staffId}</td>
        <td>${staff.firstName}</td>
        <td>${staff.designation}</td>
        <td>${staff.contactNo}</td>
        <td>${staff.gender}</td>
        <td>${staff.role}</td>
        <td><button value="${staff.staffId}" class="edit-btn">Edit</button></td>
        <td><button value="${staff.staffId}" class="delete-btn">Delete</button></td>
    `;

    tableBody.appendChild(row);
}

document.querySelector('#staff-list tbody').addEventListener('click', (e) => {
    const target = e.target;

    if (target.classList.contains('edit-btn')) {
        editStaff(target.value);
    }

    if (target.classList.contains('delete-btn')) {
        deleteStaff(target.value);
    }
});

function deleteStaff(staffId) {
    Swal.fire({
        title: `Are you sure?`,
        text: `You are about to delete the staff member with ID ${staffId}. This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:8082/cms/api/v1/staffs/${staffId}`,
                type: "DELETE",
                headers: {
                    "Authorization": "Bearer " + getToken()
                },
                success: (res) => {
                    Swal.fire(
                        'Deleted!',
                        `Staff member with ID ${staffId} has been deleted successfully.`,
                        'success'
                    );

                    initializeStaff();
                    addStaffInOthers();
                },
                error: (err) => {
                    toastr.error("cannot delete staff");
                    console.error('Error deleting staff:', err);
                }
            });
        }
    });

}

let updateStaffId = null;

function editStaff(staffId) {
    Swal.fire({
        title: `Are you sure?`,
        text: `You are about to edit the staff member with ID ${staffId}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, edit it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:8082/cms/api/v1/staffs/${staffId}`,
                type: "GET",
                headers: {
                    "Authorization": "Bearer " + getToken()
                },
                success: (res) => {
                    console.log('Staff details fetched:', res);
                    updateStaffId = res.staffId;

                    document.getElementById('firstName').value = res.firstName;
                    document.getElementById('lastName').value = res.lastName;
                    document.getElementById('designation').value = res.designation;
                    document.getElementById('gender').value = res.gender;
                    document.getElementById('joinedDate').value = res.joinedDate.split('T')[0];
                    document.getElementById('dob').value = res.dob.split('T')[0];
                    document.getElementById('buildingNo').value = res.buildingNo;
                    document.getElementById('lane').value = res.lane;
                    document.getElementById('city').value = res.city;
                    document.getElementById('state').value = res.state;
                    document.getElementById('postalcode').value = res.postalcode;
                    document.getElementById('contactNo').value = res.contactNo;
                    document.getElementById('email').value = res.email;
                    document.getElementById('role').value = res.role;
                    document.getElementById('logIdStaff').value = res.logId;

                    $('#updateStaffBtn').css('display', 'inline');
                },
                error: (err) => {
                    console.error('Error fetching staff details:', err);
                    toastr.error("cannot fetch staff");
                }
            });
        }
    });

}


function clearStaffForm() {
    document.getElementById('staff-form').reset();
    $('#updateStaffBtn').css('display', 'none');
}

$('#clearStaffBtn').on('click', () => {
    clearStaffForm();
});

$('#updateStaffBtn').on('click', () => {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const designation = document.getElementById('designation').value;
    const gender = document.getElementById('gender').value;
    const joinedDate = document.getElementById('joinedDate').value;
    const dob = document.getElementById('dob').value;
    const buildingNo = document.getElementById('buildingNo').value;
    const lane = document.getElementById('lane').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const postalcode = document.getElementById('postalcode').value;
    const contactNo = document.getElementById('contactNo').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    let logId = document.getElementById('logIdStaff').value;

    if (/^\d+$/.test(postalcode)) {
    } else {
        toastr.error('Postal code is not a valid number.');
    }

    if (/^(0\d{9}|\+94\d{9})$/.test(contactNo)) {
    } else {
        toastr.error('Invalid contact number. Please enter a valid format.');
    }

    if (logId === 'Select Log') {
        logId = null
    }

    const staff = {
        firstName,
        lastName,
        designation,
        gender,
        joinedDate,
        dob,
        buildingNo,
        lane,
        city,
        state,
        postalcode,
        contactNo,
        email,
        role,
        logId
    };

    $.ajax({
        url: "http://localhost:8082/cms/api/v1/staffs/" + updateStaffId,
        type: "PUT",
        data: JSON.stringify(staff),
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            initializeStaff()
            addStaffInOthers()
            swal.fire('Success', 'Staff updated successfully', 'success');
        },
        error: (res) => {
            toastr.error("cannot update staff");
            console.error(res);
        }
    });

});

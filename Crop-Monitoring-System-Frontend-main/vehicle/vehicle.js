import {getToken} from "../home/home.js";


initializeVehicle();

export function initializeVehicle() {
    loadVehicleTable();
    clearVehicleForm();
    loadStaffOnVehicle();
}

function loadStaffOnVehicle() {
    $.ajax({
        url: "http://localhost:8082/cms/api/v1/staffs",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            const staffIds = res.map(staff => staff.staffId);
            const staffIdSelect = document.getElementById('staffIdOnVehicle');
            $('#staffIdOnVehicle').empty();
            $('#staffIdOnVehicle').append('<option selected>Select Staff</option>');
            staffIds.forEach(staffId => {
                const option = document.createElement('option');
                option.value = staffId;
                option.textContent = staffId;
                staffIdSelect.appendChild(option);
            });
        },
        error: (res) => {
            console.error(res);
        }
    });
}

function clearVehicleForm() {
    document.getElementById('vehicle-form').reset();
    $('#updateVehicleBtn').css('display', 'none');
}

function loadVehicleTable() {
    $.ajax({
        url: "http://localhost:8082/cms/api/v1/vehicles",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            $('#vehicle-list').DataTable().destroy();
            $('#vehicle-list tbody').empty();
            res.forEach(vehicle => {
                addVehicleToTable(vehicle);
            });
            new DataTable("#vehicle-list", {paging: true, pageLength: 10, destroy: true});
        },
        error: (res) => {
            toastr.error("cannot load vehicle table");
            console.error(res);
        }
    });
}

document.getElementById('vehicle-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const licenNo = document.getElementById('licenNo').value;
    const category = document.getElementById('category').value;
    const fuelType = document.getElementById('fuelType').value;
    const vehicleStatus = document.getElementById('vehicleStatus').value;
    let staffId = document.getElementById('staffIdOnVehicle').value;
    const remark = document.getElementById('remark').value;

    if (staffId === 'Select Staff') {
        staffId = null;
    }

    const vehicle = {
        licenNo,
        category,
        fuelType,
        vehicleStatus,
        staffId,
        remark
    };

    $.ajax({
        url: "http://localhost:8082/cms/api/v1/vehicles",
        type: "POST",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        data: JSON.stringify(vehicle),
        contentType: "application/json",
        success: (res) => {
            initializeVehicle();
            swal.fire('Success!', 'Vehicle added successfully','success');
        },
        error: (res) => {
            toastr.error("cannot add vehicle");
            console.error(res);
        }
    });

});

function addVehicleToTable(vehicle) {
    const tableBody = document.querySelector('#vehicle-list tbody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${vehicle.vehicleId}</td>
        <td>${vehicle.category}</td>
        <td>${vehicle.fuelType}</td>
        <td>${vehicle.vehicleStatus}</td>
        <td>${vehicle.staffId || "Not Assigned"}</td>
        <td><button class="edit-btn" data-vehicle-id="${vehicle.vehicleId}">Edit</button></td>
        <td><button class="delete-btn" data-vehicle-id="${vehicle.vehicleId}">Delete</button></td>
    `;

    tableBody.appendChild(row);
}

document.querySelector('#vehicle-list tbody').addEventListener('click', (e) => {
    const target = e.target;

    if (target.classList.contains('edit-btn')) {
        const vehicleId = target.getAttribute('data-vehicle-id');
        editVehicle(vehicleId);
    }

    if (target.classList.contains('delete-btn')) {
        const vehicleId = target.getAttribute('data-vehicle-id');
        deleteVehicle(vehicleId);
    }
});

function deleteVehicle(vehicleId) {
    Swal.fire({
        title: `Are you sure?`,
        text: `Are you sure you want to delete the vehicle with ID ${vehicleId}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:8082/cms/api/v1/vehicles/${vehicleId}`,
                type: "DELETE",
                headers: {
                    "Authorization": "Bearer " + getToken()
                },
                success: (res) => {
                    Swal.fire(
                        'Deleted!',
                        `The vehicle with ID ${vehicleId} has been deleted successfully.`,
                        'success'
                    );
                    initializeVehicle();
                },
                error: (err) => {
                    console.error("Error deleting vehicle:", err);
                    toastr.error("cannot delete vehicle");
                }
            });
        }
    });

}

let updateVehicleId = null;

function editVehicle(vehicleId) {
    Swal.fire({
        title: `Are you sure?`,
        text: `You are about to edit the vehicle with ID ${vehicleId}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, edit it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            updateVehicleId = vehicleId;

            $('#updateVehicleBtn').css('display', 'inline');

            $.ajax({
                url: `http://localhost:8082/cms/api/v1/vehicles/${vehicleId}`,
                type: "GET",
                headers: {
                    "Authorization": "Bearer " + getToken()
                },
                success: (res) => {
                    document.getElementById('licenNo').value = res.licenNo;
                    document.getElementById('category').value = res.category;
                    document.getElementById('fuelType').value = res.fuelType;
                    document.getElementById('vehicleStatus').value = res.vehicleStatus;

                    $('#staffIdOnVehicle').val(res.staffId || 'Select Staff');

                    document.getElementById('remark').value = res.remark || "";

                },
                error: (err) => {
                    toastr.error("cannot edit vehicle");
                }
            });
        }
    });

}


$('#updateVehicleBtn').on('click', function() {
    const licenNo = document.getElementById('licenNo').value;
    const category = document.getElementById('category').value;
    const fuelType = document.getElementById('fuelType').value;
    const vehicleStatus = document.getElementById('vehicleStatus').value;
    let staffId = document.getElementById('staffIdOnVehicle').value;
    const remark = document.getElementById('remark').value;

    if (staffId === 'Select Staff') {
        staffId = null;
    }

    const vehicle = {
        licenNo,
        category,
        fuelType,
        vehicleStatus,
        staffId,
        remark
    };

    $.ajax({
        url: "http://localhost:8082/cms/api/v1/vehicles/" + updateVehicleId,
        type: "PUT",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        data: JSON.stringify(vehicle),
        contentType: "application/json",
        success: (res) => {
            console.log(res);
            initializeVehicle();
            swal.fire('Success!', 'Vehicle updated successfully','success');
        },
        error: (res) => {
            toastr.error("cannot update vehicle");
            console.error(res);
        }
    });

})

$('#clearVehicleBtn').on('click', function() {
    clearVehicleForm();
});

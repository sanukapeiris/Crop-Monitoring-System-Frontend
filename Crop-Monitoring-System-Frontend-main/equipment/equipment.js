import {getToken} from "../home/home.js";

initializeEquipment();

export function initializeEquipment() {
    loadEquipmentTable();
    loadStaffOnEquipment();
    loadFieldOnEquipment();
    clearEquipmentForm();
}

function loadFieldOnEquipment() {
    $.ajax({
        url: "http://localhost:8082/cms/api/v1/fields",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            const fieldSelect = document.getElementById('fieldIdOnEquipment');
            $('#fieldIdOnEquipment').empty();
            $('#fieldIdOnEquipment').append('<option selected>Select Field</option>');
            res.forEach(field => {
                const option = document.createElement('option');
                option.value = field.fieldId;
                option.textContent = field.fieldId;
                fieldSelect.appendChild(option);
            });
        },
        error: (res) => {
            console.error(res);
        }
    });
}

function loadStaffOnEquipment() {
    $.ajax({
        url: "http://localhost:8082/cms/api/v1/staffs",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            const staffSelect = document.getElementById('staffIdOnEquipment');
            $('#staffIdOnEquipment').empty();
            $('#staffIdOnEquipment').append('<option selected>Select Staff</option>');
            res.forEach(staff => {
                const option = document.createElement('option');
                option.value = staff.staffId;
                option.textContent = staff.staffId;
                staffSelect.appendChild(option);
            });
        },
        error: (res) => {
            console.error(res);
        }
    });
}

function loadEquipmentTable() {
    $.ajax({
        url: "http://localhost:8082/cms/api/v1/equipments",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            $('#equipment-list').DataTable().destroy();
            $('#equipment-list tbody').empty();
            res.forEach(equipment => {
                addEquipmentToTable(equipment);
            });
            new DataTable("#equipment-list", {paging: true, pageLength: 10, destroy: true});
        },
        error: (res) => {
            console.error(res);
        }
    });
}

document.getElementById('equipment-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const equipmentName = document.getElementById('equipmentName').value;
    const equipmentType = document.getElementById('equipmentType').value;
    const equipmentStatus = document.getElementById('equipmentStatus').value;
    let staffId = document.getElementById('staffIdOnEquipment').value;
    let fieldId = document.getElementById('fieldIdOnEquipment').value;

    if (staffId === 'Select Staff') {
        staffId = null;
    }

    if (fieldId === 'Select Field') {
        fieldId = null;
    }

    const equipment = {
        equipmentName,
        equipmentType,
        equipmentStatus,
        staffId,
        fieldId
    };

    $.ajax({
        url: "http://localhost:8082/cms/api/v1/equipments",
        type: "POST",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        data: JSON.stringify(equipment),
        contentType: "application/json",
        success: (res) => {
            console.log(res);
            initializeEquipment();
            swal.fire('Success', 'Equipment saved successfully', 'success');
        },
        error: (res) => {
            toastr.error("cannot save equipment");
            console.error(res);
        }
    });

});

function clearEquipmentForm() {
    document.getElementById('equipment-form').reset();
    $('#updateEquipmentBtn').css('display', 'none');
}

$('#clearEquipmentBtn').on('click', () => {
    clearEquipmentForm();
});

function addEquipmentToTable(equipment) {
    const tableBody = document.querySelector('#equipment-list tbody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${equipment.equipmentId}</td>
        <td>${equipment.equipmentName}</td>
        <td>${equipment.equipmentStatus}</td>
        <td>${equipment.staffId || "Not Assigned"}</td>
        <td>${equipment.fieldId || "Not Assigned"}</td>
        <td><button class="edit-btn" data-equipment-id="${equipment.equipmentId}">Edit</button></td>
        <td><button class="delete-btn" data-equipment-id="${equipment.equipmentId}">Delete</button></td>
    `;

    tableBody.appendChild(row);
}

document.querySelector('#equipment-list tbody').addEventListener('click', (e) => {
    const target = e.target;

    if (target.classList.contains('edit-btn')) {
        const equipmentId = target.getAttribute('data-equipment-id');
        editEquipment(equipmentId);
    }

    if (target.classList.contains('delete-btn')) {
        const equipmentId = target.getAttribute('data-equipment-id');
        deleteEquipment(equipmentId);
    }
});

function deleteEquipment(equipmentId) {
    Swal.fire({
        title: `Are you sure?`,
        text: `You are about to delete equipment with ID ${equipmentId}. This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:8082/cms/api/v1/equipments/${equipmentId}`,
                type: "DELETE",
                headers: {
                    "Authorization": "Bearer " + getToken()
                },
                success: (res) => {
                    Swal.fire(
                        'Deleted!',
                        'The equipment has been deleted.',
                        'success'
                    );
                    initializeEquipment();
                },
                error: (err) => {
                    toastr.error("cannot delete equipment");
                    console.error("Error deleting equipment:", err);
                }
            });
        }
    });

}

let updateEquipmentId = null;

function editEquipment(equipmentId) {
    Swal.fire({
        title: `Are you sure?`,
        text: `You are about to edit equipment with ID ${equipmentId}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, edit it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            updateEquipmentId = equipmentId;

            $('#updateEquipmentBtn').css('display', 'inline');

            $.ajax({
                url: `http://localhost:8082/cms/api/v1/equipments/${equipmentId}`,
                type: "GET",
                headers: {
                    "Authorization": "Bearer " + getToken()
                },
                success: (res) => {
                    document.getElementById('equipmentName').value = res.equipmentName;
                    document.getElementById('equipmentType').value = res.equipmentType;
                    document.getElementById('equipmentStatus').value = res.equipmentStatus;

                    $('#staffIdOnEquipment').val(res.staffId || 'Select Staff');
                    $('#fieldIdOnEquipment').val(res.fieldId || 'Select Field');
                },
                error: (err) => {
                    toastr.error("cannot fetch equipment");
                    console.error("Error fetching equipment data:", err);
                }
            });
        }
    });

}


$('#updateEquipmentBtn').on('click', () => {
    const equipmentName = document.getElementById('equipmentName').value;
    const equipmentType = document.getElementById('equipmentType').value;
    const equipmentStatus = document.getElementById('equipmentStatus').value;
    let staffId = document.getElementById('staffIdOnEquipment').value;
    let fieldId = document.getElementById('fieldIdOnEquipment').value;

    if (staffId === 'Select Staff') {
        staffId = null;
    }

    if (fieldId === 'Select Field') {
        fieldId = null;
    }

    const equipment = {
        equipmentName,
        equipmentType,
        equipmentStatus,
        staffId,
        fieldId
    };

    $.ajax({
        url: "http://localhost:8082/cms/api/v1/equipments/" + updateEquipmentId,
        type: "PUT",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        data: JSON.stringify(equipment),
        contentType: "application/json",
        success: (res) => {
            console.log(res);
            initializeEquipment();
        },
        error: (res) => {
            console.error(res);
        }
    });

});


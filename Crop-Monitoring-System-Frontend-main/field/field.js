import {initializeCrop} from "../crop/crop.js";
import {initializeStaff} from "../staff/staff.js";
import {initializeEquipment} from "../equipment/equipment.js";
import {getToken} from "../home/home.js";

initializeField();

const map = L.map('map').setView([6.698066, 79.911289], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

let marker = L.marker([6.698066, 79.911289]).addTo(map);

map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    document.getElementById('latitude').value = lat.toFixed(6);
    document.getElementById('longitude').value = lng.toFixed(6);

    marker.setLatLng([lat, lng]);
});

$('#goToLocation').on('click', function(e) {
    e.preventDefault();
    const lat = parseFloat(document.getElementById('latitude').value);
    const lng = parseFloat(document.getElementById('longitude').value);

    if (!isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], 13);
        marker.setLatLng([lat, lng]);
    } else {
        toastr.error('Please enter valid latitude and longitude values.');
    }
});

export function initializeField() {
    loadFieldTable();
    loadLogIdsOnField();
}

function reloadOthers() {
    initializeCrop()
    initializeStaff()
    initializeEquipment()
}

function encodeFieldImage(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            resolve(event.target.result);
        };
        reader.onerror = function (error) {
            reject(error); // Handle errors properly
        };
        reader.readAsDataURL(imageFile);
    });
}

function loadFieldTable() {
    $.ajax({
        url: "http://localhost:8082/cms/api/v1/fields",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            $('#field-list').DataTable().destroy();
            $('#field-list tbody').empty();
            res.forEach(field => {
                addFieldToTable(field);
            });
            new DataTable("#field-list", {paging: true, pageLength: 10, destroy: true});
        },
        error: (res) => {
            toastr.error("cannot load fields");
            console.error(res);
        }
    });
}

function saveFieldImage(fieldId, image1, image2) {
    if (image1 != null || image2 != null) {
        const formData = new FormData();

        formData.append('fieldId', fieldId);
        formData.append('image1', image1);
        formData.append('image2', image2);

        $.ajax({
            url: "http://localhost:8082/cms/api/v1/fields",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            headers: {
                "Authorization": "Bearer " + getToken()
            },
            success: (res) => {
                console.log(res);
                initializeField()
                toastr.success("Field image saved successfully");
            },
            error: (res) => {
                toastr.error("cannot save field image");
                console.error(res);
            }
        });
    } else {
        initializeField()
    }


}

function loadLogIdsOnField() {
    $.ajax({
        url: "http://localhost:8082/cms/api/v1/logs",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            const logIdSelect = document.getElementById('logIdOnField');
            $('#logIdOnField').empty();
            $('#logIdOnField').append('<option selected>Select Log</option>');
            res.forEach(log => {
                const option = document.createElement('option');
                option.value = log.logId;
                option.textContent = log.logId;
                logIdSelect.appendChild(option);
            });
        },
        error: (res) => {
            console.error(res);
        }
    });
}

$('#saveFieldBtn').on('click', (e) => {
    e.preventDefault();

    const fieldName = document.getElementById('fieldName').value;
    let latitude = document.getElementById('latitude').value;
    let longitude = document.getElementById('longitude').value
    const fieldSize = document.getElementById('fieldSize').value;
    let imageFile1 = document.getElementById('image1').files[0];
    let imageFile2 = document.getElementById('image2').files[0];
    let logId = document.getElementById('logIdOnField').value;

    if (logId === 'select log') {
        logId = null;
    }

    let image1 = null;
    let image2 = null;

    (async function () {
        if (imageFile1) {
            try {
                image1 = await encodeFieldImage(imageFile1);
            } catch (error) {
                console.error("Error encoding image:", error);
            }
        } else {
            console.log("No file selected.");
        }

        if (imageFile2) {
            try {
                image2 = await encodeFieldImage(imageFile2);
            } catch (error) {
                console.error("Error encoding image:", error);
            }
        } else {
            console.log("No file selected.");
        }
    })();


    let fieldLocation = extractCoordinates(latitude, longitude);

    const field = {
        fieldName,
        fieldLocation,
        fieldSize,
        logId
    };

    $.ajax({
        url: "http://localhost:8082/cms/api/v1/fields",
        type: "POST",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        data: JSON.stringify(field),
        contentType: "application/json",
        success: (res) => {
            var fieldId = res.fieldId;
            saveFieldImage(fieldId, image1, image2);
            initializeField();
            reloadOthers()
            clearFieldForm();
            swal.fire('Success!','Field saved successfully','success');
        },
        error: (res) => {
            console.error(res);
            toastr.error("cannot save field");
            reloadOthers()
        }
    });


});

function extractCoordinates(lat,lon) {

    return {
        x: parseFloat(lat),
        y: parseFloat(lon)
    };
}

$('#clearFieldBtn').on('click', () => {
    clearFieldForm();
});

function clearFieldForm() {
    document.getElementById('field-form').reset();
    $('#updateFieldBtn').css('display', 'none');
}

function addFieldToTable(field) {
    const tableBody = document.querySelector('#field-list tbody');
    const row = document.createElement('tr');

    const img1 = createImageElement(field.image1, 'Field Image 1');
    const img2 = createImageElement(field.image2, 'Field Image 2');

    row.innerHTML = `
        <td>${field.fieldId}</td>
        <td>${field.fieldName}</td>
        <td>${field.fieldSize}</td>
        <td></td>
        <td></td>
        <td><button class="edit-btn" data-field-id="${field.fieldId}">Edit</button></td>
        <td><button class="delete-btn" data-field-id="${field.fieldId}">Delete</button></td>
    `;

    if (img1) row.cells[3].appendChild(img1);
    if (img2) row.cells[4].appendChild(img2);

    tableBody.appendChild(row);
}

function createImageElement(src, alt) {
    if (!src) return null;
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.width = '50px';
    img.style.height = '50px';
    return img;
}

document.querySelector('#field-list tbody').addEventListener('click', (e) => {
    const target = e.target;

    if (target.classList.contains('edit-btn')) {
        const fieldId = target.getAttribute('data-field-id');
        editField(fieldId);
    }

    if (target.classList.contains('delete-btn')) {
        const fieldId = target.getAttribute('data-field-id');
        deleteField(fieldId);
    }
});

function deleteField(fieldId) {
    Swal.fire({
        title: `Are you sure?`,
        text: `You are about to delete the field with ID ${fieldId}. This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:8082/cms/api/v1/fields/${fieldId}`,
                type: "DELETE",
                headers: {
                    "Authorization": "Bearer " + getToken()
                },
                success: (res) => {
                    Swal.fire(
                        'Deleted!',
                        `Field with ID ${fieldId} has been deleted successfully.`,
                        'success'
                    );
                    initializeField();
                    reloadOthers();
                },
                error: (err) => {
                    toastr.error("cannot delete field");
                }
            });
        }
    });

}

let updateFieldId = null;

function editField(fieldId) {
    Swal.fire({
        title: `Are you sure?`,
        text: `You are about to edit the field with ID ${fieldId}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, edit it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            updateFieldId = fieldId;

            $('#updateFieldBtn').css('display', 'inline');

            $.ajax({
                url: `http://localhost:8082/cms/api/v1/fields/${fieldId}`,
                type: "GET",
                headers: {
                    "Authorization": "Bearer " + getToken()
                },
                success: (res) => {
                    document.getElementById('fieldName').value = res.fieldName;
                    document.getElementById('latitude').value = `${res.fieldLocation.x}`;
                    document.getElementById('longitude').value = `${res.fieldLocation.y}`;
                    document.getElementById('fieldSize').value = res.fieldSize;

                    $('#logIdOnField').val(res.logId || 'Select Log');
                },
                error: (err) => {
                    toastr.error("cannot edit field");
                    console.error("Error fetching field data:", err);
                }
            });
        }
    });

}


$('#updateFieldBtn').on('click', () => {
    const fieldName = document.getElementById('fieldName').value;
    let latitude = document.getElementById('latitude').value;
    let longitude = document.getElementById('longitude').value;
    const fieldSize = document.getElementById('fieldSize').value;
    const logId = document.getElementById('logIdOnField').value;
    let imageFile1 = document.getElementById('image1').files[0];
    let imageFile2 = document.getElementById('image2').files[0];


    let image1 = null;
    let image2 = null;

    (async function () {
        if (imageFile1) {
            try {
                image1 = await encodeFieldImage(imageFile1);
            } catch (error) {
                console.error("Error encoding image:", error);
            }
        } else {
            console.log("No file selected.");
        }

        if (imageFile2) {
            try {
                image2 = await encodeFieldImage(imageFile2);
            } catch (error) {
                console.error("Error encoding image:", error);
            }
        } else {
            console.log("No file selected.");
        }
    })();

    let fieldLocation = extractCoordinates(latitude, longitude);

    const field = {
        fieldName,
        fieldLocation,
        fieldSize,
        logId
    };

    $.ajax({
        url: "http://localhost:8082/cms/api/v1/fields/" + updateFieldId,
        type: "PUT",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        data: JSON.stringify(field),
        contentType: "application/json",
        success: (res) => {
            saveFieldImage(updateFieldId, image1, image2);
            initializeField();
            reloadOthers()
            swal.fire('Success!','Field updated successfully','success');
        },
        error: (res) => {
            console.error(res);
            initializeField()
            toastr.error("cannot update field");
        }
    });
})

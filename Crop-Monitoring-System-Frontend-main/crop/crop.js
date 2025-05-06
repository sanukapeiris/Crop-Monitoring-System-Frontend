import {getToken} from "../home/home.js";

initializeCrop();

export function initializeCrop() {
    loadCropTable();
    loadFieldIdOnCrop();
    loadLogIdsOnCrop()
    clearCropForm();
}

function loadLogIdsOnCrop() {
    $.ajax({
        url: "http://localhost:8082/cms/api/v1/logs",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            const logSelect = document.getElementById('logIdOnCrop');
            $('#logIdOnCrop').empty();
            $('#logIdOnCrop').append('<option selected>Select Log</option>');
            res.forEach(log => {
                const option = document.createElement('option');
                option.value = log.logId;
                option.textContent = log.logId;
                logSelect.appendChild(option);
            });
        },
        error: (res) => {
            console.error(res);
        }
    });
}

function loadFieldIdOnCrop() {
    $.ajax({
        url: "http://localhost:8082/cms/api/v1/fields",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            const fieldSelect = document.getElementById('fieldIdOnCrop');
            $('#fieldIdOnCrop').empty();
            $('#fieldIdOnCrop').append('<option selected>Select Field</option>');
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

function loadCropTable() {
    $.ajax({
        url: "http://localhost:8082/cms/api/v1/crops",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            $('#crop-list').DataTable().destroy();
            $('#crop-list tbody').empty();
            res.forEach(crop => {
                addCropToTable(crop);
            });
            new DataTable("#crop-list", {paging: true, pageLength: 10, destroy: true});
        },
        error: (res) => {
            console.error(res);
        }
    });
}

function encodeCropImage(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            resolve(event.target.result); // Ensure 'event' is correctly passed
        };
        reader.onerror = function (error) {
            reject(error); // Handle errors properly
        };
        reader.readAsDataURL(imageFile);
    });
}

function saveCropImage(cropId, image) {
    if (image != null) {

        const formData = new FormData();

        formData.append('cropId', cropId);
        formData.append('image', image);

        $.ajax({
            url: "http://localhost:8082/cms/api/v1/crops",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            headers: {
                "Authorization": "Bearer " + getToken()
            },
            success: (res) => {
                console.log(res);
                initializeCrop()

            },
            error: (res) => {
                console.error(res);
            }
        });
    } else {
        initializeCrop()
    }

}

document.getElementById('crop-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const commonName = document.getElementById('commonName').value;
    const scientificName = document.getElementById('scientificName').value;
    let cropImg = document.getElementById('cropImg').files[0];
    const category = document.getElementById('cropCategory').value;
    const cropSeason = document.getElementById('cropSeason').value;
    let fieldId = document.getElementById('fieldIdOnCrop').value;
    let logId = document.getElementById('logIdOnCrop').value;

    if (cropImg == null) {
        cropImg = null;
    }

    if (fieldId == null) {
        fieldId = null;
    }

    if (logId == null) {
        logId = null;
    }

    let image = null;

    (async function () {
        if (cropImg) {
            try {
                image = await encodeCropImage(cropImg);
            } catch (error) {
                console.error("Error encoding image:", error);
            }
        } else {
            console.log("No file selected.");
        }
    })();

    const crop = {
        commonName,
        scientificName,
        category,
        cropSeason,
        fieldId,
        logId
    };

    $.ajax({
        url: "http://localhost:8082/cms/api/v1/crops",
        type: "POST",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        data: JSON.stringify(crop),
        contentType: "application/json",
        success: (res) => {
            console.log(res);
            var cropId = res.cropId;
            saveCropImage(cropId, image);
            initializeCrop()
            Swal.fire({
                title: "Success!",
                text: "Crop added successfully!",
                icon: "success",
            });
        },
        error: (res) => {
            console.error(res);
            toastr.error("Crop not added! Please try again.");
        }
    });

});

function clearCropForm() {
    document.getElementById('crop-form').reset();
    $('#updateCropBtn').css('display', 'none');
}

function addCropToTable(crop) {
    const tableBody = document.querySelector('#crop-list tbody');
    const row = document.createElement('tr');

    const img = document.createElement('img');
    img.src = crop.cropImg || "https://via.placeholder.com/50";
    img.alt = 'Crop Image';
    img.style.width = '50px';
    img.style.height = '50px';

    row.innerHTML = `
        <td>${crop.cropId}</td>
        <td>${crop.commonName}</td>
        <td></td> 
        <td>${crop.category}</td>
        <td>${crop.cropSeason}</td>
        <td>${crop.fieldId || "Not Assigned"}</td>
        <td><button class="edit-btn" data-crop-id="${crop.cropId}">Edit</button></td>
        <td><button class="delete-btn" data-crop-id="${crop.cropId}">Delete</button></td>
    `;

    row.cells[2].appendChild(img);

    tableBody.appendChild(row);
}

document.querySelector('#crop-list tbody').addEventListener('click', (e) => {
    const target = e.target;

    if (target.classList.contains('edit-btn')) {
        const cropId = target.getAttribute('data-crop-id');
        editCrop(cropId);
    }

    if (target.classList.contains('delete-btn')) {
        const cropId = target.getAttribute('data-crop-id');
        deleteCrop(cropId);
    }
});

function deleteCrop(cropId) {
    Swal.fire({
        title: 'Are you sure?',
        text: `You want to delete crop with ID ${cropId}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:8082/cms/api/v1/crops/${cropId}`,
                type: "DELETE",
                headers: {
                    "Authorization": "Bearer " + getToken()
                },
                success: (res) => {
                    Swal.fire(
                        'Deleted!',
                        `Crop with ID ${cropId} has been deleted.`,
                        'success'
                    );
                    initializeCrop();
                },
                error: (err) => {
                    Swal.fire(
                        'Cancelled',
                        `Crop with ID ${cropId} could not be deleted.`,
                        'error'
                    );
                }
            });

        } else {
            Swal.fire(
                'Cancelled',
                `Crop with ID ${cropId} could not be deleted.`,
                'error'
            );
        }
    });



}

let updateCropId = null;

function editCrop(cropId) {

    Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to edit the crop with ID ${cropId}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, edit it!',
        cancelButtonText: 'No, cancel!'
    }).then((result) => {
        if (result.isConfirmed) {

            updateCropId = cropId;

            $('#updateCropBtn').css('display', 'inline');

            $.ajax({
                url: `http://localhost:8082/cms/api/v1/crops/${cropId}`,
                type: "GET",
                headers: {
                    "Authorization": "Bearer " + getToken()
                },
                success: (res) => {
                    console.log("Crop data fetched successfully:", res);

                    document.getElementById('commonName').value = res.commonName;
                    document.getElementById('scientificName').value = res.scientificName;
                    document.getElementById('cropCategory').value = res.category;
                    document.getElementById('cropSeason').value = res.cropSeason;

                    document.getElementById('fieldIdOnCrop').value = res.fieldId || 'Select Field';
                    document.getElementById('logIdOnCrop').value = res.logId || 'Select Log';

                },
                error: (err) => {
                    console.error("Error fetching crop data:", err);
                    Swal.fire(
                        'Cancelled',
                        `something went wrong`,
                        'info'
                    );
                }
            });

        } else {

            Swal.fire(
                'Cancelled',
                `Crop with ID ${cropId} remains unchanged.`,
                'info'
            );
        }
    });



}


$('#updateCropBtn').on('click', function() {
    const commonName = document.getElementById('commonName').value;
    const scientificName = document.getElementById('scientificName').value;
    let cropImg = document.getElementById('cropImg').files[0];
    const category = document.getElementById('cropCategory').value;
    const cropSeason = document.getElementById('cropSeason').value;
    let fieldId = document.getElementById('fieldIdOnCrop').value;
    let logId = document.getElementById('logIdOnCrop').value;

    if (fieldId == null) {
        fieldId = null;
    }

    if (logId == null) {
        logId = null;
    }

    if (cropImg == null) {
        cropImg = null;
    }

    const crop = {
        commonName,
        scientificName,
        category,
        cropSeason,
        fieldId,
        logId
    };

    let image = null;

    (async function () {
        if (cropImg) {
            try {
                image = await encodeCropImage(cropImg);
            } catch (error) {
                console.error("Error encoding image:", error);
            }
        } else {
            console.log("No file selected.");
        }
    })();

    $.ajax({
        url: "http://localhost:8082/cms/api/v1/crops/" + updateCropId,
        type: "PUT",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        data: JSON.stringify(crop),
        contentType: "application/json",
        success: (res) => {
            console.log(res);
            saveCropImage(updateCropId, image);
            initializeCrop()
            Swal.fire({
                title: "Success!",
                text: "Crop Updated successfully!",
                icon: "success",
            });
        },
        error: (res) => {
            console.error(res);
            toastr.error("Crop not Updated! Please try again.");
        }
    });
});

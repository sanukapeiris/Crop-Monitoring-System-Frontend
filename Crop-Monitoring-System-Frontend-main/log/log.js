import { initializeStaff } from "../staff/staff.js";
import { initializeField } from "../field/field.js";
import { initializeCrop } from "../crop/crop.js";
import {getToken} from "../home/home.js";

initializeLog();

function initializeLog() {
    loadLogTable()
    clearForm()
}

function reloadAll() {
    initializeStaff()
    initializeField()
    initializeCrop()
}

function encodeLogImage(imageFile) {
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

document.getElementById('log-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const logDate = document.getElementById('logDate').value;
    const logDetails = document.getElementById('logDetails').value;
    const imageFile = document.getElementById('logImage').files[0];

    let image = null;

    (async function () {
        if (imageFile) {
            try {
                image = await encodeLogImage(imageFile);
            } catch (error) {
                console.error("Error encoding image:", error);
            }
        } else {
            console.log("No file selected.");
        }
    })();


    const log = {
        logDate,
        logDetails
    };

    var jsonLog = JSON.stringify(log);

    $.ajax({
        url: "http://localhost:8082/cms/api/v1/logs",
        type: "POST",
        data: jsonLog,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            var logId = res.logId;
            saveImage(logId, image);
            initializeLog()
            reloadAll()
            swal.fire('Success!','Log saved successfully','success');
        },
        error: (res) => {
            toastr.error("cannot save log");
            console.error(res);
            reloadAll()
        }
    });



});

function saveImage(logId, image) {
    if (image != null) {

        const formData = new FormData();

        formData.append('logId', logId);
        formData.append('image', image);

        $.ajax({
            url: "http://localhost:8082/cms/api/v1/logs",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            headers: {
                "Authorization": "Bearer " + getToken()
            },
            success: (res) => {
                toastr.success("Log image saved successfully");
                console.log(res);
                initializeLog()
            },
            error: (res) => {
                toastr.warning("cannot save log image");
                console.error(res);
            }
        });
    } else {
        initializeLog()
    }

}

function loadLogTable() {
    $.ajax({
        url: "http://localhost:8082/cms/api/v1/logs",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        success: (res) => {
            $('#log-list').DataTable().destroy();
            $('#log-list tbody').empty();
            res.forEach(log => {
                addLogToTable(log);
            });
            new DataTable("#log-list", {paging: true, pageLength: 10, destroy: true});
        },
        error: (res) => {
            toastr.error("cannot load log table");
            console.error(res);
        }
    });
}

function addLogToTable(log) {
    const tableBody = document.querySelector('#log-list tbody');
    const row = document.createElement('tr');

    log.logDate = log.logDate.split('T')[0];

    const img = document.createElement('img');
    img.src = log.image ? log.image : 'default-image.png'; // Use a default image if log.image is null
    img.alt = 'Log Image';
    img.style.width = '50px'; // Adjust size as needed
    img.style.height = '50px';

    row.innerHTML = `
        <td>${log.logId}</td>
        <td>${log.logDate}</td>
        <td>${log.logDetails}</td>
        <td></td>
        <td><button value="${log.logId}" class="edit-btn">Edit</button></td>
        <td><button value="${log.logId}" class="delete-btn">Delete</button></td>`;

    row.cells[3].appendChild(img);

    tableBody.appendChild(row);
}

document.querySelector('#log-list tbody').addEventListener('click', (e) => {
    const target = e.target;

    if (target.classList.contains('edit-btn')) {
        editLog(target.value);
    }

    if (target.classList.contains('delete-btn')) {
        deleteLog(target.value);
    }
});

function deleteLog(logId) {
    Swal.fire({
        title: `Are you sure?`,
        text: `You are about to delete the log with ID ${logId}. This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:8082/cms/api/v1/logs/${logId}`,
                type: "DELETE",
                headers: {
                    "Authorization": "Bearer " + getToken()
                },
                success: (res) => {
                    Swal.fire(
                        'Deleted!',
                        `Log with ID ${logId} has been deleted successfully.`,
                        'success'
                    );

                    console.log('Log deleted successfully:', res);
                    reloadAll()
                    initializeLog()

                },
                error: (err) => {
                    toastr.error("cannot delete log it is used in another table");
                    console.error('Error deleting log:', err);
                }
            });
        }
    });

}

let updateLogId = null;

function editLog(logId) {
    Swal.fire({
        title: `Are you sure?`,
        text: `You are about to edit the log with ID ${logId}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, edit it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            updateLogId = logId;

            const row = document.querySelector(`#log-list tbody tr td button[value="${logId}"]`).closest('tr');

            const logDate = row.cells[1].textContent;
            const logDetails = row.cells[2].textContent;

            document.getElementById('logDate').value = logDate;
            document.getElementById('logDetails').value = logDetails;

            $('#updateLogBtn').css('display', 'inline');

        }
    });

}


$('#updateLogBtn').on('click', () => {

    const logDate = document.getElementById('logDate').value;
    const logDetails = document.getElementById('logDetails').value;
    const imageFile = document.getElementById('logImage').files[0];

    const log = {
        logDate,
        logDetails
    };

    let image = null;

    (async function () {
        if (imageFile) {
            try {
                image = await encodeLogImage(imageFile);
            } catch (error) {
                console.error("Error encoding image:", error);
            }
        } else {
            console.log("No file selected.");
        }
    })();


    $.ajax({
        url: "http://localhost:8082/cms/api/v1/logs/" + updateLogId,
        type: "PUT",
        headers: {
            "Authorization": "Bearer " + getToken()
        },
        data: JSON.stringify(log),
        contentType: "application/json",
        success: (res) => {
            saveImage(updateLogId, image);
            initializeLog()
            reloadAll()
            swal.fire('Success!', 'Log updated successfully', 'success');
        },
        error: (res) => {
            toastr.error("cannot update log");
            console.error(res);
        }
    });
});

function clearForm() {
    document.getElementById('log-form').reset();
    $('#updateLogBtn').css('display', 'none');
}

$('#clearLogBtn').on('click', () => {
    clearForm();
});
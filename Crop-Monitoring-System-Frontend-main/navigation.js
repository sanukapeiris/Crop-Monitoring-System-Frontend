$('#vehicle_management').css('display','none');
$('#equipment_management').css('display','none');
$('#log_management').css('display','none');
$('#staff_management').css('display','none');
$('#crop_management').css('display','none');
$('#field_management').css('display','none');
$('#account_settings').css('display','none');

$('#dashboard_nav').on('click', () => {
    $('#dashboard').css('display','block');
    $('#vehicle_management').css('display','none');
    $('#equipment_management').css('display','none');
    $('#log_management').css('display','none');
    $('#staff_management').css('display','none');
    $('#crop_management').css('display','none');
    $('#field_management').css('display','none');
    $('#account_settings').css('display','none');
});

$('#vehicle_nav').on('click', () => {
    $('#dashboard').css('display','none');
    $('#vehicle_management').css('display','block');
    $('#equipment_management').css('display','none');
    $('#log_management').css('display','none');
    $('#staff_management').css('display','none');
    $('#crop_management').css('display','none');
    $('#field_management').css('display','none');
    $('#account_settings').css('display','none');
});

$('#equipment_nav').on('click', () => {
    $('#dashboard').css('display','none');
    $('#vehicle_management').css('display','none');
    $('#equipment_management').css('display','block');
    $('#log_management').css('display','none');
    $('#staff_management').css('display','none');
    $('#crop_management').css('display','none');
    $('#field_management').css('display','none');
    $('#account_settings').css('display','none');
});

$('#log_nav').on('click', () => {
    $('#dashboard').css('display','none');
    $('#vehicle_management').css('display','none');
    $('#equipment_management').css('display','none');
    $('#log_management').css('display','block');
    $('#staff_management').css('display','none');
    $('#crop_management').css('display','none');
    $('#field_management').css('display','none');
    $('#account_settings').css('display','none');
});

$('#staff_nav').on('click', () => {
    $('#dashboard').css('display','none');
    $('#vehicle_management').css('display','none');
    $('#equipment_management').css('display','none');
    $('#log_management').css('display','none');
    $('#staff_management').css('display','block');
    $('#crop_management').css('display','none');
    $('#field_management').css('display','none');
    $('#account_settings').css('display','none');
});

$('#crop_nav').on('click', () => {
    $('#dashboard').css('display','none');
    $('#vehicle_management').css('display','none');
    $('#equipment_management').css('display','none');
    $('#log_management').css('display','none');
    $('#staff_management').css('display','none');
    $('#crop_management').css('display','block');
    $('#field_management').css('display','none');
    $('#account_settings').css('display','none');
});

$('#fields_nav').on('click', () => {
    $('#dashboard').css('display','none');
    $('#vehicle_management').css('display','none');
    $('#equipment_management').css('display','none');
    $('#log_management').css('display','none');
    $('#staff_management').css('display','none');
    $('#crop_management').css('display','none');
    $('#field_management').css('display','block');
    $('#account_settings').css('display','none');
});

$('#settings_nav').on('click', () => {
    $('#dashboard').css('display','none');
    $('#vehicle_management').css('display','none');
    $('#equipment_management').css('display','none');
    $('#log_management').css('display','none');
    $('#staff_management').css('display','none');
    $('#crop_management').css('display','none');
    $('#field_management').css('display','none');
    $('#account_settings').css('display','block');
});

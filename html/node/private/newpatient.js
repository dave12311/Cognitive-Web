function getValue(name){
    return document.getElementById(name).value;
}

function submitPatient(){
    var patient = {
        group: getValue('group'),
        age: getValue('age'),
        height: getValue('height'),
        sex: getValue('sex'),
        marital_status: getValue('marital_status'),
        employment_status: getValue('employment_status'),
        financial_status: getValue('financial_status'),
        first_diag: getValue('first_diag'),
        hosp_no: getValue('hosp_no'),
        alcohol: getValue('alcohol'),
        NART: getValue('NART'),
        PANSS_POS: getValue('PANSS_POS'),
        PANSS_NEG: getValue('PANSS_NEG'),
        CGI_S: getValue('CGI_S'),
        CGI_I: getValue('CGI_I')
    };

    var request = new XMLHttpRequest();

    request.open('POST', '/api/newpatient', true);
    request.setRequestHeader('Content-type', 'application/json');

    request.onload = function(){
        if(this.status === 403){
            window.location.replace('/');
        }else{
            var reply = JSON.parse(this.response);
            if(reply.status === 'OK'){
                alertify.alert('Új beteg hozzáadva!', 'Beteg ID: #'+reply.id, function(){
                    window.location.replace('/users/dashboard');
                });
            }else{
                alertify.set('notifier','position', 'top-right');
                alertify.error("Adatbázis hiba!");
            }
        }
    };

    request.send(JSON.stringify(patient));
}
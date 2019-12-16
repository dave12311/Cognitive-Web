function getValue(name){
    return document.getElementById(name).value;
}

function load(){
    var request = new XMLHttpRequest();
    var params = new URLSearchParams(document.location.search.substring(1));
    request.open('GET', '/api/patient?patientID=' + params.get('patientID'), true);
    request.onload = function(){
        if(this.status === 200){
            var res = JSON.parse(this.response);
            document.getElementById('id').innerHTML = 'Beteg #' + res.id + ' szerkesztése';
            document.title = 'Beteg ' + res.id;

            document.getElementById('group').value = res.patient_group;
            document.getElementById('age').value = res.age;
            document.getElementById('height').value = res.height;
            document.getElementById('sex').value = res.sex;
            document.getElementById('marital_status').value = res.marital_status;
            document.getElementById('employment_status').value = res.employment_status;
            document.getElementById('financial_status').value = res.financial_status;
            document.getElementById('first_diag').value = res.first_diag;
            document.getElementById('hosp_no').value = res.hosp_no;
            document.getElementById('alcohol').value = res.alcohol;
            document.getElementById('NART').value = res.nart;
            document.getElementById('PANSS_POS').value = res.panss_pos;
            document.getElementById('PANSS_NEG').value = res.panss_neg;
            document.getElementById('CGI_S').value = res.cgi_s;
            document.getElementById('CGI_I').value = res.cgi_i;
        }else if(this.status === 404){
            document.title = 'Hiba';
            alertify.set('notifier','position', 'top-right');
            alertify.error("Nem létező beteg ID!");
        }else if(this.status === 403){
            window.location.replace('/');
        }
    };
    request.send();
}

function submitPatient(){
    var params = new URLSearchParams(document.location.search.substring(1));
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
        CGI_I: getValue('CGI_I'),
        id: params.get('patientID')
    };

    var request = new XMLHttpRequest();

    request.open('POST', '/api/patient', true);
    request.setRequestHeader('Content-type', 'application/json');

    request.onload = function(){
        if(this.status === 200){
            alertify.alert('Beteg adatok frissítve!', 'Beteg ID: #'+params.get('patientID'), function(){
                window.location.replace('/users/selectpatient?patientID=' + params.get('patientID'));
            });
        }else if(this.status === 403){
            window.location.replace('/');
        }else{
            alertify.set('notifier','position', 'top-right');
            alertify.error("Adatbázis hiba!");
        }
    };

    request.send(JSON.stringify(patient));
}
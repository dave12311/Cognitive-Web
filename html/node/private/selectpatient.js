function load(){
    var request = new XMLHttpRequest();
    var params = new URLSearchParams(document.location.search.substring(1));
    request.open('GET', '/api/patient?patientID=' + params.get('patientID'), true);
    request.onload = function(){
        if(this.status === 200){
            var res = JSON.parse(this.response);
            document.title = 'Beteg ' + res.id;
            document.getElementById('id').innerHTML = 'Beteg ID: ' + res.id;
            document.getElementById('group').innerHTML = res.patient_group;
            document.getElementById('age').innerHTML = res.age;
            document.getElementById('height').innerHTML = res.height;
            document.getElementById('sex').innerHTML = res.sex;
            document.getElementById('marital_status').innerHTML = res.marital_status;
            document.getElementById('employment_status').innerHTML = res.employment_status;
            document.getElementById('financial_status').innerHTML = res.financial_status;
            document.getElementById('first_diag').innerHTML = res.first_diag;
            document.getElementById('hosp_no').innerHTML = res.hosp_no;
            document.getElementById('alcohol').innerHTML = res.alcohol;
            document.getElementById('NART').innerHTML = res.nart;
            document.getElementById('PANSS_POS').innerHTML = res.panss_pos;
            document.getElementById('PANSS_NEG').innerHTML = res.panss_neg;
            document.getElementById('CGI_S').innerHTML = res.cgi_s;
            document.getElementById('CGI_I').innerHTML = res.cgi_i;
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

function back(){
    window.location.replace('/users/dashboard');
}

function modify(){
    var params = new URLSearchParams(document.location.search.substring(1));
    window.location.replace('/users/editpatient?patientID=' + params.get('patientID'));
}
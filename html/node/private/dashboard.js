function selectPatient(){
    alertify.prompt('Beteg kiválasztása', 'Beteg ID:', '', function(evt, value){
        var request = new XMLHttpRequest();
        request.open('GET', '/api/checkpatient?patientID=' + value, true);
        request.onload = function(){
            if(this.status === 404){
                alertify.set('notifier','position', 'top-right');
                alertify.error("Nem létező beteg ID!");
            }else if(this.status === 200){
                window.location.replace('/users/selectpatient?patientID=' + value);
            }else if(this.status === 403){
                window.location.replace('/');
            }
        };
        request.send(value);
    }, function(){}).set('labels', {ok: 'OK', cancel: 'Mégsem'});
}
$(function(){
    $('#formi').submit(()=>{return false});
    $('#formi').submit(function(){
        $.post('/check/database/login',{
            e : $('#email').val(),
            p : $('#password').val()
        }, (data, status) =>{
            console.log(data);
            if(data.status == 200){
                window.location.href = data.redirect;
            }else{
                $('#mess').html('<span id="mess" class="text-danger">'+data.message+'</span>');
            }
        });
        return false;
    });
})
function encrypt(message) {
    return message;
}
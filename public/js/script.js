var n = "";
var key = "";
(function(){
    var somethingThatDoSomethingSpecial = io();
    var somethingThatIsNotEnough = new JSEncrypt({default_key_size : 2048});
    function getSomethingThatDoSomethingSpecial(){
        return somethingThatDoSomethingSpecial;
    }
    function getSomethingThatIsNotEnough(){
        return somethingThatIsNotEnough;
    }
    $(document).ready(function(){
        $.get('/get/login/data/nick', (data) =>{
            n = data.n;
        });
        $.post('/get/key/final',{m:'hola'}, (data,status)=>{
            getSomethingThatIsNotEnough().setPublicKey(data.key);
        });
    });
    $(function(){
        $('#chat').submit(()=>{return false});
        $('#chat').submit(function(){
            getSomethingThatDoSomethingSpecial().emit('sended', {
                message : getSomethingThatIsNotEnough().encrypt($('#message').val()),
                name : n
            });
            $('#message').val('');
            return false;
        });
        getSomethingThatDoSomethingSpecial().on('sended', function(data){
            $('#messages').append($('<div>').html(
                '<div class="card"><div class="card-body"><div class="row"><div class="col-2 card-title-mod"><h4>'+data.name+
                '</h4></div><div class="col-8 card-text-mod"><div>'+data.message.crypted
                +'</div><hr><div>'+data.message.normal+'</div></div></div></div></div>'
            ))
            $("#messCont").animate({ scrollTop: $('#messCont').prop("scrollHeight")}, 500);
        });
        $('#enviar').click(function(){
            key = $('#key').val();
            $('#key').val('');
            $('#modal').modal('hide');
        });
    });
    function encrypt(message) {
        return message;
    }
})();

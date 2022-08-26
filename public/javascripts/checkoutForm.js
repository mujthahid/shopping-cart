$("#checkout-form").submit((e)=>{

    e.preventDefault() 
    $.ajax({
     url:'/place-order',
     data: $('#checkout-form').serialize(),
  method:'post',
   success:(response)=>{
        if(response.cod){
         location.href='/order-confirmation'
        }else{
         razorpayPayment(response)
        }
     }
    })
    })
  
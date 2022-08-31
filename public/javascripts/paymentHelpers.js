function razorpayPayment(order){
    var options = {
    "key": "rzp_test_p5neKGHUt06jiF", // Enter the Key ID generated from the Dashboard
    "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "Shopify LLP",
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "handler": function (response){
    
        verifyPayment(response,order)
    },
    "prefill": {
        "name": '',
        "email": '',
        "contact": ""
    },
    "notes": {
        "address": "Razorpay Corporate Office"
    },
    "theme": {
        "color": "#3399cc"
    }
 };
 var rzp1 = new Razorpay(options);
 rzp1.on('payment.failed', function (response){
        // alert(response.error.code);
        // alert(response.error.description);
        // alert(response.error.source);
        // alert(response.error.step);
        // alert(response.error.reason);
        // alert(response.error.metadata.order_id);
        // alert(response.error.metadata.payment_id);
 });
 
    rzp1.open();
   
 }
 function verifyPayment(payment,order){
    $.ajax({
        url:'/verify-payment',
        data:{
           payment,
           order
        },
        method: 'post',
        success:(response)=>{
            if(response.status){
                 location.href='/order-confirmation'
            }else{
                alert('payment failed')
            }
        }
    })
 }
 
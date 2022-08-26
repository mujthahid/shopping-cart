function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = $('#cart-count').html()
                if (response.productExist) {
                    $('#cart-count').html(count)
                } else {
                    count = parseInt(count) + 1
                    $('#cart-count').html(count)
                }
            }
        }
    })
}












  

function pizzaCart() {

  return {
    title: '',
    pizzas: [],
    username: '',
    cartId: '',
    cartPizzas: [],
    historyCartsIds: [],
    pastOrderedPizzas: [],
    cartTotal: 0,
    paymentAmount: 0,
    message: '',
    usernameSet: false,
    displayHistory:false,
    featuredPizzas:[],
    init() {
      const url = 'https://pizza-api.projectcodex.net/api/pizzas';
      axios.
        get(url).then(
          result => {
            this.pizzas = result.data.pizzas

          })
        .catch((error) => {
          console.error(error);
        })


      this.setCartCode()
      this.setUsername()
      this.title = this.username + "'s" + ' Pizza Cart'
      this.showCartData();
      if(this.featuredPizzas.length===0){
        const randomPizzaIds = this.getRandomPizzaIds(pizzas, 3);
        for(pizzaId of randomPizzaIds){
          this.setFeaturedPizzas(pizzaId)
        }
      }
      
      
      
    },
    getDataFromStorage() {
      
      const storedCartId = localStorage.getItem('cartId');
      const username = localStorage.getItem('username');
      if (storedCartId && username) {
        this.cartId = storedCartId;
        this.username = username;
      }
    },
    getRandomPizzaIds(pizzas, count) {
      const shuffledPizzas = [...pizzas]; // Make a copy of the original array
      let currentIndex = shuffledPizzas.length;
    
      // While there are elements to shuffle
      while (currentIndex !== 0) {
        // Pick a remaining element
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
    
        // Swap with the current element
        [shuffledPizzas[currentIndex], shuffledPizzas[randomIndex]] = [
          shuffledPizzas[randomIndex],
          shuffledPizzas[currentIndex],
        ];
      }
    
      // Return the first 'count' elements
      return shuffledPizzas.slice(0, count).map((pizza) => pizza.id);
    },
    setCartCode() {
      if (this.cartId === '') {
        this.getDataFromStorage();
        if (this.cartId === '') {
          this.createCart();
        }
      }
    },
    setUsername() {
      this.getDataFromStorage()
      if (this.username.length > 2) {
        this.usernameSet = true;
        localStorage['username'] = this.username;
      } else {
        alert('Username must have at least 3 characters');
      }
    },
    showCartData() {
      this.getCart().then(result => {
        const cartData = result.data;
        this.cartPizzas = cartData.pizzas;
        this.cartTotal = cartData.total;
      })
    },
    getCart() {
      const getCartUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`
      return axios.get(getCartUrl)
    },
    addToCart(pizzaId) {
      const addToCartUrl = 'https://pizza-api.projectcodex.net/api/pizza-cart/add';
      const data = {
        cart_code: this.cartId,
        pizza_id: pizzaId
      };
      const headers = {
        'Content-Type': 'application/json'
      };

      axios.post(addToCartUrl, data, { headers })
        .then(this.showCartData())
        .catch(error => {
          alert(error)
        });

    }
    ,
    removeFromCart(pizzaId) {
      const removeToCartUrl = 'https://pizza-api.projectcodex.net/api/pizza-cart/remove';
      const data = {
        cart_code: this.cartId,
        pizza_id: pizzaId
      };
      const headers = {
        'Content-Type': 'application/json'
      };

      axios.post(removeToCartUrl, data, { headers })
        .then(this.showCartData())
        .catch(error => {
          alert(error)
        });

    },

    createCart() {
      return axios.get(
        `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`
      ).then(result => {
        this.cartId = result.data.cart_code;
        localStorage.setItem('cartId', this.cartId);
      });
    },

    payPizza() {

      const payCartUrl = 'https://pizza-api.projectcodex.net/api/pizza-cart/pay';
      const data = {
        "cart_code": this.cartId,
        "amount": this.paymentAmount
      };
      const headers = {
        'Content-Type': 'application/json'
      };

      axios.post(payCartUrl, data, { headers })
        .then(result => {
          this.message = result.data.message
          if (result.data.status === 'failure') {
            setTimeout(() => {
              this.message = '';
            }, 2500)
          } else {
            setTimeout(() => {
              this.cartPizzas = [];
              this.cartTotal = 0;
              this.paymentAmount = 0;
              this.message = '';
              localStorage.removeItem('cartId');
              this.createCart();
            }, 2500)
          }
        }

        )
        .catch(error => {
          alert(error)
        });
    },
    orderHistory() {
  
      const orderHistoryUrrl = `https://pizza-api.projectcodex.net/api/pizza-cart/username/${this.username}`
      axios.get(orderHistoryUrrl).then(
        result => {
    
          this.historyCartsIds = result.data.filter(cart => cart.status==='paid');
          this.activateDisplayHistory();
        }
      )
        
    },
    getPastOrders(CartCode) {
     
      const getCartUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/${CartCode}/get`;
      return axios.get(getCartUrl)
      .then(result=>{
      
        this.pastOrderedPizzas.push({'pizzas':result.data.pizzas,'total':result.data.total,'cartId':result.data.id});
        //alert(this.pastOrderedPizzas.length)
        
      })


    },
    activateDisplayHistory(){
      this.displayHistory=true;
    },
    newOrder(){
      this.displayHistory=false;
    },
    logout() {
      this.cartPizzas = [];
      this.cartTotal = 0;
      this.paymentAmount = 0;
      localStorage.removeItem('cartId');
      this.createCart()
      localStorage.removeItem('username');
      this.username = '';
      this.usernameSet = false;
    },
    // 
    setFeaturedPizzas(pizzaId){
      const featuredCartUrl = 'https://pizza-api.projectcodex.net/api/pizzas/featured';
      const data = {
        "username" : this.username,
	      pizza_id: pizzaId
      };
      const headers = {
        'Content-Type': 'application/json'
      };

      axios.post(featuredCartUrl, data, { headers })
        .then(this.showCartData())
        .catch(error => {
          alert(error)
        });
    },
    getFeaturedPizzas(){

      const getCartUrl = `https://pizza-api.projectcodex.net/api/pizzas/featured?username=avermeulen`;
      axios.get(getCartUrl)
      .then(result=>{
      
        this.featuredPizzas=result.data.pizzas;
  })
    },
    priceFormat(price) {
      return parseFloat(price.toFixed(2));
    },
    getPizzaImageSource(size) {
      return `./images/${size}-pizza.jpg`;
  }
  

  };
}


document.addEventListener('alpine:init', () => {
  Alpine.data('PizzaCartAPI', pizzaCart);
});

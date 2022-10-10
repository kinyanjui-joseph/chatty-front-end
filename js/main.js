const URL = 'https://pristine-chatty.herokuapp.com/messages'
var socket = io();

const store = Vuex.createStore({
  state () {
    return {
      name: "",
      message: "",
      thread:[],
      online: true,
      loading: true,
    }
  },
  mutations: {
    nameUpdator(state, name){
    	state.name = name
    },
    messageUpdator(state, message){
    	state.message = message
    },
    addMessage(state, data){
      for(i=0;i<data.length;i++){
      state.thread.push(data[i])
      }
    },
    updateThread(state,json){
      state.thread.push(json)
      console.log(json)
    },
    changeLoadingState(state, loading) {
      state.loading = loading
    },
    clearForm(state){
      state.name = "",
      state.message = ""
    },
  },
  getters: {},
  actions: {
  loadData({commit}) {
  axios.get(URL).then((response) => {
    let data = response.data
  commit('addMessage', data)
  commit('changeLoadingState', false)
  })
  },
  async sendMsg(){
    /*const new_msg = { 
      name: this.state.name,
      message: this.state.message,
      id: Math.random().toString(16).slice(2),
      time: Math.floor(Date.now() / 1000)
    };*/
  	const json = JSON.stringify({ 
      name: this.state.name,
      message: this.state.message,
      id: Math.random().toString(16).slice(2),
      time: Math.floor(Date.now() / 1000)
    });
    socket.emit('message', json);
    socket.on('message', function(json){
      store.commit('updateThread',JSON.parse(json))
    })
    const res = await axios.post(URL, json, {
  	headers: {
  	'Content-Type': 'application/json'
  	}
  	});
    store.commit('clearForm')
    alert('sent')
  }
  }
})

const navigation = {
  computed: {
  	...Vuex.mapState([
  		'online','users_online', 'thread'
    ]),
    ...Vuex.mapGetters([
    ])
  },
  methods: {
  	...Vuex.mapMutations([
  	]),
  },
  template: `
    <div class="header">
      <div class="logo-wrap" id="logo">
        <h1 class="logo">Chatty <i class="fa-solid fa-screen-users"></i></h1>
        <span class="tag-line">Secure group chat you can trust</span>
      </div>
      <div class="status">
        <h4 class="online" v-show="online">Users online:{{thread.length}}</h4>
        <h4 class="offline" v-show="!online">OFFLINE</h4>
      </div>
    </div>  
  `
}

const msgForm = {
  computed: {
  	...Vuex.mapState([
  		'name','message'
    ]),
    ...Vuex.mapGetters([
    ]),
    message: {
    	get () {
    		return this.$store.state.message
    	},
    	set (message) {
    		this.$store.commit('messageUpdator', message)
    	}
    },
    name: {
    	get () {
    		return this.$store.state.name
    	},
    	set (name) {
    		this.$store.commit('nameUpdator',name)
    	}
    }
  },
  methods: {
	...Vuex.mapMutations([
		'messageUpdator','addMessage'
	]),
	async sendMessage(){
    let x = document.forms["form"]["fname"].value;
    let y = document.forms["form"]["message"].value;
    if (x == "") {
      alert("Please provide your name!");
      return false;
    }
    if (y == "") {
      alert("Please provide your message!");
      return false;
    }
      this.$store.dispatch('sendMsg')
	},
  },
  /*html*/
  template: `
  	<form class="container" id="form" v-on:submit.prevent="sendMessage">
  		<div class="form-header-wrp">
  		  <h3 class="form-header">Send Message</h3>
      </div>
  		<div class="name-wrp">  
        <label for="fname">User:</label>                                      
        <input name="fname" id="name" maxlength="10" class="form-control" autocomplete="off" v-model="name" placeholder="Username">                                     
  		</div>  
      <div class="message-wrp">
        <label for="message">message</label>                       			     
        <textarea id="message" maxlength="150" name="message" class="form-control" v-model="message" placeholder="Type your message here"> 
        </textarea> 
      </div>                                      
  	  <div class="btn-wrp">                                            
  	    <button id="send" class="btn" >Send</button>
      </div>
  	</form>
  `,
}

const messages = {
  computed: {
  	...Vuex.mapState([
  		'name', 'message', 'thread', 'loading', 'newMsg', 'isConnected', 'socketMessage'
    ]),
    ...Vuex.mapGetters([]),
  },
  methods: {
  	...Vuex.mapMutations([
  	]),
  },
  template: `
  <div class="messages">
    <div class="messages-header">
      <h3> Messages</h3>
    </div>
    <div v-if="loading">
      <p>Loading...</p>
    </div>
    <div v-else>
    <div id="thread-item"
    v-for="msg in thread"
    :key="msg.id"
    > 
        <h4 class="name-field"><span style="font-weight: bold">Name:</span> {{msg.name}}</h4>
        <p class="message-field"><span style="font-weight: bold">Message:</span> {{msg.message}}</p>
      </div>
    </div>
</div>
  `,
}

const chat = {
  components:{
  	navigation,msgForm,messages
  },
  computed: {
  	...Vuex.mapState([
    ]),
    ...Vuex.mapGetters([
    ]),
  },
  methods: {
  },
  template: `
  	<div class="chatty"> 
  		<div class="headerForm">
  			<navigation></navigation>
  			<msgForm></msgForm>
  		</div>
      <div>
        <messages></messages>
      </div>
  	</div>
  `,
}

const app = Vue.createApp({
  components:{
  	chat
  },
  created() {
  this.$store.dispatch('loadData')
  },
  template:`
  	<chat></chat>
  `
})

app.use(store)
app.mount('#app')
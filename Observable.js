// var Observable = {

//     observers: [],

//     on: function(topic, observer) {
//       this.observers[topic] || (this.observers[topic] = [])

//       this.observers[topic].push(observer)
//     },

//     remove: function(topic, observer) {
//       if (!this.observers[topic]){
//         return;
//       }
        
//       var index = this.observers[topic].indexOf(observer)
//       if (~index) {
//         this.observers[topic].splice(index, 1)
//       }

//     }, 

//     notify: function(topic, message) {//notifyObservers
//       if (!this.observers[topic]){
//          return;
//       }
       
//       for (var i = this.observers[topic].length - 1; i >= 0; i--) {
//         this.observers[topic][i](message);
//       }
//     }

//   }

var Observable = function() {
    this.subscribers = [];
}

Observable.prototype = {

    subscribe: function(callback) {
        // In most situations, you would check to see if the
        // callback already exists within the subscribers array,
        // but for the sake of keeping us on track and because
        // this isn't necessarily included, we'll leave it out.
        // Just add the callback to the subscribers list
        this.subscribers.push(callback);
    },

    unsubscribe: function(callback) {
        var i = 0,
            len = this.subscribers.length;
        
        // Iterate through the array and if the callback is
        // found, remove it.
        for (; i < len; i++) {
            if (this.subscribers[i] === callback) {
                this.subscribers.splice(i, 1);
                // Once we've found it, we don't need to
                // continue, so just return.
                return;
            }
        }
    },


    notify: function() {
        var i = 0,
            len = this.subscribers.length;
        
        // Iterate over the subscribers array and call each of
        // the callback functions. d
        for (; i < len; i++) {
            this.subscribers[i].update.apply(this.subscribers[i], arguments);
        }        
    }
};





























// Observer.Notify/update


// var Observer = {
//   update:function(sender, args){

//   }
// }




// class Controller {

//   function main(){

//       var view = new View(); //Observable view 可以被ViewController观察， viewController是view 的观察者
//       var action = new Action();
//       //view.on('selcted',this.action.selcted);
//       view.on('show',action.show);
//       view.on('hide',action.hide);




//   }

// }






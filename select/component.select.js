
var SELECT_VIEW_TEMPLATE = [
    '<div class="select-view">',
       '<div class="select-text">',
          '<div class="selected-option"><%=selectedText%></div>',
          '<b class="icon-arrow-down"></b>',
        '</div>',
       '<input type="hidden" value="<%=selectedValue%>" class="selected-value">',
       '<ul class="select-list">',

          ' <%_.each(list, function(item) {%>',
            '<li ',
                'data-value="<%= item.value%>" ',
                '<%if(item.selected){%>class="selected"<%}%>><%=item.text%></li>',
          '<%});%>',
       '</ul>',
    '</div>'
].join('');

function SelectView(root){
    var self = this;

    this.template = _.template(SELECT_VIEW_TEMPLATE);

    $(root).on('click', '.select-text', function(ev){
        self.show();
        return false;
    });

    $(root).on('click', '.select-list li', function(ev){
        var actionargs = {
          type:'selected',
          value:$(ev.target).attr('data-value')
        };
       
        
        self.notify(self, actionargs);

        return false;

    });


    $(document).on('click', function(ev){
        self.hide();
        return false;
    });


    this.hide = function(){
        $(root).find('.select-list').hide();
    };

    this.show = function(){
        $(root).find('.select-list').show();
    };

    this.update = function(viewmodel){
        $(root).html(this.template(viewmodel));
    };
}
_.extend(SelectView.prototype, new Observable());



function SelectContorller(model){
    var self = this;
    this.model = model;

    this.actions = {

        hide:function(sender, actionargs){
            sender.hide();

        },

        show:function(sender, actionargs){
            sender.show();
        },

        selected: function(sender, actionargs){
            self.model.select(actionargs.value);
        }

    };
    
    this.update = function(observable, actionargs){
      if(this.actions[actionargs.type]){
         this.actions[actionargs.type](observable, actionargs);
      }

    };

}


_.extend(SelectContorller.prototype, new Observable());


function SelectModle(){
    this.list = [
      { value:'-1', text:'请选择' },    
      { value:'0101', text:'选项一' },
      { value:'0102', text:'选项二' },
      { value:'0103', text:'选项三' }
    ];

    this.selectedText = "请选择";
    this.selectedValue = "-1";

    this.select = function(selecedID){
      for(var i=0; i < this.list.length; i++){
          this.list[i].selected = this.list[i].value == selecedID;  
          this.selectedText = this.list[i].text;
          this.selectedValue = this.list[i].value;
      }
      this.notify(this);
    };  

}

_.extend(SelectModle.prototype, new Observable());


function SelectComponent (root){
  
  //一个组件有View，Modle, Controller三个对象组成， View捕获用户行为, 通知给Controller, Controller更新Modle, Mode将更新通知给View。
  var view = new SelectView(root);

  var model = new SelectModle();  

  var controller = new SelectContorller(model);

  model.subscribe(view); //View观察Model, 模型数据更改调用调用View 观察者的update方法更新自己

  view.subscribe(controller); //Contorller观察View， 对视图上发生的指定用户行为，调用model更新自己。

  model.notify(model);
}

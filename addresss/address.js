/**
 * Created by tongjie on 15/9/22.
 */
KISSY.add('waybill/common/selectbox', function(S, require,exports,module) {
    var Base = require('base'),
        IO = require('io'),
        Node = require('node'),
        XTemplate = require('kg/xtemplate/4.1.4/'),
        addressSelectTPL =require('waybill/common/address-select-tpl');

    var $ = Node.all;

    var DISABLE_TPL = [

    '<div class="text-box J_select disable">',
    '<div class="select-text">',
    '<span class="J_selectOption">请选择</span>',
    '<b class="icon">&#xe609;</b>',
    '</div>',
    '</div>',

    '<div class="text-box J_select disable">',
    '<div class="select-text">',
    '<span class="J_selectOption">请选择城市</span>',
    '<b class="icon">&#xe609;</b>',
    '</div>',
    '</div>',

    '<div class="text-box J_select disable">',
    '<div class="select-text">',
    '<span class="J_selectOption">请选择区／县</span>',
    '<b class="icon">&#xe609;</b>',
    '</div>',
    '</div>'
    ].join('');

    function SelectBox(root) {
        root = root || document;
        this.root = root;
        this.bind(root);
    }

    S.extend(SelectBox, S.Base, {
        setOptionsHTML:function(list){

            var selected = "";
            var dataItem = "";
            var addressListHTML = [];
            for(var i=0; i<list.datas.length; i++){
                dataItem = list.datas[i];

                if(dataItem.selected){
                    selected = ' class="selected"';
                    $(this.root).one('.J_selectOption').html(dataItem.text);
                    $(this.root).one('.J_SelectValue').val(dataItem.key);
                }else{
                    selected='';
                }
                addressListHTML.push('<li  '+ selected+ ' data-value ="'+dataItem.key+'" >' +dataItem.text+'</li>')
            }

            $(this.root).one('.select-list').html(addressListHTML.join(''));
        },
        bind: function (root) {
            //alert(1)
            var self = this;
            //debugger
            //自定义select
            $(root).delegate('click', '.J_select', function (ev) {
                //console.log(ev.currentTarget)
                var selectList = $(ev.currentTarget).one('.select-list');

                if ($(ev.currentTarget).hasClass('disable')) {
                    return;
                }

                $('.select-list-show').each(function (item) {
                    if (item[0] != selectList[0]) {
                        item.removeClass('select-list-show');
                    }

                });


                selectList.toggleClass('select-list-show');
                //selectList.toggle();

                return false;
            });
            
            //选择select列表
            $(root).delegate('click', '.J_select .select-list li', function (ev) {
                //console.log(this)
                var option = $(ev.currentTarget);
                var select = $(ev.currentTarget).parent('.J_select');
                var selected = select.one('.J_selectOption');
                var list = select.one('.select-list');
                var selectedValue = select.one('.J_SelectValue');
                list.all('li').removeClass('selected');
                option.addClass('selected');
                selected.html(option.html());
                selectedValue[0].value = option.attr('data-value');
                list.removeClass('select-list-show');

                self.fire('change', {sender: option, level: list.attr('data-bind')});

                return false;
            });

            //select 隐藏
            $(document).on('click', function (ev) {
                var selectList = $('.J_select').all('.select-list');
                selectList.removeClass('select-list-show');
                //selectList.hide();
            });

        }

    });

    function AddressModel(areasID) {
        var self = this;
        var source = "//division-data.alicdn.com/simple/addr_4_1111_1.js";
        var sourceName = "tdist";

        S.getScript(source, {
            success: function () {
                self._processData(tdist);

                var allAddressData = self.get('allAddressData');

                //console.log(allAddressData)
                var provincesID = allAddressData[1].ch;
                self.provinces = [];


                for (var i = 0; i < provincesID.length; i++) {
                    var key = provincesID[i];
                    self.provinces.push({
                        key: key,
                        name: allAddressData[key].n
                    });
                }

                //出发数据更新事件
                //self.fire('update', { provinces:self.provinces, cities:[], areas:[], status:{} });
            }
        });
    }

    S.extend(AddressModel, S.Base, {

        provinces: [],

        cities: [],

        areas: [],

        status: {},

        //遍历对象，生成 "key" : { n:"名字", ch:[子地址数组], p:"父id"} 的形式
        _processData: function (data) {

            var self = this,
                dataTemporary = {},
                eachData;

            S.each(data, function (valNode, key) {
                eachData = data[key];

                if (!dataTemporary[key]) {
                    dataTemporary[key] = {n: eachData[0], p: eachData[1], ch: []};
                } else {
                    dataTemporary[key].n = eachData[0];
                    dataTemporary[key].p = eachData[1];
                }
                if (!dataTemporary[eachData[1]]) {
                    dataTemporary[eachData[1]] = {ch: [key]}

                } else {
                    dataTemporary[eachData[1]].ch.push(key);
                }
            });

            self.set("allAddressData", dataTemporary);


        },

        getCities: function (provinceKey) {
            var allAddressData = this.get('allAddressData');
            var cities = [];
            var citiesID = allAddressData[provinceKey].ch;

            for (var i = 0; i < citiesID.length; i++) {
                var key = citiesID[i];
                cities.push({
                    key: key,
                    name: allAddressData[key].n
                });
            } 			//mock data
            return cities;

        },

        getAreas: function (cityKey) {
            var allAddressData = this.get('allAddressData');
            var areas = [];

            if (!cityKey) {
                return [];
            }

            var areasID = allAddressData[cityKey].ch;

            for (var i = 0; i < areasID.length; i++) {
                var key = areasID[i];
                areas.push({
                    key: key,
                    name: allAddressData[key].n
                });
            } 			//mock data
            return areas;
        },

        updateCities: function (key) {

            if (this.status['selected.city']) {
                this.status['selected.city'].selected = false;
            }

            if (!key) {
                this.status['selected.city'] = null;
                this.status['selected.area'] = null;
                this.areas = [];
            }

            for (var i = 0; i < this.cities.length; i++) {
                var city = this.cities[i];

                if (city.key == key) {
                    city.selected = true;
                    this.status['selected.city'] = city;
                    this.status['selected.area'] = null;
                }
            }

            this.areas = this.getAreas(key);
        },

        updateAreas: function (key) {
            if (this.status['selected.area']) {
                this.status['selected.area'].selected = false;
            }

            for (var i = 0; i < this.areas.length; i++) {
                var area = this.areas[i];

                if (area.key == key) {
                    area.selected = true;
                    this.status['selected.area'] = area;
                }
            }

        },

        updateProvinces: function (key) {
            var allAddressData = this.get('allAddressData');

            if (this.status['selected.province']) {
                this.status['selected.province'].selected = false;
            }

            if (!key) {
                this.status['selected.province'] = null;
                this.status['selected.city'] = null;
                this.status['selected.area'] = null;
                this.cities = [];
                this.areas = [];
                return;
            }

            for (var i = 0; i < this.provinces.length; i++) {
                var province = this.provinces[i];

                if (province.key == key) {
                    province.selected = true;
                    this.status['selected.province'] = province;
                    this.status['selected.city'] = null;
                    this.status['selected.area'] = null;
                }
            }

            this.cities = this.getCities(key);
            this.areas = [];
        },

        update: function (key, level) {


            //if (level == "address.provinces") {
            //    this.updateProvinces(key);
            //}
            //if (level == "address.cities") {
            //    this.updateCities(key);
            //} else if (level == "address.areas") {
            //    this.updateAreas(key);
            //}


            if(level =="address.provinces"){
                this.updateProvinces(key);
                this.updateCities(this.cities[0].key);
                if(this.areas.length){
                    this.updateAreas(this.areas[0].key);
                }
            }else if(level == "address.cities"){
                this.updateCities(key);
                if(this.areas.length){
                    this.updateAreas(this.areas[0].key);
                }
            }else{
                this.updateAreas(key);
            }


            //console.log(1,this.provinces)
            this.fire('update', {
                provinces: this.provinces,
                cities: this.cities,
                areas: this.areas,
                status: this.status
            });

        },

        getlevel: function (key, keys) {
            var allAddressData = this.get('allAddressData');
            var parentKey = allAddressData[key].p;

            if (parentKey == 1) {
                return;
            }

            keys.splice(0, 0, parentKey)

            this.getlevel(parentKey, keys);


        },

        setAddressData: function (key) {
            var keys = []
            this.getlevel(key, keys);

            if (keys.length === 2) {
                this.updateProvinces(keys[0])
                this.updateCities(keys[1])
                this.updateAreas(key);
            }

            if (keys.length == 1) {
                this.updateProvinces(keys[0])
                this.updateCities(key);
            }

            this.fire('update', {
                provinces: this.provinces,
                cities: this.cities,
                areas: this.areas,
                status: this.status
            });
            //console.log(this.provinces, this.cities, this.areas)


        }

    });

    function AddressSelectBox(root) {
        var self = this;

        AddressSelectBox.superclass.constructor.call(this, root);

        var addressModel = new AddressModel();
        this.addressModel = addressModel;
        addressModel.on('update', function (model) {
            //alert(1)
            // model.provinces.splice(0,0,'{ name:"请选择省份", key:""}');
            // model.cities.splice(0,0,'{ name:"请选择城市", key:""}');
            // model.areas.splice(0,0,'{ name:"请选择区／县", key:""}');
            self.setData(model);
        });

        this.on('change', function (ev) {
            var option = ev.sender;
            var key = option.attr('data-value');
            //console.log(key,ev.level)
            addressModel.update(key, ev.level);

        });


        this.__elements__ = {};
        this.elements['root'] = $(root);

        //UI 元素
        this.provinces = this.elements('address.provinces'); // data-bind = 'address.provinces'
        this.cities = this.elements('address.cities');
        this.areas = this.elements('address.areas');

        //UI 模版
        //this.provincesTPL = this.provinces.html();
        //this.citiesTPL = this.cities.html();
        //this.areasTPL = this.areas.html();
        this.TPL = this.elements['root'].html();

        //this.setData(addressModel);


    }

    S.extend(AddressSelectBox, SelectBox, {
        setData: function (address) {
            var self = this;

            var provinces = this.provinces; // data-bind = 'address.provinces'
            var cities = this.cities;
            var areas = this.areas;

            var provincesTPL = this.provincesTPL;
            var citiesTPL = this.citiesTPL;
            var areasTPL = this.areasTPL;

            //console.log(address.provinces)

            // var html = new XTemplate(provincesTPL).render(address);
            // provinces.html(html);

            // html = new XTemplate(citiesTPL).render(address);
            // cities.html(html);

            // html = new XTemplate(areasTPL).render(address);
            // areas.html(html);


            this.elements['root'].html(new XTemplate(addressSelectTPL).render(address))
            this.elements['root'].all('.J_select').removeClass('disable');

            this.select(address, 'selected.province');
            this.select(address, 'selected.city');
            this.select(address, 'selected.area');


        },

        disable:function(status){
            if(status){
                this.elements['root'].all('.J_select').addClass('disable');
            }else{
                this.elements['root'].all('.J_select').removeClass('disable');
            }

            //this.elements['root'].html(DISABLE_TPL);
        },

        reset:function(){

        },

        select: function (address, level) {

            var defaultText = {
                'selected.province': '请选择省份',
                'selected.city': '请选择城市',
                'selected.area': '请选择地区'
            };

            var selectboxID = {
                'selected.province': '#J_province',
                'selected.city': '#J_city',
                'selected.area': '#J_area'
            };

            var text = address.status[level] && address.status[level].name || defaultText[level];
            var value = address.status[level] && address.status[level].key || '';
            var selectbox = $(selectboxID[level]);

            //console.log(text,value)
            selectbox.one('.J_selectOption').html(text);
            selectbox.one('.J_SelectValue').val(value);
        },

        setAddress: function (key) {
            this.addressModel.setAddressData(key);
        },


        elements: function (id) {
            var bindpath = '.select-list[data-bind="' + id + '"]';

            if (!this.__elements__[id]) {
                this.__elements__[id] = this.elements['root'].one(bindpath);
            }

            //debugger
            return this.__elements__[id];
        }

    });


    module.exports = {
        SelectBox:SelectBox,
        AddressSelectBox: AddressSelectBox
    };

});
